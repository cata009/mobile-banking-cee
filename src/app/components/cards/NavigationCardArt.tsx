import Card, { type CardVariant } from "@/app/components/cards/Card";

/**
 * Small 64×40 card art used as the leading visual of a NavigationRow
 * (Design System "Navigation row / Special / Card" variant).
 *
 * Reuses the canonical `Card` component so the thumbnail pulls real
 * card artwork (logo, pattern, Mastercard mark) instead of a hand-drawn
 * placeholder. Defaults to the "MC Debit Gold" variant.
 */
export default function NavigationCardArt({ variant = "mc-debit-gold" }: { variant?: CardVariant } = {}) {
  return <Card variant={variant} size="figma" ariaLabel="Card" />;
}
