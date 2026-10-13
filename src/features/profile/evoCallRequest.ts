import type { CountryId } from '@/app/state/demoTypes'
import { getInitialAppointmentDate } from '@/app/screens/appointments/appointmentModel'

export interface RequestCallDraft {
  reasons: string[]
  details: string[]
  callbackDate: string
  intervals: string[]
  countryCode: string
  phoneNumber: string
  notes: string
}

export const CONTACT_INTERVALS = ['09:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00'] as const

const CALL_NUMBER_BY_COUNTRY: Record<CountryId, { countryCode: string; mobileNumber: string }> = {
  IT: { countryCode: '+39', mobileNumber: '' },
  CZ: { countryCode: '+420', mobileNumber: '602123456' },
  SK: { countryCode: '+421', mobileNumber: '901234567' },
  RO: { countryCode: '+40', mobileNumber: '721234567' },
  RS: { countryCode: '+381', mobileNumber: '641234567' },
  HU: { countryCode: '+36', mobileNumber: '301234567' },
  BA: { countryCode: '+387', mobileNumber: '61123456' },
  BA_BL: { countryCode: '+387', mobileNumber: '61123456' },
  SI: { countryCode: '+386', mobileNumber: '401234567' },
}

export function createCallDraft(country: CountryId): RequestCallDraft {
  const phone = CALL_NUMBER_BY_COUNTRY[country]
  return {
    reasons: [],
    details: [],
    callbackDate: getInitialAppointmentDate(),
    intervals: [],
    countryCode: phone.countryCode,
    phoneNumber: phone.mobileNumber,
    notes: '',
  }
}

export function validPhone(phoneNumber: string): boolean {
  const digits = phoneNumber.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

export function canContinueCall(draft: RequestCallDraft): boolean {
  return (
    draft.reasons.length > 0 &&
    draft.details.length > 0 &&
    draft.callbackDate.length > 0 &&
    draft.intervals.length > 0 &&
    validPhone(draft.phoneNumber)
  )
}
