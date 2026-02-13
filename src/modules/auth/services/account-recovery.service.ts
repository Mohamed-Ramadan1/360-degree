import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { EmailQueueService } from 'src/queues/services/email-queue.service';
import { VerificationTokensCreatorService } from 'src/common/services/verification-tokens-creator.service';
import { UserAuthService } from 'src/modules/users/services/user-auth.service';
import { generatePasswordResetEmail } from '../emails/templates/passwordResetEmail';

@Injectable()
export class AccountRecoveryService {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly verificationTokensCreator: VerificationTokensCreatorService,
    private readonly emailQueueService: EmailQueueService,
    private readonly logger: LoggerService,
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
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error('Error in sendPasswordResetEmail', error);
      throw error;
    }
  }
}
