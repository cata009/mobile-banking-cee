import {
  createRoboAdvisorFlowState,
  type RoboAdvisorFlowState,
  type RoboAdvisorCreationStep,
  type RoboAdvisorManagementMode,
} from './legacyFlowState'
import { getRoboPortfolioForGoal, type RoboExistingGoal, type RoboPortfolio, type RoboStrategy } from './model'
import type { RoboDemoClock } from './demoClock'

type Draft = Omit<
  RoboAdvisorFlowState,
  'step' | 'previousStep' | 'previousPortfolioStep' | 'managementMode' | 'termsAccepted' | 'selectedPortfolio'
>
type InputStage = Exclude<RoboAdvisorCreationStep, 'review' | 'sign' | 'processing' | 'success' | 'goal-detail'>
type CreationStage =
  | { kind: InputStage; portfolio: RoboPortfolio | null }
  | { kind: 'review'; portfolio: RoboPortfolio; termsAccepted: boolean }
  | { kind: 'sign'; portfolio: RoboPortfolio; termsAccepted: true }
type Common = {
  // Incoming goals stay prop-owned until hydration or a local update publishes
  // a working goal. Keep this independent of the current navigation stage.
  goalSource: 'incoming' | 'local'
  reviewConsent: boolean
  draft: Draft
  previousStep: RoboAdvisorCreationStep
  previousPortfolioStep: RoboAdvisorCreationStep
}
export type RoboState = Common &
  (
    | { kind: 'creation'; stage: CreationStage; quitOpen: boolean; publishedGoal: RoboExistingGoal | null }
    | { kind: 'processing' | 'success'; goal: RoboExistingGoal; portfolio: RoboPortfolio }
    | { kind: 'detail'; goal: RoboExistingGoal; portfolio: RoboPortfolio; management: 'menu' }
    | {
        kind: 'management'
        goal: RoboExistingGoal
        portfolio: RoboPortfolio
        management: Exclude<RoboAdvisorManagementMode, 'menu'>
      }
  )
type DraftChanged = {
  [Field in keyof Draft]: { type: 'draft-changed'; field: Field; value: Draft[Field] }
}[keyof Draft]
export type RoboEvent =
  | DraftChanged
  | { type: 'navigate'; to: RoboAdvisorCreationStep }
  | { type: 'select-horizon'; years: number }
  | { type: 'set-manual-horizon'; value: string }
  | { type: 'open-portfolio'; from: 'funding-setup' | 'target' | 'strategy' | 'projection' }
  | { type: 'open-projection'; strategyId: RoboStrategy['id'] }
  | { type: 'portfolio-selected'; portfolio: RoboPortfolio | null }
  | { type: 'terms-toggled'; accepted: boolean }
  | { type: 'goal-updated'; goal: RoboExistingGoal }
  | { type: 'incoming-goal-changed'; goal: RoboExistingGoal }
  | { type: 'management-opened'; mode: RoboAdvisorManagementMode }
  | { type: 'processing-completed' }
  | { type: 'quit-requested' | 'quit-resumed' }

export function createRoboState(goal?: RoboExistingGoal, clock?: RoboDemoClock): RoboState {
  const {
    step: _step,
    previousStep,
    previousPortfolioStep,
    managementMode: _management,
    termsAccepted: _terms,
    selectedPortfolio,
    ...draft
  } = createRoboAdvisorFlowState(goal, clock)
  const common = { draft, previousStep, previousPortfolioStep, reviewConsent: false, goalSource: 'incoming' as const }
  return goal && selectedPortfolio
    ? { ...common, kind: 'detail', goal, portfolio: selectedPortfolio, management: 'menu' }
    : { ...common, kind: 'creation', stage: { kind: 'intro', portfolio: null }, quitOpen: false, publishedGoal: null }
}

export function getRoboFlowView(state: RoboState): RoboAdvisorFlowState {
  return {
    ...state.draft,
    previousStep: state.previousStep,
    previousPortfolioStep: state.previousPortfolioStep,
    step:
      state.kind === 'creation'
        ? state.stage.kind
        : state.kind === 'detail' || state.kind === 'management'
          ? 'goal-detail'
          : state.kind,
    selectedPortfolio: state.kind === 'creation' ? state.stage.portfolio : state.portfolio,
    termsAccepted: state.reviewConsent,
    managementMode: state.kind === 'detail' || state.kind === 'management' ? state.management : 'menu',
  }
}

const destinations: Partial<Record<RoboAdvisorCreationStep, readonly RoboAdvisorCreationStep[]>> = {
  intro: ['contact'],
  contact: ['intro', 'profile'],
  profile: ['contact', 'goal-type'],
  'goal-type': ['profile', 'goal-name'],
  'goal-name': ['goal-type', 'target'],
  target: ['goal-name', 'portfolio', 'funding-setup', 'strategy'],
  'funding-setup': ['target', 'portfolio'],
  strategy: ['target', 'projection', 'portfolio'],
  projection: ['strategy', 'portfolio'],
  portfolio: ['target', 'funding-setup', 'strategy', 'projection', 'review'],
  review: ['portfolio', 'sign'],
  sign: ['review', 'processing'],
}

export function roboReducer(state: RoboState, event: RoboEvent): RoboState {
  if (state.kind === 'creation' && state.quitOpen && event.type !== 'quit-resumed' && event.type !== 'quit-requested')
    return state
  if (event.type === 'draft-changed') return { ...state, draft: { ...state.draft, [event.field]: event.value } }
  if (event.type === 'select-horizon')
    return { ...state, draft: { ...state.draft, horizonYears: event.years, manualHorizon: '' } }
  if (event.type === 'set-manual-horizon')
    return { ...state, draft: { ...state.draft, horizonYears: 0, manualHorizon: event.value } }
  if (event.type === 'incoming-goal-changed') {
    if (state.goalSource !== 'incoming' || (state.kind !== 'detail' && state.kind !== 'management')) return state
    return { ...state, goal: event.goal, portfolio: getRoboPortfolioForGoal(event.goal) ?? state.portfolio }
  }
  if (event.type === 'goal-updated') {
    if (state.kind === 'creation')
      return state.stage.kind === 'sign' ? { ...state, goalSource: 'local', publishedGoal: event.goal } : state
    if (state.goal.id !== event.goal.id) return state
    return {
      ...state,
      goalSource: 'local',
      goal: event.goal,
      portfolio: getRoboPortfolioForGoal(event.goal) ?? state.portfolio,
    }
  }
  if (event.type === 'management-opened') {
    if (state.kind !== 'detail' && state.kind !== 'management') return state
    return event.mode === 'menu'
      ? { ...state, kind: 'detail', management: 'menu' }
      : { ...state, kind: 'management', management: event.mode }
  }
  if (event.type === 'processing-completed') return state.kind === 'processing' ? { ...state, kind: 'success' } : state
  if (event.type === 'quit-requested' || event.type === 'quit-resumed')
    return state.kind === 'creation' ? { ...state, quitOpen: event.type === 'quit-requested' } : state
  if (event.type === 'navigate' && state.kind === 'success' && event.to === 'goal-detail')
    return { ...state, kind: 'detail', management: 'menu' }
  if (state.kind !== 'creation' || state.quitOpen) return state
  if (event.type === 'portfolio-selected')
    return state.stage.kind === 'portfolio'
      ? { ...state, stage: { ...state.stage, portfolio: event.portfolio } }
      : state
  if (event.type === 'terms-toggled')
    return state.stage.kind === 'review'
      ? { ...state, reviewConsent: event.accepted, stage: { ...state.stage, termsAccepted: event.accepted } }
      : state
  if (event.type === 'open-projection')
    return state.stage.kind === 'strategy'
      ? {
          ...state,
          draft: { ...state.draft, selectedStrategyId: event.strategyId },
          stage: { kind: 'projection', portfolio: state.stage.portfolio },
          previousStep: 'strategy',
        }
      : state
  if (event.type === 'open-portfolio')
    return state.stage.kind === event.from
      ? { ...state, stage: { kind: 'portfolio', portfolio: state.stage.portfolio }, previousPortfolioStep: event.from }
      : state
  if (event.type !== 'navigate' || !destinations[state.stage.kind]?.includes(event.to)) return state
  const portfolio = state.stage.portfolio
  if (event.to === 'review')
    return portfolio ? { ...state, stage: { kind: 'review', portfolio, termsAccepted: state.reviewConsent } } : state
  if (event.to === 'sign')
    return state.stage.kind === 'review' && state.stage.termsAccepted
      ? { ...state, stage: { kind: 'sign', portfolio: state.stage.portfolio, termsAccepted: true } }
      : state
  if (event.to === 'processing')
    return portfolio && state.publishedGoal
      ? { ...state, kind: 'processing', goal: state.publishedGoal, portfolio }
      : state
  if (event.to === 'success' || event.to === 'goal-detail') return state
  return { ...state, stage: { kind: event.to, portfolio } }
}
