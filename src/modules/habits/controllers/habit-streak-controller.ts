import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { HabitStreakService } from '../services/habit-streak-service';

@Controller(':id')
export class HabitStreakController {
  constructor(private readonly habitStreakService: HabitStreakService) {}

  @Patch('complete')
  @HttpCode(HttpStatus.OK)
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

  @Get('streaks')
  @HttpCode(HttpStatus.OK)
  async getHabitStreaks(@Param('id') habitId: string, @Req() req) {
    const result = await this.habitStreakService.getHabitStreaks(
      habitId,
      req.user,
    );
    return {
      message: 'Habit streaks retrieved successfully',
      ...result,
    };
  }
}
