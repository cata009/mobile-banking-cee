import { DEFAULT_FUTURE_PROFILE, type FutureInvestmentProfile } from './model'
let profile = DEFAULT_FUTURE_PROFILE
const listeners = new Set<() => void>()
export const readFutureProfile = () => profile
export const subscribeFutureProfile = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export function saveFutureProfile(next: FutureInvestmentProfile) {
  profile = { ...next, version: profile.version + 1 }
  listeners.forEach((listener) => listener())
}
