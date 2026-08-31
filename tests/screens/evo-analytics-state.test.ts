import { describe, expect, it } from 'vitest'
import { createEvoAnalyticsState, evoAnalyticsReducer } from '@/app/screens/analytics/evoAnalyticsState'
import type { SpendingPeriodSelection } from '@/app/screens/analytics/evoSpendingPeriods'

const APRIL: SpendingPeriodSelection = {
  id: 'month:2026-04',
  kind: 'month',
  monthKeys: ['2026-04'],
  title: 'April',
  subtitle: '2026',
}

const LAST_THREE: SpendingPeriodSelection = {
  id: 'range:2026-02..2026-04',
  kind: 'range',
  monthKeys: ['2026-02', '2026-03', '2026-04'],
  title: 'Last 3 months',
  subtitle: 'Feb – Apr 2026',
}

describe('Evo analytics state', () => {
  it('opens analysis with clean category filters', () => {
    const dirty = {
      ...createEvoAnalyticsState('scope-a', null, APRIL),
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
    let state = createEvoAnalyticsState(null, null, APRIL)
    state = evoAnalyticsReducer(state, { type: 'toggle-segment', key: 'groceries' })
    state = evoAnalyticsReducer(state, { type: 'toggle-segment', key: 'travel' })
    state = evoAnalyticsReducer(state, { type: 'toggle-segment', key: 'groceries' })
    expect(state.selectedSplitKeys).toEqual(['travel'])

    state = evoAnalyticsReducer(state, { type: 'change-split-mode', mode: 'merchants' })
    expect(state).toMatchObject({ expenseSplitMode: 'merchants', selectedSplitKeys: [] })
  })

  it('returns breakdowns to the screen that opened them', () => {
    let state = createEvoAnalyticsState(null, null, APRIL)
    state = evoAnalyticsReducer(state, { type: 'open-breakdown', from: 'overview', direction: 'expense' })
    expect(state).toMatchObject({ view: 'breakdown', breakdownOrigin: 'overview' })
    expect(evoAnalyticsReducer(state, { type: 'close-breakdown' }).view).toBe('overview')
  })

  it('leaves own-account transfers out until they are explicitly switched on', () => {
    const state = createEvoAnalyticsState(null, null, APRIL)
    expect(state.includeOwnTransfers).toBe(false)
    expect(evoAnalyticsReducer(state, { type: 'toggle-own-transfers' }).includeOwnTransfers).toBe(true)
  })

  it('clears stale bucket selection when the period changes', () => {
    const state = { ...createEvoAnalyticsState(null, null, APRIL), selectedBucketKey: 'week-2' }
    expect(evoAnalyticsReducer(state, { type: 'select-period', period: LAST_THREE })).toMatchObject({
      period: LAST_THREE,
      selectedBucketKey: null,
      // Picking a period closes the sheet it was picked in.
      periodSheetOpen: false,
    })
  })
})
