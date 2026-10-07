import {
  getRecommendedInvestmentBaskets,
  type InvestmentBasketInvestorProfile,
} from '@/app/config/investmentBasketFundsConfig'
import { ROBO_STRATEGIES, ROBO_PORTFOLIOS } from '@/features/investments/robo/catalog'
import {
  type RoboFundingMethod,
  type RoboExistingGoal,
  type RoboInvestorProfileStatus,
  type RoboPortfolio,
  type RoboReviewRow,
  type RoboStrategy,
  RoboFundingFieldVisibility,
  RoboDraft,
} from '@/features/investments/robo/types'

export function parseRoboGoalAmount(integer: string, decimals: string): number {
  const wholeAmount = Number(integer.replace(/\D/g, ''))
  const decimalDigits = decimals.match(/\d+/)?.[0] ?? '0'
  return wholeAmount + Number(decimalDigits) / 100
}

export function getRoboGoalProgress(
  goal: Pick<RoboExistingGoal, 'currentInteger' | 'currentDecimals' | 'targetInteger' | 'targetDecimals'>,
): number {
  const currentValue = parseRoboGoalAmount(goal.currentInteger, goal.currentDecimals)
  const targetValue = parseRoboGoalAmount(goal.targetInteger, goal.targetDecimals)
  return targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0
}

export function calculateRoboGoalProgress(currentValue: number, targetValue: number): number {
  return targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0
}

export function isInvestorProfileBlocking(status: RoboInvestorProfileStatus): boolean {
  return status !== 'valid'
}

export function getFundingFieldVisibility(method: RoboFundingMethod): RoboFundingFieldVisibility {
  return {
    initialAmount: method !== 'regular',
    monthlyContribution: method !== 'one-off',
    startDate: method !== 'one-off',
    cashAccount: true,
  }
}

export function formatCzkInteger(value: string | number): string {
  const digits = String(value).replace(/\D/g, '') || '0'
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function formatCzkGoalAmount(integer: string, decimals: string): string {
  const decimalDigits = decimals.replace(/\D/g, '').padEnd(2, '0').slice(0, 2)
  return `${formatCzkInteger(integer)},${decimalDigits} CZK`
}

export function formatCzkReturnLabel(value: string): string {
  return value.replace(/(\d)[\s\u00a0\u202f]+(?=\d{3}(?:[,.]|$))/g, '$1.')
}

export function formatCzkInput(value: string): string {
  const numberValue = Number(value.replace(/[^\d]/g, ''))
  if (!Number.isFinite(numberValue) || numberValue <= 0) return '0,00 CZK'
  return formatCzkGoalAmount(String(numberValue), ',00')
}

export function buildRoboReviewRows(draft: RoboDraft): RoboReviewRow[] {
  const rows: RoboReviewRow[] = [
    { label: 'Goal type', value: draft.goalType, section: 'goal' },
    { label: 'Goal name', value: draft.goalName, section: 'goal' },
    { label: 'Target amount', value: formatCzkInput(draft.targetAmount), section: 'goal' },
    { label: 'Portfolio', value: draft.portfolioName, section: 'goal' },
  ]

  if (draft.fundingMethod !== 'regular') {
    rows.push({ label: 'Invest now', value: formatCzkInput(draft.initialAmount), section: 'plan' })
  }
  if (draft.fundingMethod !== 'one-off') {
    rows.push({ label: 'Invest monthly', value: formatCzkInput(draft.monthlyContribution), section: 'plan' })
    rows.push({ label: 'Monthly contribution starts', value: draft.startDate, section: 'plan' })
  }

  rows.push(
    { label: 'Time horizon', value: `${draft.horizonYears} years`, section: 'plan' },
    { label: 'Cash account', value: draft.cashAccountLabel, section: 'plan' },
    { label: 'Investor profile', value: draft.investorProfileLabel, section: 'plan' },
  )

  return rows
}

export function getPortfoliosForStrategy(
  strategyId: RoboStrategy['id'],
  investorProfile: InvestmentBasketInvestorProfile = 'moderate-v2',
): readonly RoboPortfolio[] {
  const eligibleIds = new Set<string>(getRecommendedInvestmentBaskets(investorProfile).map((basket) => basket.id))
  return ROBO_PORTFOLIOS.filter(
    (portfolio) =>
      portfolio.strategyId === strategyId && portfolio.basketFund && eligibleIds.has(portfolio.basketFund.id),
  )
}

export function getRoboPortfolioForGoal(
  goal: Pick<RoboExistingGoal, 'portfolioId' | 'basketId' | 'basketKey'>,
): RoboPortfolio | null {
  const basketPortfolio =
    ROBO_PORTFOLIOS.find((portfolio) => portfolio.id === goal.portfolioId && portfolio.basketFund) ??
    (goal.basketKey ? ROBO_PORTFOLIOS.find((portfolio) => portfolio.basketFund?.id === goal.basketKey) : undefined) ??
    (goal.basketId
      ? ROBO_PORTFOLIOS.find(
          (portfolio) =>
            portfolio.basketFund?.marketInfo?.basketId === goal.basketId || portfolio.basketFund?.id === goal.basketId,
        )
      : undefined)
  if (basketPortfolio) return basketPortfolio

  const storedPortfolio = ROBO_PORTFOLIOS.find((portfolio) => portfolio.id === goal.portfolioId)
  const inferredStrategyId =
    storedPortfolio?.strategyId ??
    ROBO_STRATEGIES.find((strategy) => goal.portfolioId.startsWith(`basket-${strategy.id}-`))?.id

  return (
    ROBO_PORTFOLIOS.find(
      (portfolio) => portfolio.basketFund && (!inferredStrategyId || portfolio.strategyId === inferredStrategyId),
    ) ?? null
  )
}

export * from './types'

export * from './catalog'
