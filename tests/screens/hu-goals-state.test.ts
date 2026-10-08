import { describe, expect, it } from 'vitest'
import { HU_KIDS_INITIAL_GOALS } from '@/app/screens/kids/hu/data'
import { createHuGoalsState, huGoalsReducer } from '@/features/kids/hu/goals/state'

describe('HU goal transitions', () => {
  it('ignores selection of a goal that no longer exists', () => {
    const state = createHuGoalsState(HU_KIDS_INITIAL_GOALS, [])
    expect(huGoalsReducer(state, { type: 'open-detail', goalId: 'missing' })).toBe(state)
  })
  it('adds money once, caps progress and ignores stale submissions after leaving add money', () => {
    const goal = HU_KIDS_INITIAL_GOALS[0]!
    let state = createHuGoalsState([goal], [])
    state = huGoalsReducer(state, { type: 'open-detail', goalId: goal.id })
    state = huGoalsReducer(state, { type: 'open-add-money' })
    const action = { type: 'add-money' as const, goalId: goal.id, amount: goal.targetAmount, contributionId: 'new' }
    state = huGoalsReducer(state, action)
    expect(state.goals[0]?.savedAmount).toBe(goal.targetAmount)
    expect(state.contributions).toHaveLength(1)
    expect(state.route).toEqual({ kind: 'detail', goalId: goal.id })
    expect(huGoalsReducer(state, action)).toBe(state)
  })
  it('records scheduled money without changing saved money and removes schedules with their goal', () => {
    const goal = HU_KIDS_INITIAL_GOALS[0]!
    let state = createHuGoalsState([goal], [])
    state = huGoalsReducer(state, { type: 'open-detail', goalId: goal.id })
    state = huGoalsReducer(state, { type: 'open-add-money' })
    state = huGoalsReducer(state, {
      type: 'add-money',
      goalId: goal.id,
      amount: 1000,
      contributionId: 'scheduled',
      schedule: { startDate: '2026-10-07', repeat: 'weekly', endsOn: { type: 'never' } },
    })
    expect(state.goals[0]?.savedAmount).toBe(goal.savedAmount)
    expect(state.contributions[0]?.subtitle).toContain('Weekly')
    state = huGoalsReducer(state, { type: 'terminate', goalId: goal.id })
    expect(state.goals).toEqual([])
    expect(state.contributions).toEqual([])
    expect(state.route).toEqual({ kind: 'overview' })
  })
})
