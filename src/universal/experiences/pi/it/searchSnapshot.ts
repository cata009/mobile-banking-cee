import type { ProductCounts } from '@/app/state/demoTypes'
import { getAccountPreferences, getAccountLedgerRecord } from '@/features/accounts-payments/mobileFirstAccounts'
import { getItalyFinancialSnapshot } from '@/features/finance/italyFinancials'
import { ACCOUNT_DIRECTORY, ACCOUNT_IMPORTED_DIRECTORY } from '@/experiences/pi/it/mobile-first/accountContent'
import { ITALY_CARDS, type ItalyCardsSnapshot } from '@/experiences/pi/it/mobile-first/cardsContent'
import { createItalySearchIndex } from '@/experiences/pi/it/mobile-first/searchContent'

/** Composition adapter mirrors Home's input assembly; matching and domain policies stay canonical. */
export function getItalySearchSnapshot(productCounts: ProductCounts, cardsSnapshot?: ItalyCardsSnapshot) {
  const financial = getItalyFinancialSnapshot()
  const preferences = getAccountPreferences()
  const accounts = [
    ...new Map(
      [
        ...ACCOUNT_DIRECTORY.slice(0, productCounts.accounts),
        ...ACCOUNT_IMPORTED_DIRECTORY,
        ...preferences.imported,
      ].map((account) => [account.number, account] as const),
    ).values(),
  ].map((account) =>
    getAccountLedgerRecord({ ...account, name: preferences.names[account.number] ?? account.name }, financial),
  )
  return {
    financialRevision: financial.revision,
    accounts,
    entries: createItalySearchIndex({
      accounts,
      cards: cardsSnapshot?.cards ?? ITALY_CARDS,
      cardMovements: cardsSnapshot?.movements,
      productCounts,
    }),
  }
}
