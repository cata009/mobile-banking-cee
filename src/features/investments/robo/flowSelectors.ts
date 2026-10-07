import type { RoboExistingGoal, RoboReviewRow, RoboFundingMethod } from './types'
import { formatCzkInput, getFundingFieldVisibility } from './model'
import { ROBO_INVESTOR_PROFILE_LABELS } from './presentationData'
import { isRoboFundingDateAllowed, type RoboDemoClock } from './demoClock'

export function buildRoboCreationReviewRows(
  goalType: string,
  goalName: string,
  targetAmount: string,
  portfolioName: string,
  horizonYears: number,
): RoboReviewRow[] {
  return [
    { label: 'Goal type', value: goalType, section: 'goal' },
    { label: 'Goal name', value: goalName, section: 'goal' },
    { label: 'Target amount', value: formatCzkInput(targetAmount), section: 'goal' },
    { label: 'Portfolio', value: portfolioName, section: 'goal' },
    { label: 'Time horizon', value: `${horizonYears} years`, section: 'plan' },
    { label: 'Investor profile', value: ROBO_INVESTOR_PROFILE_LABELS.moderate, section: 'plan' },
  ]
}

export function getRoboDetailFlags(currentValue: number, goal?: RoboExistingGoal) {
  return {
    isEmptyGoal: currentValue <= 0,
    hasPendingBuyOrders:
      goal?.orders?.some((order) => order.orderType === 'BUY' && order.status === 'PENDING') ?? false,
    hasRecurringPlan: Boolean(goal?.recurringContribution),
    hasSellHistory:
      (goal?.transactions?.some((transaction) => transaction.type === 'SELL') ?? false) ||
      (goal?.orders?.some((order) => order.orderType === 'SELL') ?? false),
  }
}

export function canReviewRoboTopUp(
  method: RoboFundingMethod,
  initial: number,
  monthly: number,
  date: string,
  hasAccount: boolean,
  clock: RoboDemoClock,
): boolean {
  const fields = getFundingFieldVisibility(method)
  return Boolean(
    (fields.initialAmount ? initial > 0 : true) &&
    (fields.monthlyContribution ? monthly > 0 : true) &&
    (fields.startDate ? isRoboFundingDateAllowed(date, clock) : true) &&
    hasAccount,
  )
}
