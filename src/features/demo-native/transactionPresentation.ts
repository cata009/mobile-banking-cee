import type { Product } from '@/data/products'
import type { NativeTransactionLeadingVisual } from './bankingPresentation'

/** Caller enrichment is data; Native owns the merchant and product visuals. */
export interface NativeTransactionPresentation {
  /** Explicit null preserves a Source detail with no linked product. */
  product?: Product | null
  merchantEnrichment?: {
    cleanMerchantName: string
    leadingVisual?: NativeTransactionLeadingVisual
    location?: { label: string; address: string }
    mcc?: string
  }
}
