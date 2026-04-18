import { RecurrenceType } from 'src/common/consts';
import { IHabit } from '../../interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class getHabitResponse {
  @ApiProperty({
    description: 'A message indicating the result of the habit retrieval',
    example: 'Habit retrieved successfully',
    required: true,
  })
  message!: string;

  @ApiProperty({
    description: 'The retrieved habit object',
    example: {
      id: '1',
      title: 'Drink water',
      description: 'Drink at least 8 glasses of water per day',
      recurrenceType: RecurrenceType.DAILY,
      time: '09:00',
      days: [1, 2, 3, 4, 5, 6, 7],
      dayOfMonth: null,
      endDate: null,
      nextTriggerAt: new Date(),
      ownerId: 'user1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    required: true,
  })
  habit!: IHabit;
}
