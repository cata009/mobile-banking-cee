import type { CzChatSmartReplyOptions } from './helpers'
import { buildCzProfileChatContext } from './domains/profileContext'
import { buildCzCardsChatContext } from './domains/cardsContext'
import { buildCzAccountsChatContext } from './domains/accountsContext'
import { buildCzSavingsChatContext } from './domains/savingsContext'
import { buildCzDocumentsPaymentsChatContext } from './domains/documentsPaymentsContext'
import { buildCzInvestmentsChatContext } from './domains/investmentsContext'
import { buildCzProductShelfChatContext } from './domains/productShelfContext'

/** A resolver owns one detached, immutable snapshot; each domain derives its data from that snapshot. */
export function buildCzChatNormalizedContext(options: CzChatSmartReplyOptions) {
  const snapshot = structuredClone(options)
  const seed = { ...snapshot, selectedInvestmentSecurity: snapshot.selectedInvestmentSecurity ?? null }
  const profile = buildCzProfileChatContext({ ...seed })
  const cards = buildCzCardsChatContext({ ...seed, ...profile })
  const accounts = buildCzAccountsChatContext({ ...seed, ...profile, ...cards })
  const savings = buildCzSavingsChatContext({ ...seed, ...profile, ...accounts })
  const documentsPayments = buildCzDocumentsPaymentsChatContext({ ...seed })
  const investments = buildCzInvestmentsChatContext({ ...seed, ...profile })
  const productShelf = buildCzProductShelfChatContext({ ...seed, ...profile, ...cards })
  return freezeCzChatSnapshot({
    ...seed,
    ...profile,
    ...cards,
    ...accounts,
    ...savings,
    ...documentsPayments,
    ...investments,
    ...productShelf,
  })
}
export type CzChatNormalizedContext = ReturnType<typeof buildCzChatNormalizedContext>

function freezeCzChatSnapshot<T>(value: T): Readonly<T> {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freezeCzChatSnapshot(child)
    Object.freeze(value)
  }
  return value
}
