import type { CountryId } from '@/app/state/demoTypes'
import type { Currency, Product } from '@/data/products'
import { convertCurrency, getCountryCurrency, roundMoney } from '@/data/exchangeRates'
import { getLinkedAccountOverride } from './cardLinkedAccounts'

/**
 * Deterministic demo facts that the product mock does not carry: ledger and overdraft figures,
 * fees, interest, credit-card obligations and the per-country identifier formats.
 *
 * The existing product `balance` of a current account is its available funds (including the
 * overdraft); everything here is derived from it so the figures stay mutually consistent.
 * Metadata only: no UI runtime imports.
 */

/** Demo amounts expressed in EUR and converted into the product currency. */
/** The baseline demo adds this uplift (local currency) to every current account's available funds. */
const OVERDRAFT_LIMIT_LOCAL = 20000
const BLOCKED_AMOUNT_EUR = 45
const OUTSTANDING_AMOUNT_EUR = 120
const CREDIT_EVIDENCE_EUR = 300

/** Demo credit-card obligation rules (share of the drawn amount). */
export const CARD_STATEMENT_DUE_SHARE = 0.25
export const CARD_MINIMUM_DUE_SHARE = 0.05
const CARD_DUE_DATE = '25.12.2026'

export type ProductStatus = 'ACTIVE' | 'BLOCKED'

export interface InterestTier {
  /** Inclusive upper bound of the tier; `undefined` means "above the previous tier". */
  upTo?: number
  rate: string
}

export interface AccountFacts {
  status: ProductStatus
  currency: Currency
  availableFunds: number
  ledgerBalance: number
  overdraftLimit: number
  blockedAmount: number
  outstandingAmount: number
  creditEvidenceIncrease: number
  fees: {
    chargeDay: string
    frequency: 'Monthly' | 'Quarterly' | 'Annual'
    nextChargeDate: string
    /** Only shown when the fees are debited from another account. */
    transferAccount?: string
  }
  interest: {
    credit: InterestTier[]
    /** Debit (overdraft) interest exists only when the account has an overdraft facility. */
    debit: InterestTier[] | null
  }
}

const eurTo = (amount: number, currency: Currency) => roundMoney(convertCurrency(amount, 'EUR', currency))

const TIERED_COUNTRIES = new Set<CountryId>(['CZ', 'SK'])

export function getAccountFacts(
  product: Pick<Product, 'id' | 'type' | 'balance' | 'currency'>,
  country: CountryId,
  options: { blocked?: boolean } = {},
): AccountFacts {
  const currency = product.currency
  const current = product.type === 'current_account'
  const overdraftLimit = current
    ? roundMoney(convertCurrency(OVERDRAFT_LIMIT_LOCAL, getCountryCurrency(country), currency))
    : 0
  const blockedAmount = current ? eurTo(BLOCKED_AMOUNT_EUR, currency) : 0
  const ledgerBalance = roundMoney(product.balance - overdraftLimit + blockedAmount)
  const tiers: InterestTier[] = TIERED_COUNTRIES.has(country)
    ? [{ upTo: eurTo(20000, currency), rate: '1.50%' }, { rate: '0.10%' }]
    : [{ rate: '0.10%' }]
  return {
    status: options.blocked ? 'BLOCKED' : 'ACTIVE',
    currency,
    availableFunds: product.balance,
    ledgerBalance: current ? ledgerBalance : product.balance,
    overdraftLimit,
    blockedAmount,
    outstandingAmount: current ? eurTo(OUTSTANDING_AMOUNT_EUR, currency) : 0,
    creditEvidenceIncrease: current ? eurTo(CREDIT_EVIDENCE_EUR, currency) : 0,
    fees: {
      chargeDay: '15',
      frequency: 'Monthly',
      nextChargeDate: '15.12.2026',
    },
    interest: {
      credit: tiers,
      debit: overdraftLimit > 0 ? [{ rate: '14.90%' }] : null,
    },
  }
}

export interface CreditCardFacts {
  creditLimit: number
  availableCredit: number
  drawn: number
  /** Statement amount due, including interest-free installments (RO "rata datorată"). */
  statementDue: number
  minimumDue: number
  /** Total outstanding obligation (HU `totalAmountObl`). */
  totalDue: number
  dueDate: string
  interestRate: string
  currency: Currency
}

export function getCreditCardFacts(card: {
  creditLimit: number
  availableCredit: number
  currency: Currency
}): CreditCardFacts {
  const drawn = Math.max(0, roundMoney(card.creditLimit - card.availableCredit))
  return {
    creditLimit: card.creditLimit,
    availableCredit: card.availableCredit,
    drawn,
    statementDue: roundMoney(drawn * CARD_STATEMENT_DUE_SHARE),
    minimumDue: roundMoney(drawn * CARD_MINIMUM_DUE_SHARE),
    totalDue: drawn,
    dueDate: CARD_DUE_DATE,
    interestRate: '24.90%',
    currency: card.currency,
  }
}

export interface LoanFacts {
  contractNumber: string
  repaymentAccount: string
  rate: string
  /** Fixed margin over the country's reference index. */
  margin: string
  referenceIndex: string
}

const REFERENCE_INDEX: Record<CountryId, string> = {
  RO: 'IRCC',
  CZ: 'PRIBOR',
  SK: 'EURIBOR',
  HU: 'BUBOR',
  RS: 'BELIBOR',
  SI: 'EURIBOR',
  BA: 'EURIBOR',
  BA_BL: 'EURIBOR',
  IT: 'EURIBOR',
}

export function getLoanFacts(
  product: Pick<Product, 'id' | 'accountNumber'>,
  country: CountryId,
  repaymentAccount: string,
): LoanFacts {
  return {
    contractNumber: `CTR-${product.accountNumber.slice(-8)}`,
    repaymentAccount,
    rate: '6.20%',
    margin: '2.10%',
    referenceIndex: REFERENCE_INDEX[country],
  }
}

export interface AccountIdentifier {
  key: 'iban' | 'accountNumber' | 'bban'
  label: string
  /** Value as displayed. */
  value: string
  /** Value placed on the clipboard (no spaces). */
  copyValue: string
}

const compact = (value: string) => value.replace(/\s+/g, '')
export const formatIbanGroups = (iban: string) =>
  compact(iban)
    .replace(/(.{4})/g, '$1 ')
    .trim()

/** Country-specific identifiers displayed on the account details page. */
export function getAccountIdentifiers(country: CountryId, accountNumber: string): AccountIdentifier[] {
  const iban = compact(accountNumber)
  const digits = iban.replace(/\D/g, '')
  const ibanIdentifier: AccountIdentifier = {
    key: 'iban',
    label: 'IBAN',
    value: formatIbanGroups(iban),
    copyValue: iban,
  }
  switch (country) {
    case 'CZ': {
      const local = `000000-${digits.slice(-10).padStart(10, '0')}/2700`
      return [
        { key: 'accountNumber', label: 'Account number', value: local, copyValue: compact(local) },
        ibanIdentifier,
      ]
    }
    case 'HU': {
      const local = `HUOBUD-${digits.slice(-8).padStart(8, '0')}`
      return [{ key: 'accountNumber', label: 'Account number', value: local, copyValue: local }, ibanIdentifier]
    }
    case 'RS': {
      const local = digits.slice(-18).padStart(18, '0')
      return [{ key: 'accountNumber', label: 'Account number', value: local, copyValue: local }, ibanIdentifier]
    }
    case 'BA':
    case 'BA_BL': {
      const bban = digits.slice(-16).padStart(16, '0')
      const bbanIdentifier: AccountIdentifier = { key: 'bban', label: 'BBAN', value: bban, copyValue: bban }
      // A 16-digit account identifier is a BBAN only: the IBAN field is hidden.
      return /^\d{16}$/.test(iban) ? [bbanIdentifier] : [bbanIdentifier, ibanIdentifier]
    }
    default:
      return [ibanIdentifier]
  }
}

/** SI: every account whose IBAN starts with SI56 is a current account, the rest are savings. */
export function classifySlovenianAccount(iban: string): 'current_account' | 'saving_account' {
  return compact(iban).startsWith('SI56') ? 'current_account' : 'saving_account'
}

export type ShareableProductType = 'current_account' | 'saving_account' | 'term_deposit' | 'loan' | 'mortgage'

export interface AccountCapabilities {
  nickname: { enabled: boolean; maxLength: number }
  share: { types: readonly ShareableProductType[]; fieldSelection: boolean }
  /** Debit cards listed individually before "View all cards" replaces the list. */
  connectedCardsListLimit: number
}

const CURRENT_AND_SAVINGS: readonly ShareableProductType[] = ['current_account', 'saving_account']

const ACCOUNT_CAPABILITIES: Record<CountryId, AccountCapabilities> = {
  RO: {
    nickname: { enabled: true, maxLength: 20 },
    share: { types: [...CURRENT_AND_SAVINGS, 'term_deposit', 'loan', 'mortgage'], fieldSelection: false },
    connectedCardsListLimit: 3,
  },
  CZ: {
    nickname: { enabled: true, maxLength: 20 },
    share: { types: CURRENT_AND_SAVINGS, fieldSelection: true },
    connectedCardsListLimit: 3,
  },
  SK: {
    nickname: { enabled: true, maxLength: 20 },
    share: { types: CURRENT_AND_SAVINGS, fieldSelection: true },
    connectedCardsListLimit: 3,
  },
  HU: {
    nickname: { enabled: false, maxLength: 0 },
    share: { types: [...CURRENT_AND_SAVINGS, 'term_deposit'], fieldSelection: false },
    connectedCardsListLimit: 3,
  },
  RS: {
    nickname: { enabled: false, maxLength: 0 },
    share: { types: [...CURRENT_AND_SAVINGS, 'term_deposit', 'loan', 'mortgage'], fieldSelection: false },
    connectedCardsListLimit: 3,
  },
  SI: {
    nickname: { enabled: true, maxLength: 30 },
    share: { types: CURRENT_AND_SAVINGS, fieldSelection: false },
    connectedCardsListLimit: 3,
  },
  BA: {
    nickname: { enabled: true, maxLength: 30 },
    share: { types: CURRENT_AND_SAVINGS, fieldSelection: false },
    connectedCardsListLimit: 3,
  },
  BA_BL: {
    nickname: { enabled: true, maxLength: 30 },
    share: { types: CURRENT_AND_SAVINGS, fieldSelection: false },
    connectedCardsListLimit: 3,
  },
  IT: {
    nickname: { enabled: true, maxLength: 20 },
    share: { types: [...CURRENT_AND_SAVINGS, 'term_deposit', 'loan', 'mortgage'], fieldSelection: false },
    connectedCardsListLimit: 3,
  },
}

export function getAccountCapabilities(country: CountryId): AccountCapabilities {
  return ACCOUNT_CAPABILITIES[country]
}

export function canShareAccountDetails(country: CountryId, productType: string): boolean {
  return (getAccountCapabilities(country).share.types as readonly string[]).includes(productType)
}

export interface CardCapabilities {
  /** Debit cards may be linked to several current accounts (multi-currency). */
  multiAccountLinking: boolean
  spendFromAccount: boolean
}

export function getCardCapabilities(country: CountryId): CardCapabilities {
  const multi = country === 'CZ' || country === 'SK'
  return { multiAccountLinking: multi, spendFromAccount: multi }
}

/** Reference to the account holder shown on details pages. */
export const DEMO_ACCOUNT_OWNER = 'IACOB MIHAI-CATALIN'

/**
 * Current accounts a debit card spends from, in debit priority order. In CZ and SK the card tied
 * to the first account is multi-currency and also draws on the remaining current accounts.
 */
export function getLinkedAccountIds(
  card: { id?: string; linkedAccountId?: string },
  currentAccountIds: readonly string[],
  country: CountryId,
): string[] {
  const override = card.id ? getLinkedAccountOverride(card.id) : undefined
  if (override) return override.filter((id) => currentAccountIds.includes(id))
  const first = card.linkedAccountId
  if (!first) return []
  if (!getCardCapabilities(country).multiAccountLinking || first !== currentAccountIds[0]) return [first]
  return [first, ...currentAccountIds.filter((id) => id !== first)]
}

/** A card is expired once the last day of its MM/YY month has passed. */
export function isCardExpired(expiryDate: string, now: Date = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiryDate.trim())
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  return now.getTime() >= new Date(year, month, 1).getTime()
}
