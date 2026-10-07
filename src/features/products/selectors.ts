import { getProductsByCategory, type ProductCategory } from '@/data/products'
import { convertCurrency, getCountryCurrency, roundMoney } from '@/data/exchangeRates'
import { formatCzLocalAccountNumber } from '@/data/czechDomesticAccount'
import type { CountryId, ProductCounts, ReleaseId } from '@/app/state/demoTypes'
import { applyProductCounts } from './counts'
import { applyCzApp2027CurrentAccounts, applyCzApp2027TermDeposits, applyCzApp2027DebitCards } from './czEvoFixtures'

function formatProductIban(country: string, productId: string, baseNumber: string): string {
  const prefix = country === 'BA_BL' ? 'BA' : country
  let hash = 0
  for (let i = 0; i < productId.length; i++) {
    hash += productId.charCodeAt(i)
  }
  const checkDigits = String((hash % 89) + 10)
  return `${prefix}${checkDigits}BACX${baseNumber}`
}

export type DeriveProductCategoriesInput = {
  country: CountryId
  release: ReleaseId
  resolvedProductCounts: ProductCounts
}

export function deriveProductCategories({
  country,
  release,
  resolvedProductCounts,
}: DeriveProductCategoriesInput): ProductCategory[] {
  const localCurrency = getCountryCurrency(country)
  const baseCountedCategories = applyProductCounts(getProductsByCategory(), resolvedProductCounts)
  const isCzApp2027 = country === 'CZ' && release === 'release-future-evo-2027'
  const countedCategories = isCzApp2027
    ? applyCzApp2027DebitCards(applyCzApp2027CurrentAccounts(applyCzApp2027TermDeposits(baseCountedCategories)))
    : baseCountedCategories
  const countedProducts = countedCategories.flatMap((category) => category.products)

  // Get base categories and convert all products to local currency
  return countedCategories.map((category) => ({
    ...category,
    products: category.products.map((product) => {
      const isCard = product.type === 'debit_card' || product.type === 'credit_card' || product.type === 'meal_card'
      const preserveCzApp2027Account = isCzApp2027 && product.type === 'current_account'
      const preserveCzApp2027ForeignDebitCard =
        isCzApp2027 && product.type === 'debit_card' && (product.currency === 'EUR' || product.currency === 'USD')
      const formattedAccountNumber = preserveCzApp2027Account
        ? product.accountNumber
        : isCard
          ? product.accountNumber
          : isCzApp2027
            ? formatCzLocalAccountNumber(product.accountNumber)
            : formatProductIban(country, product.id, product.accountNumber)

      if (preserveCzApp2027Account) {
        return {
          ...product,
          accountNumber: formattedAccountNumber,
        }
      }

      // Debit cards mirror the balance of their linked current account
      const linkedAccount =
        product.type === 'debit_card' || product.type === 'meal_card'
          ? (countedProducts.find((p) => p.id === product.linkedAccountId) ??
            countedProducts.find((p) => p.type === 'current_account'))
          : undefined
      const sourceBalance = linkedAccount
        ? linkedAccount.balance
        : isCard && product.type !== 'credit_card'
          ? 0
          : product.balance
      const sourceCurrency = linkedAccount ? linkedAccount.currency : product.currency
      const convertedBalance = preserveCzApp2027ForeignDebitCard
        ? sourceBalance
        : roundMoney(convertCurrency(sourceBalance, sourceCurrency, localCurrency))

      if (product.type === 'credit_card') {
        const availableCredit = roundMoney(convertCurrency(product.availableCredit, sourceCurrency, localCurrency))
        const creditLimit = roundMoney(convertCurrency(product.creditLimit, sourceCurrency, localCurrency))

        return {
          ...product,
          accountNumber: formattedAccountNumber,
          balance: availableCredit,
          availableCredit,
          creditLimit,
          currency: localCurrency,
        }
      }

      return {
        ...product,
        accountNumber: formattedAccountNumber,
        // Convert balance to local currency and add 20,000 local currency boost
        // (demo-only uplift so the current account shows a comfortable balance)
        balance: product.type === 'current_account' ? roundMoney(convertedBalance + 20000) : convertedBalance,
        // Update currency to local
        currency: preserveCzApp2027ForeignDebitCard ? sourceCurrency : localCurrency,
      }
    }),
  }))
}
