import { BullRootModuleOptions } from '@nestjs/bullmq';
import { queueRedisConfig } from 'src/config/redis.config';
import { QueueNames } from './queue-names.enum';
export const bullMQConfig: BullRootModuleOptions = {
  connection: {
    ...queueRedisConfig,
    // Override specific settings for BullMQ workers
    connectTimeout: 60000, // 1 minute
    lazyConnect: true,
    maxRetriesPerRequest: null,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    commandTimeout: 60000, // 1 minute
  },
  defaultJobOptions: {
    removeOnComplete: 5,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

export const emailQueueConfig = {
  name: QueueNames.EMAIL,
  defaultJobOptions: {
    removeOnComplete: 5,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};

export const resourceCleanupQueueConfig = {
  name: QueueNames.RESOURCE_CLEANUP,
  defaultJobOptions: {
    removeOnComplete: 5,
    removeOnFail: 5,
    attempts: 8,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
};
