import { LoggerService } from 'src/logs/logger.service';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import { BaseEmailJob } from '../../types/email-job.types';

import { QueueNames } from '../../config/queue-names.enum';
import { EmailSenderService } from 'src/common/services/email-sender.service';

@Processor(QueueNames.EMAIL, {
  concurrency: 5,
})
@Injectable()
export class EmailProcessor extends WorkerHost implements OnModuleDestroy {
  constructor(
    private readonly emailService: EmailSenderService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  onModuleDestroy() {
    // Gracefully close the worker when the module is destroyed
    try {
      this.logger.log('Email processor shutting down gracefully');
    } catch (error) {
      this.logger.error('Error closing email processor:', error as Error);
    }
  }

  async process(job: Job<any, any, string>): Promise<void> {
    this.logger.log(`Processing email job ${job.id} of type ${job.data.type}`);
    await this.handleBaseJobProperties(job.data as BaseEmailJob);
  }

  private async handleBaseJobProperties(data: BaseEmailJob) {
    try {
      await this.emailService.sendEmail(
        data.to,
        data.subject,
        data.text,
        data.html,
      );
      this.logger.log(`Email of type ${data.type} sent to ${data.to}`);
    } catch (error: any) {
      console.error(error);
      this.logger.error(
        `Failed to send email of type ${data.type} to ${data.to}:`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Event handlers for job lifecycle
   */
  @OnWorkerEvent('completed')
  onCompleted(job: Job<BaseEmailJob>) {
    this.logger.log(
      `Email job ${job.id} (${job.data.type}) completed successfully`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<BaseEmailJob>, error: Error) {
    this.logger.error(
      `Email job ${job.id} (${job.data.type}) failed:`,
      error.message,
    );
  }

  @OnWorkerEvent('stalled')
  onStalled(job: Job<BaseEmailJob>) {
    this.logger.warn(
      `Email job ${job.id} (${job.data.type}) stalled - retrying...`,
    );
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<BaseEmailJob>, progress: number) {
    this.logger.debug(`Email job ${job.id} progress: ${progress}%`);
  }
}
