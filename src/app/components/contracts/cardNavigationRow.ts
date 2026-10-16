/** Caller supplies localized label and masked number; no data/context/runtime dependency. */
export interface NavigationCardIdentity {
  type: string
  id: string
}
export function resolveCardNavigationRow(card?: NavigationCardIdentity | null) {
  const credit = card?.type === 'credit_card'
  return {
    credit,
    artVariant: credit
      ? 'mc-credit-partner-standard'
      : card?.type === 'debit_card' && (card.id.endsWith('-2') || card.id === 'card-3')
        ? 'mc-debit-standard'
        : 'mc-debit-gold',
    width: 64,
    height: 40,
    cornerRadius: 4,
    trailingSlot: 24,
    gap: 16,
    paddingVertical: 18,
    shadowToken: '--uc-shadow-rgb',
    shadowOffsetY: 3,
    shadowBlur: 4,
    shadowOpacity: 0.22,
    titleFontSize: 16,
    titleLineHeight: 20,
    subtitleFontSize: 14,
    subtitleLineHeight: 15,
    subtitleMarginTop: 2,
    titleToken: '--uc-text',
    subtitleToken: '--uc-text-muted',
    fallbackMaskedNumber: '5545 XXXX XXXX 3250',
    rootKind: 'button',
    interactive: false,
    rootClass: 'grid w-full grid-cols-[64px_1fr_24px] items-center gap-[16px] py-[18px] text-left',
  } as const
}
