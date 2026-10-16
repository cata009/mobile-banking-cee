import type { Product } from '@/data/products'

/** The existing CZ assistant offer; an accepted override suppresses repeat promotion. */
export function creditLimitOpportunityNudge(
  enabled: boolean,
  card: Product | null | undefined,
  overrides: Readonly<Record<string, number>> = {},
) {
  if (!enabled || card?.type !== 'credit_card' || overrides[card.id] != null) return null
  return {
    title: 'Upgrade your credit limit to 15 000 CZK',
    body: 'You have a personalized offer ready. Review the new limit first; nothing changes unless you continue.',
    ctaLabel: 'FIND OUT MORE',
  }
}
