import { LoggerService } from 'src/logs/logger.service';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueNames } from '../../config/queue-names.enum';
import { ResourceCleanupService } from 'src/common/services/resource-cleanup.service';
@Processor(QueueNames.RESOURCE_CLEANUP, {
  concurrency: 5,
})
@Injectable()
export class ResourceCleanupProcessor
  extends WorkerHost
  implements OnModuleDestroy
{
  constructor(
    private readonly logger: LoggerService,
    private readonly resourceCleanupService: ResourceCleanupService,
  ) {
    super();
  }

  async process(job: Job<{ key: string }>): Promise<void> {
    try {
      this.logger.log(
        `Processing cleanup job ${job.id} for resource key: ${job.data.key}`,
      );
      await this.resourceCleanupService.deleteFileFromCloudinary(job.data.key);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error(
        `Error processing resource cleanup job: ${job.id}`,
        err,
      );
    }
  }

  /**
   * Event handlers for job lifecycle
   */
  @OnWorkerEvent('completed')
  onCompleted(job: Job<{ key: string }>) {
    this.logger.log(
      `Resource cleanup job ${job.id} for resource ${job.data.key} completed successfully`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<{ key: string }>, error: Error) {
    this.logger.error(
      `Resource cleanup job ${job.id} for resource ${job.data.key} failed:`,
      error.message,
    );
  }

  @OnWorkerEvent('stalled')
  onStalled(job: Job<{ key: string }>) {
    this.logger.warn(
      `Resource cleanup job ${job.id} for resource ${job.data.key} stalled - retrying...`,
    );
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<{ key: string }>, progress: number) {
    this.logger.debug(
      `Resource cleanup job ${job.id} for resource ${job.data.key} progress: ${progress}%`,
    );
  }

  onModuleDestroy() {
    this.logger.log('ResourceCleanupProcessor module destroyed');
    // Add any necessary cleanup logic here
  }
}
