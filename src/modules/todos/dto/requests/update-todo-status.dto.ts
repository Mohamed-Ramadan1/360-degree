import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TodoStatus } from 'src/common/consts/todo-status';

export class UpdateTodoStatusDto {
  @ApiProperty({
    description: 'The new status of the todo',
    enum: TodoStatus,
    example: TodoStatus.DONE,
  })
  @IsEnum(TodoStatus)
  @IsNotEmpty()
  status: TodoStatus;
}
