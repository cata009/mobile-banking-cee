import {
  createDemoAppointments,
  DEFAULT_CLIENT_EMAIL,
  type AppointmentRecord,
} from '@/app/screens/appointments/appointmentModel';
import type { CountryId } from '@/app/state/demoTypes';
const prefix = 'uc-demo-appointments-v2';
function valid(value: unknown): value is AppointmentRecord {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<AppointmentRecord>;
  return (
    typeof item.id === 'string' &&
    typeof item.appointmentDate === 'string' &&
    typeof item.selectedTime === 'string' &&
    typeof item.email === 'string' &&
    (item.meetingType === 'branch' || item.meetingType === 'online') &&
    Array.isArray(item.reasons) &&
    Array.isArray(item.details) &&
    ['pending', 'confirmed', 'completed', 'cancelled'].includes(
      item.status ?? '',
    )
  );
}
function parseRecords(
  raw: string | null | undefined,
): AppointmentRecord[] | null {
  if (raw === null || raw === undefined) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter(valid).map(item => ({
          ...item,
          email: /@unicredit(?:bank)?\./i.test(item.email.trim())
            ? DEFAULT_CLIENT_EMAIL
            : item.email,
        }))
      : [];
  } catch {
    return [];
  }
}
export function loadAppointments(country: CountryId): AppointmentRecord[] {
  try {
    const current = parseRecords(
      globalThis.localStorage?.getItem(`${prefix}:${country}`),
    );
    if (current !== null) return current;
    const legacy =
      parseRecords(
        globalThis.localStorage?.getItem(`uc-demo-appointments-v1:${country}`),
      ) ?? [];
    const seeded = [...legacy, ...createDemoAppointments()];
    saveAppointments(country, seeded);
    return seeded;
  } catch {
    return [];
  }
}
export function saveAppointments(
  country: CountryId,
  records: readonly AppointmentRecord[],
) {
  try {
    globalThis.localStorage?.setItem(
      `${prefix}:${country}`,
      JSON.stringify(records),
    );
  } catch {
    /* Demo remains usable without persistence. */
  }
}
