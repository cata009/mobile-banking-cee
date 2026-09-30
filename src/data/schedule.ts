export type ScheduleRepeat = "never" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

export type ScheduleEnd =
  | { type: "never" }
  | { type: "on-date"; date: string };

export interface ScheduleConfig {
  startDate: string;
  repeat: ScheduleRepeat;
  endsOn: ScheduleEnd;
}
