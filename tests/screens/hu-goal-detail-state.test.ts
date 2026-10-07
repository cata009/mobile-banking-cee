import { describe, expect, it } from 'vitest'
import { HU_KIDS_INITIAL_GOALS } from '@/app/screens/kids/hu/data'
import { createHuGoalDetailState, huGoalDetailReducer } from '@/features/kids/hu/goals/detail'

describe('HU goal detail state', () => {
  it('keeps one management sheet open and resets stale goal selections', () => {
    let state = createHuGoalDetailState(HU_KIDS_INITIAL_GOALS[0]!)
    state = huGoalDetailReducer(state, { type: 'sheet', sheet: 'settings' })
    state = huGoalDetailReducer(state, { type: 'sheet', sheet: 'rename' })
    state = huGoalDetailReducer(state, { type: 'contribution', contributionId: 'scheduled' })
    expect(state.sheet).toBe('rename')
    state = huGoalDetailReducer(state, { type: 'goal', goal: HU_KIDS_INITIAL_GOALS[1]! })
    expect(state).toMatchObject({ sheet: null, contributionId: null, renameTitle: HU_KIDS_INITIAL_GOALS[1]!.title })
  })
  it('ignores management requests with no active goal', () => {
    const state = createHuGoalDetailState(null)
    expect(huGoalDetailReducer(state, { type: 'sheet', sheet: 'modify' })).toBe(state)
  })
})
