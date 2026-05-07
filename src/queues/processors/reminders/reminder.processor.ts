import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import { LoggerService } from 'src/logs/logger.service';
import { generateTodoReminderEmail } from 'src/modules/todos/emails/templates/reminderTodoEmail';
import { ReminderRepository } from 'src/modules/todos/repos/reminder.repo';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationSourceType } from 'src/common/consts/notification-source-type';
import { NotificationEvents } from 'src/modules/notifications/events/names/notification-events.constants';
import { EmailQueueService } from 'src/queues';
import { QueueNames } from 'src/queues/config/queue-names.enum';
import { BaseReminderJob } from 'src/queues/types/reminder-job.types';

@Processor(QueueNames.REMINDER)
export class ReminderProcessor extends WorkerHost implements OnModuleDestroy {
  constructor(
    private readonly emailQueueService: EmailQueueService,
    private readonly reminderRepo: ReminderRepository,
    private readonly eventEmitter: EventEmitter2,
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

  async process(job: Job<BaseReminderJob, unknown, string>): Promise<void> {
    this.logger.log(
      `Processing reminder job ${job.id} of type ${job.data.type}`,
    );
    try {
      await this.reminderRepo.markAsSent(job.data.reminderId);

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

      this.eventEmitter.emit(NotificationEvents.Created, {
        userId: job.data.userId,
        title: `Reminder: ${job.data.todoTitle}`,
        body: `Don't forget to complete your task: ${job.data.todoTitle}`,
        sourceType: NotificationSourceType.TODOS,
        sourceId: job.data.todoId,
        payload: {
          reminderId: job.data.reminderId,
          todoId: job.data.todoId,
          reminderAt: job.data.reminderAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to process reminder job ${job.id}:`, error);
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
