import { Injectable } from '@nestjs/common';
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
      const { timeUTC, daysUTC, endDate } = this.prepareHabitDates(
        createHabitDto,
        user.timezone,
      );

      return await this.habitRepository.createHabit(
        createHabitDto,
        timeUTC,
        daysUTC,
        endDate,
        user.id,
      );
    } catch (error) {
      this.logger.error('Error creating habit', error);
      throw error;
    }
  }

  private prepareHabitDates(dto: HabitCreateDto, timezone: string) {
    return {
      timeUTC: this.timezoneService.convertToUTC(dto.time, timezone),
      daysUTC: dto.days
        ? this.timezoneService.convertDaysToUTC(dto.days, dto.time, timezone)
        : null,
      endDate: dto.endDate
        ? this.timezoneService.convertEndDateToUTC(dto.endDate, timezone)
        : null,
    };
  }
}
