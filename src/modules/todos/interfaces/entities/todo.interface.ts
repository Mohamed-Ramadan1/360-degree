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
  createdAt: Date;
  updatedAt: Date;
}
