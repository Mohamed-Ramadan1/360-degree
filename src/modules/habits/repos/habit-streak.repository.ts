import { EntityManager, IsNull, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HabitStreak } from '../entities/habit-streak.entity';
import { generateId } from 'src/utils';
import { PaginationService } from 'src/common/pagination/paginate.service';
import { IHabitStreakRepository } from '../interfaces';

@Injectable()
export class HabitStreakRepository implements IHabitStreakRepository {
  constructor(
    @InjectRepository(HabitStreak)
    private readonly habitStreakRepository: Repository<HabitStreak>,
    private readonly paginationService: PaginationService,
  ) {}

  async update(id: string, updateData: Partial<HabitStreak>) {
    await this.habitStreakRepository.update(id, updateData);
  }

  async updateWithManager(
    id: string,
    updateData: Partial<HabitStreak>,
    manager: EntityManager,
  ) {
    await manager.getRepository(HabitStreak).update(id, updateData);
  }

  async findActive(habitId: string): Promise<HabitStreak | null> {
    return this.habitStreakRepository.findOne({
      where: { habitId, endedAt: IsNull() },
    });
  }

  async findActiveWithManager(
    habitId: string,
    manager: EntityManager,
  ): Promise<HabitStreak | null> {
    return manager.getRepository(HabitStreak).findOne({
      where: { habitId, endedAt: IsNull() },
    });
  }

  async create(data: Partial<HabitStreak>): Promise<HabitStreak> {
    const streak = this.habitStreakRepository.create({
      id: generateId(),
      ...data,
    });
    return this.habitStreakRepository.save(streak);
  }

  async createWithManager(
    data: Partial<HabitStreak>,
    manager: EntityManager,
  ): Promise<HabitStreak> {
    const streak = manager.getRepository(HabitStreak).create({
      id: generateId(),
      ...data,
    });
    return manager.getRepository(HabitStreak).save(streak);
  }

  async findByHabitId(habitId: string) {
    const queryBuilder = this.habitStreakRepository
      .createQueryBuilder('habit_streaks')
      .where('habit_streaks.habitId = :habitId', { habitId })
      .select([
        'habit_streaks.id',
        'habit_streaks.count',
        'habit_streaks.startedAt',
        'habit_streaks.endedAt',
      ]);

    return this.paginationService.paginate(
      queryBuilder,
      {},
      { alias: 'habit_streaks' },
    );
  }
}
