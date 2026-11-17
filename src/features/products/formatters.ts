import { formatAmount, type Product, type ProductCategory } from '@/data/products'
import { convertCurrency, getCountryCurrency } from '@/data/exchangeRates'
import { formatMaskedCardNumber } from '@/app/utils/cardNumber'
import { formatEvo2027Amount } from '@/app/utils/evo2027Formatting'
import type { CountryId, ReleaseId } from '@/app/state/demoTypes'

import { getHomeTotalsPolicy, type HomeIndicatorPolicy, type HomeTotalsMeasure } from './homePolicy'

const roundCents = (value: number) => Math.round(value * 100) / 100

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
  const toLocal = (amount: number, product: Product) => convertCurrency(amount, product.currency, localCurrency)

  const measureHomeTotal = (measure: HomeTotalsMeasure): number => {
    const allProducts = categories.flatMap((cat) => cat.products)
    const ofType = <T extends Product['type']>(type: T) => allProducts.filter((p) => p.type === type)
    const creditCards = ofType('credit_card') as Extract<Product, { type: 'credit_card' }>[]
    const sum = (products: Product[], value: (product: Product) => number) =>
      products.reduce((total, product) => total + toLocal(value(product), product), 0)
    switch (measure) {
      case 'currentAccounts':
        return sum(ofType('current_account'), (p) => p.balance)
      case 'primaryAccount':
        return sum(ofType('current_account').slice(0, 1), (p) => p.balance)
      case 'savings':
        return sum(ofType('saving_account'), (p) => p.balance)
      case 'termDeposits':
        return sum(ofType('term_deposit'), (p) => p.balance)
      case 'mainCreditAvailable':
        return sum(creditCards.slice(0, 1), (p) => (p as (typeof creditCards)[number]).availableCredit)
      case 'creditAvailable':
        return sum(creditCards, (p) => (p as (typeof creditCards)[number]).availableCredit)
      case 'creditDrawn':
        return sum(creditCards, (p) => {
          const card = p as (typeof creditCards)[number]
          return Math.max(0, card.creditLimit - card.availableCredit)
        })
      case 'loans':
        return sum([...ofType('loan'), ...ofType('mortgage')], (p) => Math.abs(p.balance))
    }
  }

  /** Header indicators for the Home summary, per the country's Home policy. */
  const calculateHomeTotals = () => {
    const policy = getHomeTotalsPolicy(country, release)
    const indicator = (spec: HomeIndicatorPolicy, value: number) => ({
      labelKey: spec.labelKey,
      fallback: spec.fallback,
      value,
      amount: formatAmountForRelease(value, localCurrency),
    })
    const measure = (spec: HomeIndicatorPolicy) =>
      spec.measures.reduce((total, key) => total + measureHomeTotal(key), 0)
    const primaryValue = measure(policy.primary)
    const secondaryValue = measure(policy.secondary)
    const hideSecondary =
      policy.secondary.hideWhenEqualToPrimary === true && roundCents(secondaryValue) === roundCents(primaryValue)
    return {
      primary: indicator(policy.primary, primaryValue),
      secondary: hideSecondary ? null : indicator(policy.secondary, secondaryValue),
    }
  }

  return {
    formatProductAmount,
    getProductDisplayNumber,
    calculateTotal,
    calculateTotalAvailable,
    calculateTotalAvailableAmount,
    calculateTotalOwed,
    calculateHomeTotals,
  }
}
