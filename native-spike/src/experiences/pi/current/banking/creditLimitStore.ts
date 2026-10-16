import {
  readCreditLimitOverrides,
  recordCreditLimitOverride,
  type CreditLimitState,
} from '@/features/cards/credit-limit/model';
import type { BankingScenarioId, CountryId } from '@/app/state/demoTypes';

type Scope = { country: CountryId; bankingScenario: BankingScenarioId };
let state: CreditLimitState = {};
const listeners = new Set<() => void>();

/** App-session state; the shared Source model owns scope keys and financial validation. */
export const nativeCreditLimits = {
  read(scope: Scope): Readonly<Record<string, number>> {
    return readCreditLimitOverrides(state, { ...scope, product: 'PI' });
  },
  record(scope: Scope, cardId: string, limit: number) {
    const next = recordCreditLimitOverride(state, { ...scope, product: 'PI' }, cardId, limit);
    if (next === state) return;
    state = next;
    listeners.forEach(listener => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
};
