import type { DemoState } from './demoTypes';

/** Keep the Italy homepage prototype separate from the CEE app contexts. */
export function normalizeDemoContext(state: DemoState): DemoState {
  if (state.country === 'IT' && state.product === 'PI') {
    return {
      ...state,
      designSystem: 'mobile-first',
      scenario: 'active',
      baseline: 'baseline-current',
      release: 'release-current',
      bankingScenario: state.bankingScenario === 'kids-child-preview' || state.bankingScenario === 'sme-owner-preview'
        ? 'retail-single-account'
        : state.bankingScenario,
    };
  }

  return {
    ...state,
    country: state.country === 'IT' ? 'RO' : state.country,
    designSystem: state.designSystem === 'mobile-first' ? 'current' : state.designSystem,
  };
}
