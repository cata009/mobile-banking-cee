import type { SavingGoal } from '@/data/huKidsBanking'
import type { HuGoalContribution } from '@/app/screens/kids/hu/types'
import type { ScheduleConfig } from '@/data/schedule'
import { formatScheduleSummary } from '@/app/utils/scheduleFormatting'

export type HuGoalsRoute =
  { kind: 'inactive' | 'overview' | 'create' } | { kind: 'detail' | 'add-money'; goalId: string }
export type HuGoalsState = {
  goals: SavingGoal[]
  contributions: HuGoalContribution[]
  selectedGoalId: string
  route: HuGoalsRoute
}
export type HuGoalsEvent =
  | { type: 'leave' | 'open-overview' | 'open-create' | 'open-add-money' | 'back-detail' }
  | { type: 'open-detail' | 'terminate'; goalId: string }
  | { type: 'create'; goal: SavingGoal }
  | { type: 'rename'; goalId: string; title: string }
  | { type: 'modify'; goalId: string; targetAmount: number }
  | { type: 'delete-contribution'; contributionId: string }
  | { type: 'add-money'; goalId: string; amount: number; contributionId: string; schedule?: ScheduleConfig }

export function createHuGoalsState(goals: SavingGoal[], contributions: HuGoalContribution[]): HuGoalsState {
  return { goals, contributions, selectedGoalId: goals[0]?.id ?? '', route: { kind: 'inactive' } }
}

export function selectHuGoal(state: HuGoalsState): SavingGoal | null {
  return state.goals.find((goal) => goal.id === state.selectedGoalId) ?? state.goals[0] ?? null
}

export function huGoalsReducer(state: HuGoalsState, event: HuGoalsEvent): HuGoalsState {
  switch (event.type) {
    case 'leave':
      return { ...state, route: { kind: 'inactive' } }
    case 'open-overview':
      return { ...state, route: { kind: 'overview' } }
    case 'open-create':
      return { ...state, route: { kind: 'create' } }
    case 'open-detail':
      return state.goals.some((goal) => goal.id === event.goalId)
        ? { ...state, selectedGoalId: event.goalId, route: { kind: 'detail', goalId: event.goalId } }
        : state
    case 'open-add-money':
      return state.route.kind === 'detail'
        ? { ...state, route: { kind: 'add-money', goalId: state.route.goalId } }
        : state
    case 'back-detail':
      return state.route.kind === 'add-money'
        ? { ...state, route: { kind: 'detail', goalId: state.route.goalId } }
        : state
    case 'create':
      if (
        state.route.kind !== 'create' ||
        !event.goal.title.trim() ||
        !Number.isFinite(event.goal.targetAmount) ||
        event.goal.targetAmount <= 0 ||
        state.goals.some((goal) => goal.id === event.goal.id)
      )
        return state
      return {
        ...state,
        goals: [event.goal, ...state.goals],
        selectedGoalId: event.goal.id,
        route: { kind: 'detail', goalId: event.goal.id },
      }
    case 'rename':
      if (state.route.kind !== 'detail' || state.route.goalId !== event.goalId || !event.title.trim()) return state
      return {
        ...state,
        goals: state.goals.map((goal) => (goal.id === event.goalId ? { ...goal, title: event.title } : goal)),
      }
    case 'modify':
      if (
        state.route.kind !== 'detail' ||
        state.route.goalId !== event.goalId ||
        !Number.isFinite(event.targetAmount) ||
        event.targetAmount <= 0
      )
        return state
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === event.goalId
            ? { ...goal, targetAmount: event.targetAmount, savedAmount: Math.min(goal.savedAmount, event.targetAmount) }
            : goal,
        ),
      }
    case 'terminate': {
      if (state.route.kind !== 'detail' || state.route.goalId !== event.goalId) return state
      const goals = state.goals.filter((goal) => goal.id !== event.goalId)
      return {
        ...state,
        goals,
        contributions: state.contributions.filter((entry) => entry.goalId !== event.goalId),
        selectedGoalId: goals[0]?.id ?? '',
        route: { kind: 'overview' },
      }
    }
    case 'delete-contribution':
      if (state.route.kind !== 'detail') return state
      return {
        ...state,
        contributions: state.contributions.filter(
          (entry) => entry.id !== event.contributionId || entry.goalId !== state.selectedGoalId,
        ),
      }
    case 'add-money': {
      if (
        state.route.kind !== 'add-money' ||
        state.route.goalId !== event.goalId ||
        !state.goals.some((goal) => goal.id === event.goalId) ||
        !Number.isFinite(event.amount) ||
        event.amount <= 0 ||
        state.contributions.some((entry) => entry.id === event.contributionId)
      )
        return state
      const contribution: HuGoalContribution = {
        id: event.contributionId,
        goalId: event.goalId,
        title: event.schedule ? 'Scheduled transfer' : 'You added money',
        subtitle: event.schedule ? formatScheduleSummary(event.schedule) : 'Just now',
        amount: event.amount,
        createdAt: 'Just now',
        tone: 'self',
        ...(event.schedule ? { schedule: event.schedule } : {}),
      }
      return {
        ...state,
        goals: event.schedule
          ? state.goals
          : state.goals.map((goal) =>
              goal.id === event.goalId
                ? { ...goal, savedAmount: Math.min(goal.targetAmount, goal.savedAmount + event.amount) }
                : goal,
            ),
        contributions: [contribution, ...state.contributions],
        route: { kind: 'detail', goalId: event.goalId },
      }
    }
  }
}
