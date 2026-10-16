import { isValidElement, type ReactNode } from 'react'
import type { AccountTransaction } from '@/data/accountDetails'
import type { NativeTransactionLeadingVisual } from '@/features/demo-native/bankingPresentation'

type MerchantLogo = Extract<NativeTransactionLeadingVisual, { kind: 'merchant-logo' }>

function isEthocaMerchant(value: unknown): value is MerchantLogo['merchant'] {
  return value === 'youtube' || value === 'netflix' || value === 'carrefour' || value === 'emag'
}

/** Convert trusted Source preview nodes into plain descriptors for Native rendering. */
export function serializeNativeTransactionVisual(
  value: ReactNode | undefined,
  transaction: AccountTransaction,
): NativeTransactionLeadingVisual | undefined {
  if (value == null || typeof value === 'boolean') return undefined
  if (isValidElement<{ merchant?: unknown; transaction?: AccountTransaction; size?: unknown }>(value)) {
    const props = value.props
    if (props.transaction?.id === transaction.id && isEthocaMerchant(props.merchant)) {
      return {
        kind: 'merchant-logo',
        merchant: props.merchant,
        size: props.size === 64 ? 64 : 32,
      }
    }
    if (props.transaction?.id === transaction.id) {
      return {
        kind: 'pfm',
        category: transaction.pfmCategory,
        variant: 'category-circle',
        size: 32,
      }
    }
  }
  return {
    kind: 'pfm',
    category: transaction.pfmCategory,
    variant: 'category-circle',
    size: 32,
  }
}
