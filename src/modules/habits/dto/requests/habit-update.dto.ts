import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class HabitUpdateDto {
  @ApiProperty({
    description: 'The new title of the habit',
    example: 'Drink water',
    required: false,
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time must be in HH:mm 24-hour format (e.g. 10:00 or 22:00)',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  time?: string;

  @ApiProperty({
    description: 'The days of the week when the habit should be performed',
    example: [1, 3, 5],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  days?: number[];

  @ApiProperty({
    description: 'The day of the month when the habit should be performed',
    example: 15,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @ApiProperty({
    description: 'The date when the habit should end',
    example: '2023-12-31',
    required: false,
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate must be in YYYY-MM-DD format',
  })
  endDate?: string;
}
