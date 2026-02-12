import { RedisService } from '../../infrastructure/redis/services/redis.service';
/**
 * @module VerificationTokensCreatorService
 * @description A NestJS service for generating secure verification tokens for email verification and password reset.
 */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { LoggerService } from 'src/logs/logger.service';

@Injectable()
export class VerificationTokensCreatorService
  implements OnModuleDestroy, OnModuleInit
{
  constructor(
    private readonly redisService: RedisService,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    this.logger.log('VerificationTokensCreatorService initialized');
  }
  onModuleDestroy() {
    this.logger.log('VerificationTokensCreatorService destroyed');
  }

  async createVerificationToken(key: string, ttl: number): Promise<string> {
    try {
      const token: string = randomBytes(32).toString('hex');

      await this.redisService.del(key);

      await this.redisService.set(key, token, ttl);
      this.logger.log(`OTP generated for key: ${key}, TTL: ${ttl}s`);

      return token;
    } catch (error) {
      this.logger.error(
        `Error generating verification token for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async validateVerificationToken(
    key: string,
    token: string,
  ): Promise<boolean> {
    try {
      const storedToken = await this.redisService.get(key);

      if (!storedToken) {
        this.logger.warn(
          `Verification token not found or expired for key: ${key}`,
        );
        return false;
      }

      const isValid = storedToken === token;

      if (isValid) {
        this.logger.log(
          `Verification token validated successfully for key: ${key}`,
        );
        //delete token after successful validation to prevent reuse
        await this.redisService.del(key);
      } else {
        this.logger.warn(`Invalid verification token attempt for key: ${key}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error(
        `Error validating verification token for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }
  async deleteVerificationToken(key: string): Promise<void> {
    try {
      await this.redisService.del(key);
      this.logger.log(`Verification token deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(
        `Error deleting verification token for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async resendVerificationToken(key: string, ttl: number): Promise<string> {
    try {
      const existingToken = await this.redisService.get(key);
      if (existingToken) {
        this.logger.log(`Resending existing token for key: ${key}`);
        return existingToken;
      }
      this.logger.log(
        `No existing token found for key: ${key}, generating new one.`,
      );
      return this.createVerificationToken(key, ttl);
    } catch (error) {
      this.logger.error(
        `Error resending verification token for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async getTokenTtl(key: string): Promise<number> {
    try {
      const ttl = await this.redisService.ttl(key);
      return ttl;
    } catch (error) {
      this.logger.error(
        `Error getting TTL for verification token with key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  async tokenExists(key: string): Promise<boolean> {
    try {
      const exists = await this.redisService.exists(key);
      return exists;
    } catch (error) {
      this.logger.error(
        `Error checking existence of verification token with key ${key}: ${error.message}`,
      );
      throw error;
    }
  }
}
