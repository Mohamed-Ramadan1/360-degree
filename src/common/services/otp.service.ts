import { LoggerService } from 'src/logs/logger.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../../infrastructure/redis/services/redis.service';

@Injectable()
export class OtpService implements OnModuleInit {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.loggerService.log('OtpService initialized');
    this.loggerService.log(`Redis connected: ${this.redisService.isHealthy()}`);
  }

  async generateOtp(key: string, ttl: number): Promise<string> {
    try {
      // check if an OTP already exists for the key

      const otp = this.generateRandomOtp();

      await this.redisService.del(key);

      await this.redisService.set(key, otp, ttl);
      this.loggerService.log(`OTP generated for key: ${key}, TTL: ${ttl}s`);
      return otp;
    } catch (error) {
      this.loggerService.error(
        `Failed to generate OTP for key: ${key}`,
        error as Error,
      );
      throw error;
    }
  }

  async validateOtp(key: string, otp: string): Promise<boolean> {
    try {
      const storedOtp = await this.redisService.get(key);

      if (!storedOtp) {
        this.loggerService.warn(`OTP not found or expired for key: ${key}`);
        return false;
      }

      const isValid = storedOtp === otp;

      if (isValid) {
        this.loggerService.log(`OTP validated successfully for key: ${key}`);
        // Optionally delete OTP after successful validation to prevent reuse
        await this.deleteOtp(key);
      } else {
        this.loggerService.warn(`Invalid OTP attempt for key: ${key}`);
      }

      return isValid;
    } catch (error) {
      this.loggerService.error(`Failed to validate OTP for key: ${key}`, error);
      throw error;
    }
  }

  async deleteOtp(key: string): Promise<void> {
    try {
      await this.redisService.del(key);
      this.loggerService.log(`OTP deleted for key: ${key}`);
    } catch (error) {
      this.loggerService.error(`Failed to delete OTP for key: ${key}`, error);
      throw error;
    }
  }

  async resendOtp(key: string, ttl: number): Promise<string> {
    try {
      // Delete existing OTP if any
      await this.deleteOtp(key);

      // Generate and store new OTP
      const newOtp = await this.generateOtp(key, ttl);
      this.loggerService.log(`OTP resent for key: ${key}`);

      return newOtp;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.loggerService.error(`Failed to resend OTP for key: ${key}`, err);
      throw err;
    }
  }

  async getOtpTtl(key: string): Promise<number> {
    try {
      const ttl = await this.redisService.ttl(key);
      return ttl;
    } catch (error) {
      this.loggerService.error(
        `Failed to get TTL for key: ${key}`,
        error as Error,
      );
      throw error;
    }
  }

  async otpExists(key: string): Promise<boolean> {
    try {
      const exists = await this.redisService.exists(key);

      return exists === true;
    } catch (error) {
      this.loggerService.error(
        `Failed to check OTP existence for key: ${key}`,
        error as Error,
      );
      throw error;
    }
  }

  private generateRandomOtp(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }
}
