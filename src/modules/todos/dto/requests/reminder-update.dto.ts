import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, Validate } from 'class-validator';
import { IsFutureDate } from 'src/common/validators/is-future-date.validator';

export class ReminderUpdateDto {
  @ApiProperty({
    example: '2024-12-31T23:59:59Z',
    description: 'Updated reminder date in ISO format',
  })
  @IsISO8601({ strict: true })
  // @Validate(IsFutureDate)
  reminderAt!: Date;
}
