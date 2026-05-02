import { EntityManager } from 'typeorm';
import { PaginatedResponseDto } from 'src/common/pagination/dto';
import { GetHabitsDto, HabitCreateDto } from '../../dto';
import { IHabit } from '../entities/habit.interface';

export interface IHabitRepository {
  createHabit(
    createHabitDto: HabitCreateDto,
    nextTriggerAt: Date,
    endDate: Date | null,
    userId: string,
  ): Promise<IHabit>;

  findDueHabits(): Promise<IHabit[] | null>;

  update(id: string, updateData: Partial<IHabit>): Promise<void>;

  updateWithManager(
    id: string,
    updateData: Partial<IHabit>,
    manager: EntityManager,
  ): Promise<void>;

  findById(id: string, ownerId: string): Promise<IHabit | null>;

  findByIdForUpdate(
    id: string,
    ownerId: string,
    manager: EntityManager,
  ): Promise<IHabit | null>;

  delete(id: string): Promise<void>;

  findHabits(
    ownerId: string,
    getHabitsDto: GetHabitsDto,
  ): Promise<PaginatedResponseDto<IHabit>>;
}
