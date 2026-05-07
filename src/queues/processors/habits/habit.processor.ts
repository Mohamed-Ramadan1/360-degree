import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bullmq';
import { NotificationSourceType } from 'src/common/consts/notification-source-type';
import { TimezoneService } from 'src/common/services/timezone.service';
import { LoggerService } from 'src/logs/logger.service';
import { generateHabitReminderEmail } from 'src/modules/habits/emails/templates/habitReminderEmail';
import { HabitRepository } from 'src/modules/habits/repos/habit.repository';
import { NotificationEvents } from 'src/modules/notifications/events/names/notification-events.constants';
import { EmailQueueService } from 'src/queues';
import { QueueNames } from 'src/queues/config/queue-names.enum';
import { BaseHabitJob } from 'src/queues/types/habit-job.type';

@Processor(QueueNames.HABIT)
export class HabitProcessor extends WorkerHost implements OnModuleDestroy {
  constructor(
    private readonly emailQueueService: EmailQueueService,
    private readonly habitRepo: HabitRepository,
    private readonly timezoneService: TimezoneService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  onModuleDestroy() {
    try {
      this.logger.log('Habit processor shutting down gracefully');
    } catch (error) {
      this.logger.error('Error closing habit processor:', error as Error);
    }
  }

  async process(job: Job<any, any, string>): Promise<void> {
    this.logger.log(`Processing habit job ${job.id} of type ${job.data.type}`);
    try {
      const nextTriggerAt = this.timezoneService.calculateNextTriggerAt(
        {
          recurrenceType: job.data.recurrenceType,
          time: job.data.time,
          days: job.data.days,
          dayOfMonth: job.data.dayOfMonth,
          endDate: job.data.endDate,
        },
        job.data.timezone,
      );

      if (nextTriggerAt) {
        await this.habitRepo.update(job.data.habitId, { nextTriggerAt });
      } else {
        await this.habitRepo.update(job.data.habitId, {
          isActive: false,
          nextTriggerAt: null,
        });
      }

      await this.emailQueueService.addEmailJob({
        type: 'habit-email',
        to: job.data.userEmail,
        subject: `Habit Reminder: ${job.data.habitTitle}`,
        text: `Don't forget to complete your habit: ${job.data.habitTitle}`,
        html: generateHabitReminderEmail({
          userName: job.data.userName,
          habitTitle: job.data.habitTitle,
          habitAt: job.data.time,
          habitId: job.data.habitId,
        }),
      });

      this.eventEmitter.emit(NotificationEvents.Created, {
        userId: job.data.userId,
        title: `Habit Reminder: ${job.data.habitTitle}`,
        body: `Don't forget to complete your habit: ${job.data.habitTitle}`,
        sourceType: NotificationSourceType.HABITS,
        sourceId: job.data.habitId,
        payload: {
          habitId: job.data.habitId,
          recurrenceType: job.data.recurrenceType,
          scheduledTime: job.data.time,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to process habit job ${job.id}:`, error);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<BaseHabitJob>) {
    this.logger.log(
      `Habit job ${job.id} (${job.data.type}) completed successfully`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<BaseHabitJob>, error: Error) {
    this.logger.error(
      `Habit job ${job.id} (${job.data.type}) failed:`,
      error.message,
    );
  }

  @OnWorkerEvent('stalled')
  onStalled(job: Job<BaseHabitJob>) {
    this.logger.warn(
      `Habit job ${job.id} (${job.data.type}) stalled - retrying...`,
    );
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<BaseHabitJob>, progress: number) {
    this.logger.debug(`Habit job ${job.id} progress: ${progress}%`);
  }
}
