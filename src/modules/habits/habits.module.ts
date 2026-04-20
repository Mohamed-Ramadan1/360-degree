import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Habit } from './entities/habit.entity';
import { HabitRepository } from './repos/habit.repository';
import { HabitsService } from './services/habits-service';
import { HabitsController } from './controllers/habits-controller';
import { HabitScheduler } from './schedulers/habit.scheduler';
import { HabitStreak } from './entities/habit-streak.entity';
import { HabitStreakRepository } from './repos/habit-streak.repository';
import { HabitStreakController } from './controllers/habit-streak-controller';
import { HabitStreakService } from './services/habit-streak-service';

@Module({
  imports: [TypeOrmModule.forFeature([Habit, HabitStreak])],
  controllers: [HabitsController, HabitStreakController],
  providers: [
    HabitsService,
    HabitRepository,
    HabitScheduler,
    HabitStreakRepository,
    HabitStreakService,
  ],

  exports: [HabitRepository],
})
export class HabitsModule {}
