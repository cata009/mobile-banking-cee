import type { SavingGoal } from '@/data/huKidsBanking'
import type { HuGoalContribution } from '@/app/screens/kids/hu/types'
export type HuGoalDetailState = {
  goalId: string | null
  sheet: 'settings' | 'rename' | 'modify' | null
  contributionId: string | null
  renameTitle: string
  modifyTarget: string
}
export type HuGoalDetailEvent =
  | { type: 'sheet'; sheet: HuGoalDetailState['sheet'] }
  | { type: 'contribution'; contributionId: string | null }
  | { type: 'rename-title' | 'modify-target'; value: string }
  | { type: 'goal'; goal: SavingGoal | null }
export function createHuGoalDetailState(goal: SavingGoal | null): HuGoalDetailState {
  return {
    goalId: goal?.id ?? null,
    sheet: null,
    contributionId: null,
    renameTitle: goal?.title ?? '',
    modifyTarget: String(goal?.targetAmount ?? ''),
  }
}
export function huGoalDetailReducer(state: HuGoalDetailState, event: HuGoalDetailEvent): HuGoalDetailState {
  switch (event.type) {
    case 'goal':
      return event.goal?.id === state.goalId ? state : createHuGoalDetailState(event.goal)
    case 'sheet':
      return state.goalId ? { ...state, sheet: event.sheet } : state
    case 'contribution':
      return state.goalId ? { ...state, contributionId: event.contributionId } : state
    case 'rename-title':
      return { ...state, renameTitle: event.value }
    case 'modify-target':
      return { ...state, modifyTarget: event.value.replace(/[^\d]/g, '') }
  }
}
export function selectHuGoalContributions(contributions: readonly HuGoalContribution[]) {
  return {
    scheduledTransfers: contributions.filter((entry) => Boolean(entry.schedule)),
    regularContributions: contributions.filter((entry) => !entry.schedule),
  }
}
