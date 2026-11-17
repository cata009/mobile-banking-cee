import type { CountryId, ReleaseId } from '@/app/state/demoTypes'
import type { Product } from '@/data/products'

/**
 * Executable Home rules per country (CEE Home Screen specification):
 * which products feed each header indicator, how the indicators are labelled,
 * and the order of the cards inside the Cards group.
 *
 * Metadata only: no UI runtime imports. Experiences select this policy; they
 * do not repeat the business decision. Countries without an entry (Italy) and
 * the Evo 2027 release keep the legacy aggregation.
 */

/** A slice of the customer's products, converted to the local currency by the caller. */
export type HomeTotalsMeasure =
  | 'currentAccounts'
  | 'primaryAccount'
  | 'savings'
  | 'termDeposits'
  | 'mainCreditAvailable'
  | 'creditAvailable'
  | 'creditDrawn'
  | 'loans'

export interface HomeIndicatorPolicy {
  /** Translation key; `fallback` is shown when the locale has no entry. */
  labelKey: string
  fallback: string
  measures: readonly HomeTotalsMeasure[]
  /** Hide the indicator when it equals the primary one (BIH available balance). */
  hideWhenEqualToPrimary?: boolean
}

export interface HomeTotalsPolicy {
  primary: HomeIndicatorPolicy
  secondary: HomeIndicatorPolicy
}

const TOTAL_AVAILABLE = { labelKey: 'home.totalAvailable', fallback: 'Total Available' } as const
const TOTAL_BALANCE = { labelKey: 'home.totalBalance', fallback: 'Total Balance' } as const
const TOTAL_OWED = { labelKey: 'home.totalOwed', fallback: 'Total Owed' } as const

/** Pre-specification aggregation, kept for Italy and Evo 2027. */
export const LEGACY_HOME_TOTALS_POLICY: HomeTotalsPolicy = {
  primary: { ...TOTAL_AVAILABLE, measures: ['currentAccounts', 'savings'] },
  secondary: { ...TOTAL_OWED, measures: ['loans', 'creditDrawn'] },
}

const LIQUID_AND_OWED = (primaryCredit: 'mainCreditAvailable' | 'creditAvailable'): HomeTotalsPolicy => ({
  primary: { ...TOTAL_AVAILABLE, measures: ['currentAccounts', 'savings', primaryCredit] },
  secondary: { ...TOTAL_OWED, measures: ['loans', 'creditDrawn'] },
})

const HOME_TOTALS_POLICY: Partial<Record<CountryId, HomeTotalsPolicy>> = {
  // Current accounts + savings + main credit card availability / loans + card debt.
  RO: LIQUID_AND_OWED('mainCreditAvailable'),
  // Liquid aggregation (accounts + savings + credit card) / loans + card debt.
  HU: LIQUID_AND_OWED('creditAvailable'),
  // Available on current accounts / ledger balance of accounts, savings and deposits.
  CZ: {
    primary: { ...TOTAL_AVAILABLE, measures: ['currentAccounts'] },
    secondary: { ...TOTAL_BALANCE, measures: ['currentAccounts', 'savings', 'termDeposits'] },
  },
  // Available on current accounts / own money in the bank (savings and deposits).
  SK: {
    primary: { ...TOTAL_AVAILABLE, measures: ['currentAccounts'] },
    secondary: { ...TOTAL_BALANCE, measures: ['savings', 'termDeposits'] },
  },
  RS: {
    primary: { labelKey: 'home.availableBalance', fallback: 'Available Balance', measures: ['currentAccounts'] },
    secondary: {
      labelKey: 'home.totalCurrentBalance',
      fallback: 'Total Current Balance',
      measures: ['currentAccounts'],
    },
  },
  SI: {
    primary: { ...TOTAL_AVAILABLE, measures: ['currentAccounts'] },
    secondary: { ...TOTAL_OWED, measures: ['loans', 'creditDrawn'] },
  },
  // Primary account balance; the available balance only shows when it differs.
  BA: {
    primary: { labelKey: 'home.accountBalance', fallback: 'Account Balance', measures: ['primaryAccount'] },
    secondary: {
      labelKey: 'home.availableBalance',
      fallback: 'Available Balance',
      measures: ['primaryAccount'],
      hideWhenEqualToPrimary: true,
    },
  },
}
HOME_TOTALS_POLICY.BA_BL = HOME_TOTALS_POLICY.BA

export function getHomeTotalsPolicy(country: CountryId, release: ReleaseId): HomeTotalsPolicy {
  if (release === 'release-future-evo-2027') return LEGACY_HOME_TOTALS_POLICY
  return HOME_TOTALS_POLICY[country] ?? LEGACY_HOME_TOTALS_POLICY
}

type CardType = 'credit_card' | 'debit_card' | 'meal_card'

const CREDIT_FIRST: readonly CardType[] = ['credit_card', 'debit_card', 'meal_card']
const DEBIT_FIRST: readonly CardType[] = ['debit_card', 'credit_card', 'meal_card']

const CARD_ORDER: Partial<Record<CountryId, readonly CardType[]>> = {
  RO: CREDIT_FIRST, // the meal card follows the credit and debit cards
  CZ: CREDIT_FIRST,
  HU: CREDIT_FIRST,
  RS: CREDIT_FIRST,
  SI: CREDIT_FIRST,
  SK: DEBIT_FIRST,
  BA: DEBIT_FIRST,
  BA_BL: DEBIT_FIRST,
}

/** Stable, country-specific ordering of the Cards group; other countries and Evo keep their order. */
export function orderCardsForCountry<T extends Pick<Product, 'type'>>(
  products: readonly T[],
  country: CountryId,
  release: ReleaseId,
): T[] {
  const order = release === 'release-future-evo-2027' ? undefined : CARD_ORDER[country]
  if (!order) return [...products]
  const rank = (product: T) => {
    const index = order.indexOf(product.type as CardType)
    return index === -1 ? order.length : index
  }
  return products
    .map((product, position) => ({ product, position }))
    .sort((a, b) => rank(a.product) - rank(b.product) || a.position - b.position)
    .map(({ product }) => product)
}
