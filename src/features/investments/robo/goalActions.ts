import type { RoboExistingGoal, RoboFundingMethod, RoboPortfolio } from './types'
import type { CountryId } from '@/app/state/demoTypes'
import type {
  InvestmentCatalogSecurity,
  InvestmentHistoryOrder,
  InvestmentHistoryTransaction,
} from '@/app/config/investmentsPortfolioConfig'
import { roundMoney } from '@/data/exchangeRates'
import { updateRoboGoalPositionValue, getRoboWithdrawalProducts } from './goalModel'
import { addRoboBasketPurchaseToPositions, buildRoboBasketPendingOrders } from './goalPositions'
export type RoboOperation = { id: string; date: string }
export type RoboContribution = {
  method: RoboFundingMethod
  initialAmount: number
  monthlyAmount: number
  startDate: string
  cashAccountId: string
}

export function applyRoboTopUp(
  goal: RoboExistingGoal,
  portfolio: RoboPortfolio,
  contribution: RoboContribution,
  country: CountryId,
  securityCatalog: readonly InvestmentCatalogSecurity[],
  operation: RoboOperation,
): RoboExistingGoal {
  const basket = portfolio.basketFund
  if (!basket) return goal
  const pendingOrders =
    contribution.initialAmount > 0
      ? buildRoboBasketPendingOrders(
          basket,
          contribution.initialAmount,
          country,
          securityCatalog,
          operation.id,
          contribution.cashAccountId,
          operation.date,
        )
      : []
  const recurringContribution =
    contribution.monthlyAmount > 0
      ? {
          amount: contribution.monthlyAmount,
          startDate: contribution.startDate,
          cashAccountId: contribution.cashAccountId,
        }
      : goal.recurringContribution
  const nextGoal = updateRoboGoalPositionValue(goal, goal.positions ?? [], {
    orders: [...(goal.orders ?? []), ...pendingOrders],
  })
  return { ...nextGoal, recurringContribution }
}

export function applyRoboSale(
  existingGoal: RoboExistingGoal,
  portfolio: RoboPortfolio,
  currentValue: number,
  country: CountryId,
  securityCatalog: readonly InvestmentCatalogSecurity[],
  selectedWithdrawalProductId: string | null,
  execution: { quantity: number; amount: number },
  operation: RoboOperation,
): RoboExistingGoal {
  const withdrawalProducts = getRoboWithdrawalProducts(
    portfolio,
    currentValue,
    country,
    securityCatalog,
    existingGoal.positions,
  )
  const soldProduct = withdrawalProducts.find((product) => product.id === selectedWithdrawalProductId)
  const activeBasket = portfolio.basketFund
  const basePositions =
    existingGoal && activeBasket
      ? (existingGoal.positions ??
        addRoboBasketPurchaseToPositions(activeBasket, currentValue, country, securityCatalog))
      : []
  const position =
    soldProduct?.position ?? basePositions.find((candidate) => candidate.id === selectedWithdrawalProductId)
  if (existingGoal && activeBasket && position && execution.quantity > 0) {
    const soldQuantity = Math.min(position.quantity, execution.quantity)
    const remainingQuantity = Number(Math.max(0, position.quantity - soldQuantity).toFixed(6))
    const remainingValue =
      position.quantity > 0 ? roundMoney((position.localValue * remainingQuantity) / position.quantity) : 0
    const remainingInvestedValue =
      position.quantity > 0
        ? roundMoney(((position.investedValue ?? position.localValue) * remainingQuantity) / position.quantity)
        : 0
    const nextPositions = basePositions.map((candidate) =>
      candidate.id === position.id
        ? {
            ...candidate,
            quantity: remainingQuantity,
            localValue: remainingValue,
            investedValue: remainingInvestedValue,
          }
        : candidate,
    )
    const eventId = operation.id
    const securityId = soldProduct?.security?.id ?? position.securityId ?? position.productId
    const currency = soldProduct?.security?.instrumentCurrency ?? position.currency
    const transaction: InvestmentHistoryTransaction = {
      id: `${eventId}-transaction`,
      securityId,
      date: operation.date,
      title: position.title,
      amount: execution.amount,
      quantity: soldQuantity,
      currency,
      type: 'SELL',
      tone: 'negative',
      logoId: soldProduct?.security?.logoId,
    }
    const order: InvestmentHistoryOrder = {
      id: `${eventId}-order`,
      securityId,
      date: transaction.date,
      title: position.title,
      amount: execution.amount,
      quantity: soldQuantity,
      currency,
      orderType: 'SELL',
      status: 'EXECUTED',
      tone: 'negative',
      logoId: soldProduct?.security?.logoId,
    }
    return updateRoboGoalPositionValue(existingGoal, nextPositions, {
      transactions: [...(existingGoal.transactions ?? []), transaction],
      orders: [...(existingGoal.orders ?? []), order],
    })
  }
  return existingGoal
}
