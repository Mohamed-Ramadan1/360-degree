import { TodoPriority } from 'src/common/consts';

export interface BaseReminderJob {
  type: string;
  reminderId: string;
  userEmail: string;
  userName: string;
  todoTitle: string;
  reminderAt: Date;
  priority: TodoPriority;
  todoId: string;
}
