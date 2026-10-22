import type { NativeDemoRoute } from '@/features/demo-native/contracts'

/** Preview-only states. Customer route and screen IDs remain unchanged. */
export const PRIME_REFERENCE_SCREENS = [
  'prime-home',
  'prime-upgrade',
  'prime-upgrade-call',
  'prime-advisor',
  'prime-benefits',
  'prime-call-confirm',
  'prime-call-active',
  'prime-email-chooser',
  'prime-email-compose',
  'prime-email-sent',
  'prime-email-unavailable',
  'prime-appointment-handoff',
  'prime-callback-handoff',
  'prime-directions-handoff',
  'prime-benefit-handoff',
  'prime-terms-handoff',
] as const

export type PrimeReferenceScreen = (typeof PRIME_REFERENCE_SCREENS)[number]
export type PrimeCustomerSegment = 'standard' | 'prime' | 'private'

export function primeEntryScreen(
  segment: PrimeCustomerSegment,
  serviceActive: boolean,
): 'prime-upgrade' | 'prime-advisor' {
  return segment === 'standard' && !serviceActive ? 'prime-upgrade' : 'prime-advisor'
}

/** Standard's advisor relationship is distinct from the PRIME benefit entitlement. */
export function primeBenefitsScreen(segment: PrimeCustomerSegment): 'prime-upgrade' | 'prime-benefits' {
  return segment === 'standard' ? 'prime-upgrade' : 'prime-benefits'
}

export function primeCustomerContext(parameters: Readonly<Record<string, string>> = {}) {
  const segment: PrimeCustomerSegment =
    parameters.segment === 'prime' || parameters.segment === 'private' ? parameters.segment : 'standard'
  return { segment, serviceActive: segment !== 'standard' || parameters.service === 'active' }
}

/** Inspector/rail entry and the phone entry share exactly the same entitlement policy. */
export function resolvePrimePrototypeTarget(
  from: PrimeReferenceScreen,
  to: PrimeReferenceScreen,
  parameters: Readonly<Record<string, string>>,
) {
  const customer = primeCustomerContext(parameters)
  if (
    customer.segment === 'standard' &&
    (to === 'prime-benefits' || to === 'prime-benefit-handoff' || to === 'prime-terms-handoff')
  )
    return primeBenefitsScreen(customer.segment)
  if (from !== 'prime-home' || (to !== 'prime-upgrade' && to !== 'prime-advisor')) return to
  if (to === 'prime-upgrade' && customer.segment === 'standard' && customer.serviceActive) return 'prime-upgrade'
  return primeEntryScreen(customer.segment, customer.serviceActive)
}
export type PrimeContactScreen = 'call-confirm' | 'call-active' | 'email-chooser' | 'email-compose' | 'email-sent'

export function isPrimeReferenceScreen(value: unknown): value is PrimeReferenceScreen {
  return PRIME_REFERENCE_SCREENS.some((screen) => screen === value)
}

/** Only the reference's homepage and PRIME can navigate inside this isolated host. */
export function primeReferenceTarget(route: NativeDemoRoute): PrimeReferenceScreen | null {
  if (route.screen === 'home') return 'prime-home'
  if (route.screen === 'prime') {
    const state = route.params?.referenceState
    return isPrimeReferenceScreen(state) ? state : 'prime-advisor'
  }
  if (route.screen === 'products' && route.params?.view === 'prime') return 'prime-advisor'
  if (route.screen === 'appointments') return 'prime-appointment-handoff'
  if (route.screen === 'call-request') return 'prime-callback-handoff'
  return null
}

export function primeContactScreen(screen: PrimeReferenceScreen): PrimeContactScreen | null {
  switch (screen) {
    case 'prime-call-confirm':
      return 'call-confirm'
    case 'prime-call-active':
      return 'call-active'
    case 'prime-email-chooser':
      return 'email-chooser'
    case 'prime-email-compose':
      return 'email-compose'
    case 'prime-email-sent':
      return 'email-sent'
    default:
      return null
  }
}

export const PRIME_REFERENCE_HANDOFFS: Partial<
  Record<PrimeReferenceScreen, { title: string; detail: string; returnTo: PrimeReferenceScreen }>
> = {
  'prime-directions-handoff': {
    title: 'Branch directions',
    detail:
      'The reference displays the advisor’s branch address. A map integration is not implemented in the source; no external map is opened.',
    returnTo: 'prime-advisor',
  },
  'prime-benefit-handoff': {
    title: 'Benefit details',
    detail:
      'The four benefit summaries are reproduced from the source. Their detail destinations are not implemented in the reference.',
    returnTo: 'prime-benefits',
  },
  'prime-terms-handoff': {
    title: 'Terms and conditions',
    detail:
      'The source contains this control, but no terms document destination. This is a reference boundary, not an approved terms document.',
    returnTo: 'prime-benefits',
  },
  'prime-email-unavailable': {
    title: 'Email app unavailable',
    detail:
      'Prototype-only integration failure fixture. No email has been sent. Retry returns to the app chooser; close returns to your advisor.',
    returnTo: 'prime-advisor',
  },
}
