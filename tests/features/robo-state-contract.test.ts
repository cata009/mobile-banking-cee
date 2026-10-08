import { describe, expect, it } from 'vitest'
import { createRoboState, roboReducer, getRoboFlowView } from '@/features/investments/robo/flowState'
import { getPortfoliosForStrategy } from '@/features/investments/robo/model'
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures'

describe('Robo canonical state', () => {
  it('requires data confirmation between the intro and risk-profile stages', () => {
    const intro = createRoboState()
    expect(roboReducer(intro, { type: 'navigate', to: 'profile' })).toBe(intro)
    const data = roboReducer(intro, { type: 'navigate', to: 'contact' })
    expect(getRoboFlowView(data).step).toBe('contact')
    const profile = roboReducer(data, { type: 'navigate', to: 'profile' })
    expect(getRoboFlowView(profile).step).toBe('profile')
    expect(roboReducer(profile, { type: 'navigate', to: 'intro' })).toBe(profile)
    expect(getRoboFlowView(roboReducer(profile, { type: 'navigate', to: 'contact' })).step).toBe('contact')
  })

  it('attaches management navigation to an existing goal and rejects stale creation commands', () => {
    const initial = createRoboState()
    expect(roboReducer(initial, { type: 'management-opened', mode: 'settings' })).toBe(initial)
    const detail = createRoboState(INITIAL_CZ_ROBO_GOALS[0]!)
    const settings = roboReducer(detail, { type: 'management-opened', mode: 'settings' })
    expect(settings.kind).toBe('management')
    expect(getRoboFlowView(settings)).toMatchObject({ step: 'goal-detail', managementMode: 'settings' })
    expect(roboReducer(settings, { type: 'portfolio-selected', portfolio: null })).toBe(settings)
    expect(roboReducer(settings, { type: 'management-opened', mode: 'menu' }).kind).toBe('detail')
  })
  it('preserves the entire suspended draft and ignores stale processing completions', () => {
    const initial = createRoboState()
    const draft = roboReducer(initial, { type: 'draft-changed', field: 'goalName', value: 'Future home' })
    const suspended = roboReducer(draft, { type: 'quit-requested' })
    expect(suspended.kind).toBe('creation')
    expect(getRoboFlowView(suspended).goalName).toBe('Future home')
    expect(roboReducer(suspended, { type: 'processing-completed' })).toBe(suspended)
    expect(roboReducer(suspended, { type: 'draft-changed', field: 'goalName', value: 'Stale event' })).toBe(suspended)
    const resumed = roboReducer(suspended, { type: 'quit-resumed' })
    expect(resumed.draft).toBe(draft.draft)
    expect(getRoboFlowView(resumed)).toEqual(getRoboFlowView(draft))
  })

  it('rejects review and signing without the required selection and consent', () => {
    const initial = createRoboState()
    expect(roboReducer(initial, { type: 'navigate', to: 'review' })).toBe(initial)
    expect(roboReducer(initial, { type: 'navigate', to: 'goal-detail' })).toBe(initial)
    const portfolio = getPortfoliosForStrategy('sustainable-balanced')[0]!
    let state = createRoboState()
    for (const to of ['contact', 'profile', 'goal-type', 'goal-name', 'target'] as const)
      state = roboReducer(state, { type: 'navigate', to })
    state = roboReducer(state, { type: 'open-portfolio', from: 'target' })
    state = roboReducer(state, { type: 'portfolio-selected', portfolio })
    state = roboReducer(state, { type: 'navigate', to: 'review' })
    expect(state.kind === 'creation' && state.stage.kind).toBe('review')
    expect(roboReducer(state, { type: 'navigate', to: 'sign' })).toBe(state)
    state = roboReducer(state, { type: 'terms-toggled', accepted: true })
    state = roboReducer(state, { type: 'navigate', to: 'sign' })
    expect(state.kind === 'creation' && state.stage.kind).toBe('sign')
    expect(roboReducer(state, { type: 'processing-completed' })).toBe(state)
    state = roboReducer(state, { type: 'goal-updated', goal: INITIAL_CZ_ROBO_GOALS[0]! })
    state = roboReducer(state, { type: 'navigate', to: 'processing' })
    expect(state.kind).toBe('processing')
    state = roboReducer(state, { type: 'processing-completed' })
    expect(state.kind).toBe('success')
    state = roboReducer(state, { type: 'navigate', to: 'goal-detail' })
    expect(state.kind).toBe('detail')
    expect(roboReducer(state, { type: 'processing-completed' })).toBe(state)
    expect(roboReducer(state, { type: 'goal-updated', goal: INITIAL_CZ_ROBO_GOALS[1]! })).toBe(state)
    expect(roboReducer(state, { type: 'terms-toggled', accepted: false })).toBe(state)
  })

  it('keeps portfolio back origin, consent and the selected horizon through review back navigation', () => {
    const portfolio = getPortfoliosForStrategy('balanced-core')[0]!
    let state = createRoboState()
    for (const to of ['contact', 'profile', 'goal-type', 'goal-name', 'target'] as const)
      state = roboReducer(state, { type: 'navigate', to })
    state = roboReducer(state, { type: 'select-horizon', years: 10 })
    state = roboReducer(state, { type: 'set-manual-horizon', value: '12' })
    expect(getRoboFlowView(state)).toMatchObject({ horizonYears: 0, manualHorizon: '12' })
    state = roboReducer(state, { type: 'open-portfolio', from: 'target' })
    expect(getRoboFlowView(state).previousPortfolioStep).toBe('target')
    state = roboReducer(state, { type: 'portfolio-selected', portfolio })
    state = roboReducer(state, { type: 'navigate', to: 'review' })
    state = roboReducer(state, { type: 'terms-toggled', accepted: true })
    state = roboReducer(state, { type: 'navigate', to: 'portfolio' })
    state = roboReducer(state, { type: 'navigate', to: 'review' })
    expect(getRoboFlowView(state)).toMatchObject({
      termsAccepted: true,
      selectedPortfolio: portfolio,
      manualHorizon: '12',
    })
    state = roboReducer(state, { type: 'select-horizon', years: 5 })
    expect(getRoboFlowView(state)).toMatchObject({ horizonYears: 5, manualHorizon: '' })
  })
})
