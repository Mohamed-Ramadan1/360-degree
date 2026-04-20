import { ApiProperty } from '@nestjs/swagger';

export class CompleteHabitResponse {
  @ApiProperty({
    description: 'Response message',
    example: 'Habit completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Number of times the habit has been completed',
    example: 5,
  })
  completionCount: number;

  @ApiProperty({
    description: 'Current streak length',
    example: 3,
    nullable: true,
  })
  currentStreak: number | null;

  @ApiProperty({
    description: 'Longest streak length',
    example: 7,
    nullable: true,
  })
  longestStreak: number | null;
}
