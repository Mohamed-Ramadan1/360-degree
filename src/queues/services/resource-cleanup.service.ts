import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { InjectQueue } from '@nestjs/bullmq';
import { QueueNames } from '../config/queue-names.enum';
import { Queue } from 'bullmq';

@Injectable()
export class ResourceCleanupQueueService {
  constructor(
    private readonly logger: LoggerService,
    @InjectQueue(QueueNames.RESOURCE_CLEANUP)
    private readonly resourceCleanupQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('ResourceCleanupQueueService queue initialized');
  }

  async addCleanupTask({
    jobName,
    resourceKey,
  }: {
    jobName: string;
    resourceKey: string;
  }): Promise<void> {
    try {
      await this.resourceCleanupQueue.add(jobName, {
        key: resourceKey,
      });
      this.logger.log(
        `Added cleanup task for ${jobName},for resource key: ${resourceKey}`,
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(`Failed to add cleanup task: ${error.message}`, error);
      throw error;
    }
  }
}
