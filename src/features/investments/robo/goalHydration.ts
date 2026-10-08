import type { RoboExistingGoal } from './types'
import type { CountryId } from '@/app/state/demoTypes'
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'
import type { InvestmentBasketFund } from '@/app/config/investmentBasketFundsConfig'
import { roundMoney } from '@/data/exchangeRates'
import { getRoboGoalCurrentValue, parseRoboReturnAmount, updateRoboGoalPositionValue } from './goalModel'
import {
  addRoboBasketPurchaseToPositions,
  buildRoboPositionOpeningHistory,
  roboHistoryRowsMatch,
  applyRoboExecutedSells,
} from './goalPositions'

export function hydrateRoboGoal(
  goal: RoboExistingGoal,
  basket: InvestmentBasketFund,
  country: CountryId,
  securityCatalog: readonly InvestmentCatalogSecurity[],
): RoboExistingGoal {
  const currentValue = getRoboGoalCurrentValue(goal)
  const hasFundedPosition =
    goal.positions?.some((position) => position.quantity > 0 && position.localValue > 0) ?? false
  const needsPositionHydration = goal.positions === undefined || (currentValue > 0 && !hasFundedPosition)
  let positions = goal.positions ?? []
  if (needsPositionHydration) {
    const openingInvestment = roundMoney(Math.max(0, currentValue - parseRoboReturnAmount(goal.returnLabel)))
    positions = addRoboBasketPurchaseToPositions(basket, currentValue, country, securityCatalog).map((position) => ({
      ...position,
      investedValue: currentValue > 0 ? roundMoney((openingInvestment * position.localValue) / currentValue) : 0,
    }))
  }

  const existingTransactions = goal.transactions ?? []
  const existingOrders = goal.orders ?? []
  const openingHistory = buildRoboPositionOpeningHistory(goal.id, goal.startDate, positions, securityCatalog, basket)
  const missingBuyTransactions = openingHistory.transactions.filter(
    (transaction) =>
      !existingTransactions.some((existing) => existing.type === 'BUY' && roboHistoryRowsMatch(existing, transaction)),
  )
  const missingExecutedBuyOrders = openingHistory.orders.filter(
    (order) =>
      !existingOrders.some(
        (existing) =>
          existing.orderType === 'BUY' &&
          existing.status === 'EXECUTED' &&
          (roboHistoryRowsMatch(existing, order) ||
            existingTransactions.some(
              (transaction) => transaction.type === 'BUY' && roboHistoryRowsMatch(existing, transaction),
            )),
      ),
  )
  const hydratedTransactions = [...existingTransactions, ...missingBuyTransactions]
  const hydratedOrders = [...existingOrders, ...missingExecutedBuyOrders]
  const reconciledHistory = needsPositionHydration
    ? applyRoboExecutedSells(positions, hydratedTransactions, hydratedOrders)
    : { positions, transactions: hydratedTransactions, orders: hydratedOrders }
  const basketMetadataMissing =
    goal.basketId !== basket.marketInfo.basketId ||
    goal.basketKey !== basket.id ||
    goal.basketIsin !== basket.marketInfo.basketIsin
  const historyNeedsBackfill = missingBuyTransactions.length > 0 || missingExecutedBuyOrders.length > 0
  if (!needsPositionHydration && !basketMetadataMissing && !historyNeedsBackfill) {
    return goal
  }

  const hydratedGoal: RoboExistingGoal = {
    ...goal,
    basketId: basket.marketInfo.basketId,
    basketKey: basket.id,
    basketIsin: basket.marketInfo.basketIsin,
  }
  const reconciledGoal = updateRoboGoalPositionValue(hydratedGoal, reconciledHistory.positions, {
    transactions: reconciledHistory.transactions,
    orders: reconciledHistory.orders,
  })
  return reconciledGoal
}
