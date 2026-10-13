import {
  fromCents,
  getCardFinanceMovements,
  getCardUnpaidPurchaseCents,
  getItalyFinancialSnapshot,
  selectCardBalance,
  createFinancialInstallmentSchedule,
  type ItalyFinancialSnapshot,
} from '@/features/finance/italyFinancials'

export type CardKind = 'credit' | 'debit' | 'prepaid'
export type CardStatus = 'active' | 'suspended' | 'blocked' | 'delivered' | 'shipping' | 'renewing'
export function cardCapabilities(kind: CardKind, status: CardStatus) {
  const active = status === 'active' || status === 'renewing'
  return {
    reveal: active,
    installments: active && kind === 'credit',
    limit: active && kind === 'credit',
    recharge: active && kind === 'prepaid',
    activate: status === 'delivered',
    resume: status === 'suspended',
    suspend: active,
  }
}
export function changeCardStatus(status: CardStatus, action: 'suspend' | 'resume' | 'block' | 'activate'): CardStatus {
  if (status === 'blocked') return status
  if (action === 'block') return 'blocked'
  if (action === 'suspend' && (status === 'active' || status === 'renewing')) return 'suspended'
  if (action === 'resume' && status === 'suspended') return 'active'
  if (action === 'activate' && status === 'delivered') return 'active'
  return status
}
export interface CardMovement {
  id: string
  name: string
  category: string
  amount: number
  date: string
  status: 'settled' | 'pending' | 'authorization'
  kind?: string
  unpaidCents?: number
}

export function getCardLedgerRecord<T extends { id: string }>(
  card: T,
  state: ItalyFinancialSnapshot = getItalyFinancialSnapshot(),
) {
  const balances = selectCardBalance(state, card.id)
  const config = state.cards.find((row) => row.id === card.id)
  return {
    ...card,
    ...balances,
    status: config?.status ?? 'blocked',
    premium: balances.plans.length > 0,
    plans: balances.plans.map((plan) => ({
      total: fromCents(plan.remainingPrincipalCents),
      months: plan.months,
      ids: [...plan.movementAliases],
      schedule: plan.schedule,
      feeCents: plan.feeCents,
    })),
  }
}

export function getCardLedgerMovements(id: string, state: ItalyFinancialSnapshot = getItalyFinancialSnapshot()) {
  return getCardFinanceMovements(state, id).map((row) => ({
    ...row,
    amount: fromCents(row.amountCents),
    unpaidCents: getCardUnpaidPurchaseCents(state, id, row.id),
    day:
      row.status !== 'settled'
        ? ''
        : row.date === state.asOf
          ? 'Oggi'
          : new Date(`${row.date}T12:00:00Z`)
              .toLocaleDateString('it-IT', { day: 'numeric', month: 'long', timeZone: 'UTC' })
              .replace(/ [a-z]/, (match) => match.toLocaleUpperCase('it-IT')),
    icon:
      row.amountCents > 0
        ? ('income' as const)
        : row.name === 'Imposta di bollo'
          ? ('taxes' as const)
          : row.category === 'Utenze'
            ? ('utilities' as const)
            : ('other' as const),
    splits: row.splits?.map((part) => -fromCents(part.amountCents)),
    splitCategories: row.splits?.map((part) => ({ category: part.category, amount: -fromCents(part.amountCents) })),
  }))
}
export interface CardMovementFilter {
  query?: string
  from?: string
  to?: string
  min?: number
  max?: number
}
export function installmentSelection(
  rows: readonly Pick<CardMovement, 'id' | 'amount' | 'status' | 'unpaidCents'>[],
  selected: readonly string[],
  capacity: { reservedIds?: readonly string[]; used?: number; limit?: number } = {},
) {
  const eligible = rows.filter(
    (x) =>
      selected.includes(x.id) &&
      !capacity.reservedIds?.includes(x.id) &&
      x.status === 'settled' &&
      x.amount < 0 &&
      (x.unpaidCents === undefined || x.unpaidCents === Math.round(-x.amount * 100)),
  )
  const total = Math.round(eligible.reduce((sum, x) => sum - x.amount, 0) * 100) / 100
  return {
    total,
    valid: total >= 250 && total <= 5000 && total + (capacity.used ?? 0) <= (capacity.limit ?? 5000),
    ids: eligible.map((x) => x.id),
  }
}
export function filterCardMovements<T extends CardMovement>(rows: readonly T[], filter: CardMovementFilter): T[] {
  const query = filter.query?.trim().toLocaleLowerCase('it-IT') ?? ''
  return rows.filter(
    (x) =>
      (!query || `${x.name} ${x.category}`.toLocaleLowerCase('it-IT').includes(query)) &&
      (!filter.from || x.date >= filter.from) &&
      (!filter.to || x.date <= filter.to) &&
      (filter.min === undefined || Math.abs(x.amount) >= filter.min) &&
      (filter.max === undefined || Math.abs(x.amount) <= filter.max),
  )
}
export function splitCardMovement(amount: number, first: number): number[] | null {
  const cents = Math.round(-amount * 100),
    part = Math.round(first * 100)
  return Number.isFinite(cents) && Number.isFinite(part) && amount < 0 && part > 0 && part < cents
    ? [-part / 100, -(cents - part) / 100]
    : null
}
export function validateCardLimit(value: number, committed: number, max: number) {
  return Number.isFinite(value) && value >= Math.max(1000, committed) && value <= max
}
export function selectHomepageCards<T extends { id: string; kind: CardKind; favorite: boolean; status: CardStatus }>(
  cards: readonly T[],
  counts: { debit: number; credit: number; prepaid?: number },
): T[] {
  const remaining = {
    debit: Math.max(0, counts.debit),
    credit: Math.max(0, counts.credit),
    prepaid: Math.max(0, counts.prepaid ?? 0),
  }
  const available = cards.filter((card) => {
    if (remaining[card.kind] < 1) return false
    remaining[card.kind]--
    return true
  })
  return available.filter((c) => c.favorite && c.status !== 'blocked' && c.status !== 'suspended').slice(0, 2)
}

/** Legacy feature entry point delegates every monetary calculation to the canonical policy. */
export const createInstallmentSchedule = createFinancialInstallmentSchedule
