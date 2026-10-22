import type { Product } from '@/data/products'
import type { NativeTransactionLeadingVisual } from './bankingPresentation'
import type { NativeDemoRoute } from './contracts'

/** Caller enrichment is data; Native owns the merchant and product visuals. */
export interface NativeTransactionPresentation {
  /** Explicit null preserves a Source detail with no linked product. */
  product?: Product | null
  /** Contextual security journeys retain details/card identity without spending or payment tools. */
  showActions?: boolean
  showSpendingInsights?: boolean
  postingTime?: string
  activityStatus?: 'declined'
  showExpandableDetails?: boolean
  cardIdentityMode?: 'holder'
  /** Optional destination for the existing Card used navigation row. */
  cardDetailsRoute?: NativeDemoRoute
  /** Optional linked-case helper, rendered immediately below the transaction summary. */
  caseNotice?: { title: string; description: string; accessibilityLabel: string; route: NativeDemoRoute }
  merchantEnrichment?: {
    cleanMerchantName: string
    categoryLabel?: string
    leadingVisual?: NativeTransactionLeadingVisual
    location?: { label: string; address: string }
    mcc?: string
  }
}
