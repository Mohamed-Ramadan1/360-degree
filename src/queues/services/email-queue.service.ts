import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { Queue } from 'bullmq';
import { QueueNames } from '../config/queue-names.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { BaseEmailJob } from '../types/email-job.types';

@Injectable()
export class EmailQueueService {
  constructor(
    private readonly logger: LoggerService,
    @InjectQueue(QueueNames.EMAIL) private readonly emailQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('EmailQueueService initialized');
  }

  async addEmailJob(emailData: BaseEmailJob) {
    try {
      await this.emailQueue.add(emailData.type, emailData);
      this.logger.log(`Email job '${emailData.type}' added to queue`);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to add email job '${emailData.type}' to queue`,
        error,
      );
      throw error;
    }
  }

  async addBulkEmailJob(usersEmails: string[], emailData: BaseEmailJob) {
    try {
      await this.emailQueue.addBulk(
        usersEmails.map((email) => ({
          name: emailData.type, // Job name
          data: {
            // Job data
            type: emailData.type,
            to: email,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html,
          },
        })),
      );
    } catch (err: unknown) {
      this.logger.error('Failed to add bulk email job', err as Error);
    }
  }
}
