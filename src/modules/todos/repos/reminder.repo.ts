import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reminder } from '../entities/reminder.entity';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoggerService } from 'src/logs/logger.service';

@Injectable()
export class ReminderRepository {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    private readonly logger: LoggerService,
  ) {}

  async findDueReminders() {
    const now = new Date();
    const oneMinuteAhead = new Date(now.getTime() + 60 * 1000);
    return this.reminderRepository.find({
      where: {
        reminderAt: LessThanOrEqual(oneMinuteAhead),
        isSent: false,
      },
      relations: ['todo', 'todo.owner'],
      select: {
        id: true,
        reminderAt: true,
        todo: {
          title: true,
          dueDate: true,
          owner: {
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async markAsSent(id: string): Promise<void> {
    const result = await this.reminderRepository.update(id, { isSent: true });
    if (result.affected === 0) {
      this.logger.warn(`No reminder found with id ${id} to mark as sent.`);
    }
  }

  async create(reminderData: Partial<Reminder>): Promise<Reminder> {
    const reminder = this.reminderRepository.create(reminderData);
    return this.reminderRepository.save(reminder);
  }

  async findByTodoId(todoId: string): Promise<Reminder[]> {
    return this.reminderRepository.find({
      where: { todoId },
      order: { reminderAt: 'ASC' },
    });
  }

  async checkTooCloseReminders(
    todoId: string,
    reminderAt: Date,
  ): Promise<Reminder | null> {
    const tooClose = await this.reminderRepository.findOne({
      where: {
        todoId,
        reminderAt: Between(
          new Date(reminderAt.getTime() - 15 * 60 * 1000),
          new Date(reminderAt.getTime() + 15 * 60 * 1000),
        ),
      },
    });
    return tooClose;
  }

  async update(id: string, updateData: Partial<Reminder>): Promise<void> {
    await this.reminderRepository.update(id, updateData);
  }

  async delete(id: string, todoId: string): Promise<void> {
    const result = await this.reminderRepository.delete({ id, todoId });
    if (result.affected === 0) {
      throw new NotFoundException(
        'No reminder match provided id in the specified todo',
      );
    }
  }
}
