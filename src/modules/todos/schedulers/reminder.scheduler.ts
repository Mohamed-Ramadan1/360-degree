import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReminderRepository } from 'src/modules/todos/repos/reminder.repo';
import { ReminderQueueService } from '../../../queues/services/reminder-queue.service';
import { LoggerService } from 'src/logs/logger.service';

@Injectable()
export class ReminderScheduler implements OnModuleInit {
  constructor(
    private readonly reminderQueueService: ReminderQueueService,
    private readonly reminderRepo: ReminderRepository,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    this.logger.log('ReminderScheduler initialized');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkReminders() {
    const reminders = await this.reminderRepo.findDueReminders();

    if (reminders.length === 0) {
      return;
    }

    await Promise.all(
      reminders.map((reminder) =>
        this.reminderQueueService.addReminderJob({
          type: 'send-reminder',
          reminderId: reminder.id,
          userEmail: reminder.todo.owner.email,
          userName: reminder.todo.owner.name,
          todoTitle: reminder.todo.title,
          reminderAt: reminder.reminderAt,
          priority: reminder.todo.priority,
          todoId: reminder.todo.id,
        }),
      ),
    );
  }
}
