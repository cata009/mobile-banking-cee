export interface InsurancePerson {
  readonly name: string
  readonly guarantees: readonly string[]
  readonly beneficiary?: string
  readonly contact?: string
}
export interface InsuranceModule {
  readonly id: string
  readonly name: string
  readonly premium: number
  readonly start: string
  readonly expiry: string
  readonly addresses?: readonly string[]
  readonly guarantees: readonly string[]
  readonly people?: readonly InsurancePerson[]
}
export interface InsurancePolicy {
  readonly id: string
  readonly name: string
  readonly number: string
  readonly status: 'active' | 'inactive'
  readonly company: string
  readonly start: string
  readonly expiry: string
  readonly premium: number
  readonly frequency: string
  readonly nextPayment: string
  readonly email: string
  readonly channel: 'digital' | 'assistance'
  readonly modules: readonly InsuranceModule[]
  readonly history?: readonly {
    id: string
    label: string
    expiry: string
    amount: number
    status: 'collected' | 'pending'
  }[]
  readonly protection?: {
    readonly holder: string
    readonly insured: string
    readonly beneficiary?: string
    readonly guarantees: readonly string[]
    readonly capital?: number
  }
}
export interface InsuranceDocument {
  readonly id: string
  readonly policyId: string
  readonly title: string
  readonly category: string
  readonly date: string
  readonly reference: string
  readonly read: boolean
}
export interface InsuranceDocumentFilter {
  readonly from: string
  readonly to: string
  readonly category: string
}
export type InsuranceAction = 'add-module' | 'manage' | 'documents' | 'contact'

export function getInsuranceActions(policy: InsurancePolicy): InsuranceAction[] {
  if (policy.channel === 'assistance' || policy.status !== 'active') return ['contact']
  return [...(policy.modules.length ? ['add-module' as const] : []), 'manage', 'documents', 'contact']
}
/** Module premiums inherit the policy's payment frequency; add cents before formatting. */
export function insurancePremiumCents(policy: InsurancePolicy): number {
  return policy.modules.length
    ? policy.modules.reduce((sum, module) => sum + Math.round(module.premium * 100), 0)
    : Math.round(policy.premium * 100)
}
export function normalizeInsuranceFavorites(ids: readonly string[], policies: readonly InsurancePolicy[]): string[] {
  const active = new Set(policies.filter((p) => p.status === 'active').map((p) => p.id))
  return [...new Set(ids)].filter((id) => active.has(id)).slice(0, 2)
}
export function selectInsuranceFavorite(
  ids: readonly string[],
  id: string,
  policies: readonly InsurancePolicy[],
): string[] {
  const favorites = normalizeInsuranceFavorites(ids, policies)
  return favorites.includes(id)
    ? favorites.filter((value) => value !== id)
    : normalizeInsuranceFavorites([id, ...favorites], policies)
}
export function moveInsuranceFavorite(ids: readonly string[], index: number, delta: -1 | 1): string[] {
  const result = [...ids]
  const next = index + delta
  if (index < 0 || index >= result.length || next < 0 || next >= result.length) return result
  ;[result[index], result[next]] = [result[next]!, result[index]!]
  return result
}
export function selectHomepageInsurance(
  policies: readonly InsurancePolicy[],
  favorites: readonly string[] | null,
): InsurancePolicy[] {
  const active = policies.filter((p) => p.status === 'active')
  const ids =
    favorites === null ? active.slice(0, 2).map((p) => p.id) : normalizeInsuranceFavorites(favorites, policies)
  return ids.map((id) => active.find((p) => p.id === id)).filter((p): p is InsurancePolicy => !!p)
}
export function validateInsuranceDocumentFilter(filter: InsuranceDocumentFilter): string | null {
  const valid = (value: string) => {
    if (!value) return true
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T12:00:00Z`)
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  }
  if (!valid(filter.from) || !valid(filter.to)) return 'Inserisci date valide.'
  if (filter.from && filter.to && filter.from > filter.to) return 'La data iniziale deve precedere la data finale.'
  return null
}
export function filterInsuranceDocuments(
  documents: readonly InsuranceDocument[],
  filter: InsuranceDocumentFilter,
): InsuranceDocument[] {
  return documents.filter(
    (d) =>
      (!filter.from || d.date >= filter.from) &&
      (!filter.to || d.date <= filter.to) &&
      (!filter.category || d.category === filter.category),
  )
}
export function insurancePeriod(months: number, end: string): Pick<InsuranceDocumentFilter, 'from' | 'to'> {
  const date = new Date(`${end}T12:00:00Z`)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() - months)
  const max = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
  date.setUTCDate(Math.min(day, max))
  return { from: date.toISOString().slice(0, 10), to: end }
}
export function validInsuranceCertificateYear(value: string, referenceYear: number): boolean {
  return /^\d{4}$/.test(value) && Number(value) >= 2000 && Number(value) < referenceYear
}

export interface InsuranceSnapshot {
  readonly favorites: readonly string[] | null
  readonly portfolioFavorites: Readonly<Record<string, readonly string[]>>
  readonly readDocuments: readonly string[]
  readonly requests: readonly { policyId: string; kind: string; year?: string }[]
  readonly documentFilters: Readonly<Record<string, InsuranceDocumentFilter>>
}
let snapshot: InsuranceSnapshot = {
  favorites: null,
  portfolioFavorites: {},
  readDocuments: [],
  requests: [],
  documentFilters: {},
}
const listeners = new Set<() => void>()
export function getInsuranceSnapshot() {
  return snapshot
}
export function subscribeInsurance(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
function publish(next: InsuranceSnapshot) {
  snapshot = next
  listeners.forEach((listener) => listener())
}
export function saveInsuranceFavorites(ids: readonly string[], policies: readonly InsurancePolicy[]) {
  const favorites = normalizeInsuranceFavorites(ids, policies)
  publish({
    ...snapshot,
    favorites,
    portfolioFavorites: { ...snapshot.portfolioFavorites, [insurancePortfolioKey(policies)]: favorites },
  })
}
export function insurancePortfolioKey(policies: readonly InsurancePolicy[]): string {
  return policies
    .map((policy) => `${policy.id}:${policy.number}`)
    .sort()
    .join('|')
}
export function getInsuranceFavorites(
  policies: readonly InsurancePolicy[],
  state = snapshot,
): readonly string[] | null {
  return state.portfolioFavorites[insurancePortfolioKey(policies)] ?? null
}
export function markInsuranceDocumentRead(id: string) {
  if (!snapshot.readDocuments.includes(id)) publish({ ...snapshot, readDocuments: [...snapshot.readDocuments, id] })
}
export function recordInsuranceRequest(policyId: string, kind: string, year?: string) {
  publish({ ...snapshot, requests: [...snapshot.requests, { policyId, kind, year }] })
}
export function saveInsuranceDocumentFilter(policyId: string, filter: InsuranceDocumentFilter) {
  publish({ ...snapshot, documentFilters: { ...snapshot.documentFilters, [policyId]: filter } })
}
