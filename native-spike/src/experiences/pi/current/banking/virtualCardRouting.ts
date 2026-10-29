import type { CurrentRoute } from '../contracts';

/** Issued demo cards are session-local and are not in the shell's static product registry. */
export function isLocalVirtualCardRoute(
  route: CurrentRoute,
  cards: readonly { id: string }[],
) {
  if (!['card', 'card-info', 'card-options'].includes(route.screen))
    return false;
  const id = route.params?.productId ?? route.params?.cardId;
  return Boolean(id && cards.some(card => card.id === id));
}
