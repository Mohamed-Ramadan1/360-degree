import { RecurrenceType } from 'src/common/consts';

export interface BaseHabitJob {
  type: string;
  habitId: string;
  userId: string;
  userEmail: string;
  userName: string;
  habitTitle: string;
  recurrenceType: RecurrenceType;
  time: string;
  days: number[] | null;
  dayOfMonth: number | null;
  endDate: Date | null;
  timezone: string;
}
