import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReminderCreateDto, ReminderUpdateDto } from '../dto';
import { ReminderRepository } from '../repos/reminder.repo';
import { TodoRepository } from '../repos';
import { LoggerService } from 'src/logs/logger.service';
import { Reminder } from '../entities/reminder.entity';
import { generateId } from 'src/utils';
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
      const todo = await this.todoRepository.findTodoWithReminders(
        todoId,
        userId,
      );
      if (!todo) throw new NotFoundException('Todo not found');

      if (todo.reminders.length >= 5) {
        throw new BadRequestException('Maximum 5 reminders per todo');
      }

      const reminderAt = new Date(reminderDto.reminderAt);
      this.validateReminderAt(reminderAt, todo.reminders);

      return await this.reminderRepository.create({
        id: generateId(),
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

  async updateReminder(
    todoId: string,
    reminderId: string,
    reminderDto: ReminderUpdateDto,
    userId: string,
  ) {
    try {
      const todo = await this.todoRepository.findTodoWithReminders(
        todoId,
        userId,
      );
      if (!todo) throw new NotFoundException('Todo not found');

      const reminderAt = new Date(reminderDto.reminderAt);
      this.validateReminderAt(
        reminderAt,
        todo.reminders.filter((r) => r.id !== reminderId),
      );
      await this.reminderRepository.update(reminderId, {
        reminderAt,
        isSent: false,
      });
    } catch (error) {
      this.logger.error('Failed to update reminder', error);
      throw error;
    }
  }

  async deleteReminder(todoId: string, reminderId: string, userId: string) {
    try {
      await this.todoRepository.findOneById(todoId, userId);

      await this.reminderRepository.delete(reminderId, todoId);
    } catch (error) {
      this.logger.error('Failed to delete reminder', error);
      throw error;
    }
  }

  private validateReminderAt(reminderAt: Date, existingReminders: Reminder[]) {
    const tooClose = existingReminders.some((r) => {
      const diff = Math.abs(r.reminderAt.getTime() - reminderAt.getTime());
      return diff < 15 * 60 * 1000;
    });

    if (tooClose) {
      throw new BadRequestException(
        'Reminder must be at least 15 minutes apart',
      );
    }
  }
}
