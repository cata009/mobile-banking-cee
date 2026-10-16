import type { ProductCardAction } from '@/app/components/ProductCard'
import { AppIcon } from '@/app/components/icons'

import { FUTURE_CZ_ACCOUNT_CARD_ACTIONS } from '@/features/products/currentActions'
export { FUTURE_CZ_ACCOUNT_CARD_ACTIONS } from '@/features/products/currentActions'

export function buildFutureCzAccountCardActions({
  onNewPayment,
  onScanQrCode,
  onCreateQrCode,
  onAccountInfo,
}: {
  onNewPayment?: () => void
  onScanQrCode?: () => void
  onCreateQrCode?: () => void
  onAccountInfo?: () => void
} = {}): readonly ProductCardAction[] {
  return FUTURE_CZ_ACCOUNT_CARD_ACTIONS.map((action) => ({
    id: action.id,
    icon: <AppIcon name={action.iconName} size={action.iconSize} className="text-[var(--uc-text)]" />,
    label: action.label,
    ariaLabel: action.ariaLabel,
    onClick:
      action.id === 'new-payment'
        ? onNewPayment
        : action.id === 'scan-qr'
        ? onScanQrCode
        : action.id === 'create-qr'
        ? onCreateQrCode
        : action.id === 'account-info'
        ? onAccountInfo
        : undefined,
  }))
}
