export type CredentialKind = 'pin' | 'mobile'
/** Source document acknowledgement gate, shared by browser and native compositions. */
export function canAcceptProfileDocument({
  seen,
  accepted,
  certificateDocument,
}: {
  seen: boolean
  accepted: boolean
  certificateDocument: boolean
}): boolean {
  return (seen || certificateDocument) && accepted
}
export type InstantLimit = { kind: 'daily' | 'operation'; amount: number }
export type ConsentStatus = 'Attivo' | 'Scaduto' | 'Rev. Utente' | 'Rev. 3° Parte'
export interface ProfileConsent {
  id: string
  reference?: string
  bank: string
  direction: 'imported' | 'exported'
  status: ConsentStatus
  expires: string
  balance: boolean
  transactions: boolean
}
export interface ProfileSettingsSnapshot {
  language: string
  preferredProfile: 'UniCredit' | 'buddy'
  textSize: boolean
  location: boolean
  ipService: boolean
  biometric: boolean
  screenshots: boolean
  devices: { id: string; name: string; primary: boolean }[]
  sharedClient: boolean
  notificationsEnabled: boolean
  smsPremium: boolean
  notificationChannels: Record<string, string>
  notificationGroupEnabled: Record<string, boolean>
  categoryNotifications: string[]
  newsletters: string[]
  privacy: boolean[]
  cookies: boolean
  ivass: boolean
  signature: 'Attiva' | 'Sospesa' | 'Revocata' | 'Non attiva'
  signatureSuspendedAt?: string
  dailyLimit: number
  dailyPeriod: string
  dailyExpiresAt?: string
  previousDailyLimit?: number
  instantLimits: Record<string, InstantLimit>
  dispositions: Record<string, boolean>
  relationships: Record<string, 'informative' | 'dispositive'>
  quickEnabled: boolean
  quickAccounts: string[]
  quickDefault: string
  email: string
  phone: string
  emailVerified: boolean
  lastAccessHistoryDelivery?: { recipient: string; count: number; status: 'sent' }
  phoneVerified: boolean
  operator: string
  consents: ProfileConsent[]
  missions: string[]
}
const storageKey = 'unicredit-mobile-first-profile-settings-v1'
const defaults = (): ProfileSettingsSnapshot => ({
  language: 'Italiano',
  preferredProfile: 'UniCredit',
  textSize: false,
  location: true,
  ipService: true,
  biometric: false,
  screenshots: false,
  devices: [
    { id: 'iphone', name: 'iPhone', primary: true },
    { id: 'office', name: 'Ufficio', primary: false },
    { id: 'tablet', name: 'Tablet', primary: false },
  ],
  sharedClient: false,
  notificationsEnabled: true,
  smsPremium: true,
  notificationChannels: {},
  notificationGroupEnabled: {},
  categoryNotifications: ['Trasporti - Bus e Metro', 'Scuola e formazione - Altro scuola e formazione'],
  newsletters: ['Morning Meeting', 'Novità di Banca Multicanale', 'Newsletter Genius'],
  privacy: [true, true, true, false, true],
  cookies: true,
  ivass: true,
  signature: 'Attiva',
  dailyLimit: 5000,
  dailyPeriod: '6 Mesi',
  instantLimits: { filippo: { kind: 'operation', amount: 15000 }, andrea: { kind: 'operation', amount: 15000 } },
  dispositions: { 'Bonifico istantaneo': true, 'Bonifico Sepa': true, 'Bonifico Extra Sepa': true },
  relationships: { andrea: 'informative', salici: 'informative', ardizzon: 'dispositive' },
  quickEnabled: false,
  quickAccounts: [],
  quickDefault: '',
  email: 'mic****ssi@email.it',
  phone: '335****997',
  emailVerified: true,
  phoneVerified: true,
  operator: 'Vodafone',
  consents: [
    {
      id: 'imported-1',
      bank: 'Intesa Sanpaolo Retail',
      direction: 'imported',
      status: 'Attivo',
      expires: '09/06/2025',
      balance: true,
      transactions: true,
    },
    ...(['Rev. Utente', 'Rev. Utente', 'Scaduto', 'Rev. 3° Parte', 'Rev. Utente'] as const).map((status, i) => ({
      id: 'exported-' + i,
      bank: i === 0 ? 'Banca nazionale del lavoro S.P.A.' : 'UniCredit S.p.a Test',
      direction: 'exported' as const,
      status,
      expires: '19/02/2025',
      balance: true,
      transactions: true,
    })),
  ],
  missions: [],
})
function readInitial(): ProfileSettingsSnapshot {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null
    return saved ? { ...defaults(), ...(JSON.parse(saved) as Partial<ProfileSettingsSnapshot>) } : defaults()
  } catch {
    return defaults()
  }
}
let snapshot = readInitial()
const listeners = new Set<() => void>()
let pin = '87263915'
let mobileCode = '12345678'
let pinHistory = [pin, '69528374', '57392846', '39582746', '28593746']
let attempts = 0
let pinAttempts = 0
function publish(next: ProfileSettingsSnapshot) {
  snapshot = next
  try {
    localStorage.setItem(storageKey, JSON.stringify(next))
  } catch {
    /* The demo also works without browser persistence. */
  }
  for (const listener of listeners) listener()
}
export const profileSettingsStore = {
  getSnapshot: () => snapshot,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  update: (patch: Partial<ProfileSettingsSnapshot>) => publish({ ...snapshot, ...patch }),
  reset: () => {
    pin = '87263915'
    mobileCode = '12345678'
    pinHistory = [pin, '69528374', '57392846', '39582746', '28593746']
    attempts = 0
    pinAttempts = 0
    publish(defaults())
  },
}
const identityCodes = ['123456', '12041990', '19900412', '120490']
function digitRun(value: string, min: number): boolean {
  for (let i = 0; i <= value.length - min; i++) {
    const digits = [...value.slice(i, i + min)].map(Number)
    if (digits.slice(1).every((d, j) => d === digits[j]! + 1) || digits.slice(1).every((d, j) => d === digits[j]! - 1))
      return true
  }
  return false
}
function repeatedGroup(value: string): boolean {
  for (const length of [2, 3])
    for (let i = 0; i <= value.length - length; i++) {
      const group = value.slice(i, i + length)
      let count = 0
      for (let j = 0; j <= value.length - length; j++)
        if (value.slice(j, j + length) === group) {
          count++
          j += length - 1
        }
      if (count > 2) return true
    }
  return false
}
export function credentialError(
  kind: CredentialKind,
  current: string,
  next: string,
  confirmation: string,
): string | null {
  if (current !== (kind === 'pin' ? pin : mobileCode)) return 'Il codice attuale non è corretto.'
  if (next !== confirmation) return 'I nuovi codici non corrispondono.'
  if (!/^\d+$/.test(next) || (kind === 'pin' ? next.length > 8 : next.length < 6 || next.length > 10))
    return kind === 'pin'
      ? 'Inserisci un PIN numerico di massimo 8 cifre.'
      : 'Il Mobile Code deve contenere da 6 a 10 cifre.'
  if (kind === 'pin' && pinHistory.includes(next)) return 'Il PIN deve essere diverso dagli ultimi 5 PIN utilizzati.'
  if (identityCodes.includes(next) || next === (kind === 'mobile' ? pin : ''))
    return 'Il codice deve essere diverso da PIN, Codice Adesione e data di nascita.'
  if (next === mobileCode && kind === 'mobile') return 'Il nuovo Mobile Code deve essere diverso dal precedente.'
  if (
    /(\d)\1{3}/.test(next) ||
    digitRun(next, 4) ||
    (kind === 'mobile' && (next.startsWith('0') || repeatedGroup(next)))
  )
    return 'Il codice contiene una sequenza non consentita.'
  return null
}
export function changeCredential(
  kind: CredentialKind,
  current: string,
  next: string,
  confirmation: string,
): string | null {
  const error = credentialError(kind, current, next, confirmation)
  if (error) return error
  if (kind === 'pin') {
    pin = next
    pinHistory = [next, ...pinHistory].slice(0, 5)
  } else mobileCode = next
  return null
}
export function authorizeProfileChange(code: string): { valid: boolean; locked: boolean; error: string | null } {
  if (attempts >= 3)
    return {
      valid: false,
      locked: true,
      error: 'Autorizzazione temporaneamente bloccata.',
    }
  if (code !== mobileCode) {
    attempts++
    return {
      valid: false,
      locked: attempts >= 3,
      error: attempts >= 3 ? 'Autorizzazione temporaneamente bloccata.' : 'Il Mobile Code non è corretto. Riprova.',
    }
  }
  attempts = 0
  return { valid: true, locked: false, error: null }
}
export function resetProfileAuthorization() {
  attempts = 0
  pinAttempts = 0
}
export function isProfileAuthorizationLocked(credential: 'mobile' | 'pin' = 'mobile'): boolean {
  return credential === 'mobile' ? attempts >= 3 : pinAttempts >= 3
}
export function verifyProfilePin(value: string): boolean {
  return value === pin
}
export function authorizeProfilePin(value: string): { valid: boolean; locked: boolean; error: string | null } {
  if (pinAttempts >= 3) return { valid: false, locked: true, error: 'Accesso temporaneamente bloccato.' }
  if (value !== pin) {
    pinAttempts++
    return {
      valid: false,
      locked: pinAttempts >= 3,
      error: pinAttempts >= 3 ? 'Accesso temporaneamente bloccato.' : 'Il PIN non è corretto. Riprova.',
    }
  }
  pinAttempts = 0
  return { valid: true, locked: false, error: null }
}
export function verifyProfileMobileCode(value: string): boolean {
  return value === mobileCode
}
export function createProfileMobileCode(cardBlock: string): string | null {
  if (cardBlock !== '5678') return 'Il blocco della carta non è corretto. Riprova.'
  mobileCode = ['59382746', '68492735', '75938264'].find((value) => value !== pin && value !== mobileCode)!
  attempts = 0
  return null
}
export function validateDailyLimit(value: number, period: string): string | null {
  if (!Number.isFinite(value) || value < 5000 || value > 25000)
    return 'Il limite giornaliero deve essere compreso tra 5.000 € e 25.000 €.'
  if (!['1 Settimana', '1 Mese', '3 Mesi', '6 Mesi', '1 Anno'].includes(period))
    return 'Seleziona un periodo di validità.'
  return null
}
export function profileLimitExpiration(period: string, now = new Date()): Date {
  const expires = new Date(now)
  if (period === '1 Settimana') expires.setDate(expires.getDate() + 7)
  else expires.setMonth(expires.getMonth() + ({ '1 Mese': 1, '3 Mesi': 3, '6 Mesi': 6, '1 Anno': 12 }[period] ?? 0))
  expires.setHours(23, 59, 59, 999)
  return expires
}
export function effectiveProfileDailyLimit(state: ProfileSettingsSnapshot, now = new Date()): number {
  return state.dailyExpiresAt && new Date(state.dailyExpiresAt).getTime() < now.getTime()
    ? (state.previousDailyLimit ?? 5000)
    : state.dailyLimit
}
export function applyProfileDailyLimit(value: number, period: string, now = new Date()): string | null {
  const error = validateDailyLimit(value, period)
  if (error) return error
  publish({
    ...snapshot,
    previousDailyLimit: effectiveProfileDailyLimit(snapshot, now),
    dailyLimit: value,
    dailyPeriod: period,
    dailyExpiresAt: profileLimitExpiration(period, now).toISOString(),
  })
  return null
}
export function validateInstantLimit(next: InstantLimit, previous: InstantLimit): string | null {
  if (!Number.isFinite(next.amount) || next.amount < 0 || next.amount > 999999999)
    return 'Inserisci un importo limite valido.'
  if (next.amount === previous.amount && next.kind === previous.kind) return 'Modifica il valore per poter procedere.'
  return null
}
export function quickOperationError(
  accounts: readonly string[],
  defaultAccount: string,
  costs: boolean,
  emailVerified: boolean,
  phoneVerified: boolean,
): string | null {
  if (!emailVerified || !phoneVerified) return 'Verifica email e numero di cellulare prima di procedere.'
  if (!accounts.length) return 'Seleziona almeno un conto o una carta.'
  if (!accounts.includes(defaultAccount)) return 'Seleziona un conto predefinito tra quelli abilitati.'
  if (!costs) return 'Conferma di aver preso visione dei costi.'
  return null
}
export function consentAction(id: string, action: 'renew' | 'revoke'): string | null {
  const consent = snapshot.consents.find((x) => x.id === id)
  if (!consent) return 'Consenso non trovato.'
  if (action === 'renew' && consent.status.startsWith('Rev.'))
    return 'Un consenso revocato richiede una nuova autorizzazione.'
  publish({
    ...snapshot,
    consents: snapshot.consents.map((x) =>
      x.id === id
        ? {
            ...x,
            status: action === 'revoke' ? 'Rev. Utente' : 'Attivo',
            expires: action === 'renew' ? '10/04/2027' : x.expires,
          }
        : x,
    ),
  })
  return null
}
export function addImportedConsent(bank: string) {
  publish({
    ...snapshot,
    consents: [
      ...snapshot.consents.map((consent) =>
        consent.direction === 'imported' && consent.bank === bank && consent.status === 'Attivo'
          ? { ...consent, status: 'Rev. Utente' as const }
          : consent,
      ),
      {
        id: 'imported-' + String(Date.now()),
        bank,
        direction: 'imported',
        status: 'Attivo',
        expires: '10/04/2027',
        balance: true,
        transactions: true,
      },
    ],
  })
}
export function filterAccesses<T extends { date: string; channel: string }>(
  rows: readonly T[],
  from: string,
  to: string,
  channel: string,
): T[] {
  if (from && to && from > to) return []
  return rows.filter(
    (x) => (!from || x.date >= from) && (!to || x.date <= to) && (channel === 'Tutti' || x.channel === channel),
  )
}
export function categoryNotificationError(
  category: string,
  subcategory: string,
  active: readonly string[],
): string | null {
  if (!category || !subcategory) return 'Seleziona una categoria e una sottocategoria.'
  return active.includes(category + ' - ' + subcategory) ? 'La notifica è già attiva per questa categoria.' : null
}
export function deviceDeactivationError(code: string): string | null {
  return code.trim().toUpperCase() === 'RSSMRA90R10F205I' ? null : 'Il codice fiscale inserito non corrisponde.'
}
export function validProfileContact(kind: 'email' | 'phone', value: string): boolean {
  return kind === 'email' ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) : /^\+?\d{9,13}$/.test(value)
}
export function sendProfileAccessHistory(recipient: string, count: number): string | null {
  if (!snapshot.emailVerified || !validProfileContact('email', recipient))
    return 'Verifica un indirizzo email valido prima di inviare lo storico.'
  if (!Number.isInteger(count) || count < 0) return 'Lo storico non è disponibile.'
  publish({ ...snapshot, lastAccessHistoryDelivery: { recipient, count, status: 'sent' } })
  return null
}
export function isThirdPartyCodeValid(code: string): boolean {
  return code.trim().toUpperCase() === 'YADITY'
}
export function securityLevel(missions: readonly string[]): 'Basso' | 'Medio' | 'Alto' {
  return missions.includes('unsafe-device') ? 'Basso' : missions.length >= 5 ? 'Alto' : 'Medio'
}
export function switchProfileNotificationsToPush() {
  publish({
    ...snapshot,
    smsPremium: false,
    notificationsEnabled: true,
    notificationChannels: Object.fromEntries(
      Object.entries(snapshot.notificationChannels).map(([key, value]) => [
        key,
        value === 'SMS Premium' ? 'Push' : value,
      ]),
    ),
  })
}
export function saveProfileNotificationPreferences(
  enabled: boolean,
  channels: Record<string, string>,
  groups = snapshot.notificationGroupEnabled,
) {
  publish({
    ...snapshot,
    notificationsEnabled: enabled,
    notificationGroupEnabled: groups,
    notificationChannels: Object.fromEntries(
      Object.entries(channels).map(([key, value]) => [
        key,
        !snapshot.smsPremium && value === 'SMS Premium' ? 'Push' : value,
      ]),
    ),
  })
}
export function parseProfileAmount(value: string): number {
  const input = value.trim()
  if (!input) return Number.NaN
  const normalized = /^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(input)
    ? input.replace(/\./g, '').replace(',', '.')
    : input.replace(',', '.')
  return Number(normalized)
}
export function effectiveProfileSignature(
  status: ProfileSettingsSnapshot['signature'],
  suspendedAt: string | undefined,
  now = new Date(),
): ProfileSettingsSnapshot['signature'] {
  return status === 'Sospesa' && suspendedAt && now.getTime() - new Date(suspendedAt).getTime() >= 90 * 86400000
    ? 'Revocata'
    : status
}
export function transitionProfileSignature(action: 'Attiva' | 'Sospesa' | 'Revocata', now = new Date()): void {
  publish({
    ...snapshot,
    signature: action,
    signatureSuspendedAt: action === 'Sospesa' ? now.toISOString() : undefined,
  })
}
export function profileDocument(title: string, body: string): string {
  return (
    'FACSIMILE\n' + title + '\n\n' + body + '\n\nDocumento del prototipo. Nessuna richiesta bancaria è stata inviata.'
  )
}
export function exportProfileText(filename: string, text: string) {
  if (typeof URL.createObjectURL !== 'function') return text
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return text
}
export function createProfilePdf(title: string, body: string): Uint8Array {
  const text = profileDocument(title, body)
    .normalize('NFKD')
    .replace(/[^\x20-\x7E\n]/g, '')
  const lines = text.split('\n').flatMap((line) => line.match(/.{1,85}(?:\s|$)|.{1,85}/g) ?? [''])
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  const pages: number[] = []
  for (let offset = 0; offset < Math.max(lines.length, 1); offset += 35) {
    const page = objects.length + 1,
      streamId = page + 1
    pages.push(page)
    const stream =
      'BT /F1 11 Tf 40 790 Td 20 TL ' +
      lines
        .slice(offset, offset + 35)
        .map((line, i) => (i ? 'T* ' : '') + '(' + line.replace(/[\\()]/g, (c) => '\\' + c) + ') Tj')
        .join('\n') +
      ' ET'
    objects.push(
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ' +
        streamId +
        ' 0 R >>',
      '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream',
    )
  }
  objects[1] = '<< /Type /Pages /Kids [' + pages.map((x) => x + ' 0 R').join(' ') + '] /Count ' + pages.length + ' >>'
  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((object, i) => {
    offsets.push(pdf.length)
    pdf += i + 1 + ' 0 obj\n' + object + '\nendobj\n'
  })
  const start = pdf.length
  pdf +=
    'xref\n0 ' +
    (objects.length + 1) +
    '\n0000000000 65535 f \n' +
    offsets.map((x) => String(x).padStart(10, '0') + ' 00000 n \n').join('') +
    'trailer\n<< /Size ' +
    (objects.length + 1) +
    ' /Root 1 0 R >>\nstartxref\n' +
    start +
    '\n%%EOF'
  return new TextEncoder().encode(pdf)
}
export function downloadProfilePdf(title: string, body: string): Uint8Array {
  const bytes = createProfilePdf(title, body)
  if (typeof URL.createObjectURL === 'function') {
    const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'documento-consensi.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }
  return bytes
}
