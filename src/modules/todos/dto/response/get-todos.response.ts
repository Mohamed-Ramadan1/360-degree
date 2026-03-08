import { ApiProperty } from '@nestjs/swagger';
import { ITodo } from '../../interfaces/entities/todo.interface';
import { PaginatedResponseDto } from 'src/common/pagination/dto';

export class GetAllTodosResponse extends PaginatedResponseDto<ITodo> {
  @ApiProperty({
    description: 'A message indicating the result of the operation',
    example: 'Todos retrieved successfully',
    required: true,
  })
  message: string;
}
