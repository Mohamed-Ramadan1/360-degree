import { RecurrenceType } from 'src/common/consts';

export interface IHabit {
  id: string;

  title: string;

  description: string | null;

  recurrenceType: RecurrenceType;

  time: string;

  days: number[] | null;

  dayOfMonth: number | null;

  endDate: Date | null;

  nextTriggerAt: Date | null;

  isActive: boolean;

  ownerId: string;

  currentStreak: number;

  longestStreak: number;

  completionCount: number;

  lastCompletedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
}
