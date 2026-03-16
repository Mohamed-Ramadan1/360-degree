import { Body, Controller, Post, Req } from '@nestjs/common';
import { HabitsService } from '../services/habits-service';
import { HabitCreateDto } from '../dto';

@Controller()
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  async createHabit(@Body() createHabitDto: HabitCreateDto, @Req() req) {
    const habit = await this.habitsService.createHabit(
      createHabitDto,
      req.user,
    );
    return {
      message: 'Habit created successfully',
      habit,
    };
  }

  // TODO: Add endpoints for updating, deleting, and fetching habits
}
