import { LoggerService } from 'src/logs/logger.service';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';

import { QueueNames } from '../../config/queue-names.enum';
import { SmsSenderService } from 'src/common/services/sms-sender.service';
import { BaseSmsJob } from 'src/queues/types/sms-job.types';

@Processor(QueueNames.SMS, {
  concurrency: 5,
})
@Injectable()
export class SmsProcessor extends WorkerHost implements OnModuleDestroy {
  constructor(
    private readonly smsService: SmsSenderService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  onModuleDestroy() {
    // Gracefully close the worker when the module is destroyed
    try {
      this.logger.log('SMS processor shutting down gracefully');
    } catch (error) {
      this.logger.error('Error closing SMS processor:', error as Error);
    }
  }

  async process(job: Job<any, any, string>): Promise<void> {
    this.logger.log(`Processing SMS job ${job.id} of type ${job.data.type}`);
    await this.handleBaseJobProperties(job.data as BaseSmsJob);
  }

  private async handleBaseJobProperties(data: BaseSmsJob) {
    try {
      await this.smsService.send(data.to, data.message);
      this.logger.log(`SMS of type ${data.type} sent to ${data.to}`);
    } catch (error: any) {
      console.error(error);
      this.logger.error(
        `Failed to send SMS of type ${data.type} to ${data.to}:`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Event handlers for job lifecycle
   */
  @OnWorkerEvent('completed')
  onCompleted(job: Job<BaseSmsJob>) {
    this.logger.log(
      `SMS job ${job.id} (${job.data.type}) completed successfully`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<BaseSmsJob>, error: Error) {
    this.logger.error(
      `SMS job ${job.id} (${job.data.type}) failed:`,
      error.message,
    );
  }

  @OnWorkerEvent('stalled')
  onStalled(job: Job<BaseSmsJob>) {
    this.logger.warn(
      `SMS job ${job.id} (${job.data.type}) stalled - retrying...`,
    );
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<BaseSmsJob>, progress: number) {
    this.logger.debug(`SMS job ${job.id} progress: ${progress}%`);
  }
}
