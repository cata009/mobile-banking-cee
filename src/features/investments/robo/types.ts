import { type InvestmentBasketFund } from '@/app/config/investmentBasketFundsConfig'
import type { InvestmentHistoryOrder, InvestmentHistoryTransaction } from '@/app/config/investmentsPortfolioConfig'
import type { Currency } from '@/data/products'

export type RoboInvestorProfileStatus = 'valid' | 'expired' | 'missing'

export type RoboFundingMethod = 'one-off' | 'regular' | 'combined'

export interface RoboFundingFieldVisibility {
  initialAmount: boolean
  monthlyContribution: boolean
  startDate: boolean
  cashAccount: true
}

export interface RoboAllocation {
  label: string
  percent: number
}

export interface RoboStrategy {
  id: 'sustainable-balanced' | 'balanced-core' | 'steady-income'
  name: string
  description: string
  allocation: readonly RoboAllocation[]
  illustrativeReturn: string
  scenarioValues: readonly [number, number, number]
}

export interface RoboHolding {
  name: string
  type: string
  percent: number
  currency: string
}

export type RoboProductLogo = 'apple' | 'tesla' | 'microsoft' | 'amundi' | 'unicredit'

export interface RoboPortfolioProduct {
  name: string
  currency: string
  percent: number
  logo: RoboProductLogo
  securityId: string
}

export interface RoboPortfolioAssetGroup {
  label: string
  percent: number
  products: readonly RoboPortfolioProduct[]
  initiallyVisible: number
}

export interface RoboPortfolioPresentation {
  shortName: 'Sustainable' | 'Core' | 'Income'
  assetGroups: readonly RoboPortfolioAssetGroup[]
}

export interface RoboPortfolio {
  id: string
  strategyId: RoboStrategy['id']
  name: string
  description: string
  minimumLabel?: string
  suitabilitySummary: string
  holdings: readonly RoboHolding[]
  basketFund?: InvestmentBasketFund
}

export interface RoboExistingGoal {
  id: string
  name: string
  purpose: string
  currentInteger: string
  currentDecimals: string
  returnLabel: string
  returnTone: 'positive' | 'negative' | 'neutral'
  targetInteger: string
  targetDecimals: string
  horizonYears: number
  startDate?: string
  endDate: string
  portfolioId: RoboPortfolio['id']
  /** Basket ID shown on basket details; config ID is used when no source ID was supplied. */
  basketId?: string
  /** Stable local basket key used to resolve the goal's constituent model. */
  basketKey?: string
  /** Single ISIN of the basket instrument. */
  basketIsin?: string
  /** Persisted units and market value for each constituent of the selected basket. */
  positions?: readonly RoboGoalPosition[]
  /** Executed product-level activity for this goal. */
  transactions?: readonly InvestmentHistoryTransaction[]
  orders?: readonly InvestmentHistoryOrder[]
  /** Future monthly contribution plan; it does not count as an executed holding. */
  recurringContribution?: {
    amount: number
    startDate: string
    cashAccountId?: string
  }
}

export interface RoboGoalPosition {
  id: string
  holdingIndex: number
  productId?: string
  securityId?: string
  title: string
  allocationPercent: number
  quantity: number
  localValue: number
  investedValue?: number
  currency: Currency
}

export interface RoboDraft {
  goalType: string
  goalName: string
  targetAmount: string
  horizonYears: number
  fundingMethod: RoboFundingMethod
  initialAmount: string
  monthlyContribution: string
  startDate: string
  cashAccountLabel: string
  investorProfileLabel: string
  portfolioName: string
}

export interface RoboReviewRow {
  label: string
  value: string
  section: 'goal' | 'plan'
}

export interface RoboDocument {
  id: string
  title: string
  description: string
}
