import type { RoboAdvisorManagementMode } from './legacyFlowState'
import type { RoboExistingGoal, RoboFundingMethod } from './types'
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'

type TopUpDraft = { amount: string; monthlyAmount: string; method: RoboFundingMethod; date: string }
type TopUp = TopUpDraft & ({ kind: 'amount' } | { kind: 'review' } | { kind: 'sign' } | { kind: 'success' })
type Withdrawal =
  | { kind: 'idle'; productId: string | null }
  | { kind: 'selling'; productId: string; security: InvestmentCatalogSecurity }
// Draft slots are intentionally cached across management modes. Only the active
// top-up/sale discriminant accepts stage transitions; switching settings does not
// discard a rename, amount, history tab, or the selected withdrawal product.
export type RoboManagementState = {
  mode: RoboAdvisorManagementMode
  initialFundingDate: string
  topUp: TopUp
  withdrawal: Withdrawal
  renameName: string
  historyTab: 'transactions' | 'orders'
  recurringDatePickerOpen: boolean
  cashAccountSheetOpen: boolean
}
export type RoboManagementSeed = {
  mode: RoboAdvisorManagementMode
  name: string
  date: string
  goal?: RoboExistingGoal
}
export type RoboManagementEvent =
  | { type: 'mode-entered'; seed: RoboManagementSeed }
  | { type: 'amount-changed' | 'monthly-amount-changed' | 'date-changed' | 'rename-changed'; value: string }
  | { type: 'method-changed'; method: RoboFundingMethod }
  | { type: 'top-up-reviewed'; valid: boolean }
  | { type: 'top-up-sign-requested' | 'top-up-submitted' }
  | { type: 'top-up-back'; to: 'amount' | 'review' }
  | { type: 'sale-opened'; productId: string; security: InvestmentCatalogSecurity }
  | { type: 'sale-cancelled' | 'sale-completed' }
  | { type: 'history-tab-changed'; tab: 'transactions' | 'orders' }
  | { type: 'date-picker-toggled' | 'account-sheet-toggled'; open: boolean }

export function createRoboManagementState(seed: RoboManagementSeed): RoboManagementState {
  return {
    mode: seed.mode,
    initialFundingDate: seed.date,
    topUp: {
      kind: 'amount',
      amount: seed.mode === 'monthly' ? '2000' : '10000',
      monthlyAmount: String(seed.goal?.recurringContribution?.amount ?? 2000),
      method: seed.goal?.recurringContribution ? 'combined' : 'one-off',
      date: seed.date,
    },
    withdrawal: { kind: 'idle', productId: null },
    renameName: seed.name,
    historyTab: !seed.goal?.transactions?.length && seed.goal?.orders?.length ? 'orders' : 'transactions',
    recurringDatePickerOpen: false,
    cashAccountSheetOpen: false,
  }
}

export function roboManagementReducer(state: RoboManagementState, event: RoboManagementEvent): RoboManagementState {
  switch (event.type) {
    case 'mode-entered': {
      const seed = createRoboManagementState(event.seed)
      return {
        ...state,
        mode: event.seed.mode,
        initialFundingDate: event.seed.date,
        topUp: event.seed.mode === 'add-money' ? { ...seed.topUp, amount: state.topUp.amount } : state.topUp,
      }
    }
    case 'amount-changed':
      return { ...state, topUp: { ...state.topUp, amount: event.value } }
    case 'monthly-amount-changed':
      return { ...state, topUp: { ...state.topUp, monthlyAmount: event.value } }
    case 'date-changed':
      return { ...state, topUp: { ...state.topUp, date: event.value } }
    case 'rename-changed':
      return { ...state, renameName: event.value }
    case 'method-changed':
      return state.mode === 'add-money' && state.topUp.kind === 'amount'
        ? { ...state, topUp: { ...state.topUp, method: event.method } }
        : state
    case 'top-up-reviewed':
      return state.mode === 'add-money' && state.topUp.kind === 'amount' && event.valid
        ? { ...state, topUp: { ...state.topUp, kind: 'review' } }
        : state
    case 'top-up-sign-requested':
      return state.mode === 'add-money' && state.topUp.kind === 'review'
        ? { ...state, topUp: { ...state.topUp, kind: 'sign' } }
        : state
    case 'top-up-submitted':
      return state.mode === 'add-money' && state.topUp.kind === 'sign'
        ? { ...state, topUp: { ...state.topUp, kind: 'success' } }
        : state
    case 'top-up-back':
      return state.mode === 'add-money' &&
        ((state.topUp.kind === 'sign' && event.to === 'review') ||
          (state.topUp.kind === 'review' && event.to === 'amount'))
        ? { ...state, topUp: { ...state.topUp, kind: event.to } }
        : state
    case 'sale-opened':
      return state.mode === 'withdraw'
        ? { ...state, withdrawal: { kind: 'selling', productId: event.productId, security: event.security } }
        : state
    case 'sale-cancelled':
      return state.withdrawal.kind === 'selling'
        ? { ...state, withdrawal: { kind: 'idle', productId: state.withdrawal.productId } }
        : state
    case 'sale-completed':
      return state.withdrawal.kind === 'selling' ? { ...state, withdrawal: { kind: 'idle', productId: null } } : state
    case 'history-tab-changed':
      return { ...state, historyTab: event.tab }
    case 'date-picker-toggled':
      return { ...state, recurringDatePickerOpen: event.open }
    case 'account-sheet-toggled':
      return { ...state, cashAccountSheetOpen: event.open }
  }
}
