import { describe, expect, it } from 'vitest'
import { createRoboManagementState, roboManagementReducer } from '@/features/investments/robo/managementState'

describe('Robo management transitions', () => {
  it('requires review before signing and preserves edited amounts across back navigation', () => {
    let state = createRoboManagementState({ mode: 'add-money', name: 'Home', date: '1 March 2026' })
    expect(roboManagementReducer(state, { type: 'top-up-sign-requested' })).toBe(state)
    state = roboManagementReducer(state, { type: 'amount-changed', value: '5000' })
    state = roboManagementReducer(state, { type: 'top-up-reviewed', valid: true })
    state = roboManagementReducer(state, { type: 'top-up-sign-requested' })
    expect(state.topUp.kind).toBe('sign')
    state = roboManagementReducer(state, { type: 'top-up-back', to: 'review' })
    expect(state.topUp.amount).toBe('5000')
    expect(roboManagementReducer(state, { type: 'top-up-submitted' })).toBe(state)
  })
  it('rejects invalid review and ignores stale sale completions', () => {
    const state = createRoboManagementState({ mode: 'settings', name: 'Home', date: '1 March 2026' })
    expect(roboManagementReducer(state, { type: 'top-up-reviewed', valid: false })).toBe(state)
    expect(roboManagementReducer(state, { type: 'sale-completed' })).toBe(state)
  })
})
