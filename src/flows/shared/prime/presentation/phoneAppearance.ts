import type { PrimeReferenceScreen } from '@/features/prime/reference'

export interface PrimePhoneAppearance {
  /** Matches the existing phone host convention: dark means white foreground. */
  statusBarVariant: 'light' | 'dark'
  microphoneActive: boolean
}

/** One source for reference, exported phone frames and executive presentation chrome. */
export function getPrimePhoneAppearance(screen: PrimeReferenceScreen): PrimePhoneAppearance {
  const light =
    screen === 'prime-home' ||
    screen === 'prime-email-compose' ||
    screen === 'prime-email-sent' ||
    screen === 'prime-appointment-handoff' ||
    screen === 'prime-callback-handoff'
  return {
    statusBarVariant: light ? 'light' : 'dark',
    microphoneActive: screen === 'prime-upgrade-call' || screen === 'prime-call-active',
  }
}
