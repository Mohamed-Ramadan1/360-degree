import { ITodo } from '../entities/todo.interface';

export interface ITodoService {
  createTodo(userId: string, todoData: Partial<ITodo>): Promise<ITodo>;
  getAllTodos(): Promise<ITodo[]>;
  getTodoById(id: string): Promise<ITodo>;
  updateTodo(
    id: string,
    updateData: Partial<ITodo>,
    userId: string,
  ): Promise<void>;
  updateTodoStatus(id: string, updateStatusData: Partial<ITodo>): Promise<void>;
  deleteTodo(id: string): Promise<void>;
}
