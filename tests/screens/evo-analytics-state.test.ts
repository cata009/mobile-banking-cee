import { describe, expect, it } from 'vitest'
import { createEvoAnalyticsState, evoAnalyticsReducer } from '@/app/screens/analytics/evoAnalyticsState'

describe('Evo analytics state', () => {
  it('opens analysis with clean category filters', () => {
    const dirty = {
      ...createEvoAnalyticsState('scope-a', null, 'period-a'),
      selectedSplitKeys: ['groceries'],
      selectedBucketKey: 'week-1',
      expenseSplitMode: 'merchants' as const,
      expenseChartMode: 'bars' as const,
    }

    expect(evoAnalyticsReducer(dirty, { type: 'open-analysis', direction: 'income' })).toMatchObject({
      view: 'analysis',
      analysisDirection: 'income',
      selectedSplitKeys: [],
      selectedBucketKey: null,
      expenseSplitMode: 'categories',
      expenseChartMode: 'donut',
    })
  })

  it('keeps segment toggles set-like and clears them when split mode changes', () => {
    let state = createEvoAnalyticsState(null, null, 'period-a')
    state = evoAnalyticsReducer(state, { type: 'toggle-segment', key: 'groceries' })
    state = evoAnalyticsReducer(state, { type: 'toggle-segment', key: 'travel' })
    state = evoAnalyticsReducer(state, { type: 'toggle-segment', key: 'groceries' })
    expect(state.selectedSplitKeys).toEqual(['travel'])

    state = evoAnalyticsReducer(state, { type: 'change-split-mode', mode: 'merchants' })
    expect(state).toMatchObject({ expenseSplitMode: 'merchants', selectedSplitKeys: [] })
  })

  it('returns breakdowns to the screen that opened them', () => {
    let state = createEvoAnalyticsState(null, null, 'period-a')
    state = evoAnalyticsReducer(state, { type: 'open-breakdown', from: 'overview', direction: 'expense' })
    expect(state).toMatchObject({ view: 'breakdown', breakdownOrigin: 'overview' })
    expect(evoAnalyticsReducer(state, { type: 'close-breakdown' }).view).toBe('overview')
  })

  it('clears stale bucket selection when the period changes', () => {
    const state = { ...createEvoAnalyticsState(null, null, 'period-a'), selectedBucketKey: 'week-2' }
    expect(evoAnalyticsReducer(state, { type: 'select-period', periodKey: 'period-b' })).toMatchObject({
      selectedPeriodKey: 'period-b',
      selectedBucketKey: null,
    })
  })
})
