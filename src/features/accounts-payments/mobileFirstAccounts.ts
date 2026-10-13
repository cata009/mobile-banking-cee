/** Account policies shared by the Italian Conti compositions. No UI dependencies. */
import {
  getAccountFinanceMovements,
  getFinanceEventForMovement,
  getItalyFinancialSnapshot,
  selectAccountBalance,
  setEventAnnotations,
  registerImportedFinancialAccount,
  fromCents,
  toCents,
  type ItalyFinancialSnapshot,
} from '@/features/finance/italyFinancials'
export interface MobileFirstAccountRecord {
  readonly name: string
  readonly number: string
  readonly balance: number
  readonly bookBalance?: number
  readonly listBalance?: number
  readonly bank?: string
  readonly iban?: string
  readonly imported?: boolean
  readonly openingBalance?: number
  readonly settledNet?: number
  readonly pendingDebits?: number
  readonly overdraft?: number
  readonly otherUnavailable?: number
}

export interface AccountMovement {
  readonly id: string
  readonly name: string
  readonly category: string
  readonly amount: number
  readonly date: string
  readonly icon: 'utilities' | 'taxes' | 'expenses' | 'incomes'
  readonly pending?: boolean
  readonly status?: 'settled' | 'pending' | 'authorization'
  readonly kind?: string
  readonly eventId?: string
  readonly excluded?: boolean
  readonly subcategory?: string
  readonly note?: string
  readonly splits?: readonly { category: string; amount: string }[]
  readonly bookedOn?: string
}

export interface AccountMovementChanges {
  readonly category?: string
  readonly subcategory?: string
  readonly note?: string
  readonly excluded?: boolean
  readonly splits?: readonly { category: string; amount: string }[]
}

// Session state survives account view remounts. Cross-feature consumers use explicit account + movement identities.
let movementChanges: Readonly<Record<string, AccountMovementChanges>> = {}
const movementListeners = new Set<() => void>()
export interface AccountSettingsState {
  readonly services: Readonly<Record<string, boolean>>
  readonly bancomatActive: boolean
  readonly requestMoney: boolean
  readonly preferred: boolean
  readonly sendLimits: readonly [string, string]
  readonly paymentLimits: readonly [string, string]
}
export const DEFAULT_ACCOUNT_SETTINGS: AccountSettingsState = {
  services: {},
  bancomatActive: true,
  requestMoney: true,
  preferred: false,
  sendLimits: ['500', '1500'],
  paymentLimits: ['500', '1500'],
}
let accountPreferences: {
  names: Readonly<Record<string, string>>
  favorites: readonly string[] | null
  imported: readonly MobileFirstAccountRecord[]
  settings: Readonly<Record<string, AccountSettingsState>>
} = { names: {}, favorites: null, imported: [], settings: {} }
export function getAccountPreferences() {
  return accountPreferences
}
export function saveAccountName(number: string, name: string) {
  accountPreferences = { ...accountPreferences, names: { ...accountPreferences.names, [number]: name } }
  movementListeners.forEach((listener) => listener())
}
export function saveAccountFavorites(favorites: readonly string[]) {
  accountPreferences = { ...accountPreferences, favorites: [...new Set(favorites)].slice(0, 2) }
  movementListeners.forEach((listener) => listener())
}
export function saveImportedAccount(account: MobileFirstAccountRecord) {
  registerImportedFinancialAccount({
    number: account.number,
    name: account.name,
    bank: account.bank ?? 'FINECO',
    iban: account.iban ?? '',
    imported: true,
    openingBalanceCents: 0,
    overdraftCents: 0,
    otherUnavailableCents: 0,
  })
  accountPreferences = { ...accountPreferences, imported: [...accountPreferences.imported, account] }
  movementListeners.forEach((listener) => listener())
}
export function saveAccountSettings(number: string, settings: AccountSettingsState) {
  const previous = settings.preferred
    ? Object.fromEntries(
        Object.entries(accountPreferences.settings).map(([key, value]) => [
          key,
          key === number ? value : { ...value, preferred: false },
        ]),
      )
    : accountPreferences.settings
  accountPreferences = { ...accountPreferences, settings: { ...previous, [number]: settings } }
  movementListeners.forEach((listener) => listener())
}
export function subscribeAccountMovementChanges(listener: () => void) {
  movementListeners.add(listener)
  return () => {
    movementListeners.delete(listener)
  }
}
export function getAccountMovementChanges() {
  return movementChanges
}
export function saveAccountMovementChanges(accountId: string, movementId: string, changes: AccountMovementChanges) {
  const event = getFinanceEventForMovement(getItalyFinancialSnapshot(), 'account', accountId, movementId)
  if (event) {
    const result = setEventAnnotations(event.id, {
      ...(changes.category !== undefined ? { category: changes.category } : {}),
      ...(changes.subcategory !== undefined ? { subcategory: changes.subcategory } : {}),
      ...(changes.note !== undefined ? { note: changes.note } : {}),
      ...(changes.excluded !== undefined ? { excluded: changes.excluded } : {}),
      ...(changes.splits
        ? {
            splits: changes.splits.map((part) => ({
              category: part.category,
              amountCents: toCents(Number(part.amount)),
            })),
          }
        : {}),
    })
    if (!result.ok) return
  }
  const key = `${accountId}:${movementId}`
  movementChanges = { ...movementChanges, [key]: { ...movementChanges[key], ...changes } }
  movementListeners.forEach((listener) => listener())
}

export function getAccountLedgerRecord<T extends MobileFirstAccountRecord>(
  account: T,
  state: ItalyFinancialSnapshot = getItalyFinancialSnapshot(),
) {
  const balance = selectAccountBalance(state, account.number)
  const openingBalance = fromCents(
    state.accounts.find((config) => config.number === account.number)?.openingBalanceCents ?? 0,
  )
  return {
    ...account,
    ...balance,
    openingBalance,
    settledNet: fromCents(balance.bookBalanceCents - toCents(openingBalance)),
    listBalance: balance.balance,
  }
}

export function getAccountLedgerMovements(
  number: string,
  state: ItalyFinancialSnapshot = getItalyFinancialSnapshot(),
): AccountMovement[] {
  return getAccountFinanceMovements(state, number).map((row) => ({
    ...row,
    amount: fromCents(row.amountCents),
    pending: row.status !== 'settled',
    icon:
      row.amountCents > 0
        ? 'incomes'
        : row.name === 'Imposta di bollo'
          ? 'taxes'
          : row.category === 'Utenze'
            ? 'utilities'
            : 'expenses',
    splits: row.splits?.map((part) => ({ category: part.category, amount: fromCents(part.amountCents).toFixed(2) })),
  }))
}

export interface AccountSearchFilters {
  readonly tag: string
  readonly from: string
  readonly to: string
  readonly min: string
  readonly max: string
}

export const EMPTY_ACCOUNT_FILTERS: AccountSearchFilters = { tag: '', from: '', to: '', min: '', max: '' }

export function matchesAccountMovement(movement: AccountMovement, filters: AccountSearchFilters) {
  const words = filters.tag.trim().toLocaleLowerCase('it-IT').split(/\s+/).filter(Boolean)
  const haystack = `${movement.name} ${movement.category}`.toLocaleLowerCase('it-IT')
  return (
    words.every((word) => haystack.includes(word)) &&
    (!filters.from || movement.date >= filters.from) &&
    (!filters.to || movement.date <= filters.to) &&
    (!filters.min || Math.abs(movement.amount) >= Number(filters.min)) &&
    (!filters.max || Math.abs(movement.amount) <= Number(filters.max))
  )
}

export function accountFilterError(filters: AccountSearchFilters): string | null {
  if (filters.from && filters.to && filters.from > filters.to) return 'La data iniziale deve precedere la data finale.'
  if (
    [filters.min, filters.max].some((value) => value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0))
  )
    return 'Inserisci un importo valido.'
  if (filters.min && filters.max && Number(filters.min) > Number(filters.max))
    return 'L’importo minimo deve essere inferiore al massimo.'
  return null
}

export function accountNameError(value: string): string | null {
  const name = value.trim()
  if (!name) return 'Inserisci il nome del conto.'
  if (name.length > 20 || !/^[\p{L}\p{N} ]+$/u.test(name)) return 'Massimo 20 caratteri alfanumerici'
  return null
}

/** At most two internal accounts can be favorite; imported accounts cannot. */
export function selectAccountFavorite(favorites: readonly string[], number: string, imported: boolean): string[] {
  if (imported) return [...favorites]
  if (favorites.includes(number)) return favorites.filter((id) => id !== number)
  return [number, ...favorites].slice(0, 2)
}

export function accountSplitError(
  amount: number,
  parts: readonly { amount: string; category: string }[],
): string | null {
  if (parts.length < 2 || parts.length > 6) return 'Scegli da 2 a 6 categorie.'
  if (parts.some((part) => !/^\d+(?:\.\d{1,2})?$/.test(part.amount)))
    return 'Inserisci importi con un massimo di due decimali.'
  const cents = parts.map((part) => Math.round(Number(part.amount) * 100))
  if (
    parts.some((part, index) => !part.category || !part.amount || !Number.isFinite(cents[index]) || cents[index]! <= 0)
  )
    return 'Inserisci un importo positivo per ogni categoria.'
  if (cents.reduce((sum, value) => sum + value, 0) !== Math.round(Math.abs(amount) * 100))
    return 'La somma degli importi deve essere uguale al totale movimento.'
  return null
}

export function accountPeriod(months: number, end: string) {
  const date = new Date(`${end}T12:00:00Z`)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() - months)
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
  date.setUTCDate(Math.min(day, lastDay))
  return { from: date.toISOString().slice(0, 10), to: end }
}

export function accountLimitsError(daily: string, monthly: string): string | null {
  if (![daily, monthly].every((value) => /^\d+(?:\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value))))
    return 'Inserisci limiti validi con un massimo di due decimali.'
  if (Number(daily) > Number(monthly)) return 'Il limite giornaliero non può superare il limite mensile.'
  return null
}

/** Home consumes this policy with its canonical fixture; defaults remain unchanged until the user saves preferences. */
export function selectHomeAccounts<T extends MobileFirstAccountRecord>(
  accounts: readonly T[],
  snapshot = accountPreferences,
): T[] {
  const internal = accounts.filter((account) => !account.imported)
  const ids = snapshot.favorites ?? internal.slice(0, 2).map((account) => account.number)
  return ids
    .map((number) => internal.find((account) => account.number === number))
    .filter((account): account is T => !!account)
    .map((account) => ({ ...account, name: snapshot.names[account.number] ?? account.name }))
}

/** Twelve monthly allocations for a product, with pending/excluded rows outside the household budget. */
export function getMovementCategoryTrend(
  movements: readonly {
    date: string
    category: string
    amount: number
    pending?: boolean
    status?: string
    excluded?: boolean
    kind?: string
    splits?: readonly { category: string; amount: string }[]
  }[],
  category: string,
  asOf: string,
) {
  const end = new Date(`${asOf.slice(0, 7)}-01T12:00:00Z`)
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(end)
    date.setUTCMonth(date.getUTCMonth() - 11 + index)
    const month = date.toISOString().slice(0, 7)
    const totalCents = movements
      .filter(
        (row) =>
          row.date.startsWith(month) &&
          !row.excluded &&
          !row.pending &&
          (!row.status || row.status === 'settled') &&
          !['transfer', 'topup', 'repayment'].includes(row.kind ?? ''),
      )
      .reduce((total, row) => {
        const allocation = row.splits?.length
          ? row.splits
              .filter((split) => split.category === category)
              .reduce((sum, split) => sum + Math.round(Number(split.amount) * 100), 0)
          : row.category === category
            ? Math.round(Math.abs(row.amount) * 100)
            : 0
        return total + allocation
      }, 0)
    return {
      month,
      totalCents,
      label: date.toLocaleDateString('it-IT', { month: 'short', timeZone: 'UTC' }).replace('.', ''),
    }
  })
}
