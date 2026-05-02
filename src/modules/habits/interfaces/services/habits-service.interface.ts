import { PaginatedResponseDto } from 'src/common/pagination/dto';
import {
  GetHabitsDto,
  HabitCreateDto,
  HabitUpdateDto,
  HabitUpdateInfoDto,
} from '../../dto';
import { IUser } from 'src/modules/users/interfaces';
import { IHabit } from '../entities/habit.interface';

export interface IHabitsService {
  createHabit(createHabitDto: HabitCreateDto, user: IUser): Promise<IHabit>;

  updateHabitInfo(
    habitId: string,
    updateHabitDto: HabitUpdateInfoDto,
    user: IUser,
  ): Promise<void>;

  updateHabitSchedule(
    habitId: string,
    updateHabitDto: HabitUpdateDto,
    user: IUser,
  ): Promise<void>;

  deleteHabit(habitId: string, user: IUser): Promise<void>;

  getHabitById(habitId: string, user: IUser): Promise<IHabit>;

  getHabits(
    user: IUser,
    getHabitsDto: GetHabitsDto,
  ): Promise<PaginatedResponseDto<IHabit>>;
}
