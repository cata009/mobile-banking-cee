export interface ProfileHubState {
  persona: string
  readIds: readonly string[]
  decisions: Readonly<Record<string, 'approved' | 'declined'>>
  invitationActive: boolean
  tokenGeneration: number
}
export type ProfileHubEvent =
  | { type: 'read'; id: string }
  | { type: 'persona'; id: string }
  | { type: 'decision'; id: string; decision: 'approved' | 'declined' }
  | { type: 'leave-promotion' }
  | { type: 'new-token' }

export function initialProfileHubState(): ProfileHubState {
  return {
    persona: 'uci-personal',
    readIds: ['bank-access'],
    decisions: {},
    invitationActive: true,
    tokenGeneration: 0,
  }
}
export function profileHubReducer(state: ProfileHubState, event: ProfileHubEvent): ProfileHubState {
  if (event.type === 'read')
    return state.readIds.includes(event.id) ? state : { ...state, readIds: [...state.readIds, event.id] }
  if (event.type === 'persona') return { ...state, persona: event.id }
  if (event.type === 'decision')
    return {
      ...state,
      readIds: state.readIds.includes(event.id) ? state.readIds : [...state.readIds, event.id],
      decisions: { ...state.decisions, [event.id]: event.decision },
    }
  if (event.type === 'leave-promotion') return { ...state, invitationActive: false }
  return { ...state, tokenGeneration: state.tokenGeneration + 1 }
}
export function profileUnreadCount(state: ProfileHubState, ids: readonly string[]): number {
  return ids.filter((id) => !state.readIds.includes(id)).length
}
export function nextProfileToken(generation: number): string {
  return String((12345678 + generation * 7919) % 100000000).padStart(8, '0')
}
export interface SearchableProfileBranch {
  name: string
  address: string
  type: string
  services: readonly string[]
}
export function filterProfileBranches<T extends SearchableProfileBranch>(
  branches: readonly T[],
  query: string,
  type: string,
  services: readonly string[],
): T[] {
  const term = query.trim().toLocaleLowerCase('it-IT')
  return branches.filter(
    (branch) =>
      `${branch.name} ${branch.address}`.toLocaleLowerCase('it-IT').includes(term) &&
      (type === '' || branch.type === type) &&
      services.every((service) => branch.services.includes(service)),
  )
}

let snapshot = initialProfileHubState()
const listeners = new Set<() => void>()
export const profileHubStore = {
  getSnapshot: () => snapshot,
  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  dispatch: (event: ProfileHubEvent) => {
    const next = profileHubReducer(snapshot, event)
    if (next !== snapshot) {
      snapshot = next
      for (const listener of listeners) listener()
    }
  },
  reset: () => {
    snapshot = initialProfileHubState()
    for (const listener of listeners) listener()
  },
}
