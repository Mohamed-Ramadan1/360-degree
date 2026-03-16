import { DateTime, WeekdayNumbers } from 'luxon';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';
import { RecurrenceType } from '../consts';

@Injectable()
export class TimezoneService {
  constructor(private readonly logger: LoggerService) {}
  // ✅ for create and update - always returns Date
  calculateFirstTrigger(
    dto: {
      recurrenceType: RecurrenceType;
      time: string;
      days?: number[];
      dayOfMonth?: number;
    },
    timezone: string,
  ): Date {
    return this.computeNextDate(dto, timezone).toUTC().toJSDate();
  }

  // ✅ for processor only - can return null if endDate passed
  calculateNextTriggerAt(
    dto: {
      recurrenceType: RecurrenceType;
      time: string;
      days?: number[];
      dayOfMonth?: number;
      endDate?: Date | null;
    },
    timezone: string,
  ): Date | null {
    const next = this.computeNextDate(dto, timezone);

    if (dto.endDate && next.toUTC().toJSDate() > new Date(dto.endDate)) {
      return null;
    }

    return next.toUTC().toJSDate();
  }

  convertEndDateToUTC(endDate: string, timezone: string): Date {
    try {
      return DateTime.fromISO(endDate, { zone: timezone })
        .endOf('day')
        .toUTC()
        .toJSDate();
    } catch (error) {
      this.logger.error('Error converting end date to UTC', error);
      throw error;
    }
  }

  // ✅ shared logic - used by both calculateFirstTrigger and calculateNextTriggerAt
  private computeNextDate(
    dto: {
      recurrenceType: RecurrenceType;
      time: string;
      days?: number[];
      dayOfMonth?: number;
    },
    timezone: string,
  ): DateTime {
    const [hours, minutes] = dto.time.split(':').map(Number);
    const now = DateTime.now()
      .setZone(timezone)
      .set({ second: 0, millisecond: 0 });

    switch (dto.recurrenceType) {
      case RecurrenceType.DAILY: {
        let next = now.set({ hour: hours, minute: minutes });
        if (next <= now) next = next.plus({ days: 1 });
        return next;
      }

      case RecurrenceType.WEEKLY: {
        const sortedDays = [...dto.days!].sort((a, b) => a - b);
        let closest: DateTime | null = null;

        for (const day of sortedDays) {
          const luxonDay = day === 0 ? 7 : day;
          let candidate = now.set({
            weekday: luxonDay as WeekdayNumbers,
            hour: hours,
            minute: minutes,
          });
          if (candidate <= now) candidate = candidate.plus({ weeks: 1 });
          if (!closest || candidate < closest) closest = candidate;
        }

        return closest!;
      }

      case RecurrenceType.MONTHLY: {
        let next = now.set({
          day: dto.dayOfMonth,
          hour: hours,
          minute: minutes,
        });

        if (next.day !== dto.dayOfMonth || next <= now) {
          let searchMonth = now.plus({ months: 1 }).startOf('month');

          while (true) {
            const candidate = searchMonth.set({
              day: dto.dayOfMonth!,
              hour: hours,
              minute: minutes,
            });

            if (candidate.day === dto.dayOfMonth) {
              next = candidate;
              break;
            }

            searchMonth = searchMonth.plus({ months: 1 });
          }
        }

        return next;
      }
      case RecurrenceType.LAST_DAY_OF_MONTH: {
        let next = now
          .endOf('month')
          .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });

        if (next <= now) {
          next = now
            .plus({ months: 1 })
            .endOf('month')
            .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
        }

        return next;
      }

      default:
        throw new BadRequestException('Invalid recurrence type');
    }
  }
}
