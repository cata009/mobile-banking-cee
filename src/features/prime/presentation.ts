import {
  primeBenefitsScreen,
  primeEntryScreen,
  type PrimeCustomerSegment,
  type PrimeReferenceScreen,
} from './reference'

export const PRIME_PRESENTATION_MOMENTS = ['discover', 'connect', 'benefits'] as const
export type PrimePresentationMoment = (typeof PRIME_PRESENTATION_MOMENTS)[number]
const UPGRADE_PRESENTATION_MOMENTS = ['discover', 'connect'] as const

export function primePresentationMoments(
  segment: PrimeCustomerSegment,
  serviceActive: boolean,
): readonly PrimePresentationMoment[] {
  return segment === 'standard' && !serviceActive ? UPGRADE_PRESENTATION_MOMENTS : PRIME_PRESENTATION_MOMENTS
}

export function normalizePrimePresentationMoment(
  moment: PrimePresentationMoment,
  segment: PrimeCustomerSegment,
  serviceActive: boolean,
): PrimePresentationMoment {
  return primePresentationMoments(segment, serviceActive).includes(moment) ? moment : 'connect'
}

/** Presentation navigation delegates service access to the existing feature policy. */
export function resolvePrimePresentationMoment(
  moment: PrimePresentationMoment,
  segment: PrimeCustomerSegment,
  serviceActive: boolean,
): PrimeReferenceScreen {
  if (moment === 'discover') return 'prime-home'
  const entry = primeEntryScreen(segment, serviceActive)
  return moment === 'benefits' ? primeBenefitsScreen(segment) : entry
}

/** The shared Upgrade destination retains an explicitly selected narrative moment. */
export function primePresentationMomentForScreen(
  screen: PrimeReferenceScreen,
  preferred: PrimePresentationMoment = 'connect',
): PrimePresentationMoment {
  if (screen === 'prime-home') return 'discover'
  if (screen === 'prime-benefits' || screen === 'prime-benefit-handoff' || screen === 'prime-terms-handoff')
    return 'benefits'
  if (screen === 'prime-upgrade' && preferred === 'benefits') return 'benefits'
  return 'connect'
}

export function adjacentPrimePresentationMoment(
  moment: PrimePresentationMoment,
  direction: -1 | 1,
  segment: PrimeCustomerSegment = 'prime',
  serviceActive = true,
): PrimePresentationMoment {
  const available = primePresentationMoments(segment, serviceActive)
  const selected = normalizePrimePresentationMoment(moment, segment, serviceActive)
  const index = Math.max(0, Math.min(available.length - 1, available.indexOf(selected) + direction))
  return available[index] ?? 'discover'
}
