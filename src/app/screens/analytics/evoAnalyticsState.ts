import type { ExpenseDonutCategory } from '@/app/components/analytics/ExpenseDonutChart'

export type ExpenseChartMode = 'donut' | 'bars'
export type AnalyticsDirection = 'expense' | 'income'
export type ExpenseSplitMode = 'categories' | 'merchants' | 'currencies'
export type AnalyticsView = 'overview' | 'analysis' | 'breakdown'

export type EvoAnalyticsState = {
  selectedScopeId: string
  view: AnalyticsView
  analysisDirection: AnalyticsDirection
  breakdownOrigin: Exclude<AnalyticsView, 'breakdown'>
  scopeSheetOpen: boolean
  expenseSplitMode: ExpenseSplitMode
  selectedSplitKeys: ExpenseDonutCategory[]
  expenseChartMode: ExpenseChartMode
  selectedBucketKey: string | null
  selectedPeriodKey: string
}

type SetFieldAction = {
  [Field in keyof EvoAnalyticsState]: {
    type: 'set-field'
    field: Field
    value: EvoAnalyticsState[Field]
  }
}[keyof EvoAnalyticsState]

export type EvoAnalyticsAction =
  | SetFieldAction
  | { type: 'open-analysis'; direction: AnalyticsDirection }
  | {
      type: 'open-breakdown'
      from: Exclude<AnalyticsView, 'breakdown'>
      direction: AnalyticsDirection
    }
  | { type: 'close-breakdown' }
  | { type: 'back-overview' }
  | { type: 'toggle-segment'; key: ExpenseDonutCategory }
  | { type: 'clear-selection' }
  | { type: 'change-split-mode'; mode: ExpenseSplitMode }
  | { type: 'toggle-bucket'; key: string }
  | { type: 'select-period'; periodKey: string }

export function createEvoAnalyticsState(
  initialScopeId: string | null | undefined,
  initialDirection: AnalyticsDirection | null | undefined,
  initialPeriodKey: string,
): EvoAnalyticsState {
  return {
    selectedScopeId: initialScopeId ?? 'all-accounts',
    view: initialDirection ? 'analysis' : 'overview',
    analysisDirection: initialDirection ?? 'expense',
    breakdownOrigin: 'analysis',
    scopeSheetOpen: false,
    expenseSplitMode: 'categories',
    selectedSplitKeys: [],
    expenseChartMode: 'donut',
    selectedBucketKey: null,
    selectedPeriodKey: initialPeriodKey,
  }
}

export function evoAnalyticsReducer(state: EvoAnalyticsState, action: EvoAnalyticsAction): EvoAnalyticsState {
  switch (action.type) {
    case 'set-field':
      return { ...state, [action.field]: action.value }
    case 'open-analysis':
      return {
        ...state,
        view: 'analysis',
        analysisDirection: action.direction,
        expenseSplitMode: 'categories',
        selectedSplitKeys: [],
        selectedBucketKey: null,
        expenseChartMode: 'donut',
      }
    case 'open-breakdown':
      return {
        ...state,
        view: 'breakdown',
        breakdownOrigin: action.from,
        analysisDirection: action.from === 'overview' ? action.direction : state.analysisDirection,
        selectedBucketKey: action.from === 'overview' ? null : state.selectedBucketKey,
      }
    case 'close-breakdown':
      return { ...state, view: state.breakdownOrigin }
    case 'back-overview':
      return { ...state, view: 'overview', selectedBucketKey: null }
    case 'toggle-segment':
      return {
        ...state,
        selectedSplitKeys: state.selectedSplitKeys.includes(action.key)
          ? state.selectedSplitKeys.filter((entry) => entry !== action.key)
          : [...state.selectedSplitKeys, action.key],
      }
    case 'clear-selection':
      return { ...state, selectedSplitKeys: [], selectedBucketKey: null }
    case 'change-split-mode':
      return { ...state, expenseSplitMode: action.mode, selectedSplitKeys: [] }
    case 'toggle-bucket':
      return {
        ...state,
        selectedBucketKey: state.selectedBucketKey === action.key ? null : action.key,
      }
    case 'select-period':
      return { ...state, selectedPeriodKey: action.periodKey, selectedBucketKey: null }
  }
}
