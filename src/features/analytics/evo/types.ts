import type { Product } from '@/data/products'
import type { SpendingAnalyticsTransaction } from '@/data/spendingAnalytics'
import type { PfmCategoryName } from '@/data/pfmCategories'

export type AnalyticsScope = {
  id: string
  label: string
  products: Product[]
}

export interface ExpenseBreakdownRow {
  key: string
  label: string
  total: number
  transactionCount: number
  /** Set for category rows so the list can reuse the PFM icon. */
  category?: PfmCategoryName
  /** Currency rows reuse the same roundel shown on the Evo account cards. */
  currency?: Product['currency']
  /**
   * A transaction from the group, so a merchant row can lead with the same
   * visual the statement uses — the brand mark, the counterparty initials, or
   * the account pair — instead of a second, weaker icon language.
   */
  sample?: SpendingAnalyticsTransaction
}
