import { describe, expect, it } from 'vitest'
import { mockProducts } from '@/data/products'
import { createSpendingRangeSummary } from '@/data/spendingAnalytics'
import { createEvoAnalyticsState, evoAnalyticsReducer } from '@/features/analytics/evo/state'
import {
  buildExpenseBars,
  buildExpenseBreakdown,
  buildDonutSegments,
  selectEvoAnalyticsView,
} from '@/features/analytics/evo/selectors'
import { selectExpenseSelectionLabels } from '@/features/analytics/evo/labels'

const period = { id: 'month:2026-04', kind: 'month' as const, monthKeys: ['2026-04'], title: 'April', subtitle: '2026' }
const accounts = mockProducts.filter((product) => product.type === 'current_account')
const scope = { id: 'all-accounts', label: 'All accounts', products: accounts }
const summary = createSpendingRangeSummary('CZ', accounts, period.monthKeys, {
  key: period.id,
  label: period.title,
  year: '2026',
  kind: 'month',
})

describe('Evo pure analytics selectors', () => {
  it('counts the rows folded into Other and preserves a single named merchant', () => {
    const rows = ['One', 'Two', 'Three', 'Four'].map((key) => ({ key, label: key, total: 1, transactionCount: 1 }))
    expect(
      selectExpenseSelectionLabels(rows, new Set(['Other', 'One']), new Set(['One', 'Two']), 'categories'),
    ).toMatchObject({ count: 3, singleLabel: null, countedLabel: '3 categories' })
    expect(selectExpenseSelectionLabels(rows, new Set(['Two']), new Set(['One', 'Two']), 'merchants')).toMatchObject({
      count: 1,
      singleLabel: 'Two',
    })
  })
  it('preserves all spending across breakdown rows and donut remainder', () => {
    const transactions = summary.sourceTransactions.filter((transaction) => transaction.amount < 0)
    const rows = buildExpenseBreakdown('categories', transactions, new Map(), summary.currency, 'en-US')
    const total = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
    expect(rows.reduce((sum, row) => sum + row.total, 0)).toBeCloseTo(total)
    expect(buildDonutSegments(rows).reduce((sum, segment) => sum + segment.total, 0)).toBeCloseTo(total)
    expect(rows.map((row) => row.total)).toEqual(rows.map((row) => row.total).sort((a, b) => b - a))
  })
  it('combines category and weekly selection while keeping the original ring visible', () => {
    let state = createEvoAnalyticsState(null, 'expense', period)
    const all = selectEvoAnalyticsView(state, summary, accounts, scope)
    const row = all.donutRows[0]!
    state = evoAnalyticsReducer(state, { type: 'toggle-segment', key: row.key })
    const selected = selectEvoAnalyticsView(state, summary, accounts, scope)
    expect(selected.visibleExpenses.every((transaction) => transaction.pfmCategory === row.category)).toBe(true)
    expect(selected.expenseHeaderLabel).toBe(row.label)
    expect(selected.donutSegments).toEqual(all.donutSegments)
    state = evoAnalyticsReducer(state, { type: 'toggle-bucket', key: 'w1' })
    const weekly = selectEvoAnalyticsView(state, summary, accounts, scope)
    expect(weekly.visibleExpenses.every((transaction) => Number(transaction.day) <= 7)).toBe(true)
    expect(weekly.expenseFilterLabel).toContain('1–7 April 2026')
    expect(weekly.expenseHeaderAmount).toBeCloseTo(
      weekly.visibleExpenses.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    )
  })
  it('builds exact monthly buckets and short trailing weeks', () => {
    const april = buildExpenseBars(period, summary, [])
    expect(april.at(-1)).toMatchObject({ key: 'w5', label: '29–30', weight: 2 / 7, total: 0 })
    const range = { ...period, kind: 'range' as const, monthKeys: ['2026-02', '2026-03', '2026-04'] }
    expect(buildExpenseBars(range, summary, []).map((bar) => [bar.key, bar.label])).toEqual([
      ['2026-02', 'Feb'],
      ['2026-03', 'Mar'],
      ['2026-04', 'Apr'],
    ])
  })
  it('keeps subcategory bubbles while applying their exclusions only to transactions', () => {
    let state = createEvoAnalyticsState(null, 'expense', period)
    const row = selectEvoAnalyticsView(state, summary, accounts, scope).donutRows.find((row) => row.category)!
    state = evoAnalyticsReducer(state, { type: 'open-breakdown', from: 'analysis', direction: 'expense', row })
    const detail = selectEvoAnalyticsView(state, summary, accounts, scope).breakdownDetail!
    const label = detail.subcategories[0]!.label
    state = evoAnalyticsReducer(state, { type: 'toggle-subcategory', label })
    const filtered = selectEvoAnalyticsView(state, summary, accounts, scope).breakdownDetail!
    expect(filtered.subcategories).toEqual(detail.subcategories)
    expect(filtered.transactions.length).toBeLessThan(detail.transactions.length)
    expect(
      evoAnalyticsReducer(state, { type: 'select-period', period: { ...period, id: 'changed' } }).excludedSubcategories
        .size,
    ).toBe(0)
  })
})
