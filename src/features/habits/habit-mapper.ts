import { calculateHabitStats } from './habit-streak';

export type HabitRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'selected_days';
  days_of_week: number[] | null;
  start_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type HabitCheckInRow = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_on: string;
  completed_at: string;
  created_at: string;
};

export function toHabitDto(row: HabitRow, completedDates: string[], onDate: string) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    frequency: row.frequency,
    daysOfWeek: row.days_of_week,
    startDate: row.start_date,
    isActive: row.is_active,
    ...calculateHabitStats(
      {
        frequency: row.frequency,
        daysOfWeek: row.days_of_week,
        startDate: row.start_date,
      },
      completedDates,
      onDate,
    ),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toHabitCheckInDto(row: HabitCheckInRow) {
  return {
    id: row.id,
    habitId: row.habit_id,
    completedOn: row.completed_on,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

