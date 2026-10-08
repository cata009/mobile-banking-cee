import type { DemoState } from '@/app/state/demoTypes'

/** Existing Future Gain product shelf policy, shared by the App and its experience adapter. */
export function isFutureGainAvailable(state: Pick<DemoState, 'product' | 'country' | 'release'>): boolean {
  return state.product === 'PI' && state.country === 'RS' && state.release === 'release-future-rs-future-gain'
}
