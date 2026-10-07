import {
  buildInvestmentChartPoints,
  buildInvestmentDistributionItems,
  buildInvestmentHistoryOrders,
  buildInvestmentSecurities,
  buildInvestmentSecurityCatalog,
} from '@/app/config/investmentsPortfolioConfig'
import { getCountryConfig } from '@/app/registry/countryConfig'
import {
  type CoAppingInvestmentChart,
  type CoAppingRichBlock,
} from '../../../../../package/mobile-pi-coapping-chat-package/src'
import { buildCzNavigateAction, formatCzChatDate, formatCzChatMoney, type CzChatSmartReplyOptions } from '../helpers'
import type { buildCzProfileChatContext } from './profileContext'
import { normalizeCzChatInput as normalize } from '../matching'
/** Domain-owned derivation used once when a chat resolver snapshots its input. */
export function buildCzInvestmentsChatContext(
  context: Pick<CzChatSmartReplyOptions, 'country' | 'selectedInvestmentSecurity'> &
    Pick<ReturnType<typeof buildCzProfileChatContext>, 'investmentProducts' | 'investmentProduct'>,
) {
  const { country, selectedInvestmentSecurity, investmentProducts, investmentProduct } = context
  const investmentSecurities = buildInvestmentSecurities(investmentProducts, country)

  const investmentSecurityCatalog = buildInvestmentSecurityCatalog(investmentSecurities, country)

  const investmentOrders = buildInvestmentHistoryOrders(investmentSecurities, country)

  const latestInvestmentOrder = investmentOrders[0] ?? null

  const pendingInvestmentOrders = investmentOrders.filter((order) => order.status === 'PENDING')

  const rejectedInvestmentOrders = investmentOrders.filter((order) => order.status === 'REJECTED')

  const executedInvestmentOrders = investmentOrders.filter((order) => order.status === 'EXECUTED')

  const investmentLocalTotal = investmentSecurities.reduce((sum, security) => sum + security.localValue, 0)

  const topInvestmentSecurity =
    [...investmentSecurities].sort((first, second) => second.localValue - first.localValue)[0] ?? null

  const topInvestmentShare =
    topInvestmentSecurity && investmentLocalTotal > 0
      ? `${Math.round((topInvestmentSecurity.localValue / investmentLocalTotal) * 100)}%`
      : 'n/a'

  const currencyMix = buildInvestmentDistributionItems(investmentSecurities, 'currency')
    .slice(0, 2)
    .map((item) => `${item.label} ${item.percent}%`)
    .join(' / ')

  const assetClassMix = buildInvestmentDistributionItems(investmentSecurities, 'asset-class')
    .slice(0, 2)
    .map((item) => `${item.label} ${item.percent}%`)
    .join(' / ')

  const investmentValue = investmentProduct
    ? formatCzChatMoney(investmentProduct.balance, investmentProduct.currency, country)
    : 'not available in this simulation profile'

  const investmentReturn = investmentProduct
    ? `${investmentProduct.totalGainLossPercentage >= 0 ? '+' : ''}${investmentProduct.totalGainLossPercentage.toFixed(2)}%`
    : 'n/a'

  const investmentGainLoss = investmentProduct
    ? `${investmentProduct.totalGainLoss >= 0 ? '+' : '-'}${formatCzChatMoney(
        investmentProduct.totalGainLoss,
        investmentProduct.currency,
        country,
      )}`
    : 'n/a'

  const selectedInvestmentValue = selectedInvestmentSecurity?.owned
    ? formatCzChatMoney(selectedInvestmentSecurity.localValue, selectedInvestmentSecurity.localCurrency, country)
    : null

  const selectedInvestmentMarketPrice = selectedInvestmentSecurity
    ? formatCzChatMoney(selectedInvestmentSecurity.marketPrice, selectedInvestmentSecurity.instrumentCurrency, country)
    : null

  const selectedInvestmentPerformance = selectedInvestmentSecurity
    ? `${selectedInvestmentSecurity.performancePercent >= 0 ? '+' : '-'}${Math.abs(selectedInvestmentSecurity.performancePercent).toFixed(2)}%`
    : null

  const selectedInvestmentQuantity = selectedInvestmentSecurity
    ? new Intl.NumberFormat(getCountryConfig(country).locale, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(selectedInvestmentSecurity.quantity)
    : null

  const selectedInvestmentRisk = selectedInvestmentSecurity?.riskLevel
    ? `${selectedInvestmentSecurity.riskLevel} risk`
    : 'Risk level not available'

  const selectedInvestmentLiquidity = selectedInvestmentSecurity?.liquidity
    ? `${selectedInvestmentSecurity.liquidity} liquidity`
    : 'Liquidity not available'

  const selectedInvestmentPortfolioShare =
    selectedInvestmentSecurity?.owned && investmentLocalTotal > 0
      ? `${Math.round((selectedInvestmentSecurity.localValue / investmentLocalTotal) * 100)}%`
      : null

  const latestOrderAmount = latestInvestmentOrder
    ? formatCzChatMoney(latestInvestmentOrder.amount, latestInvestmentOrder.currency, country)
    : 'n/a'

  const latestOrderSummary = latestInvestmentOrder
    ? `${latestInvestmentOrder.orderType} ${latestInvestmentOrder.title}, ${latestInvestmentOrder.status.toLowerCase()}, ${latestOrderAmount} on ${formatCzChatDate(
        latestInvestmentOrder.date,
      )}`
    : 'No investment orders are present in this mock profile.'

  const orderStatusSummary = investmentOrders.length
    ? `${executedInvestmentOrders.length} executed, ${pendingInvestmentOrders.length} pending, ${rejectedInvestmentOrders.length} rejected`
    : 'No orders'

  const investmentPortfolioBlock: CoAppingRichBlock = {
    type: 'investment-summary',
    eyebrow: 'Investments',
    title: 'Portfolio context',
    body: topInvestmentSecurity
      ? `Largest holding is ${topInvestmentSecurity.title}. Use performance, ${currencyMix || 'currency mix'}, and ${
          assetClassMix || 'asset class mix'
        } before opening a product or order.`
      : 'Use the portfolio overview before opening a product or order.',
    metrics: [
      { label: 'Current value', value: investmentValue, helper: investmentProduct?.name ?? 'Simulation profile' },
      { label: 'Return', value: investmentReturn, helper: investmentGainLoss },
      { label: 'Largest holding', value: topInvestmentShare, helper: topInvestmentSecurity?.title ?? 'No holdings' },
    ],
    action: buildCzNavigateAction('open-investments', 'Open Investments', 'investments'),
  }

  const selectedInvestmentProductBlock: CoAppingRichBlock | null = selectedInvestmentSecurity
    ? {
        type: 'investment-summary',
        logoId: selectedInvestmentSecurity.logoId ?? 'unicredit',
        title: selectedInvestmentSecurity.title,
        body: `${selectedInvestmentSecurity.assetClass} ${selectedInvestmentSecurity.productType.toLowerCase()} in ${selectedInvestmentSecurity.instrumentCurrency}. ${selectedInvestmentRisk}; ${selectedInvestmentLiquidity}.`,
        metricLayout: 'stack',
        metrics: selectedInvestmentSecurity.owned
          ? [
              {
                label: 'Holding value',
                value: selectedInvestmentValue ?? 'n/a',
                helper: `${selectedInvestmentQuantity ?? '0'} PCS`,
              },
              {
                label: 'Performance',
                value: selectedInvestmentPerformance ?? 'n/a',
                helper: 'Current product snapshot',
              },
              {
                label: 'Market price',
                value: selectedInvestmentMarketPrice ?? 'n/a',
                helper: `Updated ${selectedInvestmentSecurity.lastUpdate}`,
              },
            ]
          : [
              {
                label: 'Market price',
                value: selectedInvestmentMarketPrice ?? 'n/a',
                helper: `Updated ${selectedInvestmentSecurity.lastUpdate}`,
              },
              { label: 'Performance', value: selectedInvestmentPerformance ?? 'n/a', helper: 'Product snapshot' },
              { label: 'Ownership', value: 'Not held', helper: 'Available in the catalogue' },
            ],
      }
    : null

  const selectedInvestmentChart: CoAppingInvestmentChart | null = selectedInvestmentSecurity
    ? {
        currency: selectedInvestmentSecurity.instrumentCurrency,
        defaultPeriod: '3y',
        series: {
          '1m': buildInvestmentChartPoints(selectedInvestmentSecurity.marketPrice, '1m'),
          '3m': buildInvestmentChartPoints(selectedInvestmentSecurity.marketPrice, '3m'),
          '1y': buildInvestmentChartPoints(selectedInvestmentSecurity.marketPrice, '1y'),
          '3y': buildInvestmentChartPoints(selectedInvestmentSecurity.marketPrice, '3y'),
          max: buildInvestmentChartPoints(selectedInvestmentSecurity.marketPrice, 'max'),
        },
      }
    : null

  const selectedInvestmentMarketPriceFormatted = selectedInvestmentSecurity
    ? formatCzChatMoney(selectedInvestmentSecurity.marketPrice, selectedInvestmentSecurity.instrumentCurrency, country)
    : ''

  const selectedInvestmentExplanationBlock: CoAppingRichBlock | null = selectedInvestmentSecurity
    ? {
        type: 'investment-summary',
        logoId: selectedInvestmentSecurity.logoId ?? 'unicredit',
        title: selectedInvestmentSecurity.title,
        eyebrow: `Actual market price: ${selectedInvestmentMarketPriceFormatted}`,
        body: '',
        metricLayout: 'stack',
        metrics: [
          {
            label: 'Structure',
            value: `${selectedInvestmentSecurity.assetClass} ${selectedInvestmentSecurity.productType.toLowerCase()}`,
            helper: 'Diversified investment product',
          },
          {
            label: 'Currency',
            value: selectedInvestmentSecurity.instrumentCurrency,
            helper: selectedInvestmentSecurity.owned
              ? `Portfolio value displayed in ${selectedInvestmentSecurity.localCurrency}`
              : 'Instrument denomination',
          },
          {
            label: 'Dealing',
            value: selectedInvestmentLiquidity.replace(/\s+liquidity$/i, ''),
            helper: "Subject to the fund's redemption rules",
          },
        ],
      }
    : null

  const investmentGoalPortfolioBlock: CoAppingRichBlock = {
    ...investmentPortfolioBlock,
    action: undefined,
  }

  const investmentOrdersBlock: CoAppingRichBlock = {
    type: 'product-cards',
    title: 'Investment order activity',
    body: `Latest mock order: ${latestOrderSummary}`,
    products: [
      {
        id: 'orders',
        title: 'Orders',
        subtitle: orderStatusSummary,
        meta: 'Open History',
        tone: 'blue',
        action: buildCzNavigateAction('open-investment-orders', 'Open History', 'investments-history'),
      },
      {
        id: 'portfolio',
        title: 'Portfolio',
        subtitle: 'Value, mix, performance',
        meta: 'Open overview',
        tone: 'neutral',
        action: buildCzNavigateAction('open-investments-from-orders', 'Open Investments', 'investments'),
      },
    ],
  }

  const investmentNextMoveBlock: CoAppingRichBlock = {
    type: 'product-cards',
    title: 'Next move planner',
    body: 'A smarter assistant should turn the portfolio readout into a choice: goal setup, order review, or risk cleanup.',
    products: [
      {
        id: 'goal',
        title: 'Goal setup',
        subtitle: 'Horizon, amount, monthly habit',
        meta: 'Plan',
        tone: 'blue',
        action: {
          id: 'plan-investment-goal',
          label: 'Start goal',
          type: 'send-message',
          prompt: 'Start an investment goal.',
        },
      },
      {
        id: 'orders',
        title: 'Orders',
        subtitle: 'Pending, executed, rejected',
        meta: 'Review',
        tone: 'dark',
        action: {
          id: 'review-investment-orders',
          label: 'Review orders',
          type: 'send-message',
          prompt: 'Review my investment orders.',
        },
      },
    ],
  }

  const selectedInvestmentNameNormalized = selectedInvestmentSecurity ? normalize(selectedInvestmentSecurity.title) : ''
  return {
    investmentSecurityCatalog,
    pendingInvestmentOrders,
    topInvestmentSecurity,
    topInvestmentShare,
    currencyMix,
    assetClassMix,
    investmentValue,
    investmentReturn,
    investmentGainLoss,
    selectedInvestmentValue,
    selectedInvestmentPerformance,
    selectedInvestmentQuantity,
    selectedInvestmentRisk,
    selectedInvestmentLiquidity,
    selectedInvestmentPortfolioShare,
    latestOrderSummary,
    orderStatusSummary,
    investmentPortfolioBlock,
    selectedInvestmentProductBlock,
    selectedInvestmentChart,
    selectedInvestmentExplanationBlock,
    investmentGoalPortfolioBlock,
    investmentOrdersBlock,
    investmentNextMoveBlock,
    selectedInvestmentNameNormalized,
  }
}
