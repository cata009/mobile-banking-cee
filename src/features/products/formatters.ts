import { formatAmount, type Product, type ProductCategory } from '@/data/products'
import { convertCurrency, getCountryCurrency } from '@/data/exchangeRates'
import { formatMaskedCardNumber } from '@/app/utils/cardNumber'
import { formatEvo2027Amount } from '@/app/utils/evo2027Formatting'
import type { CountryId, ReleaseId } from '@/app/state/demoTypes'

function getDisplayBalance(product: Product): number {
  return product.type === 'credit_card' ? product.availableCredit : product.balance
}

export function createProductFormatters(categories: ProductCategory[], country: CountryId, release: ReleaseId) {
  const localCurrency = getCountryCurrency(country)
  const formatAmountForRelease = (amount: number, currency: Product['currency']) =>
    release === 'release-future-evo-2027' ? formatEvo2027Amount(amount, currency) : formatAmount(amount, currency)

  const formatProductAmount = (product: Product) => {
    return formatAmountForRelease(getDisplayBalance(product), product.currency)
  }

  const getProductDisplayNumber = (product: Product): string => {
    if (product.type === 'debit_card' || product.type === 'credit_card' || product.type === 'meal_card') {
      return formatMaskedCardNumber(product.accountNumber)
    }
    return product.accountNumber
  }

  const calculateTotal = (
    products: Product[],
  ): {
    integer: string
    decimals: string
    currency: string
  } => {
    const total = products.reduce((sum, product) => {
      return sum + convertCurrency(getDisplayBalance(product), product.currency, localCurrency)
    }, 0)

    return formatAmountForRelease(total, localCurrency)
  }

  const calculateTotalAvailableAmount = (): number => {
    const allProducts = categories.flatMap((cat) => cat.products)

    // Sum: current_accounts + saving_accounts (NO term_deposit)
    const total = allProducts.reduce((sum, product) => {
      if (product.type === 'current_account' || product.type === 'saving_account') {
        return sum + convertCurrency(product.balance, product.currency, localCurrency)
      }
      return sum
    }, 0)

    return total
  }

  const calculateTotalAvailable = (): {
    integer: string
    decimals: string
    currency: string
  } => {
    return formatAmountForRelease(calculateTotalAvailableAmount(), localCurrency)
  }

  const calculateTotalOwed = (): {
    integer: string
    decimals: string
    currency: string
  } => {
    const allProducts = categories.flatMap((cat) => cat.products)

    const total = allProducts.reduce((sum, product) => {
      if (product.type === 'loan' || product.type === 'mortgage') {
        return sum + Math.abs(convertCurrency(product.balance, product.currency, localCurrency))
      }
      if (product.type === 'credit_card') {
        const drawn = Math.max(0, product.creditLimit - product.availableCredit)
        return sum + convertCurrency(drawn, product.currency, localCurrency)
      }
      return sum
    }, 0)

    return formatAmountForRelease(total, localCurrency)
  }
  return {
    formatProductAmount,
    getProductDisplayNumber,
    calculateTotal,
    calculateTotalAvailable,
    calculateTotalAvailableAmount,
    calculateTotalOwed,
  }
}
