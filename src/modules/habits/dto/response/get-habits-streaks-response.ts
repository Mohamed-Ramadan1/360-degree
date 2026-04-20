import { PaginatedResponseDto } from 'src/common/pagination/dto';
import { IHabitStreak } from '../../interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class GetHabitsStreaksResponse extends PaginatedResponseDto<IHabitStreak> {
  @ApiProperty({
    description:
      'A message indicating the result of the habit streaks retrieval',
    example: 'Habit streaks retrieved successfully',
    required: true,
  })
  message: string;
}
