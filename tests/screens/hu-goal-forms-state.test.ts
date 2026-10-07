import { describe, expect, it } from 'vitest'
import { HU_KIDS_ACCOUNTS } from '@/data/huKidsBanking'
import { createHuAddMoneyState, huAddMoneyReducer, selectHuAddMoney } from '@/features/kids/hu/goals/addMoney'
import { createHuGoalDraft, huGoalDraftReducer, selectHuGoalDraft } from '@/features/kids/hu/goals/createGoal'

describe('HU goal forms', () => {
  it('keeps the published draft and sanitizes the target', () => {
    const state = createHuGoalDraft()
    expect(selectHuGoalDraft(state)).toEqual({ amount: 30000, canCreate: true })
    expect(huGoalDraftReducer(state, { type: 'target', value: 'HUF 50,000' }).target).toBe('50000')
    expect(selectHuGoalDraft({ title: ' ', target: '100' }).canCreate).toBe(false)
  })
  it('evaluates precedence, replaces consecutive operators and guards overdrawn money', () => {
    let state = createHuAddMoneyState()
    for (const token of ['5', '+', '*', '2', '+', '3']) state = huAddMoneyReducer(state, { type: 'token', token })
    expect(state.expression).toBe('5*2+3')
    expect(selectHuAddMoney(state).amount).toBe(13)
    state = huAddMoneyReducer(state, { type: 'evaluate' })
    expect(state.expression).toBe('13')
    expect(selectHuAddMoney({ ...state, expression: String(HU_KIDS_ACCOUNTS[0].balance + 1) }).canSubmit).toBe(false)
  })
  it('rejects stale account picks, infinity and incomplete expressions', () => {
    const state = createHuAddMoneyState()
    expect(huAddMoneyReducer(state, { type: 'account', accountId: 'removed' })).toBe(state)
    expect(selectHuAddMoney({ ...state, expression: '5/0' }).canSubmit).toBe(false)
    expect(selectHuAddMoney({ ...state, expression: '5+' }).canSubmit).toBe(false)
  })
})
