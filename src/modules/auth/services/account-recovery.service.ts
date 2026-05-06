import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { EmailQueueService } from 'src/queues/services/email-queue.service';
import { VerificationTokensCreatorService } from 'src/common/services/verification-tokens-creator.service';
import { UserAuthService } from 'src/modules/users/services/user-auth.service';
import { generatePasswordResetEmail } from '../emails/templates/passwordResetEmail';
import { PasswordHelperService } from 'src/common/services/password-helper.service';
import { TokensTrackingService } from 'src/common/services/tokens-tracking-service.service';
import { generatePasswordUpdatedEmail } from '../emails/templates/passwordChangeConfirmationEmail';
import { generateCongratulationsEmail } from '../emails/templates/generateCongratulationsEmail';
import { IAccountRecoveryService } from '../interfaces/services/accountRecoveryService.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvents } from 'src/modules/notifications/events/names/notification-events.constants';
import { NotificationSourceType } from 'src/common/consts';

@Injectable()
export class AccountRecoveryService implements IAccountRecoveryService {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly verificationTokensCreator: VerificationTokensCreatorService,
    private readonly emailQueueService: EmailQueueService,
    private readonly passwordHelperService: PasswordHelperService,
    private readonly tokensTrackingService: TokensTrackingService,
    private readonly logger: LoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendPasswordResetEmail(email: string) {
    try {
      // Check if there is a user with this email
      const existingUser = await this.userAuthService.findByEmail(email);
      if (!existingUser) return;

      // Generate a password reset token
      const tokenKey = `reset-password-token-${existingUser.id}`;
      const token =
        await this.verificationTokensCreator.createVerificationToken(
          tokenKey,
          900,
        ); // 15 minutes expiration
      const resetPasswordEmail = generatePasswordResetEmail({
        userEmail: existingUser.email,
        userName: existingUser.name,
        userId: existingUser.id,
        resetToken: token,
        expiresInMinutes: 15,
      });

      await this.emailQueueService.addEmailJob({
        type: 'reset-password',
        to: existingUser.email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Use the following token: ${token}. This token expires at ${15} minutes.`,
        html: resetPasswordEmail,
      });

      this.eventEmitter.emit(NotificationEvents.Created, {
        userId: existingUser.id,
        title: 'Password Reset Requested',
        body: "You requested a password reset. If this wasn't you, please secure your account immediately.",
        sourceType: NotificationSourceType.SECURITY,
        sourceId: existingUser.id,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('Error in sendPasswordResetEmail', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string, userId: string) {
    try {
      const tokenKey = `reset-password-token-${userId}`;
      const isTokenValid =
        await this.verificationTokensCreator.validateVerificationToken(
          tokenKey,
          token,
        );

      if (!isTokenValid) {
        throw new BadRequestException(
          'Invalid or expired password reset token',
        );
      }
      // Check if a user exists with this token
      const user = await this.userAuthService.getUserById(userId);

      const hashedPassword: string =
        await this.passwordHelperService.hashPassword(newPassword);

      await this.userAuthService.updateUserPassword(user.id, hashedPassword);
      await this.tokensTrackingService.revokeAllUserTokens(user.id);
      await this.emailQueueService.addEmailJob({
        type: 'password-change-confirmation',
        to: user.email,
        subject: 'Password Change Confirmation',
        text: `Your password has been changed successfully.`,
        html: generatePasswordUpdatedEmail({
          userEmail: user.email,
          userName: user.name,
        }),
      });

      this.eventEmitter.emit(NotificationEvents.Created, {
        userId: user.id,
        title: 'Password Changed Successfully',
        body: 'Your password has been changed successfully. If you did not make this change, please contact support.',
        sourceType: NotificationSourceType.SECURITY,
        sourceId: user.id,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('Error in resetPassword', error);
      throw error;
    }
  }

  async verifyEmail(token: string, userId: string) {
    try {
      const tokenKey = `verification-token-${userId}`;
      const isTokenValid =
        await this.verificationTokensCreator.validateVerificationToken(
          tokenKey,
          token,
        );

      if (!isTokenValid) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      const user = await this.userAuthService.getUserById(userId);
      if (!user)
        throw new NotFoundException(
          'No user found with this id check the token validity or expiry',
        );

      if (user.isVerified) return;

      await this.userAuthService.verifyUserEmail(user.id);

      await this.emailQueueService.addEmailJob({
        type: 'account-verification-success',
        to: user.email,
        subject: 'Account Verified Successfully',
        text: `Your account has been verified successfully.`,
        html: generateCongratulationsEmail({
          userName: user.name,
        }),
      });

      this.eventEmitter.emit(NotificationEvents.Created, {
        userId: user.id,
        title: 'Email Verified Successfully',
        body: 'Your email has been verified. Your account is now fully active.',
        sourceType: NotificationSourceType.AUTH,
        sourceId: user.id,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('Error in verifyEmail', error);
      throw error;
    }
  }
}
