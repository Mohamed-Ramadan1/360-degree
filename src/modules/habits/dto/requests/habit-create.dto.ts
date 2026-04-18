import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateIf,
} from 'class-validator';
import { RecurrenceType } from 'src/common/consts';
import { IsValidHabitRecurrence } from 'src/common/validators';

export class HabitCreateDto {
  @ApiProperty({
    description: 'The title of the habit',
    example: 'Morning Jog',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({
    description: 'The description of the habit',
    example: 'Jog for 30 minutes every morning to stay fit.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'The type of recurrence for the habit',
    example: 'daily',
    enum: RecurrenceType,
  })
  @IsEnum(RecurrenceType)
  @IsValidHabitRecurrence()
  @IsNotEmpty()
  recurrenceType!: RecurrenceType;

  @ApiProperty({
    description:
      'The time of day to perform the habit (in HH:mm 24-hour format)',
    example: '07:00',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time must be in HH:mm 24-hour format (e.g. 10:00 or 22:00)',
  })
  @IsString()
  @IsNotEmpty()
  time!: string;

  @ApiProperty({
    description:
      'The days of the week to perform the habit (0 = Sunday, 6 = Saturday)',
    example: [1, 3, 5],
  })
  @ValidateIf((o) => o.recurrenceType === RecurrenceType.WEEKLY)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  days?: number[];

  @ApiProperty({
    description: 'The day of the month to perform the habit (1-31)',
    example: 15,
  })
  @ValidateIf((o) => o.recurrenceType === RecurrenceType.MONTHLY)
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @ApiProperty({
    description: 'The end date for the habit (in YYYY-MM-DD format)',
    example: '2023-12-31',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate must be in YYYY-MM-DD format',
  })
  endDate?: string;
}
