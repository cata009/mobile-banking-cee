import { describe, expect, it } from 'vitest'
import { ROBO_PORTFOLIOS } from '@/app/screens/investments/czFutureRoboAdvisorModel'
import {
  createRoboAdvisorFlowState,
  getPreviousManagementMode,
  getRoboAdvisorBackStep,
  roboAdvisorFlowReducer,
} from '@/app/screens/investments/roboAdvisorFlowState'

describe('Robo Advisor flow state', () => {
  it('creates an empty draft for a new goal and restores an existing goal', () => {
    expect(createRoboAdvisorFlowState()).toMatchObject({
      step: 'intro',
      goalName: '',
      targetAmount: '',
      selectedPortfolio: null,
      managementMode: 'menu',
    })

    const existingGoal = {
      id: 'goal-1',
      name: 'My home',
      purpose: 'Saving for a major purchase',
      status: 'ACTIVE' as const,
      currentInteger: '10 000',
      currentDecimals: '00',
      returnLabel: '+1.00%',
      returnTone: 'positive' as const,
      targetInteger: '250 000',
      targetDecimals: '00',
      progress: 4,
      endDate: '2032',
      portfolioId: ROBO_PORTFOLIOS[0]!.id,
    }

    expect(createRoboAdvisorFlowState(existingGoal)).toMatchObject({
      step: 'goal-detail',
      goalName: 'My home',
      targetAmount: '250000',
      selectedPortfolio: ROBO_PORTFOLIOS[0],
    })
  })

  it('keeps preset and manual horizons mutually exclusive', () => {
    const initial = createRoboAdvisorFlowState()
    const preset = roboAdvisorFlowReducer(initial, { type: 'select-horizon', years: 7 })
    expect(preset).toMatchObject({ horizonYears: 7, manualHorizon: '' })

    const manual = roboAdvisorFlowReducer(preset, { type: 'set-manual-horizon', value: '12' })
    expect(manual).toMatchObject({ horizonYears: 0, manualHorizon: '12' })
  })

  it('remembers the correct origin for projection and portfolio back navigation', () => {
    let state = createRoboAdvisorFlowState()
    state = roboAdvisorFlowReducer(state, { type: 'open-projection', strategyId: 'balanced-core' })
    expect(state).toMatchObject({ step: 'projection', previousStep: 'strategy', selectedStrategyId: 'balanced-core' })
    expect(getRoboAdvisorBackStep(state, false)).toBe('strategy')

    state = roboAdvisorFlowReducer(state, { type: 'open-portfolio', from: 'projection' })
    expect(getRoboAdvisorBackStep(state, false)).toBe('projection')
  })

  it('maps nested management screens back to their owning menu', () => {
    expect(getPreviousManagementMode('partial-withdrawal')).toBe('withdraw')
    expect(getPreviousManagementMode('rename')).toBe('settings')
    expect(getPreviousManagementMode('history')).toBe('menu')
  })
})
