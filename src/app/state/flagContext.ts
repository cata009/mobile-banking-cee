import type { DemoState, FeatureFlagOverrides } from './demoTypes'

export function getContextKey(
  state: Pick<DemoState, 'product' | 'country' | 'designSystem' | 'baseline' | 'release' | 'bankingScenario'>,
): string {
  return `${state.product}:${state.country}:${state.designSystem}:${state.baseline}:${state.release}:${state.bankingScenario}`
}

export function getCurrentFlags(state: DemoState): FeatureFlagOverrides {
  return state.flagsByContext[getContextKey(state)] || {}
}
