import { authorizeProfileChange as authorizeCanonicalProfileChange } from './mobileFirstProfileSettings'

export type PersonalChange =
  | 'email'
  | 'phone'
  | 'residence'
  | 'correspondence'
  | 'education'
  | 'family'
  | 'plates'
  | 'portability'
  | 'photo'
  | 'questionnaire'
export interface ProfilePersonalData {
  firstName: string
  lastName: string
  email: string
  phone: string
  provider: string
  prefix: string
  residence: string
  correspondence: string
  residenceAddress?: ProfileAddress
  correspondenceAddresses?: Record<string, ProfileAddress>
  education: string
  family: string
  children: string[]
  plates: string[]
  photo: boolean
  photoUpdated?: boolean
  questionnaireUpdated: boolean
  portabilityRequested: boolean
}
export interface ProfileAddress {
  street: string
  number: string
  postal: string
  city: string
  province: string
  careOf: string
}
export function profileAddressUpdate(
  change: 'residence' | 'correspondence',
  address: ProfileAddress,
  account: string,
  allAccounts: readonly string[],
): Partial<ProfilePersonalData> {
  if (change === 'residence') return { residence: `${address.street}, ${address.number}`, residenceAddress: address }
  return {
    correspondence: `${address.street}, ${address.number}`,
    correspondenceAddresses: {
      ...personal.correspondenceAddresses,
      ...Object.fromEntries((account === 'Tutti i rapporti' ? allAccounts : [account]).map((id) => [id, address])),
    },
  }
}
export interface ContactRelationship {
  type: 'account' | 'card' | 'mobile'
  value: string
  bic?: string
  country?: string
  city?: string
  cardType?: string
  provider?: string
}
export interface ProfileContact {
  id: string
  name: string
  alias: string
  address: string
  postal: string
  city: string
  province: string
  favorite: boolean
  own: boolean
  relationships: ContactRelationship[]
  mergeSourceIds?: readonly [string, string]
}
export interface IdentityDocument {
  id: string
  type: string
  number: string
  issued: string
  expires: string
  country: string
  city: string
  province: string
}
export const initialProfileData: ProfilePersonalData = {
  firstName: 'Andrea',
  lastName: 'Rossini',
  email: 'andrearossini@email.it',
  phone: '3351267799',
  provider: 'Vodafone',
  prefix: '+39',
  residence: 'Via Milano, 1',
  correspondence: 'Via Milano, 1',
  education: '---',
  family: '---',
  children: [],
  plates: ['AA000AAA', 'AA11AAA'],
  photo: true,
  questionnaireUpdated: false,
  portabilityRequested: false,
}
const names = [
  'Antonio Fumagalli',
  'Alessia Colombo',
  'Andrea Moretti',
  'Alberto Moretti',
  'Aurora Rossi',
  'Beatrice Ricci',
  'Diana Colombo',
  'Daniele Conti',
  'Deborah Rizzi',
  'Francesco Fumagalli',
  'Gianluca Verdi',
  'Maria Pellegrini',
]
function initialContacts(): ProfileContact[] {
  return names.map((name, index) => ({
    id: `contact-${index}`,
    name,
    alias: name.replace(' ', '.'),
    address: '',
    postal: '',
    city: '',
    province: '',
    favorite: index === 11,
    own: index === 0,
    relationships: [{ type: 'account', value: 'IT60X0542811101000000123456' }],
  }))
}
function initialDocuments(): IdentityDocument[] {
  return [
    {
      id: 'identity',
      type: 'Carta d’identità',
      number: 'AY00000009',
      issued: '2015-10-10',
      expires: '2025-10-10',
      country: 'Italia',
      city: 'Milano',
      province: 'MI',
    },
    {
      id: 'licence',
      type: 'Patente',
      number: 'MI00000418',
      issued: '2021-01-01',
      expires: '2031-01-01',
      country: 'Italia',
      city: 'Milano',
      province: 'MI',
    },
  ]
}
let personal = { ...initialProfileData }
let contacts = initialContacts()
let documents = initialDocuments()
const listeners = new Set<() => void>()
function publish() {
  listeners.forEach((listener) => listener())
}
export function subscribeProfileData(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export function getProfileDataSnapshot() {
  return personal
}
export function getContactsSnapshot() {
  return contacts
}
export function getIdentityDocumentsSnapshot() {
  return documents
}
export function resetProfileData() {
  personal = { ...initialProfileData, children: [], plates: [...initialProfileData.plates] }
  contacts = initialContacts()
  documents = initialDocuments()
  publish()
}
export function updateProfileData(update: Partial<ProfilePersonalData>) {
  personal = { ...personal, ...update }
  publish()
}
export function authorizeProfileChange(code: string) {
  return authorizeCanonicalProfileChange(code).valid
}
export function verifyProfileDataOtp(code: string) {
  return /^\d{6}$/.test(code) && code === '123456'
}
export function validatePersonalChange(
  change: PersonalChange,
  values: Record<string, string | boolean | string[]>,
): string {
  const text = (key: string) => String(values[key] ?? '').trim()
  if (change === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text('email')))
    return 'Inserisci un indirizzo email valido.'
  if (change === 'phone' && (!/^\d{7,15}$/.test(text('phone')) || !text('provider')))
    return 'Inserisci un numero di cellulare valido e seleziona l’operatore.'
  if (change === 'residence' || change === 'correspondence') {
    if (!text('street') || !text('number') || !/^\d{5}$/.test(text('postal')) || !text('city') || !text('province'))
      return 'Completa l’indirizzo e inserisci un codice postale di 5 cifre.'
  }
  if (change === 'family' && text('family') === 'Famiglia con figli') {
    const children = values.children as string[] | undefined
    if (
      !children?.length ||
      children.some(
        (date) => !date || !Number.isFinite(new Date(date).getTime()) || new Date(date).getTime() > Date.now(),
      )
    )
      return 'Inserisci una data di nascita valida per ogni figlio.'
  }
  if (
    change === 'plates' &&
    (((values.plates as string[]) ?? []).length > 3 ||
      ((values.plates as string[]) ?? []).some((plate) => !/^[A-Z0-9]{1,8}$/.test(plate)))
  )
    return 'La targa deve contenere massimo 8 caratteri alfanumerici.'
  if (change === 'portability') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text('email')) || !/^\d{7,15}$/.test(text('phone')))
      return 'Inserisci recapiti validi.'
    if (text('email') !== text('emailConfirm') || text('phone') !== text('phoneConfirm'))
      return 'I recapiti di conferma non corrispondono.'
  }
  return ''
}
export function validateContact(contact: Pick<ProfileContact, 'name' | 'relationships'>): string {
  if (!contact.name.trim()) return 'Inserisci il nominativo.'
  if (!contact.relationships.length) return 'Aggiungi almeno un rapporto.'
  const foreign = contact.relationships.some(
    (r) => r.type === 'account' && !r.value.replace(/\s/g, '').toUpperCase().startsWith('IT'),
  )
  if (foreign && contact.relationships.some((r) => r.type !== 'account'))
    return 'È possibile associare solo IBAN italiani a rapporti di cellulare e/o carta prepagata.'
  for (const r of contact.relationships) {
    if (r.type === 'account') {
      const currentForeign = !r.value.replace(/\s/g, '').toUpperCase().startsWith('IT')
      if (!/^[A-Z0-9]{5,34}$/.test(r.value.replace(/\s/g, '').toUpperCase()))
        return 'Inserisci IBAN o coordinate bancarie validi.'
      if (!currentForeign && !validItalianIban(r.value)) return 'Inserisci un IBAN italiano valido.'
      if (currentForeign && (!/^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(r.bic ?? '') || !r.country || !r.city))
        return 'Completa BIC, città e paese del conto estero.'
    }
    if (r.type === 'card' && (!/^\d{16}$/.test(r.value) || !r.cardType)) return 'Inserisci 16 cifre e il tipo di carta.'
    if (r.type === 'mobile' && (!/^\d{7,15}$/.test(r.value) || !r.provider))
      return 'Inserisci numero di cellulare e operatore.'
  }
  return ''
}
export function validItalianIban(input: string) {
  const iban = input.replace(/\s/g, '').toUpperCase()
  if (!/^IT\d{2}[A-Z]\d{10}[A-Z0-9]{12}$/.test(iban)) return false
  const rearranged = iban.slice(4) + iban.slice(0, 4)
  const numeric = [...rearranged].map((char) => (/[A-Z]/.test(char) ? String(char.charCodeAt(0) - 55) : char)).join('')
  let remainder = 0
  for (const digit of numeric) remainder = (remainder * 10 + Number(digit)) % 97
  return remainder === 1
}
export function canAddContactRelationship(relationships: ContactRelationship[], type: ContactRelationship['type']) {
  return (
    type === 'account' ||
    !relationships.some((r) => r.type === 'account' && !!r.value && !r.value.replace(/\s/g, '').startsWith('IT'))
  )
}
export function saveContact(contact: ProfileContact) {
  const error = validateContact(contact)
  if (error) return error
  contacts = contacts.some((c) => c.id === contact.id)
    ? contacts.map((c) => (c.id === contact.id ? contact : c))
    : [...contacts, contact]
  publish()
  return ''
}
export function removeContact(id: string) {
  contacts = contacts.filter((c) => c.id !== id)
  publish()
}
export function setContactFavorite(id: string, favorite: boolean) {
  contacts = contacts.map((c) => (c.id === id ? { ...c, favorite } : c))
  publish()
}
export function previewContactMerge(firstId: string, secondId: string): ProfileContact {
  const first = contacts.find((c) => c.id === firstId),
    second = contacts.find((c) => c.id === secondId)
  if (!first || !second || firstId === secondId) throw new Error('Seleziona due contatti diversi.')
  return {
    ...first,
    mergeSourceIds: [firstId, secondId],
    relationships: [...first.relationships, ...second.relationships],
    favorite: first.favorite || second.favorite,
  }
}
export function mergeContacts(firstId: string, secondId: string, edited?: ProfileContact): ProfileContact {
  const preview = previewContactMerge(firstId, secondId)
  if (
    edited &&
    (edited.id !== firstId || edited.mergeSourceIds?.[0] !== firstId || edited.mergeSourceIds?.[1] !== secondId)
  )
    throw new Error('Il contatto modificato non appartiene alla coppia selezionata.')
  const merged = edited ? { ...edited } : preview
  const error = validateContact(merged)
  if (error) throw new Error(error)
  delete merged.mergeSourceIds
  contacts = contacts.filter((c) => c.id !== secondId).map((c) => (c.id === firstId ? merged : c))
  publish()
  return merged
}
export function identityStatus(document: Pick<IdentityDocument, 'expires'>) {
  return new Date(document.expires).getTime() < Date.now() ? 'Scaduto' : 'In corso di validità'
}
export function identityNfcReadError(outcome: string, attempt: number): string | null {
  if (attempt > 0) return null
  if (outcome === 'chip-error')
    return 'Non è stato possibile accedere al chip. Riprova controllando i dati del documento o prosegui senza l’utilizzo del lettore NFC.'
  if (outcome === 'position-error')
    return 'Per una corretta lettura della carta d’identità appoggia la carta sul retro, nella parte alta del tuo dispositivo mobile.'
  return null
}
export function validateIdentityDocument(
  document: Pick<IdentityDocument, 'number' | 'issued' | 'expires' | 'country' | 'city' | 'province'>,
): string {
  if (!/^[A-Z0-9]{5,20}$/i.test(document.number) || !document.country || !document.city || !document.province)
    return 'Completa tutti i dati del documento.'
  const issued = new Date(document.issued).getTime(),
    expires = new Date(document.expires).getTime()
  if (!Number.isFinite(issued) || issued > Date.now()) return 'Inserisci una data di rilascio valida.'
  if (!Number.isFinite(expires) || expires <= Date.now() || expires <= issued)
    return 'Inserisci una data di scadenza futura, successiva al rilascio.'
  return ''
}
export function saveIdentityDocument(document: IdentityDocument) {
  const error = validateIdentityDocument(document)
  if (error) return error
  documents = documents.some((d) => d.id === document.id)
    ? documents.map((d) => (d.id === document.id ? document : d))
    : [...documents, document]
  publish()
  return ''
}
export function canCompleteQuestionnaire() {
  return documents.some((d) => identityStatus(d) !== 'Scaduto' && d.type.includes('identità'))
}
export interface ProfileQuestionnaire {
  occupation: string
  industry: string
  country: string
  province: string
  politicallyExposed: boolean
  sensitiveRole: boolean
  purposes: string[]
  sourceOfFunds: string
  additional: string
  declaration: boolean
}
export function validateQuestionnaireStep(step: number, data: ProfileQuestionnaire) {
  if (step === 1 && (!data.occupation || !data.industry || !data.country || !data.province))
    return 'Completa i dati professionali.'
  if (step === 3 && (data.purposes.some((p) => !p) || (data.politicallyExposed && !data.sourceOfFunds.trim())))
    return 'Completa lo scopo dei rapporti e l’origine dei fondi.'
  if (step === 4 && !data.declaration) return 'Conferma i dati riportati nel questionario.'
  return ''
}
