import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Validate,
} from 'class-validator';
import { TodoPriority } from 'src/common/consts';
import { IsFutureDate } from 'src/common/validators/is-future-date.validator';

export class UpdateTodoDto {
  @ApiProperty({ example: 'Buy groceries', description: 'Title of the todo' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    example: 'Milk, Bread, Eggs',
    description: 'Detailed description of the todo',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59Z',
    description: 'Due date in ISO format',
  })
  @IsISO8601({ strict: true })
  @IsOptional()
  @Validate(IsFutureDate)
  dueDate?: Date;

  @ApiProperty({
    example: 'medium',
    description: 'Priority level of the todo',
    enum: TodoPriority,
    default: TodoPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isPersonal?: boolean = true;

  @ApiProperty({ example: ['work', 'urgent'] })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ example: 'uuid-1' })
  @IsUUID('4')
  @IsOptional()
  categoryId?: string;
}
