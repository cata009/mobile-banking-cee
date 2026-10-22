import { deriveProductCategories } from '@/features/products/selectors'
import type { DebitCard } from '@/data/products'

/** The security story identifies the same first debit card that the Bosnia baseline renders. */
const baselineCard = deriveProductCategories({
  country: 'BA',
  release: 'release-current',
  resolvedProductCounts: {
    accounts: 2,
    debitCards: 2,
    creditCards: 1,
    mealCards: 0,
    deposits: 1,
    savingsAccounts: 1,
    loans: 1,
    mortgages: 1,
    investments: 1,
  },
})
  .flatMap((category) => category.products)
  .find((product): product is DebitCard => product.type === 'debit_card')!
export const FRAUD_CARD_REFERENCE: DebitCard = { ...baselineCard, cardHolderName: 'Iacob Mihai' }
export const FRAUD_CARD_LABEL = `Debit Mastercard · ${FRAUD_CARD_REFERENCE.cardNumber.slice(-4)}`
