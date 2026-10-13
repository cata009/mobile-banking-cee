import {
  authorizeProfileChange,
  resetProfileAuthorization,
  effectiveProfileSignature,
  profileSettingsStore,
  type ProfileSettingsSnapshot,
} from './mobileFirstProfileSettings'

export interface AppointmentDraft {
  branch: string
  category: string
  purpose: string
  date: string
  time: string
  notes: string
}
export interface ServiceAppointment extends AppointmentDraft {
  id: string
  status: 'Da eseguire' | 'Cancellato' | 'Concluso'
}
export interface ServiceItem {
  id: string
  title: string
  category: string
  date: string
  owner?: string
  reference?: string
  body?: string
  read: boolean
  archived: boolean
  uploaded?: boolean
  status?: string
}
export interface ServiceFilter {
  query?: string
  category?: string
  owner?: string
  start?: string
  end?: string
  archived?: boolean
  unread?: boolean
}
export function servicePracticeInteraction(
  item: Pick<ServiceItem, 'id' | 'status'>,
): 'mifid-signature' | 'overdraft-upload' | 'mifid-link' | 'readonly' {
  if (item.status !== 'Incompleta') return 'readonly'
  if (item.id === 'mifid') return 'mifid-signature'
  if (item.id === 'overdraft') return 'overdraft-upload'
  if (item.id === 'advice-practice') return 'mifid-link'
  return 'readonly'
}
export function appointmentErrors(draft: AppointmentDraft): string[] {
  const errors: string[] = []
  if (!draft.branch) errors.push('Seleziona una filiale.')
  if (!draft.category) errors.push('Seleziona una categoria.')
  if (!draft.purpose) errors.push('Seleziona lo scopo dell’appuntamento.')
  if (!draft.date || !draft.time) errors.push('Seleziona il giorno e l’orario.')
  if (['Altre operazioni', 'Altro'].includes(draft.category) && !draft.notes.trim())
    errors.push('Per la categoria selezionata, il campo Note è obbligatorio.')
  if (draft.notes.length > 150) errors.push('La nota può contenere al massimo 150 caratteri.')
  return errors
}
export function documentFilterError(filter: ServiceFilter): string {
  if (!filter.start || !filter.end) return ''
  const start = new Date(`${filter.start}T12:00:00Z`)
  const end = new Date(`${filter.end}T12:00:00Z`)
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end)
    return 'La data di fine deve essere successiva alla data di inizio.'
  const months = ['Investimenti e trading', 'Consulenze', 'Consulenza'].includes(filter.category ?? '')
    ? 1
    : filter.category === 'In primo piano'
      ? 6
      : 0
  if (months) {
    const limit = new Date(start)
    const day = limit.getUTCDate()
    limit.setUTCDate(1)
    limit.setUTCMonth(limit.getUTCMonth() + months)
    const lastDay = new Date(Date.UTC(limit.getUTCFullYear(), limit.getUTCMonth() + 1, 0)).getUTCDate()
    limit.setUTCDate(Math.min(day, lastDay))
    if (end > limit)
      return `I documenti selezionati possono avere una profondità massima di ${months === 1 ? '1 mese' : '6 mesi'}. Modifica l’arco temporale.`
  }
  return ''
}
export function filterServiceItems<T extends ServiceItem>(items: T[], filter: ServiceFilter): T[] {
  const query = filter.query?.trim().toLocaleLowerCase('it') ?? ''
  return items.filter(
    (item) =>
      item.archived === Boolean(filter.archived) &&
      (!filter.unread || !item.read) &&
      (!filter.category || item.category === filter.category) &&
      (!filter.owner || item.owner === filter.owner) &&
      (!filter.start || item.date >= filter.start) &&
      (!filter.end || item.date <= filter.end) &&
      (!query ||
        `${item.title} ${item.category} ${item.reference ?? ''} ${item.body ?? ''}`
          .toLocaleLowerCase('it')
          .includes(query)),
  )
}
export function updateServiceItems<T extends ServiceItem>(
  items: T[],
  ids: string[],
  action: 'read' | 'archive' | 'restore',
): T[] {
  const selected = new Set(ids)
  return items.map((item) =>
    selected.has(item.id)
      ? { ...item, ...(action === 'read' ? { read: true } : { archived: action === 'archive' }) }
      : item,
  )
}
export function canSignPractice(viewed: boolean, code: string): boolean {
  return viewed && /^\d{6,10}$/.test(code)
}
export function authorizeServiceSignature(viewed: boolean, code: string) {
  if (!canSignPractice(viewed, code))
    return { valid: false, locked: false, error: 'Visualizza la documentazione e inserisci il Mobile Code.' }
  return authorizeProfileChange(code)
}
export function servicePracticeSignatureError(
  settings: Pick<ProfileSettingsSnapshot, 'signature' | 'signatureSuspendedAt'> = profileSettingsStore.getSnapshot(),
  now = new Date(),
): string {
  const status = effectiveProfileSignature(settings.signature, settings.signatureSuspendedAt, now)
  if (status === 'Attiva') return ''
  if (status === 'Sospesa')
    return 'La firma digitale è sospesa. Riattiva il certificato nella sezione Sicurezza prima di firmare.'
  return 'La firma digitale non è attiva. Attiva il certificato nella sezione Sicurezza prima di firmare.'
}
export function authorizeServicePracticeSignature(viewed: boolean, code: string, now = new Date()) {
  const error = servicePracticeSignatureError(profileSettingsStore.getSnapshot(), now)
  return error ? { valid: false, locked: false, error } : authorizeServiceSignature(viewed, code)
}
export const restartServiceAuthorization = resetProfileAuthorization
export interface ProfileServicesSnapshot {
  documents: ServiceItem[]
  notices: ServiceItem[]
  messages: ServiceItem[]
  practices: ServiceItem[]
  appointments: ServiceAppointment[]
  delivery?: Record<string, string>
  deliveryEmail?: string
}
export function createProfileServicesStore(initial: ProfileServicesSnapshot) {
  let seed = initial
  let initialized = false
  const clone = () => structuredClone(seed)
  let snapshot = clone()
  const listeners = new Set<() => void>()
  return {
    initialize: (fixtures: ProfileServicesSnapshot) => {
      if (!initialized) {
        initialized = true
        seed = fixtures
        snapshot = clone()
      }
    },
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    update: <K extends keyof ProfileServicesSnapshot>(
      key: K,
      updater: (value: ProfileServicesSnapshot[K]) => ProfileServicesSnapshot[K],
    ) => {
      snapshot = { ...snapshot, [key]: updater(snapshot[key]) }
      listeners.forEach((listener) => listener())
    },
    reset: () => {
      snapshot = clone()
      restartServiceAuthorization()
      listeners.forEach((listener) => listener())
    },
  }
}
export const profileServicesStore = createProfileServicesStore({
  documents: [],
  notices: [],
  messages: [],
  practices: [],
  appointments: [],
})
export function bookServiceAppointment(draft: AppointmentDraft, id: string): ServiceAppointment {
  const errors = appointmentErrors(draft)
  if (errors.length) throw new Error(errors.join(' '))
  return { ...draft, id, status: 'Da eseguire' }
}
export function cancelServiceAppointment(appointments: ServiceAppointment[], id: string): ServiceAppointment[] {
  return appointments.map((item) => (item.id === id ? { ...item, status: 'Cancellato' } : item))
}
export function canManageServiceAppointment(
  appointment: ServiceAppointment,
  today = new Date('2025-03-01T12:00:00Z'),
): boolean {
  const starts = new Date(`${appointment.date}T${appointment.time}:00Z`).getTime()
  return (
    appointment.status === 'Da eseguire' && Number.isFinite(starts) && starts - today.getTime() > 24 * 60 * 60 * 1000
  )
}
export function canDeleteServiceDocument(item: ServiceItem): boolean {
  return Boolean(item.uploaded)
}
export function serviceBranchAvailability(branch: string): boolean {
  return branch !== 'Milano Certosa'
}
export function dateLabel(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('it-IT')
}
export function createServiceDemoPdf(title: string, lines: string[] = []): Blob {
  const escape = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7e]/g, ' ')
      .replace(/[\\()]/g, '\\$&')
  const content = ['UniCredit - FACSIMILE', title, 'Documento dimostrativo. Nessuna operazione reale.', ...lines]
    .map(
      (line, index) =>
        `BT /F1 ${index === 0 ? 18 : 12} Tf 40 ${790 - index * 32} Td (${escape(line).slice(0, 90)}) Tj ET`,
    )
    .join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${offset.toString().padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}
