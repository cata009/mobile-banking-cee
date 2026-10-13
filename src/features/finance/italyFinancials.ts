import {
  classifyItalyTransaction,
  migrateItalyTransactionCategory,
  preserveItalyTransactionCategory,
  type ItalyCategoryClassification,
} from './italyTransactionCategories'

/** Italy-only demo ledger. Economic events and financial postings have distinct identities. */
export type FinanceStatus = 'settled' | 'pending' | 'authorization'
export type FinanceKind = 'purchase' | 'income' | 'refund' | 'transfer' | 'topup' | 'repayment' | 'fee'
export interface FinanceAccount {
  number: string
  name: string
  bank: string
  iban: string
  imported?: boolean
  openingBalanceCents: number
  overdraftCents: number
  otherUnavailableCents: number
}
export interface FinanceCard {
  id: string
  kind: 'debit' | 'credit' | 'prepaid'
  accountNumber: string
  openingBalanceCents: number
  limitCents: number
  maxLimitCents: number
  status: 'active' | 'suspended' | 'blocked' | 'delivered' | 'shipping' | 'renewing'
}
export interface FinanceEvent {
  id: string
  name: string
  date: string
  status: FinanceStatus
  kind: FinanceKind
  amountCents: number
  category: string
  classification?: ItalyCategoryClassification
  accountNumbers: readonly string[]
  cardIds: readonly string[]
  accountMovementIds: Readonly<Record<string, string>>
  cardMovementIds: Readonly<Record<string, string>>
  bookedOn?: string
  subcategory?: string
  note?: string
  excluded?: boolean
  splits?: readonly { category: string; amountCents: number }[]
}
export interface FinancePosting {
  id: string
  eventId: string
  ledgerId: string
  amountCents: number
  status: FinanceStatus
}
export interface FinanceReservation {
  key: string
  eventId: string
  accountNumber: string
  amountCents: number
  feeCents: number
  status: 'reserved' | 'released' | 'settled'
}
export interface FinanceInstallmentPlan {
  id: string
  cardId: string
  movementAliases: readonly string[]
  principalCents: number
  remainingPrincipalCents: number
  remainingFeesCents: number
  months: number
  feeCents: number
  schedule: readonly {
    principalCents: number
    feeCents: number
    paymentCents: number
    remainingPrincipalCents: number
  }[]
}
export interface ItalyFinancialSnapshot {
  revision: number
  asOf: string
  currency: 'EUR'
  accounts: readonly FinanceAccount[]
  cards: readonly FinanceCard[]
  events: readonly FinanceEvent[]
  postings: readonly FinancePosting[]
  reservations: readonly FinanceReservation[]
  plans: readonly FinanceInstallmentPlan[]
  completedKeys: readonly string[]
}
export interface FinanceResult {
  ok: boolean
  error?: string
  transactionId?: string
  plan?: FinanceInstallmentPlan
}
export interface FinanceMovement extends Omit<FinanceEvent, 'id'> {
  id: string
  eventId: string
}
export const ITALY_FINANCE_AS_OF = '2025-02-28'
export const ITALY_CARD_INSTALLMENT_FEE_CENTS = 100
export const ITALY_FINANCIAL_STORAGE_KEY = 'pi-it-mobile-first-finance-v1'
export function toCents(value: number): number {
  if (!Number.isFinite(value)) throw new Error('Money must be finite')
  const cents = Math.round((value + Number.EPSILON * Math.sign(value)) * 100)
  if (!Number.isSafeInteger(cents)) throw new Error('Money exceeds safe precision')
  return cents
}
export function fromCents(value: number): number {
  if (!Number.isSafeInteger(value)) throw new Error('Money must be integer cents')
  return value / 100
}
const account = (number: string, name: string, opening: number, iban: string, imported = false): FinanceAccount => ({
  number,
  name,
  bank: imported ? 'FINECO' : 'UniCredit',
  iban,
  imported,
  openingBalanceCents: toCents(opening),
  overdraftCents: 0,
  otherUnavailableCents: 0,
})
export const FINANCE_ACCOUNTS: readonly FinanceAccount[] = [
  account('000012345', 'Andrea Rossini', 52570.27, 'IT02Q0200814703400103035954'),
  account('000067890', 'Andrea Rossini e Flavia Bianchini', 16335, 'IT60X0542811101000000123456'),
  account('000098765', 'Andrea e Sara Rossini', 50000.27, 'IT29M0200805200000101234567'),
  account('000054321', 'Mariangela Bertolucci', 10400.1, 'IT29M0200805200000101234568'),
  account('000011223', 'Andrea', 53550.27, 'IT60X0542811101000000123457', true),
  account('000011224', 'Andrea Rossini', 5100, 'IT60X0542811101000000123458', true),
]
const card = (
  id: string,
  kind: FinanceCard['kind'],
  opening: number,
  limit: number,
  accountNumber = '000012345',
  status: FinanceCard['status'] = 'active',
): FinanceCard => ({
  id,
  kind,
  accountNumber,
  openingBalanceCents: toCents(opening),
  limitCents: toCents(limit),
  maxLimitCents: toCents(Math.max(limit, 5000)),
  status,
})
export const FINANCE_CARDS: readonly FinanceCard[] = [
  card('my-one', 'debit', 0, 5000),
  card('flexia', 'credit', -846.98, 5000),
  card('etica', 'credit', 0, 5000, '000067890', 'renewing'),
  card('genius', 'prepaid', 6500, 5000),
  card('minor', 'debit', 0, 500, '000067890'),
  card('suspended', 'credit', -200, 5000, '000012345', 'suspended'),
  card('blocked', 'prepaid', 6534, 5000, '000012345', 'blocked'),
  card('delivered', 'debit', 0, 5000, '000098765', 'delivered'),
]
function seed(): ItalyFinancialSnapshot {
  const events: FinanceEvent[] = [],
    postings: FinancePosting[] = []
  const add = (
    id: string,
    name: string,
    amount: number,
    category: string,
    date: string,
    status: FinanceStatus,
    kind: FinanceKind,
    accountNumber?: string,
    cardId?: string,
    accountAlias?: string,
    cardAlias?: string,
  ) => {
    const amountCents = toCents(amount)
    events.push({
      id,
      name,
      amountCents,
      category,
      date,
      status,
      kind,
      accountNumbers: accountNumber ? [accountNumber] : [],
      cardIds: cardId ? [cardId] : [],
      accountMovementIds: accountNumber && accountAlias ? { [accountNumber]: accountAlias } : {},
      cardMovementIds: cardId && cardAlias ? { [cardId]: cardAlias } : {},
      bookedOn: status === 'settled' ? date : undefined,
    })
    const ledgerId = accountNumber ? `account:${accountNumber}` : `card:${cardId}`
    postings.push({ id: `${id}:posting`, eventId: id, ledgerId, amountCents, status })
  }
  const primary: readonly [string, number, string, string, string, string | undefined][] = [
    ['Edison energia', -120, 'Utenze', '2025-02-28', '0-0', undefined],
    ['Imposta di bollo', -100, 'Utenze', '2025-02-28', '0-1', undefined],
    ['Spotify', -10, 'Altre spese', '2025-02-28', '0-2', 'spotify'],
    ['Accredito stipendio', 1800, 'Entrate', '2025-02-28', '0-3', undefined],
    ['Edison energia', -100, 'Utenze', '2025-02-27', '1-0', undefined],
    ['PayPal', -90, 'Altre spese', '2025-02-27', '1-1', 'paypal'],
    ['Netflix', -10, 'Altre spese', '2025-02-27', '1-2', 'netflix'],
    ['Starbucks', -10, 'Altre spese', '2025-02-27', '1-3', 'starbucks'],
    ['PayPal', -130, 'Altre spese', '2025-02-07', '2-0', 'paypal-feb'],
    ['Netflix', -50, 'Altre spese', '2025-02-07', '2-1', 'netflix-feb'],
    ['Starbucks', -10, 'Altre spese', '2025-02-07', '2-2', 'starbucks-feb'],
  ]
  for (const [name, amount, category, date, alias, cardAlias] of primary)
    add(
      `primary:${alias}`,
      name,
      amount,
      category,
      date,
      'settled',
      amount > 0 ? 'income' : 'purchase',
      '000012345',
      cardAlias ? 'my-one' : undefined,
      alias,
      cardAlias,
    )
  add(
    'primary:pending',
    'Pagamento e-commerce',
    -90,
    'Altre spese',
    ITALY_FINANCE_AS_OF,
    'pending',
    'purchase',
    '000012345',
    'my-one',
    'pending-0',
    'edison-pending',
  )
  add(
    'joint:salary',
    'Accredito stipendio',
    2000,
    'Entrate',
    ITALY_FINANCE_AS_OF,
    'settled',
    'income',
    '000067890',
    undefined,
    '0-3',
  )
  add(
    'joint:insurance',
    'Premio assicurativo',
    -120,
    'Assicurazioni',
    '2025-02-20',
    'settled',
    'purchase',
    '000067890',
    undefined,
    '0-0',
  )
  add('joint:tax', 'Imposta di bollo', -100, 'Utenze', '2025-02-21', 'settled', 'fee', '000067890', undefined, '0-1')
  add(
    'joint:minor',
    'Acquisto libri',
    -15,
    'Istruzione',
    '2025-02-22',
    'settled',
    'purchase',
    '000067890',
    'minor',
    '0-2',
    'spotify',
  )
  add(
    'joint:pending',
    'Pagamento e-commerce',
    -50,
    'Altre spese',
    ITALY_FINANCE_AS_OF,
    'pending',
    'purchase',
    '000067890',
    'minor',
    'pending-0',
    'edison-pending',
  )
  add(
    'third:salary',
    'Accredito stipendio',
    3600,
    'Entrate',
    ITALY_FINANCE_AS_OF,
    'settled',
    'income',
    '000098765',
    undefined,
    '0-3',
  )
  add(
    'third:netflix',
    'Netflix',
    -50,
    'Altre spese',
    '2025-02-21',
    'settled',
    'purchase',
    '000098765',
    undefined,
    '0-2',
  )
  const creditRows: readonly [string, number, string, string][] = [
    ['Edison energia', 100, 'edison', '2025-02-27'],
    ['PayPal', 90, 'paypal', '2025-02-27'],
    ['Netflix', 10, 'netflix', '2025-02-27'],
    ['Starbucks', 10, 'starbucks', '2025-02-27'],
    ['PayPal', 130, 'paypal-feb', '2025-02-07'],
    ['Netflix', 50, 'netflix-feb', '2025-02-07'],
    ['Starbucks', 10, 'starbucks-feb', '2025-02-07'],
  ]
  for (const [name, amount, alias, date] of creditRows)
    add(
      `flexia:${alias}`,
      name,
      -amount,
      name === 'Edison energia' ? 'Utenze' : 'Altre spese',
      date,
      'settled',
      'purchase',
      undefined,
      'flexia',
      undefined,
      alias,
    )
  for (const [name, amount, alias] of [
    ['Edison energia', 120, 'edison-pending'],
    ['Imposta di bollo', 100, 'stamp-pending'],
    ['Spotify', 10, 'spotify'],
  ] as const)
    add(
      `flexia:${alias}`,
      name,
      -amount,
      'Altre spese',
      '2025-02-11',
      alias === 'spotify' ? 'authorization' : 'pending',
      'purchase',
      undefined,
      'flexia',
      undefined,
      alias,
    )
  add(
    'etica:spotify',
    'Spotify',
    -10,
    'Altre spese',
    '2025-02-12',
    'settled',
    'purchase',
    undefined,
    'etica',
    undefined,
    'spotify',
  )
  add(
    'genius:spotify',
    'Spotify',
    -10,
    'Altre spese',
    '2025-02-11',
    'settled',
    'purchase',
    undefined,
    'genius',
    undefined,
    'spotify',
  )
  add(
    'genius:paypal',
    'PayPal',
    -30,
    'Altre spese',
    '2025-02-13',
    'settled',
    'purchase',
    undefined,
    'genius',
    undefined,
    'paypal',
  )
  add(
    'genius:netflix',
    'Netflix',
    -20,
    'Altre spese',
    '2025-02-16',
    'settled',
    'purchase',
    undefined,
    'genius',
    undefined,
    'netflix',
  )
  add(
    'genius:starbucks',
    'Starbucks',
    -6,
    'Altre spese',
    '2025-02-18',
    'settled',
    'purchase',
    undefined,
    'genius',
    undefined,
    'starbucks',
  )
  add(
    'genius:pending',
    'Pagamento e-commerce',
    -230,
    'Altre spese',
    ITALY_FINANCE_AS_OF,
    'pending',
    'purchase',
    undefined,
    'genius',
    undefined,
    'edison-pending',
  )
  events.push({
    id: 'seed:topup',
    name: 'Ricarica Genius Card',
    date: '2025-02-05',
    status: 'settled',
    kind: 'topup',
    amountCents: 0,
    category: 'Trasferimenti',
    accountNumbers: ['000012345'],
    cardIds: ['genius'],
    accountMovementIds: { '000012345': 'genius-topup' },
    cardMovementIds: { genius: 'recharge' },
    bookedOn: '2025-02-05',
  })
  postings.push(
    {
      id: 'seed:topup:account',
      eventId: 'seed:topup',
      ledgerId: 'account:000012345',
      amountCents: -10000,
      status: 'settled',
    },
    { id: 'seed:topup:card', eventId: 'seed:topup', ledgerId: 'card:genius', amountCents: 10000, status: 'settled' },
  )
  return {
    revision: 0,
    asOf: ITALY_FINANCE_AS_OF,
    currency: 'EUR',
    accounts: FINANCE_ACCOUNTS.map((a) => ({ ...a })),
    cards: FINANCE_CARDS.map((c) => ({ ...c })),
    events: events.map(classifyItalyTransaction),
    postings,
    reservations: [],
    plans: [],
    completedKeys: [],
  }
}
function readStoredSnapshot(): ItalyFinancialSnapshot {
  try {
    if (typeof localStorage === 'undefined') return seed()
    const stored: unknown = JSON.parse(localStorage.getItem(ITALY_FINANCIAL_STORAGE_KEY) ?? 'null')
    if (!stored || typeof stored !== 'object') return seed()
    const envelope = stored as { version?: unknown; snapshot?: unknown }
    if (envelope.version !== 1 || !envelope.snapshot || typeof envelope.snapshot !== 'object') return seed()
    const value = envelope.snapshot as ItalyFinancialSnapshot
    if (
      value.currency !== 'EUR' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value.asOf) ||
      !Number.isSafeInteger(value.revision) ||
      !Array.isArray(value.accounts) ||
      !Array.isArray(value.cards) ||
      !Array.isArray(value.events) ||
      !Array.isArray(value.postings) ||
      !Array.isArray(value.reservations) ||
      !Array.isArray(value.plans) ||
      !Array.isArray(value.completedKeys)
    )
      return seed()
    const safe = (n: unknown) => typeof n === 'number' && Number.isSafeInteger(n)
    if (
      !value.accounts.every(
        (a) =>
          typeof a.number === 'string' &&
          typeof a.name === 'string' &&
          safe(a.openingBalanceCents) &&
          safe(a.overdraftCents) &&
          safe(a.otherUnavailableCents),
      ) ||
      !value.cards.every(
        (c) =>
          typeof c.id === 'string' &&
          ['debit', 'credit', 'prepaid'].includes(c.kind) &&
          safe(c.openingBalanceCents) &&
          safe(c.limitCents) &&
          safe(c.maxLimitCents),
      ) ||
      !value.events.every(
        (e) =>
          typeof e.id === 'string' &&
          typeof e.name === 'string' &&
          safe(e.amountCents) &&
          Array.isArray(e.accountNumbers) &&
          Array.isArray(e.cardIds) &&
          e.accountMovementIds &&
          e.cardMovementIds &&
          ['settled', 'pending', 'authorization'].includes(e.status),
      ) ||
      !value.postings.every(
        (p) =>
          typeof p.ledgerId === 'string' &&
          safe(p.amountCents) &&
          value.events.some((e) => e.id === p.eventId) &&
          ['settled', 'pending', 'authorization'].includes(p.status),
      ) ||
      new Set(value.events.map((e) => e.id)).size !== value.events.length
    )
      return seed()
    // Earlier previews reserved these two Figma reference orders on screen entry.
    // They expired before this ledger's reference date; preserve actual executed and current orders.
    const expiredSeedKeys = new Set(
      value.reservations
        .filter(
          (r) =>
            r.status === 'reserved' &&
            ['it-security:91198960', 'it-security:91198961'].includes(r.key) &&
            value.asOf > '2025-02-12',
        )
        .map((r) => r.key),
    )
    const baseline = new Map(seed().events.map((event) => [event.id, event]))
    const restored: ItalyFinancialSnapshot = {
      ...value,
      events: value.events
        .filter((event) => !expiredSeedKeys.has(event.id))
        .map((event) => migrateItalyTransactionCategory(event, baseline.get(event.id))),
      postings: value.postings.filter((posting) => !expiredSeedKeys.has(posting.eventId)),
      reservations: value.reservations.map((reservation) =>
        expiredSeedKeys.has(reservation.key) ? { ...reservation, status: 'released' } : reservation,
      ),
      plans: value.plans.map((p: FinanceInstallmentPlan) => ({
        ...p,
        remainingPrincipalCents: p.remainingPrincipalCents ?? p.principalCents,
        remainingFeesCents: p.remainingFeesCents ?? p.months * p.feeCents,
        schedule: p.schedule.map((r: FinanceInstallmentPlan['schedule'][number]) => ({
          ...r,
          remainingPrincipalCents: r.remainingPrincipalCents ?? r.principalCents,
        })),
      })),
    }
    persistFinancialSnapshot(restored)
    return restored
  } catch {
    return seed()
  }
}
let snapshot = readStoredSnapshot()
const listeners = new Set<() => void>()
function persistFinancialSnapshot(value: ItalyFinancialSnapshot) {
  try {
    if (typeof localStorage !== 'undefined')
      localStorage.setItem(ITALY_FINANCIAL_STORAGE_KEY, JSON.stringify({ version: 1, snapshot: value }))
  } catch {
    /* Session calculations remain usable without storage. */
  }
}
function publish(next: ItalyFinancialSnapshot) {
  snapshot = {
    ...next,
    events: next.events.map((event) =>
      event.classification ? event : { ...event, classification: preserveItalyTransactionCategory(event, 'provided') },
    ),
    revision: snapshot.revision + 1,
  }
  persistFinancialSnapshot(snapshot)
  listeners.forEach((listener) => listener())
}
export const getItalyFinancialSnapshot = () => snapshot
export function subscribeItalyFinancialChanges(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export function notifyItalyFinancialChanges() {
  publish(snapshot)
}
export function resetItalyFinancialState() {
  publish(seed())
}
function ledger(snapshot: ItalyFinancialSnapshot, ledgerId: string, opening: number) {
  const rows = snapshot.postings.filter((p) => p.ledgerId === ledgerId)
  const settledNetCents = rows.filter((p) => p.status === 'settled').reduce((sum, p) => sum + p.amountCents, 0)
  const pendingDebitCents = -rows
    .filter((p) => p.status !== 'settled' && p.amountCents < 0)
    .reduce((sum, p) => sum + p.amountCents, 0)
  return {
    openingBalanceCents: opening,
    settledNetCents,
    bookBalanceCents: opening + settledNetCents,
    pendingDebitCents,
  }
}
export function selectAccountBalance(state: ItalyFinancialSnapshot, number: string) {
  const config = state.accounts.find((a) => a.number === number)
  const totals = ledger(state, `account:${number}`, config?.openingBalanceCents ?? 0)
  const availableCents =
    totals.bookBalanceCents -
    totals.pendingDebitCents -
    (config?.otherUnavailableCents ?? 0) +
    (config?.overdraftCents ?? 0)
  return {
    ...totals,
    availableCents,
    availableBalanceCents: availableCents,
    bookBalance: fromCents(totals.bookBalanceCents),
    balance: fromCents(availableCents),
    availableBalance: fromCents(availableCents),
    pendingDebits: fromCents(totals.pendingDebitCents),
    overdraft: fromCents(config?.overdraftCents ?? 0),
    otherUnavailable: fromCents(config?.otherUnavailableCents ?? 0),
  }
}
export function selectCardBalance(state: ItalyFinancialSnapshot, id: string, month = state.asOf.slice(0, 7)) {
  const config = state.cards.find((c) => c.id === id)
  const rows = state.events.filter((e) => e.cardIds.includes(id))
  const spendingCents = -rows
    .filter(
      (e) =>
        e.status === 'settled' && e.date.startsWith(month) && e.amountCents < 0 && ['purchase', 'fee'].includes(e.kind),
    )
    .reduce((sum, e) => sum + e.amountCents, 0)
  const totals = ledger(state, `card:${id}`, config?.openingBalanceCents ?? 0)
  const debtCents = config?.kind === 'credit' ? Math.max(0, -totals.bookBalanceCents) : 0
  const planFeesCents = state.plans.filter((p) => p.cardId === id).reduce((sum, p) => sum + p.remainingFeesCents, 0)
  const pendingDebitCents =
    config?.kind === 'debit'
      ? -state.postings
          .filter((p) => p.status !== 'settled' && p.amountCents < 0 && rows.some((e) => e.id === p.eventId))
          .reduce((sum, p) => sum + p.amountCents, 0)
      : totals.pendingDebitCents
  const committedCents = debtCents + pendingDebitCents + planFeesCents
  const linked = selectAccountBalance(state, config?.accountNumber ?? '')
  const active = config?.status === 'active' || config?.status === 'renewing'
  const availableCents = !active
    ? 0
    : config?.kind === 'credit'
      ? Math.max(0, config.limitCents - committedCents)
      : config?.kind === 'prepaid'
        ? Math.max(0, totals.bookBalanceCents - pendingDebitCents)
        : Math.max(0, linked.availableCents)
  return {
    ...totals,
    monthlySpendingCents: spendingCents,
    spendingCents,
    debtCents,
    availableCents,
    availableBalanceCents: availableCents,
    pendingDebitCents,
    committedCents,
    maxLimitCents: config?.maxLimitCents ?? 0,
    limitCents: config?.limitCents ?? 0,
    spending: fromCents(spendingCents),
    debt: fromCents(debtCents),
    available: fromCents(availableCents),
    balance: fromCents(totals.bookBalanceCents),
    limit: fromCents(config?.limitCents ?? 0),
    plans: state.plans.filter((p) => p.cardId === id),
  }
}
function movements(state: ItalyFinancialSnapshot, type: 'account' | 'card', id: string): FinanceMovement[] {
  return state.events
    .flatMap((e) => {
      const alias = (type === 'account' ? e.accountMovementIds : e.cardMovementIds)[id]
      if (!alias) return []
      const posting = state.postings.find((p) => p.eventId === e.id && p.ledgerId === `${type}:${id}`)
      return [{ ...e, id: alias, eventId: e.id, amountCents: posting?.amountCents ?? e.amountCents }]
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}
export const getAccountFinanceMovements = (state: ItalyFinancialSnapshot, number: string) =>
  movements(state, 'account', number)
export const getCardFinanceMovements = (state: ItalyFinancialSnapshot, id: string) => movements(state, 'card', id)
/** Repayments consume non-installment debt first, oldest debit first. Paid purchases cannot be financed again. */
export function getCardUnpaidPurchaseCents(state: ItalyFinancialSnapshot, cardId: string, alias: string): number {
  const config = state.cards.find((card) => card.id === cardId)
  if (config?.kind !== 'credit') return 0
  const reserved = new Set(state.plans.filter((plan) => plan.cardId === cardId).flatMap((plan) => plan.movementAliases))
  if (reserved.has(alias)) return 0
  const debits = [{ alias: '', remaining: Math.max(0, -config.openingBalanceCents) }]
  const rows = state.postings
    .filter((posting) => posting.ledgerId === `card:${cardId}` && posting.status === 'settled')
    .map((posting) => ({ posting, event: state.events.find((event) => event.id === posting.eventId)! }))
    .sort((a, b) => a.event.date.localeCompare(b.event.date))
  for (const { posting, event } of rows) {
    const purchaseAlias = event.kind === 'purchase' ? (event.cardMovementIds[cardId] ?? '') : ''
    if (purchaseAlias && reserved.has(purchaseAlias)) continue
    if (posting.amountCents < 0) debits.push({ alias: purchaseAlias, remaining: -posting.amountCents })
    else {
      let payment = posting.amountCents
      for (const debit of debits) {
        const paid = Math.min(payment, debit.remaining)
        debit.remaining -= paid
        payment -= paid
        if (payment === 0) break
      }
    }
  }
  return debits.find((debit) => debit.alias === alias)?.remaining ?? 0
}
export function getFinanceEventForMovement(
  state: ItalyFinancialSnapshot,
  type: 'account' | 'card',
  id: string,
  alias: string,
) {
  const row = movements(state, type, id).find((m) => m.id === alias)
  return row ? state.events.find((e) => e.id === row.eventId) : undefined
}
export function setEventAnnotations(
  eventId: string,
  patch: Pick<Partial<FinanceEvent>, 'category' | 'subcategory' | 'note' | 'excluded' | 'splits'>,
): FinanceResult {
  const event = snapshot.events.find((e) => e.id === eventId)
  if (!event) return { ok: false, error: 'Movimento non trovato' }
  if (
    patch.splits &&
    (patch.splits.some((s) => !Number.isSafeInteger(s.amountCents) || s.amountCents <= 0) ||
      patch.splits.reduce((sum, s) => sum + s.amountCents, 0) !== Math.abs(event.amountCents))
  )
    return { ok: false, error: 'La suddivisione deve corrispondere al movimento' }
  const changed = { ...event, ...patch }
  if (patch.category !== undefined || patch.subcategory !== undefined)
    changed.classification = preserveItalyTransactionCategory(changed, 'user')
  publish({ ...snapshot, events: snapshot.events.map((e) => (e.id === eventId ? changed : e)) })
  return { ok: true, transactionId: eventId }
}
function validAmount(amount: number) {
  return Number.isSafeInteger(amount) && amount > 0
}
function completed(key: string) {
  return snapshot.completedKeys.includes(key)
}
function transfer(
  cardId: string,
  number: string,
  amountCents: number,
  kind: 'topup' | 'repayment',
  key: string,
): FinanceResult {
  if (completed(key)) return { ok: true, transactionId: key }
  const config = snapshot.cards.find((c) => c.id === cardId)
  if (
    !config ||
    (kind === 'topup'
      ? config.kind !== 'prepaid' || !['active', 'renewing'].includes(config.status)
      : config.kind !== 'credit') ||
    !validAmount(amountCents)
  )
    return { ok: false, error: 'Importo o carta non valido' }
  if (
    !snapshot.accounts.some((a) => a.number === number) ||
    selectAccountBalance(snapshot, number).availableCents < amountCents
  )
    return { ok: false, error: 'Disponibilità insufficiente' }
  if (kind === 'repayment' && selectCardBalance(snapshot, cardId).debtCents < amountCents)
    return { ok: false, error: 'Importo superiore al debito' }
  const event: FinanceEvent = {
    id: key,
    name: kind === 'topup' ? 'Ricarica carta prepagata' : 'Rimborso carta di credito',
    date: snapshot.asOf,
    bookedOn: snapshot.asOf,
    status: 'settled',
    kind,
    amountCents: 0,
    category: 'Trasferimenti',
    accountNumbers: [number],
    cardIds: [cardId],
    accountMovementIds: { [number]: key },
    cardMovementIds: { [cardId]: key },
  }
  let remainingPayment =
    kind === 'repayment'
      ? Math.max(
          0,
          amountCents -
            Math.max(
              0,
              selectCardBalance(snapshot, cardId).debtCents -
                snapshot.plans
                  .filter((p) => p.cardId === cardId)
                  .reduce((sum, p) => sum + p.remainingPrincipalCents, 0),
            ),
        )
      : 0
  const plans = snapshot.plans.map((plan) => {
    if (plan.cardId !== cardId || remainingPayment <= 0) return plan
    let payment = Math.min(remainingPayment, plan.remainingPrincipalCents)
    remainingPayment -= payment
    const schedule = plan.schedule.map((row) => {
      const paid = Math.min(payment, row.remainingPrincipalCents)
      payment -= paid
      return { ...row, remainingPrincipalCents: row.remainingPrincipalCents - paid }
    })
    return {
      ...plan,
      schedule,
      remainingPrincipalCents: schedule.reduce((sum, row) => sum + row.remainingPrincipalCents, 0),
      remainingFeesCents: schedule
        .filter((row) => row.remainingPrincipalCents > 0)
        .reduce((sum, row) => sum + row.feeCents, 0),
    }
  })
  publish({
    ...snapshot,
    plans,
    events: [...snapshot.events, event],
    postings: [
      ...snapshot.postings,
      {
        id: key + ':account',
        eventId: key,
        ledgerId: `account:${number}`,
        amountCents: -amountCents,
        status: 'settled',
      },
      { id: key + ':card', eventId: key, ledgerId: `card:${cardId}`, amountCents, status: 'settled' },
    ],
    completedKeys: [...snapshot.completedKeys, key],
  })
  return { ok: true, transactionId: key }
}
export const rechargePrepaidCard = (
  cardId: string,
  number: string,
  amount: number,
  key = `topup:${snapshot.revision}`,
) => transfer(cardId, number, amount, 'topup', key)
export const repayCreditCard = (
  cardId: string,
  number: string,
  amount: number,
  key = `repayment:${snapshot.revision}`,
) => transfer(cardId, number, amount, 'repayment', key)
export function changeCreditLimit(cardId: string, limitCents: number): FinanceResult {
  const config = snapshot.cards.find((c) => c.id === cardId),
    balance = selectCardBalance(snapshot, cardId)
  if (
    !config ||
    config.kind !== 'credit' ||
    !['active', 'renewing'].includes(config.status) ||
    !validAmount(limitCents) ||
    limitCents < balance.committedCents ||
    limitCents > config.maxLimitCents
  )
    return { ok: false, error: 'Limite non valido per gli impegni correnti' }
  publish({ ...snapshot, cards: snapshot.cards.map((c) => (c.id === cardId ? { ...c, limitCents } : c)) })
  return { ok: true }
}
export function setFinancialCardStatus(cardId: string, status: FinanceCard['status']) {
  publish({ ...snapshot, cards: snapshot.cards.map((c) => (c.id === cardId ? { ...c, status } : c)) })
}
export function registerImportedFinancialAccount(config: FinanceAccount) {
  if (snapshot.accounts.some((a) => a.number === config.number)) return
  publish({ ...snapshot, accounts: [...snapshot.accounts, { ...config, imported: true }] })
}
export function reserveAccountFunds(
  number: string,
  amountCents: number,
  key: string,
  label: string,
  options: { feeCents?: number } = {},
): FinanceResult {
  const existing = snapshot.reservations.find((r) => r.key === key)
  if (existing)
    return {
      ok: existing.status !== 'released',
      transactionId: existing.eventId,
      error: existing.status === 'released' ? 'Ordine annullato' : undefined,
    }
  const feeCents = options.feeCents ?? 0
  if (
    !validAmount(amountCents) ||
    !Number.isSafeInteger(feeCents) ||
    feeCents < 0 ||
    feeCents > amountCents ||
    !snapshot.accounts.some((a) => a.number === number) ||
    selectAccountBalance(snapshot, number).availableCents < amountCents
  )
    return { ok: false, error: 'Disponibilità insufficiente' }
  const event: FinanceEvent = {
    id: key,
    name: label,
    date: snapshot.asOf,
    status: 'pending',
    kind: 'transfer',
    amountCents: 0,
    category: 'Investimenti',
    accountNumbers: [number],
    cardIds: [],
    accountMovementIds: { [number]: key },
    cardMovementIds: {},
  }
  publish({
    ...snapshot,
    events: [...snapshot.events, event],
    postings: [
      ...snapshot.postings,
      {
        id: key + ':reservation',
        eventId: key,
        ledgerId: `account:${number}`,
        amountCents: -amountCents,
        status: 'pending',
      },
    ],
    reservations: [
      ...snapshot.reservations,
      { key, eventId: key, accountNumber: number, amountCents, feeCents, status: 'reserved' },
    ],
  })
  return { ok: true, transactionId: key }
}
export function releaseFinancialReservation(key: string): FinanceResult {
  const reservation = snapshot.reservations.find((r) => r.key === key)
  if (!reservation) return { ok: false, error: 'Ordine non trovato' }
  if (reservation.status === 'settled') return { ok: false, error: 'Ordine già eseguito' }
  if (reservation.status === 'released') return { ok: true, transactionId: key }
  publish({
    ...snapshot,
    events: snapshot.events.filter((e) => e.id !== key),
    postings: snapshot.postings.filter((p) => p.eventId !== key),
    reservations: snapshot.reservations.map((r) => (r.key === key ? { ...r, status: 'released' } : r)),
  })
  return { ok: true, transactionId: key }
}
export function settleFinancialReservation(key: string): FinanceResult {
  const reservation = snapshot.reservations.find((r) => r.key === key)
  if (!reservation || reservation.status === 'released') return { ok: false, error: 'Ordine non disponibile' }
  if (reservation.status === 'settled') return { ok: true, transactionId: key }
  const feeId = key + ':fee'
  const event: FinanceEvent = {
    id: feeId,
    name: 'Commissione investimento',
    date: snapshot.asOf,
    bookedOn: snapshot.asOf,
    status: 'settled',
    kind: 'fee',
    amountCents: -reservation.feeCents,
    category: 'Altre spese',
    accountNumbers: [reservation.accountNumber],
    cardIds: [],
    accountMovementIds: { [reservation.accountNumber]: feeId },
    cardMovementIds: {},
  }
  publish({
    ...snapshot,
    events: [
      ...snapshot.events.map((e) => (e.id === key ? { ...e, status: 'settled' as const, bookedOn: snapshot.asOf } : e)),
      ...(reservation.feeCents ? [event] : []),
    ],
    postings: [
      ...snapshot.postings.map((p) =>
        p.eventId === key
          ? { ...p, status: 'settled' as const, amountCents: -(reservation.amountCents - reservation.feeCents) }
          : p,
      ),
      ...(reservation.feeCents
        ? [
            {
              id: feeId,
              eventId: feeId,
              ledgerId: `account:${reservation.accountNumber}`,
              amountCents: -reservation.feeCents,
              status: 'settled' as const,
            },
          ]
        : []),
    ],
    reservations: snapshot.reservations.map((r) => (r.key === key ? { ...r, status: 'settled' } : r)),
    completedKeys: [...snapshot.completedKeys, key],
  })
  return { ok: true, transactionId: key }
}
export function postAccountFinancialMovement(input: {
  accountNumber: string
  amountCents: number
  name: string
  kind: FinanceKind
  category: string
  key: string
}): FinanceResult {
  if (completed(input.key)) return { ok: true, transactionId: input.key }
  if (
    !Number.isSafeInteger(input.amountCents) ||
    !snapshot.accounts.some((a) => a.number === input.accountNumber) ||
    (input.amountCents < 0 && selectAccountBalance(snapshot, input.accountNumber).availableCents < -input.amountCents)
  )
    return { ok: false, error: 'Movimento non valido o disponibilità insufficiente' }
  const event: FinanceEvent = {
    id: input.key,
    name: input.name,
    date: snapshot.asOf,
    bookedOn: snapshot.asOf,
    status: 'settled',
    kind: input.kind,
    amountCents: ['transfer', 'topup', 'repayment'].includes(input.kind) ? 0 : input.amountCents,
    category: input.category,
    accountNumbers: [input.accountNumber],
    cardIds: [],
    accountMovementIds: { [input.accountNumber]: input.key },
    cardMovementIds: {},
  }
  publish({
    ...snapshot,
    events: [...snapshot.events, event],
    postings: [
      ...snapshot.postings,
      {
        id: input.key + ':posting',
        eventId: input.key,
        ledgerId: `account:${input.accountNumber}`,
        amountCents: input.amountCents,
        status: 'settled',
      },
    ],
    completedKeys: [...snapshot.completedKeys, input.key],
  })
  return { ok: true, transactionId: input.key }
}
export function registerCardInstallmentPlan(
  cardId: string,
  movementAliases: readonly string[],
  months: number,
): FinanceResult {
  const config = snapshot.cards.find((card) => card.id === cardId)
  if (!config || config.kind !== 'credit' || !['active', 'renewing'].includes(config.status))
    return { ok: false, error: 'Carta non disponibile per la rateizzazione' }
  if (!Number.isInteger(months) || months < 2 || months > 60) return { ok: false, error: 'Durata non valida' }
  const selected = getCardFinanceMovements(snapshot, cardId).filter(
    (m) => movementAliases.includes(m.id) && m.status === 'settled' && m.kind === 'purchase' && m.amountCents < 0,
  )
  const used = snapshot.plans.filter((p) => p.cardId === cardId).flatMap((p) => p.movementAliases)
  if (
    selected.length !== new Set(movementAliases).size ||
    selected.some((m) => used.includes(m.id) || getCardUnpaidPurchaseCents(snapshot, cardId, m.id) !== -m.amountCents)
  )
    return { ok: false, error: 'Movimenti già rateizzati o non disponibili' }
  const principalCents = -selected.reduce((sum, m) => sum + m.amountCents, 0),
    feeCents = ITALY_CARD_INSTALLMENT_FEE_CENTS
  if (
    principalCents < 25000 ||
    principalCents > 500000 ||
    selectCardBalance(snapshot, cardId).availableCents < months * feeCents
  )
    return { ok: false, error: 'Importo non disponibile per la rateizzazione' }
  const terms = createFinancialInstallmentSchedule(principalCents, months, feeCents)
  const schedule = terms.principalCents.map((principal, index) => ({
    principalCents: principal,
    feeCents,
    paymentCents: terms.paymentCents[index]!,
  }))
  const plan: FinanceInstallmentPlan = {
    id: `plan:${snapshot.revision}`,
    cardId,
    movementAliases: [...movementAliases],
    principalCents,
    remainingPrincipalCents: principalCents,
    remainingFeesCents: months * feeCents,
    months,
    feeCents,
    schedule: schedule.map((row) => ({ ...row, remainingPrincipalCents: row.principalCents })),
  }
  publish({ ...snapshot, plans: [...snapshot.plans, plan] })
  return { ok: true, plan, transactionId: plan.id }
}

export function createFinancialInstallmentSchedule(
  totalCents: number,
  months: number,
  feeCents = ITALY_CARD_INSTALLMENT_FEE_CENTS,
) {
  if (
    !Number.isSafeInteger(totalCents) ||
    totalCents <= 0 ||
    !Number.isInteger(months) ||
    months < 1 ||
    months > 600 ||
    !Number.isSafeInteger(feeCents) ||
    feeCents < 0
  )
    throw new Error('Invalid installment terms')
  const base = Math.floor(totalCents / months)
  const principalCents = Array.from({ length: months }, (_, index) =>
    index === months - 1 ? totalCents - base * (months - 1) : base,
  )
  const paymentCents = principalCents.map((principal) => principal + feeCents)
  const pv = (rate: number) =>
    paymentCents.reduce((sum, payment, index) => sum + payment / Math.pow(1 + rate, index + 1), 0)
  let low = 0,
    high = 1
  while (pv(high) > totalCents) high *= 2
  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2
    if (pv(mid) > totalCents) low = mid
    else high = mid
  }
  return {
    principalCents,
    paymentCents,
    totalFeeCents: months * feeCents,
    tan: 0 as const,
    taeg: feeCents === 0 ? 0 : (Math.pow(1 + (low + high) / 2, 12) - 1) * 100,
  }
}
