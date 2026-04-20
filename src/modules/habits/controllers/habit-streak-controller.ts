import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { HabitStreakService } from '../services/habit-streak-service';

@Controller(':id')
export class HabitStreakController {
  constructor(private readonly habitStreakService: HabitStreakService) {}

  @Patch('complete')
  async completeHabit(@Param('id') habitId: string, @Req() req) {
    const result = await this.habitStreakService.completeHabit(
      habitId,
      req.user,
    );
    return {
      message: 'Habit completed successfully',
      ...result,
    };
  }
}
