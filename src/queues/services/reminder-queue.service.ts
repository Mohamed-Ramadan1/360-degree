import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { Queue } from 'bullmq';
import { QueueNames } from '../config/queue-names.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { BaseReminderJob } from '../types/reminder-job.types';

@Injectable()
export class ReminderQueueService implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    @InjectQueue(QueueNames.REMINDER) private readonly reminderQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('ReminderQueueService initialized');
  }

  async addReminderJob(reminderData: BaseReminderJob): Promise<void> {
    try {
      await this.reminderQueue.add(reminderData.type, reminderData);
      this.logger.log(
        `Reminder job '${reminderData.type}' added to queue for reminderId: ${reminderData.reminderId}`,
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to add Reminder job '${reminderData.type}' to queue for reminderId: ${reminderData.reminderId}`,
        error,
      );
      throw error;
    }
  }
}
