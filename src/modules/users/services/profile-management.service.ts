import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { IUser } from '../interfaces/entities/user.interface';
import { LoggerService } from 'src/logs/logger.service';
import { UserAuthenticationRepository, UserRepository } from '../repos';
import { ResourceCleanupQueueService } from 'src/queues/services/resource-cleanup.service';
import { UpdateUserPasswordDto, UpdateUserProfileDto } from '../dto';
import { PasswordHelperService } from 'src/common/services/password-helper.service';
import { EmailQueueService } from 'src/queues/services/email-queue.service';
import { generatePasswordUpdatedEmail } from 'src/modules/auth/emails/templates/passwordChangeConfirmationEmail';
import { UpdateProfileData } from '../interfaces/services/profileManagementService.interface';
import { VerificationTokensCreatorService } from 'src/common/services/verification-tokens-creator.service';
import { generateWelcomeEmail } from 'src/modules/auth/emails/templates/wellcomEmail';

@Injectable()
export class ProfileManagementService {
  constructor(
    private readonly logger: LoggerService,
    private readonly userRepository: UserRepository,
    private readonly passwordHelperService: PasswordHelperService,
    private readonly userAuthRepository: UserAuthenticationRepository,
    private readonly verificationTokensCreator: VerificationTokensCreatorService,
    private readonly emailQueueService: EmailQueueService,
    private readonly resourceCleanupService: ResourceCleanupQueueService,
  ) {}
  async updatePassword(
    user: IUser,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<void> {
    try {
      const userPassword = await this.userRepository.getUserPassword(user.id);
      const isCurrentPasswordValid =
        await this.passwordHelperService.comparePasswords(
          updateUserPasswordDto.currentPassword,
          userPassword,
        );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      const hashedPassword = await this.passwordHelperService.hashPassword(
        updateUserPasswordDto.newPassword,
      );

      await this.userAuthRepository.updateUserPassword(user.id, hashedPassword);
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
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to update password for user ${user.id}: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  async updateProfile(
    user: IUser,
    updateProfileData: UpdateUserProfileDto,
  ): Promise<void> {
    try {
      if (!updateProfileData.name && !updateProfileData.phoneNumber) {
        throw new BadRequestException(
          'At least one field (name or phone number) must be provided for update',
        );
      }
      const updatedData: UpdateProfileData = {};
      if (updateProfileData.name) {
        updatedData.name = updateProfileData.name;
      }
      if (updateProfileData.phoneNumber) {
        updatedData.phoneNumber = updateProfileData.phoneNumber;
        updatedData.phoneNumberVerified = false;
        updatedData.phoneNumberVerifiedAt = null;
      }

      await this.userRepository.updateUserProfile(user.id, updatedData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to update profile for user ${user.id}: ${error.message}`,
        error,
      );
      if (err.code === '23505') {
        throw new ConflictException('Phone number already exists');
      }
      throw error;
    }
  }

  async updateProfileImage(
    user: IUser,
    imageInfo: { imageUrl: string; imageLocation: string },
  ) {
    try {
      await this.userRepository.updateUserProfileImage(user.id, imageInfo);

      if (user.profileImageKey) {
        await this.resourceCleanupService.addCleanupTask({
          jobName: 'resource-cleanup',
          resourceKey: user.profileImageKey,
        });
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to update profile image for user ${user.id}: ${error.message}`,
        error,
      );
      throw error;
    }
  }

  async resendVerificationEmail(user: IUser): Promise<void> {
    try {
      const tokenKey = `verification-token-${user.id}`;
      const tokenValue: string =
        await this.verificationTokensCreator.createVerificationToken(
          tokenKey,
          900,
        );
      const emailContent = generateWelcomeEmail({
        user,
        verificationToken: tokenValue,
        tokenExpiryMinutes: 15,
      });

      await this.emailQueueService.addEmailJob({
        type: 'welcome-email',
        to: user.email,
        subject: 'Welcome to 360-degree!',
        text: 'Welcome to 360-degree!',
        html: emailContent,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to resend verification email: ${error.message}`,
        error,
      );
      throw error;
    }
  }
}
