/**
 * Data behind the Evo 2027 Payments hub.
 *
 * The hub replaced four illustrated hero cards with one search field, a grid of
 * up to eight actions, and the people you actually pay. That last list is the
 * part with no home in the baseline data: templates and saved beneficiaries are
 * about *where* money goes, while this is about who you paid recently and how
 * often — so it lives here rather than being squeezed into `paymentTemplates`.
 */

import { getCountryConfig } from '@/app/registry/countryConfig'
import type { CountryId } from '@/app/state/demoTypes'
import type { Currency } from '@/data/products'
import type { BankId } from '@/app/config/bankLogos'
import { BANK_BADGES } from '@/app/config/bankLogos'
import type { AccountTransaction } from '@/data/accountDetails'
import type { PfmCategoryName } from '@/data/pfmCategories'
import type { ScheduleConfig } from '@/data/schedule'

export interface FrequentBeneficiary {
  id: string
  name: string
  /** Masked account, shown under the name the way a Revolt-style list shows a handle. */
  accountNumber: string
  /** Unmasked demo account details used when starting a new payment. */
  paymentAccountPrefix?: string
  paymentAccountNumber: string
  paymentBankCode: string
  recipientKind: 'individual' | 'business'
  /** Last amount paid, already signed for display as an outgoing payment. */
  lastAmount: number
  lastPaidLabel: string
  lastPaidAt?: string
  currency: Currency
  /** Receiving bank, badged on the avatar the way a transaction badges its direction. */
  bank: BankId
}

export type RecurrentPaymentKind = 'internal-transfer' | 'standing-order' | 'direct-debit'

export interface RecurrentPayment {
  id: string
  kind: RecurrentPaymentKind
  name: string
  /** Next execution date, printed exactly as the bank prints it. */
  nextDate: string
  amount: number
  currency: Currency
  /** Optional schedule configuration for locally created or edited demo flows. */
  schedule?: ScheduleConfig
  /** Optional transfer details for an internal account-to-account flow. */
  details?: string
  sourceAccountId?: string
  destinationAccountId?: string
  sourceAccountName?: string
  destinationAccountName?: string
  note?: string
  /** Direct debits carry a ceiling rather than a fixed amount. */
  isLimit?: boolean
}

interface StoredRecurrentPaymentChanges {
  created: RecurrentPayment[]
  updated: Record<string, Partial<RecurrentPayment>>
  deletedIds: string[]
}

const RECURRENT_PAYMENTS_STORAGE_KEY = 'uc.evo2027.payments.recurrentPaymentChanges'

function accountFor(country: CountryId, suffix: string) {
  const prefix = country === 'BA_BL' ? 'BA' : country
  return `${prefix}49 BACX **** ${suffix}`
}

type FrequentBeneficiarySeed = Omit<
  FrequentBeneficiary,
  | 'accountNumber'
  | 'paymentAccountNumber'
  | 'paymentBankCode'
  | 'recipientKind'
  | 'lastAmount'
  | 'lastPaidLabel'
  | 'currency'
> & {
  suffix: string
  category: PfmCategoryName
  subcategory: string
  payments: readonly { date: string; amount: number; details: string }[]
  receivedPayments?: readonly { date: string; amount: number; details: string }[]
}

const DEMO_BANK_CODES: Record<BankId, string> = {
  unicredit: '2700',
  revolut: '8250',
  kb: '0100',
  cs: '0800',
  raiffeisen: '5500',
  moneta: '0600',
}

const BUSINESS_BENEFICIARY_IDS = new Set([
  'homeowners-association',
  'bright-future-foundation',
  'city-utilities',
  'school-fees',
  'internet-provider',
  'insurance-generali',
])

const FREQUENT_BENEFICIARY_SEEDS: readonly FrequentBeneficiarySeed[] = [
  {
    id: 'maria-popescu',
    name: 'Marie Novotná',
    suffix: '4101',
    bank: 'unicredit',
    category: 'Transfers',
    subcategory: 'Bank transfer',
    payments: [
      { date: '2026-09-25', amount: 320, details: 'September rent share' },
      { date: '2026-08-24', amount: 180, details: 'Groceries for the weekend' },
      { date: '2026-07-24', amount: 460, details: 'Holiday cottage deposit' },
      { date: '2026-06-24', amount: 275, details: 'June household bills' },
    ],
    receivedPayments: [{ date: '2026-08-12', amount: 120, details: 'Cinema tickets reimbursement' }],
  },
  {
    id: 'victor-ionescu',
    name: 'Viktor Dvořák',
    suffix: '4102',
    bank: 'revolut',
    category: 'Transfers',
    subcategory: 'Bank transfer',
    payments: [
      { date: '2026-09-23', amount: 150, details: 'Dinner and cinema tickets' },
      { date: '2026-07-18', amount: 95, details: 'Train tickets to Brno' },
    ],
    receivedPayments: [{ date: '2026-08-25', amount: 50, details: 'Dinner bill split' }],
  },
  {
    id: 'homeowners-association',
    name: 'Homeowners association',
    suffix: '4103',
    bank: 'kb',
    category: 'Home',
    subcategory: 'Rent and housing',
    payments: [
      { date: '2026-08-11', amount: 599.24, details: 'August building charges' },
      { date: '2026-07-11', amount: 599.24, details: 'July building charges' },
      { date: '2026-06-11', amount: 610, details: 'Lift maintenance contribution' },
    ],
    receivedPayments: [{ date: '2026-08-20', amount: 48.5, details: 'Water overpayment refund' }],
  },
  {
    id: 'bright-future-foundation',
    name: 'Bright Future Foundation',
    suffix: '4104',
    bank: 'cs',
    category: 'Exclude from budget',
    subcategory: 'Donation',
    payments: [{ date: '2026-07-23', amount: 100, details: 'Summer food drive donation' }],
  },
  {
    id: 'anna-novak',
    name: 'Anna Novák',
    suffix: '4105',
    bank: 'unicredit',
    category: 'Transfers',
    subcategory: 'Bank transfer',
    payments: [
      { date: '2026-06-15', amount: 1200, details: 'Family holiday booking' },
      { date: '2026-05-15', amount: 950, details: 'Help with moving costs' },
      { date: '2026-04-15', amount: 800, details: 'New furniture contribution' },
      { date: '2026-03-12', amount: 1100, details: 'Spring break accommodation' },
    ],
    receivedPayments: [{ date: '2026-06-21', amount: 650, details: 'Shared holiday costs' }],
  },
  {
    id: 'city-utilities',
    name: 'City Utilities',
    suffix: '4106',
    bank: 'raiffeisen',
    category: 'Utilities',
    subcategory: 'Utility bill',
    payments: [
      { date: '2026-06-15', amount: 245.5, details: 'June electricity and water' },
      { date: '2026-05-16', amount: 208.4, details: 'May water bill adjustment' },
      { date: '2026-04-15', amount: 221, details: 'April heating advance' },
    ],
    receivedPayments: [{ date: '2026-06-28', amount: 23.5, details: 'Final meter reading refund' }],
  },
  {
    id: 'petr-havelka',
    name: 'Petr Havelka',
    suffix: '4107',
    bank: 'moneta',
    category: 'Transfers',
    subcategory: 'Bank transfer',
    payments: [
      { date: '2026-06-12', amount: 7500, details: 'Car repair reimbursement' },
      { date: '2026-04-12', amount: 4200, details: 'Mountain trip accommodation' },
    ],
    receivedPayments: [{ date: '2026-06-18', amount: 1200, details: 'Workshop parts reimbursement' }],
  },
  {
    id: 'school-fees',
    name: 'Sunnyside School',
    suffix: '4108',
    bank: 'kb',
    category: 'Education',
    subcategory: 'School fee',
    payments: [
      { date: '2026-06-03', amount: 690, details: 'June school tuition' },
      { date: '2026-05-03', amount: 690, details: 'After-school club and lunch' },
      { date: '2026-04-03', amount: 720, details: 'Spring term activity fee' },
    ],
  },
  {
    id: 'elena-marin',
    name: 'Tereza Svobodová',
    suffix: '4109',
    bank: 'unicredit',
    category: 'Transfers',
    subcategory: 'Bank transfer',
    payments: [{ date: '2026-05-28', amount: 80, details: 'Concert tickets' }],
    receivedPayments: [{ date: '2026-06-01', amount: 40, details: 'Concert ticket share' }],
  },
  {
    id: 'internet-provider',
    name: 'Airwaynet',
    suffix: '4110',
    bank: 'raiffeisen',
    category: 'Utilities',
    subcategory: 'TV, phone and internet',
    payments: [
      { date: '2026-05-21', amount: 1277, details: 'Home internet and TV - May' },
      { date: '2026-04-21', amount: 1200, details: 'Broadband plan renewal' },
    ],
    receivedPayments: [{ date: '2026-05-27', amount: 127.7, details: 'Router deposit refund' }],
  },
  {
    id: 'daniel-lataretu',
    name: 'Martin Černý',
    suffix: '4111',
    bank: 'revolut',
    category: 'Transfers',
    subcategory: 'Bank transfer',
    payments: [{ date: '2026-05-14', amount: 250, details: 'Dinner shared on 12 May' }],
    receivedPayments: [{ date: '2026-05-18', amount: 80, details: 'Taxi fare split' }],
  },
  {
    id: 'insurance-generali',
    name: 'Household insurance',
    suffix: '4112',
    bank: 'moneta',
    category: 'Insurance',
    subcategory: 'Insurance premium',
    payments: [
      { date: '2026-05-06', amount: 1150, details: 'Home insurance renewal' },
      { date: '2026-02-06', amount: 1100, details: 'Contents cover - February' },
    ],
    receivedPayments: [{ date: '2026-05-13', amount: 210, details: 'Insurance premium adjustment' }],
  },
]
const SNAPSHOT_DATE = new Date('2026-09-26T12:00:00')
const FAVORITE_BENEFICIARY_IDS_STORAGE_KEY = 'uc.evo2027.payments.favoriteBeneficiaryIds'
const BENEFICIARY_DETAILS_STORAGE_KEY = 'uc.evo2027.payments.beneficiaryDetails'
const DELETED_BENEFICIARY_IDS_STORAGE_KEY = 'uc.evo2027.payments.deletedBeneficiaryIds'

type EditableBeneficiaryDetails = Pick<
  FrequentBeneficiary,
  'name' | 'paymentAccountPrefix' | 'paymentAccountNumber' | 'paymentBankCode' | 'recipientKind' | 'bank'
>

type StoredBeneficiaryDetails = Record<string, Partial<EditableBeneficiaryDetails>>
type StoredDeletedBeneficiaryIds = Record<string, string[]>

function getStoredBeneficiaryDetails(): StoredBeneficiaryDetails {
  if (typeof window === 'undefined') return {}

  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(BENEFICIARY_DETAILS_STORAGE_KEY) ?? '{}')
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored as StoredBeneficiaryDetails : {}
  } catch {
    return {}
  }
}

function getDeletedBeneficiaryIds(country: CountryId): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(DELETED_BENEFICIARY_IDS_STORAGE_KEY) ?? '{}')
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return []
    const ids = (stored as StoredDeletedBeneficiaryIds)[country]
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function deleteFrequentBeneficiary(country: CountryId, beneficiaryId: string) {
  if (typeof window === 'undefined') return

  try {
    const storedValue: unknown = JSON.parse(window.localStorage.getItem(DELETED_BENEFICIARY_IDS_STORAGE_KEY) ?? '{}')
    const stored = storedValue && typeof storedValue === 'object' && !Array.isArray(storedValue)
      ? storedValue as StoredDeletedBeneficiaryIds
      : {}
    const deletedIds = new Set(getDeletedBeneficiaryIds(country))
    deletedIds.add(beneficiaryId)
    stored[country] = [...deletedIds]
    window.localStorage.setItem(DELETED_BENEFICIARY_IDS_STORAGE_KEY, JSON.stringify(stored))
    storeFavoriteBeneficiaryIds(getStoredFavoriteBeneficiaryIds().filter((id) => id !== beneficiaryId))
  } catch {
    /* The current screen can still return to its refreshed list if storage is unavailable. */
  }
}

export function saveFrequentBeneficiaryDetails(person: FrequentBeneficiary) {
  if (typeof window === 'undefined') return

  const stored = getStoredBeneficiaryDetails()
  stored[person.id] = {
    name: person.name,
    paymentAccountPrefix: person.paymentAccountPrefix ?? '',
    paymentAccountNumber: person.paymentAccountNumber,
    paymentBankCode: person.paymentBankCode,
    recipientKind: person.recipientKind,
    bank: person.bank,
  }

  try {
    window.localStorage.setItem(BENEFICIARY_DETAILS_STORAGE_KEY, JSON.stringify(stored))
  } catch {
    /* The edit still applies to the current screen when storage is unavailable. */
  }
}

export function getBeneficiaryBankIdForCode(bankCode: string, fallback: BankId): BankId {
  return (Object.entries(DEMO_BANK_CODES).find(([, code]) => code === bankCode)?.[0] as BankId | undefined) ?? fallback
}

export function getStoredFavoriteBeneficiaryIds(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = JSON.parse(window.localStorage.getItem(FAVORITE_BENEFICIARY_IDS_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(stored)) return []
    const knownIds = new Set(FREQUENT_BENEFICIARY_SEEDS.map((person) => person.id))
    return [...new Set(stored.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))]
  } catch {
    return []
  }
}

export function storeFavoriteBeneficiaryIds(ids: readonly string[]) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(FAVORITE_BENEFICIARY_IDS_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* Favorites still work for the current screen when storage is unavailable. */
  }
}

function recentPaymentLabel(dateIso: string) {
  const date = new Date(`${dateIso}T12:00:00`)
  const daysAgo = Math.round((SNAPSHOT_DATE.getTime() - date.getTime()) / 86_400_000)
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo >= 2 && daysAgo <= 7) return `${daysAgo} days ago`
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date)
}

/** The same booked rows are used by the account ledger, Payments hub and beneficiary history. */
export function getRecentPaymentTransactions(country: CountryId, currency: Currency): AccountTransaction[] {
  if (country !== 'CZ' || currency !== 'CZK') return []
  return FREQUENT_BENEFICIARY_SEEDS.flatMap((person) => {
    const accountNumber = `200014${person.suffix}`
    const bankCode = DEMO_BANK_CODES[person.bank]
    const createTransaction = (
      { date, amount, details }: { date: string; amount: number; details: string },
      id: string,
      type: AccountTransaction['type'],
    ): AccountTransaction => {
      const [year = '2026', month = '01', day = '01'] = date.split('-')
      const parsedDate = new Date(`${date}T12:00:00`)
      return {
        id,
        beneficiaryId: person.id,
        day,
        month: new Intl.DateTimeFormat('en', { month: 'short' }).format(parsedDate).toUpperCase(),
        monthKey: `${year}-${month}`,
        monthTitle: new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(parsedDate),
        label: person.name,
        details,
        currency,
        amount: type === 'debit' ? -amount : amount,
        type,
        category: person.category,
        pfmCategory: person.category,
        pfmSubcategory: person.subcategory,
        status: 'Booked' as const,
        source: 'account' as const,
        beneficiaryBankName: BANK_BADGES[person.bank].name,
        beneficiaryAccountNumber: `${accountNumber}/${bankCode}`,
        referenceNumber: `${year}${month}${day}${person.suffix}`,
      }
    }

    return [
      ...person.payments.map((payment, index) =>
        createTransaction(payment, `recent-payment-${person.id}-${index}`, 'debit'),
      ),
      ...(person.receivedPayments ?? []).map((payment, index) =>
        createTransaction(payment, `recent-receipt-${person.id}-${index}`, 'credit'),
      ),
    ]
  }).sort((left, right) => `${right.monthKey}-${right.day}`.localeCompare(`${left.monthKey}-${left.day}`))
}

export function getBeneficiaryPaymentHistory(person: FrequentBeneficiary, country: CountryId): AccountTransaction[] {
  return getRecentPaymentTransactions(country, person.currency).filter((payment) => payment.beneficiaryId === person.id)
}

export function getFrequentBeneficiaries(country: CountryId): FrequentBeneficiary[] {
  const currency = getCountryConfig(country).currency
  const storedDetails = getStoredBeneficiaryDetails()
  const deletedIds = new Set(getDeletedBeneficiaryIds(country))
  const transactions = getRecentPaymentTransactions(country, currency)
  return FREQUENT_BENEFICIARY_SEEDS.flatMap((seed) => {
    if (deletedIds.has(seed.id)) return []
    const latest = transactions.find((transaction) => transaction.beneficiaryId === seed.id && transaction.type === 'debit')
    if (!latest) return []
    const paymentAccountNumber = `200014${seed.suffix}`
    const paymentBankCode = DEMO_BANK_CODES[seed.bank]
    const baseBeneficiary: FrequentBeneficiary = {
        id: seed.id,
        name: seed.name,
        bank: seed.bank,
        accountNumber:
          country === 'CZ'
            ? `${paymentAccountNumber.slice(0, 6)}****/${paymentBankCode}`
            : accountFor(country, seed.suffix),
        paymentAccountNumber,
        paymentBankCode,
        recipientKind: BUSINESS_BENEFICIARY_IDS.has(seed.id) ? ('business' as const) : ('individual' as const),
        lastAmount: Math.abs(latest.amount),
        lastPaidLabel: recentPaymentLabel(`${latest.monthKey}-${latest.day}`),
        lastPaidAt: `${latest.monthKey}-${latest.day}`,
        currency,
      }
    const beneficiary = { ...baseBeneficiary, ...storedDetails[seed.id] }
    const accountPrefix = beneficiary.paymentAccountPrefix ? `${beneficiary.paymentAccountPrefix}-` : ''
    return [{
      ...beneficiary,
      accountNumber:
        country === 'CZ'
          ? `${accountPrefix}${beneficiary.paymentAccountNumber.slice(0, 6)}****/${beneficiary.paymentBankCode}`
          : accountFor(country, seed.suffix),
    }]
  })
}

const STANDING_ORDER_SEEDS: ReadonlyArray<Omit<RecurrentPayment, 'currency' | 'kind'>> = [
  { id: 'so-savings', name: 'Savings account', nextDate: '09-September-2026', amount: 900 },
  { id: 'so-rent', name: 'Rent', nextDate: '15-September-2026', amount: 22500 },
  { id: 'so-television', name: 'Television licence', nextDate: '15-September-2026', amount: 150 },
  { id: 'so-radio', name: 'Radio licence', nextDate: '16-September-2026', amount: 55 },
  { id: 'so-petr-havelka', name: 'Petr Havelka', nextDate: '16-September-2026', amount: 7500 },
  { id: 'so-internet', name: 'Internet provider', nextDate: '21-September-2026', amount: 1277 },
  { id: 'so-school', name: 'School fees', nextDate: '23-September-2026', amount: 3400 },
]

const DIRECT_DEBIT_SEEDS: ReadonlyArray<Omit<RecurrentPayment, 'currency' | 'kind'>> = [
  { id: 'dd-energy', name: 'Energy supplier', nextDate: '05-September-2026', amount: 2500, isLimit: true },
  { id: 'dd-mobile', name: 'Mobile operator', nextDate: '12-September-2026', amount: 800, isLimit: true },
  { id: 'dd-insurance', name: 'Household insurance', nextDate: '18-September-2026', amount: 1150, isLimit: true },
]

const INTERNAL_TRANSFER_SEEDS: ReadonlyArray<Omit<RecurrentPayment, 'currency' | 'kind'>> = [
  {
    id: 'mtb-demo-savings',
    name: 'To Savings account',
    nextDate: '30-September-2026',
    amount: 5000,
    schedule: { startDate: '2026-09-30', repeat: 'monthly', endsOn: { type: 'never' } },
    details: 'Everyday account → Savings account',
    sourceAccountId: 'acc-1',
    destinationAccountId: 'sav-1',
    sourceAccountName: 'Everyday account',
    destinationAccountName: 'Savings account',
    note: 'Monthly savings',
  },
  {
    id: 'mtb-demo-everyday',
    name: 'To Everyday account',
    nextDate: '15-October-2026',
    amount: 2500,
    schedule: { startDate: '2026-10-15', repeat: 'biweekly', endsOn: { type: 'never' } },
    details: 'Savings account → Everyday account',
    sourceAccountId: 'sav-1',
    destinationAccountId: 'acc-1',
    sourceAccountName: 'Savings account',
    destinationAccountName: 'Everyday account',
    note: 'Regular spending budget',
  },
]

function monthlyScheduleFromDateLabel(label: string): ScheduleConfig {
  const [dayText, monthName, yearText] = label.split('-')
  const month = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ].indexOf(monthName ?? '')
  const day = Number(dayText)
  const year = Number(yearText)
  const validDate = month >= 0 && Number.isInteger(day) && day >= 1 && day <= 31 && Number.isInteger(year)

  return {
    startDate: validDate
      ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      : new Date().toISOString().slice(0, 10),
    repeat: 'monthly',
    endsOn: { type: 'never' },
  }
}

export function getRecurrentPayments(country: CountryId, kind: RecurrentPaymentKind): RecurrentPayment[] {
  const currency = getCountryConfig(country).currency
  const seeds = kind === 'internal-transfer'
    ? INTERNAL_TRANSFER_SEEDS
    : kind === 'standing-order'
      ? STANDING_ORDER_SEEDS
      : DIRECT_DEBIT_SEEDS

  return seeds.map((seed) => ({
    ...seed,
    kind,
    currency,
    schedule: monthlyScheduleFromDateLabel(seed.nextDate),
  }))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isScheduleConfig(value: unknown): value is ScheduleConfig {
  if (!isRecord(value) || typeof value.startDate !== 'string') return false
  if (!['never', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly'].includes(String(value.repeat))) return false
  return isRecord(value.endsOn)
    && (value.endsOn.type === 'never'
      || (value.endsOn.type === 'on-date' && typeof value.endsOn.date === 'string'))
}

function isRecurrentPayment(value: unknown): value is RecurrentPayment {
  if (!isRecord(value)) return false
  return typeof value.id === 'string'
    && (value.kind === 'internal-transfer' || value.kind === 'standing-order' || value.kind === 'direct-debit')
    && typeof value.name === 'string'
    && typeof value.nextDate === 'string'
    && typeof value.amount === 'number'
    && typeof value.currency === 'string'
    && (value.schedule === undefined || isScheduleConfig(value.schedule))
    && (value.details === undefined || typeof value.details === 'string')
    && (value.sourceAccountId === undefined || typeof value.sourceAccountId === 'string')
    && (value.destinationAccountId === undefined || typeof value.destinationAccountId === 'string')
    && (value.sourceAccountName === undefined || typeof value.sourceAccountName === 'string')
    && (value.destinationAccountName === undefined || typeof value.destinationAccountName === 'string')
    && (value.note === undefined || typeof value.note === 'string')
    && (value.isLimit === undefined || typeof value.isLimit === 'boolean')
}

function getStoredRecurrentPaymentChanges(country: CountryId): StoredRecurrentPaymentChanges {
  const empty: StoredRecurrentPaymentChanges = { created: [], updated: {}, deletedIds: [] }
  if (typeof window === 'undefined') return empty

  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(`${RECURRENT_PAYMENTS_STORAGE_KEY}.${country}`) ?? '{}',
    )
    if (!isRecord(stored)) return empty

    const updates = isRecord(stored.updated) ? stored.updated : {}
    return {
      created: Array.isArray(stored.created) ? stored.created.filter(isRecurrentPayment) : [],
      updated: Object.fromEntries(
        Object.entries(updates).filter(([, value]) => isRecord(value)),
      ) as Record<string, Partial<RecurrentPayment>>,
      deletedIds: Array.isArray(stored.deletedIds)
        ? stored.deletedIds.filter((id): id is string => typeof id === 'string')
        : [],
    }
  } catch {
    return empty
  }
}

function storeRecurrentPaymentChanges(country: CountryId, changes: StoredRecurrentPaymentChanges) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${RECURRENT_PAYMENTS_STORAGE_KEY}.${country}`, JSON.stringify(changes))
  } catch {
    /* Keep the current screen usable if local storage is unavailable. */
  }
}

export function getAllRecurrentPayments(country: CountryId): RecurrentPayment[] {
  const changes = getStoredRecurrentPaymentChanges(country)
  const deletedIds = new Set(changes.deletedIds)
  const base = [
    ...getRecurrentPayments(country, 'internal-transfer'),
    ...getRecurrentPayments(country, 'standing-order'),
    ...getRecurrentPayments(country, 'direct-debit'),
  ]

  return [
    ...base
      .filter((payment) => !deletedIds.has(payment.id))
      .map((payment) => ({ ...payment, ...changes.updated[payment.id] })),
    ...changes.created.filter((payment) => !deletedIds.has(payment.id)),
  ]
}

export function createRecurrentPayment(country: CountryId, payment: RecurrentPayment) {
  const changes = getStoredRecurrentPaymentChanges(country)
  changes.created = [...changes.created.filter((item) => item.id !== payment.id), payment]
  storeRecurrentPaymentChanges(country, changes)
}

export function updateRecurrentPayment(
  country: CountryId,
  paymentId: string,
  updates: Partial<RecurrentPayment>,
) {
  const changes = getStoredRecurrentPaymentChanges(country)
  const createdIndex = changes.created.findIndex((payment) => payment.id === paymentId)
  if (createdIndex >= 0) {
    const created = changes.created[createdIndex]
    if (created) changes.created[createdIndex] = { ...created, ...updates }
  } else {
    changes.updated[paymentId] = { ...changes.updated[paymentId], ...updates }
  }
  storeRecurrentPaymentChanges(country, changes)
}

export function deleteRecurrentPayment(country: CountryId, paymentId: string) {
  const changes = getStoredRecurrentPaymentChanges(country)
  changes.created = changes.created.filter((payment) => payment.id !== paymentId)
  delete changes.updated[paymentId]
  if (!changes.deletedIds.includes(paymentId)) changes.deletedIds.push(paymentId)
  storeRecurrentPaymentChanges(country, changes)
}
