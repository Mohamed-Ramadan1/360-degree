import { IsEnum, IsOptional, MaxLength } from 'class-validator';
import { RecurrenceType } from 'src/common/consts/habit-recurrence';
import { PaginationDto } from 'src/common/pagination/dto';

export class GetHabitsDto extends PaginationDto {
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrenceType?: string;
}
