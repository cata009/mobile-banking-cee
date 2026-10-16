import type { TransactionEndpoint } from '@/data/accountDetails'
export const PARTY_DIRECTION_PATHS = {
  incoming: 'M6 1.5v9M1.5 6h9',
  outgoingLine: 'M2 6h8',
  outgoingArrow: 'M6.6 2.6 10 6l-3.4 3.4',
} as const
export const TRANSACTION_ENDPOINT_ICONS = {
  current: 'accounts-coins',
  savings: 'piggy-bank',
  deposit: 'piggy-bank',
} as const
export const TRANSACTION_ENDPOINT_STYLES = {
  current: { background: 'var(--uc-action-soft)', color: 'var(--uc-action)' },
  savings: { background: '#007A91', color: 'var(--uc-static-white)' },
  deposit: { background: '#52666D', color: 'var(--uc-static-white)' },
} as const
export const TRANSACTION_ENDPOINT_LABELS = {
  current: 'current account',
  savings: 'savings account',
  deposit: 'term deposit',
} as const
export function transactionEndpointLabel(endpoint: TransactionEndpoint) {
  return endpoint.kind === 'currency' ? endpoint.currency : TRANSACTION_ENDPOINT_LABELS[endpoint.account]
}
export function resolveTransactionAvatarFrame(size = 32) {
  const badgeSize = Math.round(size * 0.44)
  const discSize = Math.round(size * 0.68)
  return {
    size,
    badgeSize,
    glyphSize: Math.round(badgeSize * 0.66),
    fontSize: Math.round(size * 0.36),
    discSize,
    pairOffset: size - discSize,
    ringSize: 2,
    badgeOffset: -1,
    badgeBackgroundToken: '--uc-text',
    badgeForegroundToken: '--uc-surface',
    initialsToken: '--uc-static-white',
  } as const
}
