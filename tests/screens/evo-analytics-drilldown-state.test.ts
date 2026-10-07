import { describe, expect, it } from 'vitest'
import { createEvoAnalyticsState, evoAnalyticsReducer } from '@/app/screens/analytics/evoAnalyticsState'
const period = { id: 'month:2026-04', kind: 'month' as const, monthKeys: ['2026-04'], title: 'April', subtitle: '2026' }
describe('Evo drill-down ownership', () => {
  it('retains subcategory exclusions when the current period is selected again', () => {
    const state = { ...createEvoAnalyticsState(null, null, period), excludedSubcategories: new Set(['Restaurants']) }
    expect(evoAnalyticsReducer(state, { type: 'select-period', period }).excludedSubcategories).toBe(
      state.excludedSubcategories,
    )
  })
  it('ignores an obsolete breakdown back event after opening another analysis', () => {
    const state = evoAnalyticsReducer(createEvoAnalyticsState(null, null, period), {
      type: 'open-analysis',
      direction: 'income',
    })
    expect(evoAnalyticsReducer(state, { type: 'close-breakdown' })).toBe(state)
  })
  it('initializes drill-down and subcategory exclusions within the reducer', () => {
    expect(createEvoAnalyticsState(null, null, period)).toMatchObject({
      openBreakdownRow: null,
      excludedSubcategories: new Set(),
    })
  })
})
