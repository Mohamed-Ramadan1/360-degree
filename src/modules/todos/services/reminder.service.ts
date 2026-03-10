import { Injectable } from '@nestjs/common';
import { ReminderCreateDto } from '../dto';
import { ReminderRepository } from '../repos/reminder.repo';
import { TodoRepository } from '../repos';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class ReminderService {
  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly todoRepository: TodoRepository,
  ) {}

  async createReminder(
    todoId: string,
    reminderDto: ReminderCreateDto,
    userId: string,
  ) {
    // Logic to create a reminder for the specified todo
    await this.todoRepository.findOneById(todoId, userId);

    const reminder = await this.reminderRepository.create({
      id: uuidv7(),
      todoId,
      reminderAt: reminderDto.reminderAt,
    });
    return reminder;
  }
}
