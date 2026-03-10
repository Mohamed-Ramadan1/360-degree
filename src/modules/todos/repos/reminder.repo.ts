import { Injectable } from '@nestjs/common';
import { Reminder } from '../entities/reminder.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
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
    return this.reminderRepository.find({
      where: {
        reminderAt: LessThanOrEqual(new Date()),
        isSent: false,
        isEnabled: true,
        todo: {
          owner: {
            notificationsEnabled: true,
          },
        },
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
}
