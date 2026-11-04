export type DatePeriodPreset =
  | 'none'
  | 'last-week'
  | 'last-month'
  | 'last-3-months'
  | 'custom';

export interface DatePeriodSelection {
  preset: DatePeriodPreset;
  from: string;
  to: string;
}

export const DEFAULT_DATE_PERIOD: DatePeriodSelection = {
  preset: 'none',
  from: '2025-11-03',
  to: '2026-11-03',
};

const MONTHS: Record<string, string> = {
  JAN: '01',
  FEB: '02',
  MAR: '03',
  APR: '04',
  MAY: '05',
  JUN: '06',
  JUL: '07',
  AUG: '08',
  SEP: '09',
  OCT: '10',
  NOV: '11',
  DEC: '12',
};

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function toIsoDateFromParts(
  year: number,
  month: string,
  day: string,
): string {
  const monthNumber = MONTHS[month.toUpperCase()];
  if (!monthNumber || !Number.isFinite(year)) return '';
  return `${year}-${monthNumber}-${String(Number(day)).padStart(2, '0')}`;
}

export function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isValidDatePeriodRange(from: string, to: string): boolean {
  return isValidIsoDate(from) && isValidIsoDate(to) && from <= to;
}

export function resolveDatePeriodRange(
  selection: DatePeriodSelection,
  referenceDate = new Date(),
): { from: string; to: string } | undefined {
  const to = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  if (selection.preset === 'none') return undefined;
  if (selection.preset === 'custom')
    return isValidDatePeriodRange(selection.from, selection.to)
      ? { from: selection.from, to: selection.to }
      : undefined;
  if (selection.preset === 'last-week') {
    const from = new Date(to);
    from.setDate(from.getDate() - 6);
    return { from: toIsoDate(from), to: toIsoDate(to) };
  }
  if (selection.preset === 'last-month') {
    const from = new Date(to.getFullYear(), to.getMonth() - 1, 1);
    const end = new Date(to.getFullYear(), to.getMonth(), 0);
    return { from: toIsoDate(from), to: toIsoDate(end) };
  }
  const from = new Date(to);
  from.setMonth(from.getMonth() - 3);
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

export function isIsoDateInRange(
  value: string,
  from: string,
  to: string,
): boolean {
  return Boolean(value) && value >= from && value <= to;
}
