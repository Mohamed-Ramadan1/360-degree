import { TodoPriority, TodoStatus } from 'src/common/consts';

export interface ITodo {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: TodoPriority;
  status: TodoStatus;
  isPersonal: boolean;
  ownerId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
