export type HabitSchedule = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'selected_days';
  daysOfWeek: number[] | null;
  startDate: string;
};

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addDay(value: Date) {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function isoWeekKey(value: Date) {
  const date = new Date(value);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function periodKey(frequency: HabitSchedule['frequency'], date: Date) {
  if (frequency === 'weekly') return isoWeekKey(date);
  if (frequency === 'monthly') return formatDate(date).slice(0, 7);
  return formatDate(date);
}

function scheduledPeriods(habit: HabitSchedule, onDate: string) {
  if (habit.startDate > onDate) return [];

  const periods: string[] = [];
  const seen = new Set<string>();
  const selectedDays = new Set(habit.daysOfWeek ?? []);

  for (let date = parseDate(habit.startDate); formatDate(date) <= onDate; date = addDay(date)) {
    if (habit.frequency === 'selected_days' && !selectedDays.has(date.getUTCDay())) continue;

    const key = periodKey(habit.frequency, date);
    if (!seen.has(key)) {
      periods.push(key);
      seen.add(key);
    }
  }

  return periods;
}

export function isHabitScheduledOnDate(habit: HabitSchedule, date: string) {
  if (date < habit.startDate) return false;
  if (habit.frequency !== 'selected_days') return true;
  return (habit.daysOfWeek ?? []).includes(parseDate(date).getUTCDay());
}

export function calculateHabitStats(
  habit: HabitSchedule,
  completedDates: string[],
  onDate: string,
) {
  const periods = scheduledPeriods(habit, onDate);
  const completedDateSet = new Set(completedDates);
  const completedPeriods = new Set(
    completedDates
      .filter((date) => date >= habit.startDate && date <= onDate)
      .map((date) => periodKey(habit.frequency, parseDate(date))),
  );

  let currentPeriods = periods;
  const currentPeriod = periodKey(habit.frequency, parseDate(onDate));
  if (periods.at(-1) === currentPeriod && !completedPeriods.has(currentPeriod)) {
    currentPeriods = periods.slice(0, -1);
  }

  let currentStreak = 0;
  for (let index = currentPeriods.length - 1; index >= 0; index -= 1) {
    if (!completedPeriods.has(currentPeriods[index])) break;
    currentStreak += 1;
  }

  let longestStreak = 0;
  let run = 0;
  for (const period of periods) {
    if (completedPeriods.has(period)) {
      run += 1;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
  }

  return {
    completedToday: completedDateSet.has(onDate),
    isScheduledToday: isHabitScheduledOnDate(habit, onDate),
    currentStreak,
    longestStreak,
    totalCheckIns: completedDates.length,
  };
}
