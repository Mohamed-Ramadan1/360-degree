import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import { LoggerService } from 'src/logs/logger.service';
import { generateTodoReminderEmail } from 'src/modules/todos/emails/templates/reminderTodoEmail';
import { ReminderRepository } from 'src/modules/todos/repos/reminder.repo';
import { EmailQueueService } from 'src/queues';
import { QueueNames } from 'src/queues/config/queue-names.enum';
import { BaseReminderJob } from 'src/queues/types/reminder-job.types';

@Processor(QueueNames.REMINDER)
export class ReminderProcessor extends WorkerHost implements OnModuleDestroy {
  constructor(
    private readonly emailQueueService: EmailQueueService,
    private readonly reminderRepo: ReminderRepository,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  onModuleDestroy() {
    try {
      this.logger.log('Reminder processor shutting down gracefully');
    } catch (error) {
      this.logger.error('Error closing reminder processor:', error as Error);
    }
  }

  async process(job: Job<any, any, string>): Promise<void> {
    this.logger.log(
      `Processing reminder job ${job.id} of type ${job.data.type}`,
    );
    try {
      await this.emailQueueService.addEmailJob({
        type: 'reminder-email',
        to: job.data.userEmail,
        subject: `Reminder: ${job.data.todoTitle}`,
        text: `Don't forget to complete your task: ${job.data.todoTitle}`,
        html: generateTodoReminderEmail({
          userName: job.data.userName,
          todoTitle: job.data.todoTitle,
          reminderAt: job.data.reminderAt,
          priority: job.data.priority,
          todoId: job.data.todoId,
        }),
      });
      await this.reminderRepo.markAsSent(job.data.reminderId);
    } catch (error) {
      this.logger.error(
        `Failed to process reminder job ${job.id}:`,
        error.message,
      );
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<BaseReminderJob>) {
    this.logger.log(
      `Reminder job ${job.id} (${job.data.type}) completed successfully`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<BaseReminderJob>, error: Error) {
    this.logger.error(
      `Reminder job ${job.id} (${job.data.type}) failed:`,
      error.message,
    );
  }

  @OnWorkerEvent('stalled')
  onStalled(job: Job<BaseReminderJob>) {
    this.logger.warn(
      `Reminder job ${job.id} (${job.data.type}) stalled - retrying...`,
    );
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<BaseReminderJob>, progress: number) {
    this.logger.debug(`Reminder job ${job.id} progress: ${progress}%`);
  }
}
