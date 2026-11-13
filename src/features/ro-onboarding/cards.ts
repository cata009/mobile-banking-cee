import { OFFER_ACCOUNTS, type OnboardingOffer } from './offers'
import { validDeliveryAddress } from './delivery'
export type CardTier = 'standard' | 'gold' | 'platinum'
export type CardPage = 'types' | 'physical' | 'virtual' | 'platinum' | 'standard' | 'recap'
export function physicalCardTiers(offer: OnboardingOffer): CardTier[] {
  return offer === 'optim'
    ? ['standard']
    : offer === 'premium'
      ? ['platinum', 'gold', 'standard']
      : offer === 'prime'
        ? ['platinum', 'standard']
        : ['gold', 'standard']
}
export function virtualCardTiers(offer: OnboardingOffer): CardTier[] {
  return offer === 'optim' ? ['standard'] : ['gold', 'standard']
}
export function cardTitle(tier: CardTier, virtual = false): string {
  return `${virtual ? 'Virtual ' : ''}Mastercard ${tier === 'standard' ? 'Standard' : tier === 'gold' ? 'Gold' : 'Platinum'}`
}
export function selectedCardAccounts(offer: OnboardingOffer, checks: Record<string, boolean>) {
  return OFFER_ACCOUNTS[offer]
    .filter((key) => checks[key])
    .map(
      (key) =>
        [
          key,
          key === 'eur' ? 'EUR' : key === 'usd' ? 'USD' : key === 'additionalLei' ? 'RON - cont suplimentar' : 'RON',
        ] as const,
    )
}
export function cardPage(values: Record<string, string>): CardPage {
  return (values.cardPage || 'types') as CardPage
}
/** Retain the source CTA copy; selection is always driven by the actual page/tier, not its caption. */
export function cardSelectionLabel(offer: OnboardingOffer, values: Record<string, string>): string {
  const page = cardPage(values),
    virtual = page === 'virtual'
  const tier = (
    page === 'platinum'
      ? 'platinum'
      : page === 'standard'
        ? 'standard'
        : values[virtual ? 'virtualTier' : 'physicalTier'] || 'standard'
  ) as CardTier
  if (offer === 'prime' && page === 'platinum') return 'Aleg Mastercard Standard'
  if (offer === 'premium' && !virtual) return 'Aleg Mastercard Gold'
  return `Aleg ${cardTitle(tier, virtual)}`
}
export function cardGoldConflict(values: Record<string, string>, checks: Record<string, boolean>): boolean {
  return (
    !!checks.physical &&
    values.virtualTier === 'gold' &&
    (values.physicalTier === 'gold' || values.physicalTier === 'platinum')
  )
}
export function canContinueCardPage(
  offer: OnboardingOffer,
  values: Record<string, string>,
  checks: Record<string, boolean>,
): boolean {
  const page = cardPage(values)
  if (page === 'types')
    return offer === 'prime' ? !!(checks.platinum || checks.physical) : !!(checks.virtual || checks.physical)
  if (page === 'recap') return true
  const key = page === 'virtual' ? 'virtual' : page === 'platinum' ? 'platinum' : 'physical'
  const account = values[`${key}Account`]
  return (
    selectedCardAccounts(offer, checks).some(([id]) => id === account) &&
    !(page === 'virtual' && cardGoldConflict(values, checks))
  )
}
export function nextCardPage(
  offer: OnboardingOffer,
  values: Record<string, string>,
  checks: Record<string, boolean>,
): CardPage | null {
  const page = cardPage(values)
  if (page === 'types')
    return offer === 'prime' ? (checks.platinum ? 'platinum' : 'standard') : checks.physical ? 'physical' : 'virtual'
  if (page === 'platinum') return checks.physical ? 'standard' : null
  if (page === 'physical' && checks.virtual) return 'virtual'
  if (page === 'virtual') return checks.physical ? 'recap' : null
  if (page === 'standard') return checks.platinum ? 'recap' : null
  return null
}
export function validBankPassword(values: Record<string, string>, physical: boolean): boolean {
  return (
    !!values.bankPassword?.trim() &&
    values.bankPassword === values.bankPasswordConfirm &&
    (!physical || validDeliveryAddress(values))
  )
}
