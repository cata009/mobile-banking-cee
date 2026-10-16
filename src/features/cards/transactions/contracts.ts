import type { ReactNode } from 'react'

export interface CardTransactionMerchantEnrichment {
  cleanMerchantName: string
  /** A trusted merchant-logo node supplied by the caller; absent means no logo is rendered. */
  merchantLogo?: ReactNode
  location?: {
    label: string
    address: string
  }
  mcc?: string
}
