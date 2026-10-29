import {
  changeVirtualCardPicture,
  issueVirtualCard,
  readVirtualCards,
  type VirtualCardDesign,
  type VirtualCardTier,
  type VirtualCardScope,
  type VirtualCardState,
} from '@/features/cards/virtual-card/model';
import type { CurrentAccount } from '@/data/products';

let state: VirtualCardState = {};
const listeners = new Set<() => void>();
const publish = (next: VirtualCardState) => {
  if (next === state) return;
  state = next;
  listeners.forEach(listener => listener());
};
export const nativeVirtualCards = {
  read: (scope: VirtualCardScope) => readVirtualCards(state, scope),
  issue(
    scope: VirtualCardScope,
    account: CurrentAccount,
    design: VirtualCardDesign,
    tier: VirtualCardTier,
  ) {
    const before = readVirtualCards(state, scope);
    const next = issueVirtualCard(state, scope, {
      account,
      design,
      tier,
      termsAccepted: true,
    });
    const after = readVirtualCards(next, scope);
    publish(next);
    return after.length > before.length ? after[after.length - 1]!.id : null;
  },
  change(scope: VirtualCardScope, id: string, design: VirtualCardDesign) {
    const next = changeVirtualCardPicture(state, scope, id, design);
    const changed = next !== state;
    publish(next);
    return changed;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
