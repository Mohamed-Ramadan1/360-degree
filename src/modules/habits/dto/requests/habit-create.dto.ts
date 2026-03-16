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
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(RecurrenceType)
  @IsValidHabitRecurrence()
  @IsNotEmpty()
  recurrenceType: RecurrenceType;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time must be in HH:mm 24-hour format (e.g. 10:00 or 22:00)',
  })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ValidateIf((o) => o.recurrenceType === RecurrenceType.WEEKLY)
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  days?: number[];

  @ValidateIf((o) => o.recurrenceType === RecurrenceType.MONTHLY)
  @IsInt()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate must be in YYYY-MM-DD format',
  })
  endDate?: string;
}
