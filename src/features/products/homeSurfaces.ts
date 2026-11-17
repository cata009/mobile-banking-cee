import type { CountryId } from '@/app/state/demoTypes'
import type { Product } from '@/data/products'

/**
 * Executable rules for the Home surfaces around the product list: header actions, unread badge,
 * pending actions and the single-product fallback. Metadata only: no UI runtime imports.
 */

/** Demo count of unread bank messages (drives the red badge on the Messages icon). */
export const DEMO_UNREAD_MESSAGES = 2

/**
 * Slovenia and Bosnia show Contact, Messages and the privacy toggle (no Profile);
 * every other country shows Profile, Messages and the privacy toggle.
 */
export function homeHeaderUsesContact(country: CountryId): boolean {
  return country === 'SI' || country === 'BA' || country === 'BA_BL'
}

export type PendingActionKind = '3ds' | 'psd2-refusal' | 'signature' | 'secondary-identifiers'

export interface PendingAction {
  id: string
  kind: PendingActionKind
  title: string
  description: string
}

const PENDING_PRIORITY: Record<PendingActionKind, number> = {
  '3ds': 0,
  'psd2-refusal': 1,
  signature: 2,
  'secondary-identifiers': 3,
}

/** Strict priority: 3D Secure, PSD2 refusals, signatures / applications, then the rest. */
export function sortPendingActions<T extends Pick<PendingAction, 'kind'>>(actions: readonly T[]): T[] {
  return actions
    .map((action, position) => ({ action, position }))
    .sort((a, b) => PENDING_PRIORITY[a.action.kind] - PENDING_PRIORITY[b.action.kind] || a.position - b.position)
    .map(({ action }) => action)
}

/** The single-product header fallback: the only product is not a current account. */
export function needsCurrentAccountFallback(products: readonly Pick<Product, 'type'>[]): boolean {
  return products.length === 1 && products[0]!.type !== 'current_account'
}
