import type { AccountTransaction } from '@/data/accountDetails'
import type { CreditCard, DebitCard, ProductCategory } from '@/data/products'
import type { PfmCategorySelection } from '@/data/pfmCategories'
import type { TransactionIdentityDescriptor } from '@/features/accounts-payments/transactionAvatarIdentity'
import type { SpendingAnalyticsTimeline } from '@/data/spendingAnalytics'

/** Trusted, bundled artwork descriptors; no framework nodes cross the Native boundary. */
export type NativeTransactionLeadingVisual =
  | { kind: 'identity'; identity: TransactionIdentityDescriptor; size?: number }
  | { kind: 'pfm'; category: AccountTransaction['pfmCategory']; variant?: 'glyph' | 'category-circle'; size?: number }
  | { kind: 'merchant-logo'; merchant: 'youtube' | 'netflix' | 'carrefour' | 'emag'; size?: 32 | 64 }

export interface NativeBankingPresentation {
  /** A caller-owned ledger retains its exact amounts, periods and transaction identities. */
  analyticsTimeline?: SpendingAnalyticsTimeline
  /** Source preview authorities supply their exact holdings; absence uses the canonical demo selector. */
  productCategories?: readonly ProductCategory[]
  sensitiveCard?: DebitCard | CreditCard
  sensitiveTitle?: string
  productId?: string
  rows?: readonly {
    transaction: AccountTransaction
    displayLabel?: string
    leadingVisual?: NativeTransactionLeadingVisual
  }[]
  transactionCategoryOverrides?: Readonly<Record<string, PfmCategorySelection>>
  aiOpportunityNudge?: { title: string; body: string; ctaLabel: string } | null
}
