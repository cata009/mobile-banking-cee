import type { ScheduleConfig, ScheduleRepeat } from "@/data/schedule";

export const SCHEDULE_REPEAT_OPTIONS: ReadonlyArray<{ id: ScheduleRepeat; label: string }> = [
  { id: "never", label: "Never" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Every 2 weeks" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

export function toIsoDateOnly(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatScheduleDate(isoDate: string): string {
  const today = toIsoDateOnly(new Date());
  if (isoDate === today) return "Today";
  return formatScheduleDateAbsolute(isoDate);
}

export function formatScheduleDateAbsolute(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function formatScheduleSummary(schedule: ScheduleConfig): string {
  const repeatLabel = SCHEDULE_REPEAT_OPTIONS.find((option) => option.id === schedule.repeat)?.label ?? schedule.repeat;
  let summary = `${repeatLabel}, starting ${formatScheduleDate(schedule.startDate)}`;
  if (schedule.endsOn.type === "on-date") {
    summary += `, until ${formatScheduleDate(schedule.endsOn.date)}`;
  }
  return summary;
}
