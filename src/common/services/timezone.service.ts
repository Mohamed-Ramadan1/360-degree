import { DateTime, WeekdayNumbers } from 'luxon';
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logs/logger.service';

@Injectable()
export class TimezoneService {
  constructor(private readonly logger: LoggerService) {}

  convertToUTC(time: string, timezone: string): string {
    try {
      const [hours, minutes] = time.split(':').map(Number);

      const utc = DateTime.now()
        .setZone(timezone)
        .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 })
        .toUTC();

      return `${utc.hour.toString().padStart(2, '0')}:${utc.minute.toString().padStart(2, '0')}`;
    } catch (error) {
      this.logger.error('Error converting time to UTC', error);
      throw error;
    }
  }

  convertDaysToUTC(days: number[], time: string, timezone: string): number[] {
    try {
      const [hours, minutes] = time.split(':').map(Number);

      return days.map((day) => {
        const luxonDay = day === 0 ? 7 : day;

        const userDate = DateTime.now()
          .setZone(timezone)
          .set({
            weekday: luxonDay as WeekdayNumbers,
            hour: hours,
            minute: minutes,
            second: 0,
            millisecond: 0,
          });

        return userDate.toUTC().weekday % 7;
      });
    } catch (error) {
      this.logger.error('Error converting days to UTC', error);
      throw error;
    }
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

  getUTCDateTime() {
    return DateTime.utc();
  }
}
