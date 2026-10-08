export type HuGoalDraft = { title: string; target: string }
export type HuGoalDraftEvent = { type: 'title' | 'target'; value: string }
export function createHuGoalDraft(): HuGoalDraft {
  return { title: 'Skate lessons', target: '30000' }
}
export function huGoalDraftReducer(state: HuGoalDraft, event: HuGoalDraftEvent): HuGoalDraft {
  return event.type === 'title'
    ? { ...state, title: event.value }
    : { ...state, target: event.value.replace(/[^\d]/g, '') }
}
export function selectHuGoalDraft(state: HuGoalDraft) {
  const amount = Number(state.target.replace(/[^\d]/g, ''))
  return { amount, canCreate: state.title.trim().length > 0 && Number.isFinite(amount) && amount > 0 }
}
