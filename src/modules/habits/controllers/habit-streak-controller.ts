import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { HabitStreakService } from '../services/habit-streak-service';
import { CompleteHabitResponse, GetHabitsStreaksResponse } from '../dto';
import { Throttle } from '@nestjs/throttler';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Throttle({ default: { limit: 25, ttl: 600000 } })
@UseInterceptors(TransformResponseInterceptor)
@ApiTags('Habit Streaks')
@Controller(':id')
export class HabitStreakController {
  constructor(private readonly habitStreakService: HabitStreakService) {}

  @ApiOperation({
    summary: 'Complete a habit and update streaks',
    description:
      "Marks a habit as completed for the current day, updates the completion count, and manages streaks based on the habit's recurrence rules.",
  })
  @ApiOkResponse({
    description: 'Habit completed successfully',
    type: CompleteHabitResponse,
    example: {
      message: 'Habit completed successfully',
      completionCount: 5,
      currentStreak: 3,
      longestStreak: 7,
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid habit ID or habit not found',
    example: {
      statusCode: 400,
      message: 'Habit not found',
      error: 'Bad Request',
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. Please provide valid authentication credentials.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the habit to retrieve streaks for',
  })
  @Patch('complete')
  @HttpCode(HttpStatus.OK)
  async completeHabit(
    @Param('id') habitId: string,
    @Req() req,
  ): Promise<CompleteHabitResponse> {
    const result = await this.habitStreakService.completeHabit(
      habitId,
      req.user,
    );
    return {
      message: 'Habit completed successfully',
      ...result,
    };
  }

  @ApiOperation({
    summary: 'Get habit streaks',
    description:
      'Retrieves the current and longest streaks for a specific habit based on its completion history.',
  })
  @ApiOkResponse({
    description: 'Habit streaks retrieved successfully',
    type: GetHabitsStreaksResponse,
    example: {
      message: 'Habit streaks retrieved successfully',
      data: [
        {
          id: 'streak1',
          count: 3,
          startedAt: '2024-01-01T00:00:00.000Z',
          endedAt: null,
        },
        {
          id: 'streak2',
          count: 7,
          startedAt: '2024-01-01T00:00:00.000Z',
          endedAt: '2024-01-10T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid habit ID or habit not found',
    example: {
      statusCode: 400,
      message: 'Habit not found',
      error: 'Bad Request',
    },
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized. Please provide valid authentication credentials.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the habit to retrieve streaks for',
  })
  @Get('streaks')
  @HttpCode(HttpStatus.OK)
  async getHabitStreaks(
    @Param('id') habitId: string,
    @Req() req,
  ): Promise<GetHabitsStreaksResponse> {
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
