import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Habit } from '../entities/habit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HabitCreateDto } from '../dto';
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
    nextTriggerAt: Date,
    endDate: Date | null,
    userId: string,
  ) {
    return await this.habitRepository.save({
      id: generateId(),
      ...createHabitDto,
      nextTriggerAt,
      endDate,
      ownerId: userId,
    });
  }

  async findDueHabits(): Promise<Habit[] | null> {
    const now = new Date();
    // const now = new Date('2026-04-01T04:35:00.000Z');
    console.log(now);
    return this.habitRepository
      .createQueryBuilder('habit')
      .leftJoin('habit.owner', 'owner')
      .select([
        'habit.id',
        'habit.title',
        'habit.recurrenceType',
        'habit.time',
        'habit.days',
        'habit.dayOfMonth',
        'habit.endDate',
        'habit.nextTriggerAt',
        'owner.email',
        'owner.name',
        'owner.timezone',
      ])
      .where('habit.isActive = true')
      .andWhere('habit.nextTriggerAt <= :now', { now })
      .getMany();
  }

  async update(id: string, updateData: Partial<Habit>): Promise<void> {
    await this.habitRepository.update(id, updateData);
  }
}
