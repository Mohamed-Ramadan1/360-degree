import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Habit } from './entities/habit.entity';
import { HabitRepository } from './repos/habit.repository';
import { HabitsService } from './services/habits-service';
import { HabitsController } from './controllers/habits-controller';
import { HabitScheduler } from './schedulers/habit.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([Habit])],
  controllers: [HabitsController],
  providers: [HabitsService, HabitRepository, HabitScheduler],

  exports: [HabitRepository],
})
export class HabitsModule {}
