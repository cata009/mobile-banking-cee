import type {
  SearchEntry,
  SearchTarget,
} from '@/features/search/mobileFirstSearch';
import { resolveItalySearchDestination } from '@/universal/navigation/italySearchJourney';
import type { ItalyNativeIntent } from './contracts';

export type NativeItalyRoute = { id: number } & (
  | {
      screen: 'home';
      category?: Extract<SearchTarget, { kind: 'category' }>['category'];
    }
  | { screen: 'search' }
  | { screen: 'operations' }
  | { screen: 'transfer'; accountNumber: string }
  | {
      screen: 'destination';
      target: SearchTarget;
      intent?: ItalyNativeIntent;
      entry?: SearchEntry;
    }
);
export interface NativeItalyNavigation {
  current: NativeItalyRoute;
  backStack: NativeItalyRoute[];
  query: string;
  nextId: number;
}
export const initialItalyNavigation: NativeItalyNavigation = {
  current: { id: 0, screen: 'home' },
  backStack: [],
  query: '',
  nextId: 1,
};
type NewRoute = NativeItalyRoute extends infer R
  ? R extends NativeItalyRoute
    ? Omit<R, 'id'>
    : never
  : never;
const push = (
  state: NativeItalyNavigation,
  route: NewRoute,
  reset = false,
): NativeItalyNavigation => ({
  ...state,
  current: { ...route, id: state.nextId } as NativeItalyRoute,
  backStack: reset
    ? [{ id: 0, screen: 'home' }]
    : [...state.backStack, state.current],
  nextId: state.nextId + 1,
});
export function navigateItalyTarget(
  state: NativeItalyNavigation,
  target: SearchTarget,
  reset = false,
) {
  if (target.kind === 'category')
    return {
      ...state,
      current: {
        id: state.nextId,
        screen: 'home',
        category: target.category,
      } as NativeItalyRoute,
      backStack: [],
      nextId: state.nextId + 1,
    };
  return push(state, { screen: 'destination', target }, reset);
}
export function selectNativeItalySearchResult(
  state: NativeItalyNavigation,
  entry: SearchEntry,
  entries: readonly SearchEntry[],
) {
  const resolved = resolveItalySearchDestination(entry, entries);
  if (resolved.status !== 'resolved') return state;
  const next = navigateItalyTarget(
    state,
    resolved.entry.target,
    resolved.destination.returnTo === 'home',
  );
  return next.current.screen === 'destination'
    ? { ...next, current: { ...next.current, entry: resolved.entry } }
    : next;
}
export function openItalySearch(state: NativeItalyNavigation) {
  return push(state, { screen: 'search' });
}
export function navigateItalyIntent(
  state: NativeItalyNavigation,
  intent: ItalyNativeIntent,
) {
  if (intent.kind === 'operations')
    return push(state, { screen: 'operations' });
  if (intent.kind === 'account-action' && intent.action === 'transfer')
    return push(state, {
      screen: 'transfer',
      accountNumber: intent.accountNumber,
    });
  const target: SearchTarget =
    intent.kind === 'account-action'
      ? { kind: 'account', accountNumber: intent.accountNumber }
      : intent.kind === 'card-action'
      ? { kind: 'card', cardId: intent.cardId }
      : intent.kind === 'category-hub'
      ? { kind: 'category', category: intent.category }
      : intent.kind === 'insurance-action'
      ? { kind: 'category', category: 'Polizze assicurative' }
      : intent.loanId
      ? { kind: 'loan', loanId: intent.loanId }
      : { kind: 'category', category: 'Mutui e Prestiti' };
  return push(state, { screen: 'destination', target, intent });
}
export function backItalyNavigation(
  state: NativeItalyNavigation,
): NativeItalyNavigation {
  const previous = state.backStack.at(-1);
  if (!previous) return initialItalyNavigation;
  // Source Search remounts with the saved query, resetting category filters to Tutto.
  return {
    ...state,
    current:
      previous.screen === 'search'
        ? { ...previous, id: state.nextId }
        : previous,
    backStack: state.backStack.slice(0, -1),
    nextId: previous.screen === 'search' ? state.nextId + 1 : state.nextId,
  };
}
