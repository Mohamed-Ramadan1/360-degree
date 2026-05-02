import { PaginatedResponseDto } from 'src/common/pagination/dto';
import { IUser } from 'src/modules/users/interfaces';
import { IHabitStreak } from '../entities/habit-streak.interface';

export type HabitCompletionResult = {
  completionCount: number;
  currentStreak: number | null;
  longestStreak: number | null;
};

export type HabitStreaksResult = PaginatedResponseDto<IHabitStreak> & {
  currentStreak: number;
  longestStreak: number;
  totalStreaks: number;
};

export interface IHabitStreakService {
  completeHabit(habitId: string, user: IUser): Promise<HabitCompletionResult>;

  getHabitStreaks(habitId: string, user: IUser): Promise<HabitStreaksResult>;
}
