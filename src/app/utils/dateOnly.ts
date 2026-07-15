const ISO_DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseIsoDateOnly(value: string): Date {
  const match = ISO_DATE_ONLY_PATTERN.exec(value);
  const yearText = match?.[1];
  const monthText = match?.[2];
  const dayText = match?.[3];
  if (!yearText || !monthText || !dayText) {
    throw new Error(`Invalid ISO date-only value: "${value}"`);
  }

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const parsed = new Date(0);
  parsed.setHours(0, 0, 0, 0);
  parsed.setFullYear(year, month - 1, day);

  if (
    month < 1
    || month > 12
    || day < 1
    || day > 31
    || parsed.getFullYear() !== year
    || parsed.getMonth() !== month - 1
    || parsed.getDate() !== day
  ) {
    throw new Error(`Invalid ISO date-only value: "${value}"`);
  }

  return parsed;
}
