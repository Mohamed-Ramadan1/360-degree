import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';

import { IAccountSettingsService, IUser } from '../interfaces';
import { UserSettingsRepository } from '../repos';
import { OtpService } from 'src/common/services/otp.service';
import { SmsQueueService } from 'src/queues/services/sms-queue.service';

@Injectable()
export class AccountSettingsService implements IAccountSettingsService {
  private phoneVerificationRequestKey = 'phone_verification_otp:';
  private phoneVerificationOtpTtl = 600; // 10 minutes in seconds

  constructor(
    private readonly logger: LoggerService,
    private readonly otpService: OtpService,
    private readonly userSettingsRepository: UserSettingsRepository,
    private readonly smsQueueService: SmsQueueService,
  ) {}

  async acceptTerms(user: IUser): Promise<void> {
    if (user.termsAccepted) {
      return;
    }
    try {
      await this.userSettingsRepository.acceptTerms(user.id);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to accept terms for user ${user.id}: ${error.message}`,
      );
      throw error;
    }
  }

  async enableNotifications(user: IUser): Promise<void> {
    if (user.notificationsEnabled) {
      return;
    }
    try {
      await this.userSettingsRepository.enableNotifications(user.id);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to enable notifications for user ${user.id}: ${error.message}`,
      );
      throw error;
    }
  }

  async disableNotifications(user: IUser): Promise<void> {
    if (!user.notificationsEnabled) {
      return;
    }
    try {
      await this.userSettingsRepository.disableNotifications(user.id);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to disable notifications for user ${user.id}: ${error.message}`,
      );
      throw error;
    }
  }

  async requestPhoneNumberVerification(user: IUser): Promise<void> {
    try {
      if (user.phoneNumberVerified) {
        throw new BadRequestException('Phone number is already verified.');
      }
      if (!user.phoneNumber) {
        throw new BadRequestException(
          'User does not have a phone number, please set one and try again.',
        );
      }

      const key = `${this.phoneVerificationRequestKey}${user.id}`;

      const otp = await this.otpService.generateOtp(
        key,
        this.phoneVerificationOtpTtl,
      );

      await this.smsQueueService.addSmsJob({
        type: 'otp-verification',
        to: user.phoneNumber,
        message: `Welcome to 360-degree app, your verification code is ${otp}`,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to request phone number verification for user ${user.id}: ${error.message}`,
      );
      throw error;
    }
  }

  async verifyPhoneNumber(otp: string, userId: string): Promise<void> {
    try {
      const key = `${this.phoneVerificationRequestKey}${userId}`;

      const isValid = await this.otpService.validateOtp(key, otp);
      if (!isValid) {
        throw new BadRequestException('Invalid or expired OTP code.');
      }

      const isVerified =
        await this.userSettingsRepository.verifyPhoneNumber(userId);

      if (!isVerified) {
        throw new BadRequestException(
          'Phone number could not be verified, please try again later.',
        );
      }

      await this.otpService.deleteOtp(key);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to verify phone number for user ${userId}: ${error.message}`,
        error,
        this.constructor.name,
      );
      throw error;
    }
  }
}
