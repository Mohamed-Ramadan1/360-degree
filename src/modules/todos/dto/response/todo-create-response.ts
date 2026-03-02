import { ApiProperty } from '@nestjs/swagger';
import { ITodo } from '../../interfaces/entities/todo.interface';

export class TodoCreateResponse {
  @ApiProperty({
    description:
      'The message indicating the result of the todo creation operation',
    example: 'Todo item created successfully',
    required: true,
  })
  message: string;

  todo: Pick<
    ITodo,
    | 'id'
    | 'title'
    | 'description'
    | 'status'
    | 'isPersonal'
    | 'ownerId'
    | 'categoryId'
    | 'priority'
    | 'dueDate'
    | 'createdAt'
    | 'updatedAt'
  >;
}
