import { Repository } from 'typeorm';
import { Todo } from '../../entities/todo.entity';

export interface ITodoRepository {
  repository: Repository<Todo>;
  createTodo(userId: string, todoData: Partial<Todo>): Promise<Todo>;
  getAllTodos(): Promise<Todo[]>;
  findOneById(id: string): Promise<Todo>;
  findAndUpdate(id: string, updateData: Partial<Todo>): Promise<void>;
  findAndDelete(id: string): Promise<void>;
}
