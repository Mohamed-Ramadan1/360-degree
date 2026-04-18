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
import { TimezoneService } from 'src/common/services/timezone.service';
import { IUser } from 'src/modules/users/interfaces/entities/user.interface';
@Injectable()
export class ReminderService {
  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly todoRepository: TodoRepository,
    private readonly timezoneService: TimezoneService,
    private readonly logger: LoggerService,
  ) {}
  private readonly MAX_REMINDERS = 5;

  async createReminder(
    todoId: string,
    reminderDto: ReminderCreateDto,
    user: IUser,
  ) {
    try {
      const todo = await this.todoRepository.findTodoWithReminders(
        todoId,
        user.id,
      );
      if (!todo) throw new NotFoundException('Todo not found');

      if (todo.reminders.length >= this.MAX_REMINDERS) {
        throw new BadRequestException(
          `Maximum ${this.MAX_REMINDERS} reminders per todo`,
        );
      }

      const reminderAtUTC = this.getValidReminderTime(
        reminderDto.reminderAt,
        user.timezone,
      );
      this.validateReminderAt(reminderAtUTC, todo.reminders);

      return this.reminderRepository.create({
        id: generateId(),
        todoId,
        reminderAt: reminderAtUTC,
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
    user: IUser,
  ) {
    try {
      const todo = await this.todoRepository.findTodoWithReminders(
        todoId,
        user.id,
      );
      if (!todo) throw new NotFoundException('Todo not found');

      const reminderAtUTC = this.getValidReminderTime(
        reminderDto.reminderAt,
        user.timezone,
      );

      this.validateReminderAt(
        reminderAtUTC,
        todo.reminders.filter((r) => r.id !== reminderId),
      );
      await this.reminderRepository.update(reminderId, {
        reminderAt: reminderAtUTC,
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

  private getValidReminderTime(reminderAt: Date, timezone: string) {
    const reminderAtDate = new Date(reminderAt);
    const reminderAtUTC = this.timezoneService.calculateReminderTriggerAt(
      reminderAtDate,
      timezone,
    );

    const isOld = this.timezoneService.checkIfTimeOldForTimezone(
      reminderAtUTC,
      timezone,
    );

    if (isOld) {
      throw new BadRequestException('Reminder date is in the past');
    }

    return reminderAtUTC;
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
