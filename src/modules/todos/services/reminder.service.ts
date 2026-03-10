import { Injectable } from '@nestjs/common';
import { ReminderCreateDto } from '../dto';
import { ReminderRepository } from '../repos/reminder.repo';
import { TodoRepository } from '../repos';
import { v7 as uuidv7 } from 'uuid';
import { LoggerService } from 'src/logs/logger.service';

@Injectable()
export class ReminderService {
  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly todoRepository: TodoRepository,
    private readonly logger: LoggerService,
  ) {}

  async createReminder(
    todoId: string,
    reminderDto: ReminderCreateDto,
    userId: string,
  ) {
    try {
      await this.todoRepository.findOneById(todoId, userId);

      return await this.reminderRepository.create({
        id: uuidv7(),
        todoId,
        reminderAt: reminderDto.reminderAt,
      });
    } catch (error) {
      this.logger.error('Failed to create reminder', error);
      throw error;
    }
  }

  async getRemindersForTodo(todoId: string, userId: string) {
    try {
      await this.todoRepository.findOneById(todoId, userId);

      return await this.reminderRepository.findByTodoId(todoId);
    } catch (error) {
      this.logger.error('Failed to retrieve reminders for todo', error);
      throw error;
    }
  }
}
