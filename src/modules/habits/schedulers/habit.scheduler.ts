import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from 'src/logs/logger.service';
import { HabitQueueService } from 'src/queues/services/habit-queu.service';
import { HabitRepository } from '../repos/habit.repository';

@Injectable()
export class HabitScheduler implements OnModuleInit {
  constructor(
    private readonly habitQueueService: HabitQueueService,
    private readonly habitRepo: HabitRepository,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    this.logger.log('HabitScheduler initialized');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkReminders() {
    const habits = await this.habitRepo.findDueHabits();
    console.log('Found due habits: corn', habits);
    if (!habits || habits.length === 0) return;
    await Promise.all(
      habits.map((habit) =>
        this.habitQueueService.addHabitJob({
          type: 'send-habit-reminder',
          habitId: habit.id,
          userId: habit.owner.id,
          userEmail: habit.owner.email,
          userName: habit.owner.name,
          habitTitle: habit.title,
          recurrenceType: habit.recurrenceType,
          time: habit.time,
          days: habit.days,
          dayOfMonth: habit.dayOfMonth,
          endDate: habit.endDate,
          timezone: habit.owner.timezone,
        }),
      ),
    );
  }
}
