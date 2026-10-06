import type { CountryId } from "@/app/state/demoTypes";

export type AppointmentMeetingType = "branch" | "online";
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface AppointmentDraft {
  reasons: string[];
  details: string[];
  appointmentDate: string;
  meetingType: AppointmentMeetingType | null;
  branchName: string;
  branchAddress: string;
  selectedTime: string;
  selectedSlotDate: string;
  notes: string;
  email: string;
}

export interface AppointmentFeedback {
  rating: number;
  comment: string;
  reason?: string;
  reasonDetail?: string;
}

export interface AppointmentRecord {
  id: string;
  reasons: string[];
  details: string[];
  appointmentDate: string;
  meetingType: AppointmentMeetingType;
  branchName: string;
  branchAddress: string;
  selectedTime: string;
  notes: string;
  email: string;
  advisorName: string;
  status: AppointmentStatus;
  feedback?: AppointmentFeedback;
  createdAt: number;
}

export const APPOINTMENT_REASON_OPTIONS = [
  { title: "Product related info", description: "Info related to your banking products" },
  { title: "I want a new banking product", description: "Open a new product with us" },
  { title: "I want to invest", description: "Get guidance on how to invest and invest products" },
  { title: "Support with digital apps", description: "Report issues or ask for help related to how our apps are working" },
  { title: "Other issues", description: "Get guidance on how to invest and invest products" },
] as const;

export const APPOINTMENT_DETAIL_OPTIONS = [
  "Accounts & cards",
  "Loans",
  "Mortgages",
  "Savings",
  "Insurances",
  "Other reason",
] as const;

const APPOINTMENT_STORAGE_PREFIX = "uc-demo-appointments-v2";
const LEGACY_APPOINTMENT_STORAGE_PREFIX = "uc-demo-appointments-v1";
export const DEFAULT_CLIENT_EMAIL = "mihaicatalin.iacob@gmail.com";
const AVAILABLE_TIMES = [
  "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

export function toAppointmentDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromAppointmentDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year || 2000, (month || 1) - 1, day || 1);
}

export function addAppointmentDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

export function getInitialAppointmentDate(now = new Date()): string {
  let date = addAppointmentDays(now, 1);
  while (date.getDay() === 0 || date.getDay() === 6) date = addAppointmentDays(date, 1);
  return toAppointmentDateKey(date);
}

export function getAppointmentDateLocale(country: CountryId, language: string): string {
  const countryLocale: Record<CountryId, string> = {
    CZ: "CZ",
    SK: "SK",
    RO: "RO",
    RS: "RS",
    HU: "HU",
    BA: "BA",
    BA_BL: "BA",
    SI: "SI",
  };
  const languageCode = language === "en" ? "en" : language;
  return `${languageCode}-${countryLocale[country] ?? "GB"}`;
}

export function formatAppointmentDate(dateKey: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(fromAppointmentDateKey(dateKey));
}

export function formatAppointmentDateShort(dateKey: string, locale: string): { day: string; month: string } {
  const date = fromAppointmentDateKey(dateKey);
  return {
    day: new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat(locale, { month: "short" }).format(date).replace(".", "").toLocaleUpperCase(locale),
  };
}

export function formatAppointmentMonth(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

export function isAppointmentWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

/**
 * Demo availability mirrors the Figma examples: weekday appointments are
 * offered in half-hour slots, while the first Tuesday of each month is full.
 */
export function getAppointmentSlots(dateKey: string): string[] {
  const date = fromAppointmentDateKey(dateKey);
  if (isAppointmentWeekend(date)) return [];
  if (date.getDay() === 2 && date.getDate() <= 7) return [];
  return [...AVAILABLE_TIMES];
}

export function getNextAppointmentDateWithSlots(dateKey: string): string {
  let date = fromAppointmentDateKey(dateKey);
  for (let day = 0; day < 14; day += 1) {
    if (getAppointmentSlots(toAppointmentDateKey(date)).length > 0) return toAppointmentDateKey(date);
    date = addAppointmentDays(date, 1);
  }
  return toAppointmentDateKey(date);
}

function getAppointmentStorageKey(country: CountryId): string {
  return `${APPOINTMENT_STORAGE_PREFIX}:${country}`;
}

function getLegacyAppointmentStorageKey(country: CountryId): string {
  return `${LEGACY_APPOINTMENT_STORAGE_PREFIX}:${country}`;
}

function isAppointmentRecord(value: unknown): value is AppointmentRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<AppointmentRecord>;
  return typeof record.id === "string"
    && typeof record.appointmentDate === "string"
    && typeof record.selectedTime === "string"
    && typeof record.email === "string"
    && (record.meetingType === "branch" || record.meetingType === "online")
    && Array.isArray(record.reasons)
    && Array.isArray(record.details)
    && (record.status === "pending" || record.status === "confirmed" || record.status === "completed" || record.status === "cancelled");
}

function isUniCreditAddress(email: string): boolean {
  return /@unicredit(?:bank)?\./i.test(email.trim());
}

function shiftToWeekday(date: Date, offset: number): Date {
  const shifted = addAppointmentDays(date, offset);
  const direction = Math.sign(offset) || 1;
  while (isAppointmentWeekend(shifted)) shifted.setDate(shifted.getDate() + direction);
  return shifted;
}

function demoAppointmentDate(offsetInDays: number): string {
  return toAppointmentDateKey(shiftToWeekday(new Date(), offsetInDays));
}

export function createDemoAppointments(): AppointmentRecord[] {
  const now = new Date();
  const createdAt = now.getTime();
  const branchName = "Branch name 36";
  const branchAddress = "Želetavská 1525/1, 140 92, Praha 4";
  const clientEmail = DEFAULT_CLIENT_EMAIL;
  const advisorName = "David Novak";
  const reason = "Product related info";
  const makeAppointment = (
    id: string,
    offset: number,
    selectedTime: string,
    meetingType: AppointmentMeetingType,
    status: AppointmentStatus,
    details: string[],
    notes: string,
    feedback?: AppointmentFeedback,
  ): AppointmentRecord => ({
    id,
    reasons: [reason],
    details,
    appointmentDate: demoAppointmentDate(offset),
    meetingType,
    branchName,
    branchAddress,
    selectedTime,
    notes,
    email: clientEmail,
    advisorName,
    status,
    feedback,
    createdAt,
  });

  return [
    makeAppointment("demo-appointment-pending-branch", 1, "12:30", "branch", "pending", ["Accounts & cards"], "I would like to review my current account options."),
    makeAppointment("demo-appointment-pending-online", 2, "10:00", "online", "pending", ["Loans"], "I would like to discuss financing options in an online meeting."),
    makeAppointment("demo-appointment-confirmed-branch", 3, "14:30", "branch", "confirmed", ["Savings"], "Please help me compare savings options."),
    makeAppointment("demo-appointment-confirmed-online", 6, "11:00", "online", "confirmed", ["Insurances"], "I would like to review my insurance coverage."),
    makeAppointment("demo-appointment-past-branch-feedback-pending", -4, "10:30", "branch", "completed", ["Accounts & cards"], "I needed help with my everyday banking."),
    makeAppointment("demo-appointment-past-online-feedback-pending", -11, "15:00", "online", "completed", ["Loans"], "We discussed my loan repayment options."),
    makeAppointment("demo-appointment-past-branch-feedback-sent", -30, "13:00", "branch", "completed", ["Savings"], "We reviewed my savings plan.", { rating: 5, comment: "Clear answers and helpful recommendations." }),
    makeAppointment("demo-appointment-cancelled", -45, "11:30", "online", "cancelled", ["Mortgages"], "I cancelled this appointment before it took place."),
  ];
}

function parseAppointmentRecords(stored: string | null): AppointmentRecord[] | null {
  if (stored === null) return null;
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter(isAppointmentRecord).map((appointment) => ({
        ...appointment,
        email: isUniCreditAddress(appointment.email) ? DEFAULT_CLIENT_EMAIL : appointment.email,
      }))
      : [];
  } catch {
    return [];
  }
}

export function loadAppointments(country: CountryId): AppointmentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const current = parseAppointmentRecords(window.localStorage.getItem(getAppointmentStorageKey(country)));
    if (current !== null) return current;

    const legacy = parseAppointmentRecords(window.localStorage.getItem(getLegacyAppointmentStorageKey(country))) ?? [];
    const seeded = [...legacy, ...createDemoAppointments()];
    saveAppointments(country, seeded);
    return seeded;
  } catch {
    return [];
  }
}

export function saveAppointments(country: CountryId, appointments: readonly AppointmentRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getAppointmentStorageKey(country), JSON.stringify(appointments));
  } catch {
    // The appointment flow remains usable when browser storage is unavailable.
  }
}

export function sortAppointments(appointments: readonly AppointmentRecord[]): AppointmentRecord[] {
  return [...appointments].sort((left, right) => {
    const leftDate = `${left.appointmentDate}T${left.selectedTime}`;
    const rightDate = `${right.appointmentDate}T${right.selectedTime}`;
    return leftDate.localeCompare(rightDate);
  });
}

export function createAppointmentId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `appointment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
