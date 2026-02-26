import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { Queue } from 'bullmq';
import { QueueNames } from '../config/queue-names.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { BaseSmsJob } from '../types/sms-job.types';

@Injectable()
export class SmsQueueService {
  constructor(
    private readonly logger: LoggerService,
    @InjectQueue(QueueNames.SMS) private readonly smsQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('SmsQueueService initialized');
  }

  async addSmsJob(smsData: BaseSmsJob): Promise<void> {
    try {
      await this.smsQueue.add(smsData.type, smsData);
      this.logger.log(`SMS job '${smsData.type}' added to queue`);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to add SMS job '${smsData.type}' to queue`,
        error,
      );
      throw error;
    }
  }
}
