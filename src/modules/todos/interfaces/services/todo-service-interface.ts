import { PaginatedResponseDto } from 'src/common/pagination/dto/response/paginated-response.dto';
import { ITodo } from '../entities/todo.interface';
import { PaginationDto } from 'src/common/pagination/dto';

export interface ITodoService {
  createTodo(userId: string, todoData: Partial<ITodo>): Promise<ITodo>;
  getAllTodos(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<ITodo>>;
  getTodoById(id: string, userId: string): Promise<ITodo>;
  updateTodo(
    id: string,
    updateData: Partial<ITodo>,
    userId: string,
  ): Promise<void>;
  updateTodoStatus(
    id: string,
    updateStatusData: Partial<ITodo>,
    userId: string,
  ): Promise<void>;
  deleteTodo(id: string, userId: string): Promise<void>;
}
