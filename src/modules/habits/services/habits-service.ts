import { BadRequestException, Injectable } from '@nestjs/common';
import { HabitRepository } from '../repos/habit.repository';
import { LoggerService } from 'src/logs/logger.service';
import {
  GetHabitsDto,
  HabitCreateDto,
  HabitUpdateDto,
  HabitUpdateInfoDto,
} from '../dto';
import { IUser } from 'src/modules/users/interfaces';
import { TimezoneService } from 'src/common/services/timezone.service';
import { RecurrenceType } from 'src/common/consts/habit-recurrence';
import { IHabitsService } from '../interfaces';

@Injectable()
export class HabitsService implements IHabitsService {
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

  async updateHabitInfo(
    habitId: string,
    updateHabitDto: HabitUpdateInfoDto,
    user: IUser,
  ) {
    try {
      const habit = await this.getHabitOrThrow(habitId, user.id);
      if (!habit.isActive) {
        throw new BadRequestException('Cannot update an inactive habit');
      }

      await this.habitRepository.update(habitId, updateHabitDto);
    } catch (error) {
      this.logger.error('Error updating habit info', error);
      throw error;
    }
  }

  async updateHabitSchedule(
    habitId: string,
    updateHabitDto: HabitUpdateDto,
    user: IUser,
  ) {
    try {
      const habit = await this.getHabitOrThrow(habitId, user.id);

      if (!habit.isActive) {
        throw new BadRequestException('Cannot update an inactive habit');
      }

      this.validateUpdateFields(habit.recurrenceType, updateHabitDto);

      const merged = {
        recurrenceType: habit.recurrenceType,
        time: updateHabitDto.time ?? habit.time,
        days: updateHabitDto.days ?? habit.days ?? undefined,
        dayOfMonth: updateHabitDto.dayOfMonth ?? habit.dayOfMonth ?? undefined,
      };
      const endDate = this.convertEndDate(
        updateHabitDto.endDate,
        user.timezone,
      );

      const nextTriggerAt = this.timezoneService.calculateFirstTrigger(
        merged,
        user.timezone,
      );

      this.validateEndDate(endDate, nextTriggerAt);

      await this.habitRepository.update(habitId, {
        ...updateHabitDto,
        endDate,
        nextTriggerAt,
      });
    } catch (error) {
      this.logger.error('Error updating habit', error);
      throw error;
    }
  }

  async deleteHabit(habitId: string, user: IUser) {
    try {
      const habit = await this.getHabitOrThrow(habitId, user.id);
      await this.habitRepository.delete(habit.id);
    } catch (error) {
      this.logger.error('Error deleting habit', error);
      throw error;
    }
  }

  async getHabitById(habitId: string, user: IUser) {
    try {
      const habit = await this.getHabitOrThrow(habitId, user.id);
      return habit;
    } catch (error) {
      this.logger.error('Error fetching habit by id', error);
      throw error;
    }
  }

  async getHabits(user: IUser, getHabitsDto: GetHabitsDto) {
    try {
      const result = await this.habitRepository.findHabits(
        user.id,
        getHabitsDto,
      );
      return result;
    } catch (error) {
      this.logger.error('Error fetching habits', error);
      throw error;
    }
  }

  private async getHabitOrThrow(habitId: string, userId: string) {
    const habit = await this.habitRepository.findById(habitId, userId);

    if (!habit) {
      throw new BadRequestException('No habit matching the provided id');
    }

    return habit;
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

  private validateUpdateFields(
    recurrenceType: RecurrenceType,
    dto: HabitUpdateDto,
  ) {
    switch (recurrenceType) {
      case RecurrenceType.DAILY:
      case RecurrenceType.LAST_DAY_OF_MONTH:
        if (dto.days || dto.dayOfMonth) {
          throw new BadRequestException(
            `days and dayOfMonth are not allowed for ${recurrenceType} habits`,
          );
        }
        break;

      case RecurrenceType.WEEKLY:
        if (dto.dayOfMonth) {
          throw new BadRequestException(
            'dayOfMonth is not allowed for weekly habits',
          );
        }
        break;

      case RecurrenceType.MONTHLY:
        if (dto.days) {
          throw new BadRequestException(
            'days is not allowed for monthly habits',
          );
        }
        break;
    }
  }
}
