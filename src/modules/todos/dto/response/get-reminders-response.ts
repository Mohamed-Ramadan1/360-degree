import { ApiProperty } from '@nestjs/swagger';
import { IReminder } from '../../interfaces';

export class GetRemindersResponse {
  @ApiProperty({
    description: 'Response message indicating the result of the operation',
    example: 'Reminders retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'List of reminders retrieved for the specified todo',
  })
  reminders: IReminder[];
}
