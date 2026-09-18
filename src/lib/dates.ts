export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function fromDateKey(value: string): Date {
  return new Date(`${value}T12:00:00`);
}
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12);
}
export function quickDates(today = new Date()) {
  return { today, tomorrow: addDays(today, 1), weekend: addDays(today, (6 - today.getDay() + 7) % 7), nextWeek: addDays(today, (8 - today.getDay()) % 7 || 7) };
}
export function parseDateText(text: string, today = new Date()): string | null {
  const value = text.trim().toLowerCase().replace(/^([a-z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?$/, (_, month, day, year) => `${day} ${month}${year ? ` ${year}` : ''}`);
  const quick = quickDates(today);
  const aliases: Record<string, Date> = { today: quick.today, tomorrow: quick.tomorrow, 'this weekend': quick.weekend, 'next week': quick.nextWeek };
  if (aliases[value]) return dateKey(aliases[value]);
  let year: number, month: number, day: number;
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const written = value.match(/^(\d{1,2})\s+([a-z]+)(?:\s+(\d{4}))?$/);
  if (iso) { year = +iso[1]; month = +iso[2] - 1; day = +iso[3]; }
  else if (written) {
    year = written[3] ? +written[3] : today.getFullYear();
    month = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(written[2].slice(0,3));
    day = +written[1];
  } else return null;
  const result = new Date(year, month, day, 12);
  return month >= 0 && result.getFullYear() === year && result.getMonth() === month && result.getDate() === day ? dateKey(result) : null;
}
export function dateLabel(value: string): string {
  const quick = quickDates();
  if (value === dateKey(quick.today)) return 'Today';
  if (value === dateKey(quick.tomorrow)) return 'Tomorrow';
  return fromDateKey(value).toLocaleDateString('en', { weekday: 'long' });
}
