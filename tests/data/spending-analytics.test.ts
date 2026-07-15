import { describe, expect, it } from 'vitest'
import { COUNTRIES, COUNTRY_META } from '@/app/registry/demoConfig'
import { createSpendingAnalytics, createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics'
import { mockProducts, type Product } from '@/data/products'

describe('spending analytics data', () => {
  it('provides an active country summary and falls back from an invalid selection', () => {
    for (const country of COUNTRIES) {
      const timeline = createSpendingAnalyticsTimeline(country, mockProducts)
      const active = timeline.summariesByPeriodKey[timeline.activePeriodKey]

      expect(active, `${country}/active`).toBeDefined()
      expect(active?.currency, `${country}/currency`).toBe(COUNTRY_META[country].currency)
      expect(createSpendingAnalytics(country, mockProducts, 'missing-period')).toEqual(active)
    }
  })

  it('keeps the existing deterministic zero summary for an empty portfolio', () => {
    for (const country of COUNTRIES) {
      const summary = createSpendingAnalytics(country, [])

      expect(summary).toMatchObject({
        periodKey: '2026-04',
        periodKind: 'month',
        monthKey: '2026-04',
        monthTitle: 'APRIL 2026',
        yearLabel: '2026',
        periodLabel: 'APRIL',
        currency: COUNTRY_META[country].currency,
        incomeTotal: 0,
        spendingTotal: 0,
        cashWithdrawalTotal: 0,
        netTotal: 0,
        moneyOutCategories: [],
        moneyInCategories: [],
        sourceTransactions: [],
      })
    }
  })

  it('excludes raw Internal own-account transfers but retains genuine Transfers and reconciles aggregates', () => {
    const account = mockProducts.find((product) => product.type === 'current_account')
    expect(account).toBeDefined()

    const summary = createSpendingAnalytics('CZ', account ? [account] : ([] as Product[]), '2026-04')
    const ownTransfer = summary.sourceTransactions.find((transaction) => transaction.label === 'Transfer to savings')
    const genuineTransfer = summary.sourceTransactions.find((transaction) => transaction.details === 'Incoming transfer')
    const outgoingTotal = summary.moneyOutCategories.reduce((sum, category) => sum + category.total, 0)
    const incomingTotal = summary.moneyInCategories.reduce((sum, category) => sum + category.total, 0)

    expect(ownTransfer).toBeUndefined()
    expect(genuineTransfer).toMatchObject({ category: 'Transfers', pfmCategory: 'Transfers' })
    expect(outgoingTotal).toBeCloseTo(summary.spendingTotal, 2)
    expect(incomingTotal).toBeCloseTo(summary.incomeTotal, 2)
    expect(summary.netTotal).toBeCloseTo(summary.incomeTotal - summary.spendingTotal, 2)
  })
})
