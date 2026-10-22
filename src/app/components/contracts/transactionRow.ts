import { LIST_TRANSACTION_METRICS } from './listSource'

export function splitFormattedTransactionAmount(value: string) {
  const match = value.match(/^(.+?)([,.])(\d{2})$/)
  return match
    ? { integer: match[1], separator: match[2], decimals: match[3] }
    : { integer: value, separator: '', decimals: '' }
}
export function resolveTransactionRow({
  pending = false,
  evo2027 = false,
  compact = false,
  amount,
  type,
  formattedAmount,
  hasLeading = false,
  avatarPresentation = 'identity',
}: {
  pending?: boolean
  evo2027?: boolean
  compact?: boolean
  amount: number
  type: 'credit' | 'debit'
  formattedAmount: string
  hasLeading?: boolean
  avatarPresentation?: 'identity' | 'category'
}) {
  return {
    pending,
    evo2027,
    compact,
    sign: amount < 0 ? '-' : '+',
    parts: splitFormattedTransactionAmount(formattedAmount),
    positive: type === 'credit' && !pending,
    showLeading: !pending || hasLeading || avatarPresentation === 'identity',
    avatarSize: evo2027 ? 42 : 32,
    gap: evo2027 ? 12 : 16,
    gutter: LIST_TRANSACTION_METRICS.paddingHorizontal,
    height: evo2027 ? undefined : LIST_TRANSACTION_METRICS.height,
    minHeight: evo2027 ? (compact ? 64 : pending ? 92 : 80) : undefined,
    paddingVertical: evo2027
      ? compact
        ? 8
        : 16
      : pending
        ? LIST_TRANSACTION_METRICS.pendingPaddingVertical
        : LIST_TRANSACTION_METRICS.bookedPaddingVertical,
    contentGap: pending ? LIST_TRANSACTION_METRICS.pendingContentGap : LIST_TRANSACTION_METRICS.bookedContentGap,
    pendingStatusHeight: evo2027 ? undefined : LIST_TRANSACTION_METRICS.pendingStatusHeight,
    statusLineHeight: evo2027 ? undefined : LIST_TRANSACTION_METRICS.statusLineHeight,
    labelSize: 16,
    labelLineHeight: evo2027 ? 20 : LIST_TRANSACTION_METRICS.labelLineHeight,
    amountSize: 20,
    amountLineHeight: 22,
    decimalsSize: 14,
    textToken: '--uc-text',
    mutedToken: '--uc-text-muted',
    pendingDotToken: '--uc-orange-status',
  } as const
}
