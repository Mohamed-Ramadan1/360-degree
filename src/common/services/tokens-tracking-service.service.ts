import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../../infrastructure/redis/services/redis.service';
import { LoggerService } from 'src/logs/logger.service';

@Injectable()
export class TokensTrackingService implements OnModuleDestroy, OnModuleInit {
  constructor(
    private readonly redisService: RedisService,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    this.logger.log('TokensTrackingService initialized');
  }

  async trackRefreshToken(token: string, userId: string): Promise<void> {
    try {
      const tokenKey = `refresh_token:${token}`;
      const userTokensKey = `user_tokens:${userId}`;
      const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

      // Store individual token (for fast validation)
      const tokenData = JSON.stringify({
        userId,
        createdAt: new Date().toISOString(),
      });
      await this.redisService.set(tokenKey, tokenData, TTL_SECONDS);

      // Track token in user's set (for listing all user tokens)
      await this.redisService.sadd(userTokensKey, token);

      // Set/refresh expiration on user's token set
      await this.redisService.getClient().expire(userTokensKey, TTL_SECONDS);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(`Error tracking refresh token: ${error.message}`);
      throw error;
    }
  }

  async isTokenWhitelisted(token: string): Promise<boolean> {
    try {
      const key = `refresh_token:${token}`;
      return await this.redisService.exists(key);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error('Error checking token whitelist', error);
      return false;
    }
  }

  async getAllUserTokens(userId: string): Promise<string[]> {
    try {
      const userTokensKey = `user_tokens:${userId}`;
      const tokens = await this.redisService
        .getClient()
        .smembers(userTokensKey);

      // Filter out expired tokens
      const validTokens: string[] = [];
      for (const token of tokens) {
        const tokenKey = `refresh_token:${token}`;
        const exists = await this.redisService.exists(tokenKey);

        if (exists) {
          validTokens.push(token);
        } else {
          // Clean up expired token from set
          await this.redisService.srem(userTokensKey, token);
        }
      }

      return validTokens;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error('Error getting user tokens', error);
      return [];
    }
  }

  async revokeRefreshToken(token: string, userId: string): Promise<void> {
    try {
      const tokenKey = `refresh_token:${token}`;
      const userTokensKey = `user_tokens:${userId}`;

      // Delete individual token
      await this.redisService.del(tokenKey);

      // Remove from user's token set
      await this.redisService.srem(userTokensKey, token);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error('Error revoking token', error);
      throw error;
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      const userTokensKey = `user_tokens:${userId}`;

      // Get all tokens
      const tokens = await this.redisService
        .getClient()
        .smembers(userTokensKey);

      // Delete each individual token
      const pipeline = this.redisService.getClient().pipeline();
      for (const token of tokens) {
        pipeline.del(`refresh_token:${token}`);
      }
      pipeline.del(userTokensKey);

      await pipeline.exec();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error('Error revoking all user tokens', error);
      throw error;
    }
  }

  // Get count of active sessions
  async getUserActiveSessionCount(userId: string): Promise<number> {
    try {
      const tokens = await this.getAllUserTokens(userId);
      return tokens.length;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error('Error getting session count', error);
      return 0;
    }
  }

  onModuleDestroy() {
    this.logger.log('TokensTrackingService destroyed');
  }
}
