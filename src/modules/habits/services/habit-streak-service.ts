import { BadRequestException, Injectable } from '@nestjs/common';
import { IUser } from 'src/modules/users/interfaces';
import { TimezoneService } from 'src/common/services/timezone.service';
import { RecurrenceType } from 'src/common/consts';
import { DateTime } from 'luxon';
import { IHabit } from '../interfaces';
import { DataSource, EntityManager } from 'typeorm';
import { HabitRepository } from '../repos/habit.repository';
import { HabitStreakRepository } from '../repos/habit-streak.repository';

@Injectable()
export class HabitStreakService {
  constructor(
    private readonly timezoneService: TimezoneService,
    private readonly dataSource: DataSource,
    private readonly habitRepository: HabitRepository,
    private readonly habitStreakRepository: HabitStreakRepository,
  ) {}

  async completeHabit(habitId: string, user: IUser) {
    const userNow = this.timezoneService.userNowInTimezone(user.timezone);

    return this.dataSource.transaction(async (manager) => {
      const habit = await this.habitRepository.findByIdForUpdate(
        habitId,
        user.id,
        manager,
      );

      if (!habit)
        throw new BadRequestException('Invalid habit ID or habit not found');

      // Enforce recurrence rules so each habit can be completed only once
      // in its valid completion window.
      this.validateCompletion(habit, userNow, user.timezone);

      const nextCompletionCount = habit.completionCount + 1;

      // Always increment completion count for all recurrence types.
      await this.habitRepository.updateWithManager(
        habitId,
        {
          completionCount: nextCompletionCount,
          lastCompletedAt: userNow.toJSDate(),
        },
        manager,
      );

      let currentStreak: number | null = null;
      let longestStreak: number | null = null;

      // Daily habits also update streak stats.
      if (habit.recurrenceType === RecurrenceType.DAILY) {
        const dailyStreak = await this.handleDailyStreak(
          habit,
          userNow,
          user.timezone,
          manager,
        );
        currentStreak = dailyStreak.currentStreak;
        longestStreak = dailyStreak.longestStreak;
      }

      return {
        completionCount: nextCompletionCount,
        currentStreak,
        longestStreak,
      };
    });
  }

  async getHabitStreaks(habitId: string, user: IUser) {
    const habit = await this.habitRepository.findById(habitId, user.id);
    if (!habit)
      throw new BadRequestException('Invalid habit ID or habit not found');

    if (habit.recurrenceType !== RecurrenceType.DAILY)
      throw new BadRequestException(
        'Streaks are only available for daily habits',
      );

    const result = await this.habitStreakRepository.findByHabitId(habitId);

    return {
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalStreaks: habit.completionCount,
      ...result,
    };
  }

  private validateCompletion(
    habit: IHabit,
    userNow: DateTime,
    userTimezone: string,
  ) {
    const lastCompleted = habit.lastCompletedAt
      ? DateTime.fromJSDate(habit.lastCompletedAt).setZone(userTimezone)
      : null;

    switch (habit.recurrenceType) {
      case RecurrenceType.DAILY: {
        // One completion per day
        if (lastCompleted?.hasSame(userNow, 'day')) {
          throw new BadRequestException('Already completed today');
        }
        break;
      }

      case RecurrenceType.WEEKLY: {
        // Check if the current day is in the scheduled days
        const currentDay = userNow.weekday % 7;
        if (!habit.days?.includes(currentDay)) {
          throw new BadRequestException('Today is not a scheduled day');
        }
        // One completion per day
        if (lastCompleted?.hasSame(userNow, 'day')) {
          throw new BadRequestException('Already completed today');
        }
        break;
      }

      case RecurrenceType.MONTHLY: {
        // Check if the current day is the scheduled day
        if (userNow.day !== habit.dayOfMonth) {
          throw new BadRequestException('Today is not the scheduled day');
        }
        // One completion per month
        if (lastCompleted?.hasSame(userNow, 'month')) {
          throw new BadRequestException('Already completed this month');
        }
        break;
      }

      case RecurrenceType.LAST_DAY_OF_MONTH: {
        // Check if the current day is the last day of the month
        if (userNow.day !== userNow.daysInMonth) {
          throw new BadRequestException(
            'Today is not the last day of the month',
          );
        }
        // One completion per month
        if (lastCompleted?.hasSame(userNow, 'month')) {
          throw new BadRequestException('Already completed this month');
        }
        break;
      }
    }
  }

  private async handleDailyStreak(
    habit: IHabit,
    userNow: DateTime,
    userTimezone: string,
    manager: EntityManager,
  ): Promise<{ currentStreak: number; longestStreak: number }> {
    const lastCompleted = habit.lastCompletedAt
      ? DateTime.fromJSDate(habit.lastCompletedAt).setZone(userTimezone)
      : null;

    const isConsecutiveDay =
      !!lastCompleted &&
      lastCompleted.hasSame(userNow.minus({ days: 1 }), 'day');

    const nextCurrentStreak = isConsecutiveDay ? habit.currentStreak + 1 : 1;
    const nextLongestStreak = Math.max(habit.longestStreak, nextCurrentStreak);

    await this.habitRepository.updateWithManager(
      habit.id,
      {
        currentStreak: nextCurrentStreak,
        longestStreak: nextLongestStreak,
      },
      manager,
    );

    const activeStreak = await this.habitStreakRepository.findActiveWithManager(
      habit.id,
      manager,
    );

    if (isConsecutiveDay) {
      if (activeStreak) {
        await this.habitStreakRepository.updateWithManager(
          activeStreak.id,
          {
            count: nextCurrentStreak,
          },
          manager,
        );
      } else {
        await this.habitStreakRepository.createWithManager(
          {
            habitId: habit.id,
            count: nextCurrentStreak,
            startedAt: userNow
              .minus({ days: nextCurrentStreak - 1 })
              .toUTC()
              .toJSDate(),
            endedAt: null,
          },
          manager,
        );
      }
    } else {
      if (activeStreak) {
        await this.habitStreakRepository.updateWithManager(
          activeStreak.id,
          {
            endedAt: userNow.toUTC().toJSDate(),
          },
          manager,
        );
      }

      await this.habitStreakRepository.createWithManager(
        {
          habitId: habit.id,
          count: 1,
          startedAt: userNow.toUTC().toJSDate(),
          endedAt: null,
        },
        manager,
      );
    }

    return {
      currentStreak: nextCurrentStreak,
      longestStreak: nextLongestStreak,
    };
  }
}
