import { Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { Habit } from '../entities/habit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HabitCreateDto } from '../dto';
import { RecurrenceType } from 'src/common/consts/habit-recurrence';
import { TimezoneService } from 'src/common/services/timezone.service';
import { generateId } from 'src/utils';

@Injectable()
export class HabitRepository {
  constructor(
    @InjectRepository(Habit)
    private readonly habitRepository: Repository<Habit>,
    private readonly timezoneService: TimezoneService,
  ) {}
  async createHabit(
    createHabitDto: HabitCreateDto,
    timeUTC: string,
    daysUTC: number[] | null,
    endDate: Date | null,
    userId: string,
  ) {
    return await this.habitRepository.save({
      id: generateId(),
      ...createHabitDto,
      timeUTC: timeUTC,
      days: daysUTC,
      endDate: endDate,
      ownerId: userId,
    });
  }

  async findDueHabits(): Promise<Habit[] | null> {
    const now = this.timezoneService.getUTCDateTime();
    const currentTimeUTC = now.toFormat('HH:mm'); // '23:02'
    const currentDay = now.weekday % 7; // 0-6
    const currentDate = now.day; // 1-31
    const daysInMonth = now.daysInMonth; // 31

    return this.habitRepository
      .createQueryBuilder('habit')
      .leftJoinAndSelect('habit.owner', 'owner')
      .select([
        'habit.id',
        'habit.title',
        'habit.time',
        'owner.email',
        'owner.name',
      ])
      .where('habit.isActive = true')
      .andWhere('habit.timeUTC = :time', { time: currentTimeUTC })
      .andWhere('(habit.endDate IS NULL OR habit.endDate > :now)', { now })
      .andWhere(
        '(habit.lastSentAt IS NULL OR DATE(habit.lastSentAt) < DATE(:now))',
        { now },
      )
      .andWhere(
        new Brackets((qb) => {
          qb.orWhere('habit.recurrenceType = :daily', {
            daily: RecurrenceType.DAILY,
          })
            .orWhere(
              'habit.recurrenceType = :weekly AND :day = ANY(habit.days)',
              { weekly: RecurrenceType.WEEKLY, day: currentDay },
            )
            .orWhere(
              `habit.recurrenceType = :monthly AND (
              habit.dayOfMonth = :currentDate
              OR (habit.dayOfMonth > :daysInMonth AND :currentDate = :daysInMonth)
            )`,
              { monthly: RecurrenceType.MONTHLY, currentDate, daysInMonth },
            )
            .orWhere(
              'habit.recurrenceType = :lastDay AND :currentDate = :daysInMonth',
              {
                lastDay: RecurrenceType.LAST_DAY_OF_MONTH,
                currentDate,
                daysInMonth,
              },
            );
        }),
      )
      .getMany();
  }

  async markAsSent(habitId: string): Promise<void> {
    await this.habitRepository.update(habitId, {
      lastSentAt: new Date(),
    });
  }
}
