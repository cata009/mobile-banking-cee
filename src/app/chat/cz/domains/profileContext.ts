import { getCountryConfig } from '@/app/registry/countryConfig'
import type { CurrentAccount, Product } from '@/data/products'
import { isCreditCardProduct, type CzChatSmartReplyOptions } from '../helpers'

/** Domain-owned derivation used once when a chat resolver snapshots its input. */
export function buildCzProfileChatContext(
  context: Pick<
    CzChatSmartReplyOptions,
    'country' | 'categories' | 'selectedAccountProduct' | 'selectedCardProduct' | 'creditCardForOpportunity'
  >,
) {
  const { country, categories, selectedAccountProduct, selectedCardProduct, creditCardForOpportunity } = context
  const localCurrency = getCountryConfig(country).currency

  const allProducts = categories.flatMap((category) => category.products)

  const currentAccounts = allProducts.filter((product): product is CurrentAccount => product.type === 'current_account')

  const savingsProducts = allProducts.filter((product) => product.type === 'saving_account')

  const loansAndMortgages = allProducts.filter((product) => product.type === 'loan' || product.type === 'mortgage')

  const investmentProducts = allProducts.filter((product) => product.type === 'investment_account')

  const investmentProduct =
    allProducts.find(
      (product): product is Extract<Product, { type: 'investment_account' }> => product.type === 'investment_account',
    ) ?? null

  const primaryAccount =
    selectedAccountProduct?.type === 'current_account'
      ? selectedAccountProduct
      : (currentAccounts[0] ?? selectedAccountProduct ?? null)

  const primaryCard =
    (isCreditCardProduct(selectedCardProduct) ? selectedCardProduct : null) ??
    creditCardForOpportunity ??
    allProducts.find(isCreditCardProduct) ??
    null

  const selectedLoan =
    selectedAccountProduct?.type === 'loan' || selectedAccountProduct?.type === 'mortgage'
      ? selectedAccountProduct
      : (loansAndMortgages[0] ?? null)

  const selectedSavings =
    selectedAccountProduct?.type === 'saving_account' || selectedAccountProduct?.type === 'term_deposit'
      ? selectedAccountProduct
      : (savingsProducts[0] ?? null)
  return {
    localCurrency,
    allProducts,
    currentAccounts,
    loansAndMortgages,
    investmentProducts,
    investmentProduct,
    primaryAccount,
    primaryCard,
    selectedLoan,
    selectedSavings,
  }
}
