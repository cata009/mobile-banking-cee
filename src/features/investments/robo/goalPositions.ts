import { type InvestmentBasketFund, type InvestmentBasketFundHolding } from '@/app/config/investmentBasketFundsConfig'
import type { InvestmentHistoryOrder, InvestmentHistoryTransaction } from '@/app/config/investmentsPortfolioConfig'
import type { CountryId } from '@/app/state/demoTypes'
import { convertCurrency, getCountryCurrency, roundMoney } from '@/data/exchangeRates'
import { type InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'
import { type RoboExistingGoal, type RoboGoalPosition } from '@/features/investments/robo/types'

export function formatRoboCalendarDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export function parseRoboCalendarDate(value: string): Date {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return new Date()
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

export function formatRoboGoalDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export function getRoboGoalEndDate(goal: RoboExistingGoal, horizonYears: number): string {
  const date = parseRoboCalendarDate(goal.startDate ?? goal.endDate)
  date.setFullYear(date.getFullYear() + (goal.startDate ? horizonYears : horizonYears - goal.horizonYears))
  return formatRoboGoalDate(date)
}

export function getRoboGoalEndDateFromStart(startDate: string, horizonYears: number): string {
  const date = parseRoboCalendarDate(startDate)
  date.setFullYear(date.getFullYear() + horizonYears)
  return formatRoboGoalDate(date)
}

export function localizeRoboBasketInstrument(
  sourceSecurity: InvestmentCatalogSecurity,
  country: CountryId,
  overrides: { title?: string; productId?: string } = {},
): InvestmentCatalogSecurity {
  const localCurrency = getCountryCurrency(country) as InvestmentCatalogSecurity['localCurrency']
  const title = overrides.title ?? sourceSecurity.title
  const marketPrice = roundMoney(
    convertCurrency(sourceSecurity.marketPrice, sourceSecurity.instrumentCurrency, localCurrency),
  )
  const localValue = roundMoney(convertCurrency(sourceSecurity.localValue, sourceSecurity.localCurrency, localCurrency))
  const value = roundMoney(convertCurrency(sourceSecurity.value, sourceSecurity.instrumentCurrency, localCurrency))

  return {
    ...sourceSecurity,
    title,
    productId: overrides.productId ?? sourceSecurity.productId,
    value,
    currency: localCurrency,
    instrumentCurrency: localCurrency,
    localValue,
    localCurrency,
    securityAccountId: country === 'CZ' ? 'robo-sec-local' : sourceSecurity.securityAccountId,
    securityAccountName: `Investment goals ${localCurrency} portfolio`,
    securityAccountCurrency: localCurrency,
    marketPrice,
    quantity: marketPrice > 0 ? Number((value / marketPrice).toFixed(6)) : 0,
    description: `${title} is a ${sourceSecurity.assetClass.toLowerCase()} ${sourceSecurity.productType.toLowerCase()} denominated in ${localCurrency}. Review its objectives, risk profile, fees and official product documents before placing an order.`,
  }
}

export function buildRoboBasketPosition(
  sourceSecurity: InvestmentCatalogSecurity,
  localValue: number,
  country: CountryId,
  overrides: { title?: string; productId?: string; performancePercent?: number } = {},
): InvestmentCatalogSecurity {
  const security = localizeRoboBasketInstrument(sourceSecurity, country, overrides)
  const value = roundMoney(localValue)
  const performancePercent = overrides.performancePercent ?? sourceSecurity.performancePercent

  return {
    ...security,
    owned: true,
    status: 'active',
    value,
    localValue,
    localCurrency: security.instrumentCurrency,
    quantity: security.marketPrice > 0 ? Number((value / security.marketPrice).toFixed(6)) : 0,
    performancePercent,
    performanceAmount: roundMoney((localValue * performancePercent) / 100),
  }
}

export function getRoboBasketPositionId(
  basket: InvestmentBasketFund,
  holding: InvestmentBasketFundHolding,
  index: number,
) {
  return holding.productId ?? `${basket.id}-holding-${index}`
}

export function findRoboBasketSecurity(
  holding: InvestmentBasketFundHolding,
  securityCatalog: readonly InvestmentCatalogSecurity[],
) {
  return (
    securityCatalog.find(
      (security) =>
        (holding.productId && (security.productId === holding.productId || security.id === holding.productId)) ||
        security.title.trim().toLocaleLowerCase() === holding.title.trim().toLocaleLowerCase(),
    ) ?? null
  )
}

export interface RoboBasketPurchaseAllocation {
  holding: InvestmentBasketFundHolding
  holdingIndex: number
  positionId: string
  percent: number
  amount: number
  quantity: number
  security: InvestmentCatalogSecurity | null
}

export function getRoboBasketPurchaseAllocations(
  basket: InvestmentBasketFund,
  amount: number,
  country: CountryId,
  securityCatalog: readonly InvestmentCatalogSecurity[],
): RoboBasketPurchaseAllocation[] {
  const holdings = basket.holdings ?? []
  if (holdings.length === 0 || amount <= 0) return []

  const rawWeights = holdings.map((holding) => Math.max(0, holding.percent ?? 100 / holdings.length))
  const totalWeight = rawWeights.reduce((total, weight) => total + weight, 0) || holdings.length
  let allocatedAmount = 0

  return holdings.map((holding, holdingIndex) => {
    const percent = totalWeight > 0 ? ((rawWeights[holdingIndex] ?? 0) / totalWeight) * 100 : 100 / holdings.length
    const allocationAmount =
      holdingIndex === holdings.length - 1 ? roundMoney(amount - allocatedAmount) : roundMoney((amount * percent) / 100)
    allocatedAmount = roundMoney(allocatedAmount + allocationAmount)

    const security = findRoboBasketSecurity(holding, securityCatalog)
    const localizedSecurity = security
      ? localizeRoboBasketInstrument(security, country, { title: holding.title, productId: holding.productId })
      : null
    const quantity =
      localizedSecurity && localizedSecurity.marketPrice > 0
        ? Number((allocationAmount / localizedSecurity.marketPrice).toFixed(6))
        : 0

    return {
      holding,
      holdingIndex,
      positionId: getRoboBasketPositionId(basket, holding, holdingIndex),
      percent: holding.percent ?? percent,
      amount: allocationAmount,
      quantity,
      security,
    }
  })
}

export function addRoboBasketPurchaseToPositions(
  basket: InvestmentBasketFund,
  amount: number,
  country: CountryId,
  securityCatalog: readonly InvestmentCatalogSecurity[],
  existingPositions: readonly RoboGoalPosition[] = [],
): RoboGoalPosition[] {
  const localCurrency = getCountryCurrency(country) as InvestmentCatalogSecurity['localCurrency']
  return getRoboBasketPurchaseAllocations(basket, amount, country, securityCatalog).map((allocation) => {
    const previous = existingPositions.find(
      (position) => position.id === allocation.positionId || position.holdingIndex === allocation.holdingIndex,
    )
    return {
      id: allocation.positionId,
      holdingIndex: allocation.holdingIndex,
      productId: allocation.holding.productId,
      securityId: allocation.security?.id ?? previous?.securityId,
      title: allocation.holding.title,
      allocationPercent: allocation.percent,
      quantity: Number(((previous?.quantity ?? 0) + allocation.quantity).toFixed(6)),
      localValue: roundMoney((previous?.localValue ?? 0) + allocation.amount),
      investedValue: roundMoney((previous?.investedValue ?? previous?.localValue ?? 0) + allocation.amount),
      currency: localCurrency,
    }
  })
}

export function buildRoboBasketTradeHistory(
  basket: InvestmentBasketFund,
  amount: number,
  country: CountryId,
  securityCatalog: readonly InvestmentCatalogSecurity[],
  orderType: 'BUY' | 'SELL',
  eventId: string,
  date = new Date().toISOString(),
): { transactions: InvestmentHistoryTransaction[]; orders: InvestmentHistoryOrder[] } {
  const allocations = getRoboBasketPurchaseAllocations(basket, amount, country, securityCatalog).filter(
    (allocation) => allocation.amount > 0,
  )
  const currency = getCountryCurrency(country) as InvestmentCatalogSecurity['localCurrency']
  const isBuy = orderType === 'BUY'
  const tone = isBuy ? 'positive' : 'negative'

  return {
    transactions: allocations.map((allocation) => ({
      id: `${eventId}-transaction-${allocation.holdingIndex}`,
      securityId: allocation.security?.id ?? allocation.holding.productId,
      date,
      title: allocation.holding.title,
      amount: allocation.amount,
      currency,
      type: orderType,
      tone,
      logoId: allocation.security?.logoId,
    })),
    orders: allocations.map((allocation) => ({
      id: `${eventId}-order-${allocation.holdingIndex}`,
      securityId: allocation.security?.id ?? allocation.holding.productId,
      date,
      title: allocation.holding.title,
      amount: allocation.amount,
      currency,
      orderType,
      status: 'EXECUTED',
      tone,
      logoId: allocation.security?.logoId,
    })),
  }
}

export function buildRoboPositionOpeningHistory(
  goalId: string,
  startDate: string | undefined,
  positions: readonly RoboGoalPosition[],
  securityCatalog: readonly InvestmentCatalogSecurity[],
): { transactions: InvestmentHistoryTransaction[]; orders: InvestmentHistoryOrder[] } {
  const historyDate = startDate ? parseRoboCalendarDate(startDate) : new Date()
  historyDate.setHours(12, 0, 0, 0)
  const date = historyDate.toISOString()
  const fundedPositions = positions.filter((position) => position.quantity > 0 && position.localValue > 0)
  const transactionRows = fundedPositions.map((position) => {
    const amount = roundMoney(
      position.investedValue && position.investedValue > 0 ? position.investedValue : position.localValue,
    )
    const security = securityCatalog.find(
      (candidate) =>
        candidate.id === position.securityId ||
        candidate.productId === position.productId ||
        candidate.title === position.title,
    )
    return {
      id: `${goalId}-opening-buy-transaction-${position.holdingIndex}`,
      securityId: position.securityId ?? position.productId,
      date,
      title: position.title,
      amount,
      quantity: position.quantity,
      currency: position.currency,
      type: 'BUY' as const,
      tone: 'positive' as const,
      logoId: security?.logoId,
    }
  })

  return {
    transactions: transactionRows,
    orders: transactionRows.map((transaction) => ({
      id: `${goalId}-opening-buy-order-${transaction.id.split('-').at(-1)}`,
      securityId: transaction.securityId,
      date: transaction.date,
      title: transaction.title,
      amount: transaction.amount,
      quantity: transaction.quantity,
      currency: transaction.currency,
      orderType: 'BUY' as const,
      status: 'EXECUTED' as const,
      tone: 'positive' as const,
      logoId: transaction.logoId,
    })),
  }
}

export function roboHistoryRowsMatch(
  left: { securityId?: string; title: string },
  right: { securityId?: string; title: string },
): boolean {
  return left.securityId && right.securityId ? left.securityId === right.securityId : left.title === right.title
}

export function applyRoboExecutedSells(
  startingPositions: readonly RoboGoalPosition[],
  sourceTransactions: readonly InvestmentHistoryTransaction[],
  sourceOrders: readonly InvestmentHistoryOrder[],
): { positions: RoboGoalPosition[]; transactions: InvestmentHistoryTransaction[]; orders: InvestmentHistoryOrder[] } {
  const positions = startingPositions.map((position) => ({ ...position }))
  const transactions = [...sourceTransactions]
  const orders = [...sourceOrders]

  sourceOrders
    .filter((order) => order.orderType === 'SELL' && order.status === 'EXECUTED' && (order.quantity ?? 0) > 0)
    .forEach((order) => {
      const positionIndex = positions.findIndex(
        (position) =>
          (order.securityId && (order.securityId === position.securityId || order.securityId === position.productId)) ||
          (!order.securityId && order.title === position.title),
      )
      const position = positions[positionIndex]
      if (!position || position.quantity <= 0 || position.localValue <= 0) return

      const soldQuantity = Math.min(position.quantity, order.quantity ?? 0)
      if (soldQuantity <= 0) return
      const remainingQuantity = Number(Math.max(0, position.quantity - soldQuantity).toFixed(6))
      const remainingValue = roundMoney((position.localValue * remainingQuantity) / position.quantity)
      const remainingInvestedValue = roundMoney(
        ((position.investedValue ?? position.localValue) * remainingQuantity) / position.quantity,
      )
      const executedAmount = roundMoney(position.localValue - remainingValue)
      positions[positionIndex] = {
        ...position,
        quantity: remainingQuantity,
        localValue: remainingValue,
        investedValue: remainingInvestedValue,
      }

      const updatedOrder: InvestmentHistoryOrder = { ...order, amount: executedAmount, quantity: soldQuantity }
      const orderIndex = orders.findIndex((candidate) => candidate.id === order.id)
      if (orderIndex >= 0) orders[orderIndex] = updatedOrder

      const transactionIndex = transactions.findIndex(
        (transaction) =>
          transaction.type === 'SELL' &&
          transaction.title === order.title &&
          transaction.date === order.date &&
          (!order.securityId || !transaction.securityId || transaction.securityId === order.securityId),
      )
      if (transactionIndex >= 0) {
        transactions[transactionIndex] = {
          ...transactions[transactionIndex]!,
          amount: executedAmount,
          quantity: soldQuantity,
        }
      }
    })

  return { positions, transactions, orders }
}

export function buildRoboBasketPendingOrders(
  basket: InvestmentBasketFund,
  amount: number,
  country: CountryId,
  securityCatalog: readonly InvestmentCatalogSecurity[],
  eventId: string,
  cashAccountId: string,
  date = new Date().toISOString(),
): InvestmentHistoryOrder[] {
  const currency = getCountryCurrency(country) as InvestmentCatalogSecurity['localCurrency']
  return getRoboBasketPurchaseAllocations(basket, amount, country, securityCatalog)
    .filter((allocation) => allocation.amount > 0)
    .map((allocation) => ({
      id: `${eventId}-order-${allocation.holdingIndex}`,
      securityId: allocation.security?.id ?? allocation.holding.productId,
      cashAccountId,
      date,
      title: allocation.holding.title,
      amount: allocation.amount,
      currency,
      orderType: 'BUY',
      status: 'PENDING',
      tone: 'neutral',
      logoId: allocation.security?.logoId,
    }))
}
