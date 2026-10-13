import {
  getInitialAppointmentDate,
  DEFAULT_CLIENT_EMAIL,
  fromAppointmentDateKey,
  toAppointmentDateKey,
  type AppointmentDraft,
  type AppointmentRecord,
} from '@/app/screens/appointments/appointmentModel'

export function createAppointmentDraft(branchName: string, branchAddress: string): AppointmentDraft {
  const initialDate = getInitialAppointmentDate()
  return {
    reasons: [],
    details: [],
    appointmentDate: initialDate,
    meetingType: null,
    branchName,
    branchAddress,
    selectedTime: '',
    selectedSlotDate: initialDate,
    notes: '',
    email: DEFAULT_CLIENT_EMAIL,
  }
}

export function isPastAppointment(appointment: AppointmentRecord, now = new Date()): boolean {
  if (appointment.status === 'cancelled' || appointment.status === 'completed') return true
  const date = fromAppointmentDateKey(appointment.appointmentDate)
  if (date.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) return true
  if (toAppointmentDateKey(date) !== toAppointmentDateKey(now)) return false
  const [hours = 0, minutes = 0] = appointment.selectedTime.split(':').map(Number)
  return hours * 60 + minutes < now.getHours() * 60 + now.getMinutes()
}

export function canContinueBooking(draft: AppointmentDraft): boolean {
  return (
    draft.reasons.length > 0 &&
    draft.meetingType !== null &&
    draft.appointmentDate !== '' &&
    (draft.meetingType !== 'branch' || (draft.branchName.trim() !== '' && draft.branchAddress.trim() !== ''))
  )
}
export function validAppointmentEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
export function completeFeedback(rating: number, reason: string, detail: string): boolean {
  const isLowRating = rating === 1 || rating === 2
  return rating > 0 && (!isLowRating || (reason !== '' && (reason !== 'organizedMeeting' || detail !== '')))
}
