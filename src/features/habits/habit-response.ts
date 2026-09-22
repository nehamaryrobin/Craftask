import type { HabitCheckInRow, HabitRow } from './habit-mapper';
import { toHabitDto } from './habit-mapper';

export function utcDateToday() {
  return new Date().toISOString().slice(0, 10);
}

export function habitsWithStats(
  habits: HabitRow[],
  checkIns: HabitCheckInRow[],
  onDate: string,
) {
  const datesByHabit = new Map<string, string[]>();

  for (const checkIn of checkIns) {
    const dates = datesByHabit.get(checkIn.habit_id) ?? [];
    dates.push(checkIn.completed_on);
    datesByHabit.set(checkIn.habit_id, dates);
  }

  return habits.map((habit) => toHabitDto(habit, datesByHabit.get(habit.id) ?? [], onDate));
}

