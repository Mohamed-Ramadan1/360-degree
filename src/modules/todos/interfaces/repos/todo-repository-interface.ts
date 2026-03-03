import { Repository } from 'typeorm';
import { Todo } from '../../entities/todo.entity';
import { PaginatedResponseDto } from 'src/common/pagination/dto/response/paginated-response.dto';
import { PaginationDto } from 'src/common/pagination/dto/requests/pagination.dto';

export interface ITodoRepository {
  repository: Repository<Todo>;
  createTodo(userId: string, todoData: Partial<Todo>): Promise<Todo>;
  getAllTodos(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Todo>>;
  findOneById(id: string, userId: string): Promise<Todo>;
  findAndUpdate(
    id: string,
    updateData: Partial<Todo>,
    userId: string,
  ): Promise<void>;
  findAndDelete(id: string, userId: string): Promise<void>;
}
