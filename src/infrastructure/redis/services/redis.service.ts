import { LoggerService } from 'src/logs/logger.service';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

// redis.service.ts
@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  private client: Redis;
  private isConnected: boolean = false;

  constructor(
    private loggerService: LoggerService,
    private configService: ConfigService,
  ) {
    this.initializeClient();
  }

  private initializeClient() {
    this.client = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),

      // Connection pool settings
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,

      // Reconnection strategy
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        this.loggerService.warn(`Redis reconnecting... attempt ${times}`);
        return delay;
      },

      // Timeouts
      connectTimeout: 10000,
      commandTimeout: 5000,

      // Keep-alive
      keepAlive: 30000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      this.loggerService.log('Redis client connected');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      this.loggerService.log('Redis client ready');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      console.log('Redis client error:', error);
      this.loggerService.error('Redis client error', error);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.loggerService.warn('Redis client connection closed');
    });

    this.client.on('reconnecting', () => {
      this.loggerService.log('Redis client reconnecting...');
    });
  }

  async onModuleInit() {
    try {
      await this.client.ping();
      this.loggerService.log('Redis connection verified');
    } catch (error) {
      this.loggerService.error('Failed to connect to Redis', error as Error);
      throw error; // Fail fast if Redis is required
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.loggerService.log('Redis connection closed gracefully');
  }

  // Add health check
  isHealthy(): boolean {
    return this.isConnected;
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // For lists (blacklist/whitelist)
  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.client.sadd(key, ...members);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    return (await this.client.sismember(key, member)) === 1;
  }

  async srem(key: string, member: string): Promise<void> {
    await this.client.srem(key, member);
  }

  // In RedisService
  async saddWithExpiry(
    key: string,
    ttl: number,
    ...members: string[]
  ): Promise<void> {
    await this.client.sadd(key, ...members);
    await this.client.expire(key, ttl);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  // Get the client for advanced operations
  getClient(): Redis {
    return this.client;
  }
}
