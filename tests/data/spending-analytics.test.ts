import { describe, expect, it } from 'vitest'
import { COUNTRIES, COUNTRY_META } from '@/app/registry/demoConfig'
import {
  createSpendingAnalytics,
  createSpendingAnalyticsTimeline,
  createSpendingCategoryDetail,
} from '@/data/spendingAnalytics'
import { getAccountTransactions } from '@/data/accountDetails'
import { mockProducts, type Currency, type Product } from '@/data/products'

describe('spending analytics data', () => {
  it('provides two PFM-excluded pending reservations for the primary current-account profile in every country', () => {
    for (const country of COUNTRIES) {
      const pending = getAccountTransactions(country, 0, COUNTRY_META[country].currency as Currency)
        .filter((transaction) => transaction.status === 'Pending')
      const analytics = createSpendingAnalytics(country, mockProducts, '2026-04')

      expect(pending, `${country}/pending`).toHaveLength(2)
      expect(analytics.sourceTransactions.some((transaction) => transaction.status === 'Pending')).toBe(false)
    }
  })

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

  it('excludes PFM investment movements from spending aggregates', () => {
    const account = mockProducts.find((product) => product.type === 'current_account')
    expect(account).toBeDefined()

    const summary = createSpendingAnalytics('CZ', account ? [account] : ([] as Product[]), '2026-04')

    expect(summary.sourceTransactions.some((transaction) => transaction.pfmCategory === 'Investments')).toBe(false)
    expect(summary.moneyOutCategories.some((category) => category.category === 'Investments')).toBe(false)
  })

  it('applies session recategorization before analytics aggregation and category drill-down', () => {
    const account = mockProducts.find((product) => product.type === 'current_account')
    expect(account).toBeDefined()

    const baseline = createSpendingAnalytics('RO', account ? [account] : [], '2026-04')
    const shoppingTransaction = baseline.sourceTransactions.find(
      (transaction) => transaction.pfmCategory === 'Shopping',
    )
    expect(shoppingTransaction).toBeDefined()

    const timeline = createSpendingAnalyticsTimeline(
      'RO',
      account ? [account] : [],
      shoppingTransaction
        ? {
            [shoppingTransaction.id]: {
              groupId: 'financial',
              groupLabel: 'FINANCIAL',
              category: 'Finance',
              subcategory: 'MORTGAGE',
            },
          }
        : {},
    )
    const summary = timeline.summariesByPeriodKey['2026-04']
    expect(summary).toBeDefined()

    const detail = summary ? createSpendingCategoryDetail(summary, 'Finance', 'out') : undefined
    expect(detail?.transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: shoppingTransaction?.id, pfmCategory: 'Finance', pfmSubcategory: 'MORTGAGE' }),
      ]),
    )
    expect(detail?.subcategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'MORTGAGE', transactionCount: 1 }),
        expect.objectContaining({ label: 'BANK FEES' }),
      ]),
    )
    expect(summary?.moneyOutCategories.find((category) => category.category === 'Shopping')).toBeUndefined()
    expect(detail?.subcategories.reduce((total, subcategory) => total + subcategory.total, 0)).toBeCloseTo(
      detail?.total ?? 0,
      2,
    )
  })

  it('keeps income drill-down labels outside the expense recategorization taxonomy', () => {
    const account = mockProducts.find((product) => product.type === 'current_account')
    const summary = createSpendingAnalytics('RO', account ? [account] : [], '2026-04')
    const income = createSpendingCategoryDetail(summary, 'Income', 'in')
    const incomeAsOutflow = createSpendingCategoryDetail(summary, 'Income', 'out')

    expect(income.total).toBeCloseTo(summary.moneyInCategories.find((item) => item.category === 'Income')?.total ?? 0, 2)
    expect(income.subcategories).toEqual([
      expect.objectContaining({ label: 'SALARY', transactionCount: 1 }),
    ])
    expect(income.transactions.every((transaction) => transaction.amount > 0)).toBe(true)
    expect(incomeAsOutflow).toMatchObject({ total: 0, subcategories: [], transactions: [] })
  })

  it('maps production category labels for shopping, income, loans, and mortgages', () => {
    const april = createSpendingAnalytics('RO', mockProducts, '2026-04')
    const shopping = createSpendingCategoryDetail(april, 'Shopping', 'out')
    const income = createSpendingCategoryDetail(april, 'Income', 'in')
    const finance = createSpendingCategoryDetail(april, 'Finance', 'out')

    expect(shopping.subcategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'ELECTRONICS & COMPUTERS' }),
        expect.objectContaining({ label: 'SHOPPING (OTHER)' }),
      ]),
    )
    expect(income.subcategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'SALARY' }),
        expect.objectContaining({ label: 'INCOME (OTHER)' }),
      ]),
    )
    expect(finance.subcategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'LOANS' }),
        expect.objectContaining({ label: 'MORTGAGE' }),
      ]),
    )
  })

  it('orders yearly drill-down transactions by month and then by day', () => {
    const summary = createSpendingAnalytics('RO', mockProducts, 'year-2026')
    const monthDayKeys = summary.sourceTransactions.map(
      (transaction) => `${transaction.monthKey}-${transaction.day}`,
    )

    expect(monthDayKeys).toEqual([...monthDayKeys].sort((a, b) => b.localeCompare(a)))
  })

  it('recalculates category totals and transactions when a subcategory is filtered out', () => {
    const summary = createSpendingAnalytics('RO', mockProducts, '2026-04')
    const fullDetail = createSpendingCategoryDetail(summary, 'Finance', 'out')
    const withoutMortgage = createSpendingCategoryDetail(
      summary,
      'Finance',
      'out',
      new Set(['MORTGAGE']),
    )
    const mortgageTotal = fullDetail.subcategories.find((item) => item.label === 'MORTGAGE')?.total ?? 0

    expect(withoutMortgage.subcategories.some((item) => item.label === 'MORTGAGE')).toBe(false)
    expect(withoutMortgage.transactions.some((item) => item.pfmSubcategory === 'Mortgage repayment')).toBe(false)
    expect(withoutMortgage.total).toBeCloseTo(fullDetail.total - mortgageTotal, 2)
  })
})
