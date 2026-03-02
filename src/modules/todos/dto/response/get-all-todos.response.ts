import { ApiProperty } from '@nestjs/swagger';
import { ITodo } from '../../interfaces/entities/todo.interface';

export class GetAllTodosResponse {
  @ApiProperty({
    description: 'A message indicating the result of the operation',
    example: 'Todos retrieved successfully',
  })
  message: string;
  @ApiProperty({
    description: 'An array of todo items',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Buy groceries',
        description: 'Milk, Bread, Eggs',
        dueDate: '2024-12-31T23:59:59Z',
        priority: 'High',
        status: 'Pending',
        isPersonal: true,
        ownerId: '123e4567-e89b-12d3-a456-426614174000',
        tags: ['shopping', 'errands'],
        categoryId: null,
      },
    ],
  })
  todos: ITodo[];
}
