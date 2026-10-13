import type { Product, ProductCategory, CreditCard } from '@/data/products'
import type { CountryId } from '@/app/state/demoTypes'
import { createProductFormatters } from './formatters'
import { formatEvo2027Amount } from '@/app/utils/evo2027Formatting'
import {
  EVO_SAVING_ACCOUNT_ANNUAL_RATE,
  EVO_CREDIT_CARD_MINIMUM_RATE,
  getEvoCreditTerms,
} from '@/app/config/evoCreditTerms'
import { createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics'

export const EVO_HOME_INSURANCE_POLICIES = [
  {
    title: 'Genius Protect',
    subtitle: 'Life insurance policy · 3431424',
    premium: 70,
    /*
     * What the policy is actually worth to the customer — the figure a loan card
     * gives to the outstanding balance. Without it the card led with a 70 CZK
     * premium and a progress bar nobody could source.
     */
    coverAmount: 500000,
    // Was "Last payment: 30/05/2027" — a past-tense fact dated in the future.
    startDate: '30/05/2025',
    renewalDate: '30/05/2027',
    progress: 30,
    target: 'life-insurance',
  },
  {
    title: 'Home Protect',
    subtitle: 'Home insurance policy · 3431425',
    premium: 120,
    coverAmount: 2400000,
    startDate: '15/11/2025',
    renewalDate: '15/11/2026',
    progress: 56,
    target: 'home-insurance',
  },
] as const

export type DepositPresentation = {
  annualRate: number
  periodLabel: string
  termDays: number
  daysToMaturity: number
  startDate: string
  maturityDate: string
}

/** Amount visibility also applies to screen-reader monetary progress values. */
export function getEvoCreditProgressAccessibility(
  product: Pick<CreditCard, 'creditLimit' | 'availableCredit'>,
  amountsHidden: boolean,
): { min?: number; max?: number; now?: number; text?: string } {
  return amountsHidden
    ? { text: 'Amounts hidden' }
    : { min: 0, max: product.creditLimit, now: Math.max(0, product.creditLimit - product.availableCredit) }
}

const DEFAULT_DEPOSIT_PRESENTATION: DepositPresentation = {
  annualRate: 0.065,
  periodLabel: '1 Year',
  termDays: 365,
  daysToMaturity: 290,
  startDate: '30/05/2026',
  maturityDate: '30/05/2027',
}

const EVO_2027_DEPOSIT_PRESENTATIONS: Record<string, DepositPresentation> = {
  'term-1': DEFAULT_DEPOSIT_PRESENTATION,
  'term-2': {
    annualRate: 0.052,
    periodLabel: '6 Months',
    termDays: 184,
    daysToMaturity: 72,
    startDate: '12/03/2026',
    maturityDate: '12/09/2026',
  },
  'term-3': {
    annualRate: 0.071,
    periodLabel: '2 Years',
    termDays: 730,
    daysToMaturity: 481,
    startDate: '09/01/2026',
    maturityDate: '09/01/2028',
  },
}

export function getEvoDepositPresentation(product: Product) {
  const terms = EVO_2027_DEPOSIT_PRESENTATIONS[product.id] ?? DEFAULT_DEPOSIT_PRESENTATION
  return {
    ...terms,
    maturityAmount: formatEvo2027Amount(
      product.balance * (1 + (terms.annualRate * terms.termDays) / 365),
      product.currency,
    ),
  }
}

export function getEvoLoanPresentation(product: Product) {
  const terms = getEvoCreditTerms(product)
  const total = Math.abs(product.balance) * 1.45
  const repaid = total - Math.abs(product.balance)
  return {
    terms,
    remaining: formatEvo2027Amount(Math.abs(product.balance), product.currency),
    installment: formatEvo2027Amount(Math.round(Math.abs(product.balance) * terms.installmentRate), product.currency),
    total: formatEvo2027Amount(total, product.currency),
    repaid: formatEvo2027Amount(repaid, product.currency),
    repaidPercentage: total > 0 ? (repaid / total) * 100 : 0,
  }
}

export function getEvoInterestEarned(savings: Product[], deposits: Product[], currency: Product['currency']) {
  const fromSavings = savings.reduce((sum, product) => sum + product.balance * EVO_SAVING_ACCOUNT_ANNUAL_RATE, 0)
  const fromDeposits = deposits.reduce((sum, product) => {
    const presentation = getEvoDepositPresentation(product)
    return (
      sum + product.balance * presentation.annualRate * ((presentation.termDays - presentation.daysToMaturity) / 365)
    )
  }, 0)
  return formatEvo2027Amount(Math.round(fromSavings + fromDeposits), currency)
}
export function getEvoDueThisMonth(
  loans: Product[],
  mortgages: Product[],
  creditCards: Product[],
  currency: Product['currency'],
) {
  const fromLoans = [...loans, ...mortgages].reduce(
    (sum, product) => sum + Math.round(Math.abs(product.balance) * getEvoCreditTerms(product).installmentRate),
    0,
  )
  const fromCards = creditCards.reduce((sum, product) => {
    const drawn =
      'creditLimit' in product && 'availableCredit' in product
        ? Math.max(0, (product.creditLimit as number) - (product.availableCredit as number))
        : 0
    return sum + Math.round(drawn * EVO_CREDIT_CARD_MINIMUM_RATE)
  }, 0)
  return formatEvo2027Amount(fromLoans + fromCards, currency)
}
export function selectEvoHomeSummary(categories: ProductCategory[], country: CountryId) {
  const products = categories.flatMap((category) => category.products)
  const ofType = (type: Product['type']) => products.filter((product) => product.type === type)
  const formatters = createProductFormatters(categories, country, 'release-future-evo-2027')
  const savings = ofType('saving_account'),
    deposits = ofType('term_deposit')
  const totalSavings = formatters.calculateTotal([...savings, ...deposits, ...ofType('investment_account')])
  const debt = formatters.calculateTotalOwed()
  const availableTotal = formatters.calculateTotal(ofType('current_account'))
  const timeline = products.length ? createSpendingAnalyticsTimeline(country, products) : undefined
  const active = timeline?.summariesByPeriodKey[timeline.activePeriodKey]
  const spentThisMonth =
    active?.periodKind === 'month' && active.spendingTotal > 0
      ? formatEvo2027Amount(active.spendingTotal, active.currency as Product['currency'])
      : null
  const nextRenewal =
    EVO_HOME_INSURANCE_POLICIES.map((policy) => policy.renewalDate).sort((a, b) => {
      const [ad, am, ay] = a.split('/')
      const [bd, bm, by] = b.split('/')
      return `${ay}${am}${ad}`.localeCompare(`${by}${bm}${bd}`)
    })[0] ?? ''
  return {
    availableTotal,
    available: availableTotal,
    totalSavings,
    savings: totalSavings,
    debt,
    currency: totalSavings.currency as Product['currency'],
    nextRenewal,
    spentThisMonth,
    interestEarned: getEvoInterestEarned(savings, deposits, totalSavings.currency as Product['currency']),
    dueThisMonth: getEvoDueThisMonth(
      ofType('loan'),
      ofType('mortgage'),
      ofType('credit_card'),
      debt.currency as Product['currency'],
    ),
  }
}
