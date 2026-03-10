import { ApiProperty } from '@nestjs/swagger';
import { IReminder } from '../../interfaces';

export class ReminderCreateResponse {
  @ApiProperty({
    description: 'Message indicating the result of the reminder creation',
    example: 'Reminder created successfully',
    required: true,
  })
  message: string;

  @ApiProperty({
    description: 'The created reminder details',
    required: true,
  })
  reminder: IReminder;
}
