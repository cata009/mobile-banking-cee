import {
  isCardBlocked,
  setCardBlocked,
  type BlockedCards,
} from '@/features/cards/block/model';
let state: BlockedCards = {};
const listeners = new Set<() => void>();
export function subscribeBlockedCards(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function blockedCardsSnapshot() {
  return state;
}
export function changeCardBlocked(
  country: string,
  cardId: string,
  blocked: boolean,
) {
  state = setCardBlocked(state, country, cardId, blocked);
  listeners.forEach(listener => listener());
}
export { isCardBlocked };
