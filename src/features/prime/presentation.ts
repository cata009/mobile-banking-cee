import {
  primeBenefitsScreen,
  primeEntryScreen,
  type PrimeCustomerSegment,
  type PrimeReferenceScreen,
} from './reference'

export const PRIME_PRESENTATION_MOMENTS = ['discover', 'connect', 'benefits'] as const
export type PrimePresentationMoment = (typeof PRIME_PRESENTATION_MOMENTS)[number]

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
): PrimePresentationMoment {
  const index = Math.max(
    0,
    Math.min(PRIME_PRESENTATION_MOMENTS.length - 1, PRIME_PRESENTATION_MOMENTS.indexOf(moment) + direction),
  )
  return PRIME_PRESENTATION_MOMENTS[index] ?? 'discover'
}
