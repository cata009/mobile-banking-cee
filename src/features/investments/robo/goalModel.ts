import { formatInvestmentNumber } from '@/app/utils/investmentAmountFormatting'
import type { CountryId } from '@/app/state/demoTypes'
import { convertCurrency, getCountryCurrency, roundMoney } from '@/data/exchangeRates'
import { type InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'
import { ROBO_PORTFOLIO_PRESENTATIONS } from '@/features/investments/robo/catalog'
import { formatCzkInteger } from '@/features/investments/robo/model'
import { type RoboExistingGoal, type RoboGoalPosition, type RoboPortfolio } from '@/features/investments/robo/types'
import {
  buildRoboBasketTradeHistory,
  addRoboBasketPurchaseToPositions,
  getRoboBasketPositionId,
  buildRoboBasketPosition,
} from '@/features/investments/robo/goalPositions'

export function parseRoboReturnAmount(value: string): number {
  const match = value.match(/[+-]?\s*\d[\d\s.,]*/)
  if (!match) return 0
  const normalized = match[0].replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : 0
}

export function formatRoboGoalReturn(value: number, investedValue: number): string {
  const roundedReturn = roundMoney(value)
  if (roundedReturn === 0) return '0 total return'
  const sign = roundedReturn > 0 ? '+' : '−'
  const absoluteReturn = Math.abs(roundedReturn)
  const whole = Math.floor(absoluteReturn)
  const cents = Math.round((absoluteReturn - whole) * 100)
    .toString()
    .padStart(2, '0')
  const percent = investedValue > 0 ? Math.abs((roundedReturn / investedValue) * 100) : 0
  return `${sign}${formatCzkInteger(String(whole))},${cents} CZK (${sign}${formatInvestmentNumber(percent, 'CZ', 0, 2)}%)`
}

export function updateRoboGoalPositionValue(
  goal: RoboExistingGoal,
  positions: readonly RoboGoalPosition[],
  updates: Pick<RoboExistingGoal, 'transactions' | 'orders'> = {},
): RoboExistingGoal {
  const totalValue = roundMoney(positions.reduce((total, position) => total + position.localValue, 0))
  const totalInvestedValue = roundMoney(
    positions.reduce((total, position) => total + (position.investedValue ?? position.localValue), 0),
  )
  const totalReturn = roundMoney(totalValue - totalInvestedValue)
  const whole = Math.floor(totalValue)
  const cents = Math.round((totalValue - whole) * 100)
    .toString()
    .padStart(2, '0')
  return {
    ...goal,
    currentInteger: formatCzkInteger(String(whole)),
    currentDecimals: `,${cents} CZK`,
    returnLabel: formatRoboGoalReturn(totalReturn, totalInvestedValue),
    returnTone: totalReturn > 0 ? 'positive' : totalReturn < 0 ? 'negative' : 'neutral',
    positions,
    ...updates,
  }
}

export function buildInitialRoboGoal(
  basketPortfolio: RoboPortfolio,
  goal: Omit<
    RoboExistingGoal,
    'portfolioId' | 'basketId' | 'basketKey' | 'basketIsin' | 'positions' | 'transactions' | 'orders'
  >,
  initialInvestment: number,
  country: CountryId,
  securityCatalog: readonly InvestmentCatalogSecurity[],
  operation: { date: string; tradeId?: string },
): RoboExistingGoal {
  const basket = basketPortfolio.basketFund
  if (!basket) throw new Error('CZ Robo goals must reference a basket.')
  const date = operation.date
  const initialInvestmentCost =
    initialInvestment > 0 ? roundMoney(Math.max(0, initialInvestment - parseRoboReturnAmount(goal.returnLabel))) : 0
  const basketTrade =
    initialInvestment > 0
      ? buildRoboBasketTradeHistory(
          basket,
          initialInvestmentCost,
          country,
          securityCatalog,
          'BUY',
          operation.tradeId ?? goal.id,
          date,
        )
      : { transactions: [], orders: [] }
  const allocatedPositions =
    initialInvestment > 0
      ? addRoboBasketPurchaseToPositions(basket, initialInvestment, country, securityCatalog)
      : addRoboBasketPurchaseToPositions(basket, 0, country, securityCatalog)
  const positions = allocatedPositions.map((position) => ({
    ...position,
    investedValue:
      initialInvestment > 0 ? roundMoney((initialInvestmentCost * position.localValue) / initialInvestment) : 0,
  }))
  const initialGoal: RoboExistingGoal = {
    ...goal,
    portfolioId: basketPortfolio.id,
    basketId: basket.marketInfo.basketId,
    basketKey: basket.id,
    basketIsin: basket.marketInfo.basketIsin,
    positions,
    transactions: basketTrade.transactions,
    orders: basketTrade.orders,
  }
  return updateRoboGoalPositionValue(initialGoal, positions)
}

export interface RoboWithdrawalProduct {
  id: string
  name: string
  percent: number
  localValue: number
  security: InvestmentCatalogSecurity | null
  position?: RoboGoalPosition
}

export function getRoboWithdrawalProducts(
  portfolio: RoboPortfolio,
  currentValue: number,
  country: CountryId,
  securityCatalog: readonly InvestmentCatalogSecurity[],
  goalPositions?: readonly RoboGoalPosition[],
): RoboWithdrawalProduct[] {
  const basketHoldings = portfolio.basketFund?.holdings ?? []
  const basketProducts: Array<{ id: string; name: string; percent: number; position?: RoboGoalPosition }> =
    basketHoldings.map((holding, index) => {
      const id = portfolio.basketFund
        ? getRoboBasketPositionId(portfolio.basketFund, holding, index)
        : (holding.productId ?? `${portfolio.id}-holding-${index}`)
      return {
        id,
        name: holding.title,
        percent: holding.percent ?? 100 / basketHoldings.length,
        position: goalPositions?.find((position) => position.id === id || position.holdingIndex === index),
      }
    })

  const presentationProducts: Array<{ id: string; name: string; percent: number; position?: RoboGoalPosition }> =
    ROBO_PORTFOLIO_PRESENTATIONS[portfolio.strategyId].assetGroups.flatMap((group) =>
      group.products.map((product) => ({
        id: product.securityId,
        name: product.name,
        percent: product.percent,
      })),
    )
  const products =
    basketProducts.length > 0
      ? basketProducts
      : presentationProducts.length > 0
        ? presentationProducts
        : portfolio.holdings.map((holding, index) => ({
            id: `${portfolio.id}-holding-${index}`,
            name: holding.name,
            percent: holding.percent,
            position: goalPositions?.find(
              (position) => position.id === `${portfolio.id}-holding-${index}` || position.holdingIndex === index,
            ),
          }))
  const localCurrency = getCountryCurrency(country) as InvestmentCatalogSecurity['localCurrency']

  return products.map((product) => {
    const sourceSecurity =
      securityCatalog.find(
        (security) =>
          security.id === product.position?.securityId ||
          security.productId === product.position?.productId ||
          security.id === product.id ||
          security.productId === product.id ||
          security.title.trim().toLocaleLowerCase() === product.name.trim().toLocaleLowerCase(),
      ) ?? null
    const localValue = product.position
      ? product.position.localValue
      : goalPositions
        ? 0
        : roundMoney((currentValue * product.percent) / 100)
    const value = sourceSecurity
      ? roundMoney(convertCurrency(localValue, localCurrency, sourceSecurity.instrumentCurrency))
      : localValue
    const security: InvestmentCatalogSecurity | null = sourceSecurity
      ? basketProducts.length > 0
        ? buildRoboBasketPosition(sourceSecurity, localValue, country, { title: product.name, productId: product.id })
        : {
            ...sourceSecurity,
            title: product.name,
            owned: true,
            status: 'active',
            value,
            currency: sourceSecurity.instrumentCurrency,
            localValue,
            localCurrency,
            quantity: product.position?.quantity ?? Number((value / sourceSecurity.marketPrice).toFixed(6)),
            performanceAmount: roundMoney((localValue * sourceSecurity.performancePercent) / 100),
          }
      : null

    if (security && product.position) {
      security.quantity = product.position.quantity
      security.localValue = product.position.localValue
    }

    return { ...product, localValue, security }
  })
}

export function getRoboGoalCurrentValue(goal?: RoboExistingGoal): number {
  if (goal?.positions) {
    return roundMoney(goal.positions.reduce((total, position) => total + position.localValue, 0))
  }
  return goal
    ? Number(goal.currentInteger.replace(/\D/g, '')) + Number(goal.currentDecimals.replace(/[^\d]/g, '')) / 100
    : 79800
}
