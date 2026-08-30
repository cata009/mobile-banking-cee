import {
  ROBO_PORTFOLIOS,
  type RoboExistingGoal,
  type RoboFundingMethod,
  type RoboPortfolio,
  type RoboStrategy,
} from './czFutureRoboAdvisorModel'

export type RoboAdvisorCreationStep =
  | 'intro'
  | 'contact'
  | 'profile'
  | 'goal-type'
  | 'goal-name'
  | 'target'
  | 'horizon'
  | 'funding-method'
  | 'funding-setup'
  | 'strategy'
  | 'projection'
  | 'portfolio'
  | 'review'
  | 'sign'
  | 'processing'
  | 'success'
  | 'goal-detail'

export type RoboAdvisorManagementMode =
  | 'menu'
  | 'add-money'
  | 'monthly'
  | 'withdraw'
  | 'partial-withdrawal'
  | 'full-withdrawal'
  | 'history'
  | 'settings'
  | 'rename'
  | 'target'
  | 'horizon'
  | 'close'

export type RoboAdvisorFlowState = {
  step: RoboAdvisorCreationStep
  previousStep: RoboAdvisorCreationStep
  previousPortfolioStep: RoboAdvisorCreationStep
  goalType: string
  goalName: string
  targetAmount: string
  horizonYears: number
  manualHorizon: string
  fundingMethod: RoboFundingMethod | null
  initialAmount: string
  monthlyContribution: string
  startDate: string
  selectedStrategyId: RoboStrategy['id']
  selectedPortfolio: RoboPortfolio | null
  termsAccepted: boolean
  managementMode: RoboAdvisorManagementMode
}

type SettableRoboAdvisorField = keyof RoboAdvisorFlowState

type SetFieldAction = {
  [Field in SettableRoboAdvisorField]: {
    type: 'set-field'
    field: Field
    value: RoboAdvisorFlowState[Field]
  }
}[SettableRoboAdvisorField]

export type RoboAdvisorFlowAction =
  | SetFieldAction
  | { type: 'select-horizon'; years: number }
  | { type: 'set-manual-horizon'; value: string }
  | { type: 'open-projection'; strategyId: RoboStrategy['id'] }
  | { type: 'open-portfolio'; from: 'strategy' | 'projection' }

export function createRoboAdvisorFlowState(initialGoal?: RoboExistingGoal): RoboAdvisorFlowState {
  const initialPortfolio = initialGoal
    ? (ROBO_PORTFOLIOS.find((portfolio) => portfolio.id === initialGoal.portfolioId) ?? ROBO_PORTFOLIOS[0]!)
    : null

  return {
    step: initialGoal ? 'goal-detail' : 'intro',
    previousStep: 'strategy',
    previousPortfolioStep: 'strategy',
    goalType: '',
    goalName: initialGoal?.name ?? '',
    targetAmount: initialGoal?.targetInteger.replace(/\s/g, '') ?? '',
    horizonYears: 0,
    manualHorizon: '',
    fundingMethod: null,
    initialAmount: '',
    monthlyContribution: '',
    startDate: '1 March 2026',
    selectedStrategyId: initialPortfolio?.strategyId ?? 'sustainable-balanced',
    selectedPortfolio: initialPortfolio,
    termsAccepted: false,
    managementMode: 'menu',
  }
}

export function roboAdvisorFlowReducer(
  state: RoboAdvisorFlowState,
  action: RoboAdvisorFlowAction,
): RoboAdvisorFlowState {
  switch (action.type) {
    case 'set-field':
      return { ...state, [action.field]: action.value }
    case 'select-horizon':
      return { ...state, horizonYears: action.years, manualHorizon: '' }
    case 'set-manual-horizon':
      return { ...state, horizonYears: 0, manualHorizon: action.value }
    case 'open-projection':
      return {
        ...state,
        step: 'projection',
        previousStep: 'strategy',
        selectedStrategyId: action.strategyId,
      }
    case 'open-portfolio':
      return { ...state, step: 'portfolio', previousPortfolioStep: action.from }
  }
}

export function getRoboAdvisorBackStep(
  state: Pick<RoboAdvisorFlowState, 'step' | 'previousStep' | 'previousPortfolioStep'>,
  requiresContactValidation: boolean,
): RoboAdvisorCreationStep | null {
  const backMap: Partial<Record<RoboAdvisorCreationStep, RoboAdvisorCreationStep>> = {
    contact: 'intro',
    profile: requiresContactValidation ? 'contact' : 'intro',
    'goal-type': 'profile',
    'goal-name': 'goal-type',
    target: 'goal-name',
    horizon: 'target',
    'funding-method': 'horizon',
    'funding-setup': 'funding-method',
    strategy: 'funding-setup',
    projection: state.previousStep,
    portfolio: state.previousPortfolioStep,
    review: 'portfolio',
    sign: 'review',
    processing: 'sign',
    'goal-detail': 'success',
  }

  return backMap[state.step] ?? null
}

export function getPreviousManagementMode(mode: RoboAdvisorManagementMode): RoboAdvisorManagementMode {
  if (mode === 'partial-withdrawal' || mode === 'full-withdrawal') return 'withdraw'
  if (mode === 'rename' || mode === 'target' || mode === 'horizon' || mode === 'monthly' || mode === 'close') {
    return 'settings'
  }
  return 'menu'
}
