export const CAROUSEL_CARD_SHADOW =
  '0 16px 32px rgb(var(--uc-shadow-rgb) / 0.08), 0 3px 10px rgb(var(--uc-shadow-rgb) / 0.05)'
export function resolveAccountBalanceCard({
  productType,
  progress,
  active = true,
  hasSubAccount = false,
  showSubAccount = true,
  showCopy = true,
}: {
  productType?: string
  progress?: number
  active?: boolean
  hasSubAccount?: boolean
  showSubAccount?: boolean
  showCopy?: boolean
} = {}) {
  const labels =
    productType === 'saving_account'
      ? { availableLabel: 'Available funds', showCurrent: false, currentLabel: '' }
      : productType === 'term_deposit'
        ? { availableLabel: 'Deposit amount', showCurrent: true, currentLabel: 'Maturity amount' }
        : productType === 'loan' || productType === 'mortgage'
          ? { availableLabel: 'Remaining loan amount', showCurrent: true, currentLabel: 'Next installment' }
          : { availableLabel: 'Available balance', showCurrent: true, currentLabel: 'Current balance' }
  const progressFraction = typeof progress === 'number' ? Math.min(1, Math.max(0, progress)) : undefined
  return {
    ...labels,
    width: 311,
    height: 197,
    radius: 6,
    padding: 16,
    gap: 16,
    showCopy,
    hasSubAccount: showSubAccount && hasSubAccount,
    active,
    opacity: active ? 1 : 0.95,
    progressFraction,
    progressPercent: progressFraction === undefined ? undefined : Math.round(progressFraction * 100),
    progressWidth: 279,
    progressHeight: 4,
    copySlot: 32,
    ibanMaxWidth: 235,
    titleFontSize: 20,
    ibanFontSize: 16,
    amountFontSize: 30,
    decimalsFontSize: 20,
    bodyFontSize: 14,
    backgroundToken: '--uc-surface',
    textToken: '--uc-text',
    mutedToken: '--uc-text-muted',
    actionToken: '--uc-action',
    borderToken: '--uc-border',
  } as const
}
