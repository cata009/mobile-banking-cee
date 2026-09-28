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

export type RecurrentPaymentKind = 'standing-order' | 'direct-debit'

export interface RecurrentPayment {
  id: string
  kind: RecurrentPaymentKind
  name: string
  /** Next execution date, printed exactly as the bank prints it. */
  nextDate: string
  amount: number
  currency: Currency
  /** Direct debits carry a ceiling rather than a fixed amount. */
  isLimit?: boolean
}

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
  },
  {
    id: 'daniel-lataretu',
    name: 'Martin Černý',
    suffix: '4111',
    bank: 'revolut',
    category: 'Transfers',
    subcategory: 'Bank transfer',
    payments: [{ date: '2026-05-14', amount: 250, details: 'Dinner shared on 12 May' }],
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
  },
]
const SNAPSHOT_DATE = new Date('2026-09-26T12:00:00')
const FAVORITE_BENEFICIARY_IDS_STORAGE_KEY = 'uc.evo2027.payments.favoriteBeneficiaryIds'
const BENEFICIARY_DETAILS_STORAGE_KEY = 'uc.evo2027.payments.beneficiaryDetails'

type EditableBeneficiaryDetails = Pick<
  FrequentBeneficiary,
  'name' | 'paymentAccountPrefix' | 'paymentAccountNumber' | 'paymentBankCode' | 'recipientKind' | 'bank'
>

type StoredBeneficiaryDetails = Record<string, Partial<EditableBeneficiaryDetails>>

function getStoredBeneficiaryDetails(): StoredBeneficiaryDetails {
  if (typeof window === 'undefined') return {}

  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(BENEFICIARY_DETAILS_STORAGE_KEY) ?? '{}')
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored as StoredBeneficiaryDetails : {}
  } catch {
    return {}
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
    return person.payments.map(({ date, amount, details }, index) => {
      const [year = '2026', month = '01', day = '01'] = date.split('-')
      const parsedDate = new Date(`${date}T12:00:00`)
      return {
        id: `recent-payment-${person.id}-${index}`,
        beneficiaryId: person.id,
        day,
        month: new Intl.DateTimeFormat('en', { month: 'short' }).format(parsedDate).toUpperCase(),
        monthKey: `${year}-${month}`,
        monthTitle: new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(parsedDate),
        label: person.name,
        details,
        currency,
        amount: -amount,
        type: 'debit' as const,
        category: person.category,
        pfmCategory: person.category,
        pfmSubcategory: person.subcategory,
        status: 'Booked' as const,
        source: 'account' as const,
        beneficiaryBankName: BANK_BADGES[person.bank].name,
        beneficiaryAccountNumber: `${accountNumber}/${bankCode}`,
        referenceNumber: `${year}${month}${day}${person.suffix}`,
      }
    })
  }).sort((left, right) => `${right.monthKey}-${right.day}`.localeCompare(`${left.monthKey}-${left.day}`))
}

export function getBeneficiaryPaymentHistory(person: FrequentBeneficiary, country: CountryId): AccountTransaction[] {
  return getRecentPaymentTransactions(country, person.currency).filter((payment) => payment.beneficiaryId === person.id)
}

export function getFrequentBeneficiaries(country: CountryId): FrequentBeneficiary[] {
  const currency = getCountryConfig(country).currency
  const storedDetails = getStoredBeneficiaryDetails()
  const transactions = getRecentPaymentTransactions(country, currency)
  return FREQUENT_BENEFICIARY_SEEDS.flatMap((seed) => {
    const latest = transactions.find((transaction) => transaction.beneficiaryId === seed.id)
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

export function getRecurrentPayments(country: CountryId, kind: RecurrentPaymentKind): RecurrentPayment[] {
  const currency = getCountryConfig(country).currency
  const seeds = kind === 'standing-order' ? STANDING_ORDER_SEEDS : DIRECT_DEBIT_SEEDS

  return seeds.map((seed) => ({ ...seed, kind, currency }))
}
