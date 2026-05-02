import { EntityManager } from 'typeorm';
import { PaginatedResponseDto } from 'src/common/pagination/dto';
import { IHabitStreak } from '../entities/habit-streak.interface';

export interface IHabitStreakRepository {
  update(id: string, updateData: Partial<IHabitStreak>): Promise<void>;

  updateWithManager(
    id: string,
    updateData: Partial<IHabitStreak>,
    manager: EntityManager,
  ): Promise<void>;

  findActive(habitId: string): Promise<IHabitStreak | null>;

  findActiveWithManager(
    habitId: string,
    manager: EntityManager,
  ): Promise<IHabitStreak | null>;

  create(data: Partial<IHabitStreak>): Promise<IHabitStreak>;

  createWithManager(
    data: Partial<IHabitStreak>,
    manager: EntityManager,
  ): Promise<IHabitStreak>;

  findByHabitId(habitId: string): Promise<PaginatedResponseDto<IHabitStreak>>;
}
