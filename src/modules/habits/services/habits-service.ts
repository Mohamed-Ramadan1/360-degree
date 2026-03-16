import { BadRequestException, Injectable } from '@nestjs/common';
import { HabitRepository } from '../repos/habit.repository';
import { LoggerService } from 'src/logs/logger.service';
import { HabitCreateDto } from '../dto';
import { IUser } from 'src/modules/users/interfaces';
import { TimezoneService } from 'src/common/services/timezone.service';

@Injectable()
export class HabitsService {
  constructor(
    private readonly habitRepository: HabitRepository,
    private readonly timezoneService: TimezoneService,
    private readonly logger: LoggerService,
  ) {}
  async createHabit(createHabitDto: HabitCreateDto, user: IUser) {
    try {
      const endDate = this.convertEndDate(
        createHabitDto.endDate,
        user.timezone,
      );

      const nextTriggerAt = this.timezoneService.calculateFirstTrigger(
        {
          recurrenceType: createHabitDto.recurrenceType,
          time: createHabitDto.time,
          days: createHabitDto.days,
          dayOfMonth: createHabitDto.dayOfMonth,
        },
        user.timezone,
      );

      this.validateEndDate(endDate, nextTriggerAt);

      return await this.habitRepository.createHabit(
        createHabitDto,
        nextTriggerAt,
        endDate,
        user.id,
      );
    } catch (error) {
      this.logger.error('Error creating habit', error);
      throw error;
    }
  }

  private validateEndDate(endDate: Date | null, nextTriggerAt: Date) {
    if (!endDate) return;

    if (endDate < new Date()) {
      throw new BadRequestException('End date must be in the future');
    }

    if (nextTriggerAt > endDate) {
      throw new BadRequestException(
        'End date must be after the first scheduled trigger',
      );
    }
  }

  private convertEndDate(
    endDate: string | undefined,
    timezone: string,
  ): Date | null {
    if (!endDate) return null;
    return this.timezoneService.convertEndDateToUTC(endDate, timezone);
  }
}
