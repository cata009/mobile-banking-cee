import type { AccountTransaction, TransactionTransferPair } from '@/data/accountDetails'
import type { Currency } from '@/data/products'
import { isNonMerchantCounterparty, resolveTransactionMerchant, type MerchantEntry } from '@/data/merchantDirectory'

export type TransactionIdentityPresentation = 'identity' | 'category'
export type TransactionCategoryPresentation = 'glyph' | 'category-circle'
export type TransactionIdentityDescriptor =
  | { kind: 'category'; category: AccountTransaction['pfmCategory']; pfmVariant: TransactionCategoryPresentation }
  | { kind: 'pair'; pair: TransactionTransferPair; currency?: Currency }
  | { kind: 'merchant'; merchant: MerchantEntry }
  | { kind: 'party'; name: string; direction: 'in' | 'out' }

/** Exact shipped selection policy. No platform geometry, UI or locale/country overrides. */
export function resolveTransactionAvatarIdentity(
  transaction: AccountTransaction,
  {
    presentation = 'identity',
    pfmVariant = 'category-circle',
  }: { presentation?: TransactionIdentityPresentation; pfmVariant?: TransactionCategoryPresentation } = {},
): TransactionIdentityDescriptor {
  if (presentation === 'category') return { kind: 'category', category: transaction.pfmCategory, pfmVariant }
  if (transaction.transferPair) return { kind: 'pair', pair: transaction.transferPair, currency: transaction.currency }
  const merchant = resolveTransactionMerchant(transaction)
  if (merchant) return { kind: 'merchant', merchant }
  const hasCounterparty = transaction.source !== 'card' && !isNonMerchantCounterparty(transaction.label)
  if (hasCounterparty)
    return { kind: 'party', name: transaction.label, direction: transaction.type === 'credit' ? 'in' : 'out' }
  return { kind: 'category', category: transaction.pfmCategory, pfmVariant: 'category-circle' }
}
