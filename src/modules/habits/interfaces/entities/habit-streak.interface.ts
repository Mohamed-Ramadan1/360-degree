export interface IHabitStreak {
  id: string;
  habitId: string;
  count: number;
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
