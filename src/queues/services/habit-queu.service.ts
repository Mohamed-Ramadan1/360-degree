import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { Queue } from 'bullmq';
import { QueueNames } from '../config/queue-names.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { BaseHabitJob } from '../types/habit-job.type';

@Injectable()
export class HabitQueueService implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    @InjectQueue(QueueNames.HABIT) private readonly habitQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('HabitQueueService initialized');
  }

  async addHabitJob(habitData: BaseHabitJob): Promise<void> {
    try {
      await this.habitQueue.add(habitData.type, habitData);
      this.logger.log(
        `Habit job '${habitData.type}' added to queue for habitId: ${habitData.habitId}`,
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      this.logger.error(
        `Failed to add Habit job '${habitData.type}' to queue for habitId: ${habitData.habitId}`,
        error,
      );
      throw error;
    }
  }
}
