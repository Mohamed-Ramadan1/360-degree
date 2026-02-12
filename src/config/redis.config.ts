import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import { LoggerService } from 'src/logs/logger.service';
dotenv.config();

const logger = new LoggerService();

// Base configuration
const baseConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  connectTimeout: 10000,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  lazyConnect: true,
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
};

// Export the config object for BullMQ
export const queueRedisConfig = {
  ...baseConfig,
  maxRetriesPerRequest: null,
  commandTimeout: 5000,
  keepAlive: 30000,
  // Add worker-specific timeouts
  maxmemoryPolicy: 'noeviction',
  // Additional settings to prevent timeout issues
  family: 4, // 4 (IPv4) or 6 (IPv6)
  enableOfflineQueue: false,
  lazyConnect: true,
  retryDelayOnFailover: 100,
  retryDelayOnClusterDown: 300,
  retryDelayOnCrossSlot: 100,
};

// Export the config object for revocation Redis
export const revocationRedisConfig = {
  ...baseConfig,
  maxRetriesPerRequest: 1,
  commandTimeout: 2000,
  keepAlive: 15000,
};

export const otpRedisConfig = {
  ...baseConfig,
  maxRetriesPerRequest: 1,
  commandTimeout: 1000,
  keepAlive: 10000,
  // OTPs are ephemeral, so we can afford to evict them if memory is needed
  maxmemoryPolicy: 'volatile-lru',
};

// Queue Redis - optimized for reliability and persistence
const queueRedis: Redis = new Redis(queueRedisConfig);

// Revocation Redis - optimized for fast lookups
const revocationRedis: Redis = new Redis(revocationRedisConfig);

// OTP Redis - optimized for ephemeral data
const otpRedis: Redis = new Redis(otpRedisConfig);

// Basic error handling
queueRedis.on('error', (err) => {
  console.error('Queue Redis error:', err.message);
});

revocationRedis.on('error', (err) => {
  console.error('Revocation Redis error:', err.message);
});

otpRedis.on('error', (err) => {
  console.error('OTP Redis error:', err.message);
});

// Optional: Connection status logging (remove in production if too noisy)
if (process.env.NODE_ENV !== 'production') {
  queueRedis.on('connect', () => logger.log('Queue Redis connected'));
  revocationRedis.on('connect', () => logger.log('Revocation Redis connected'));
  otpRedis.on('connect', () => logger.log('OTP Redis connected'));
}

export { queueRedis, revocationRedis, otpRedis };
