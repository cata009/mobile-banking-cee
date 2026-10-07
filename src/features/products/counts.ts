import type { Product, ProductCategory, ProductType } from '@/data/products'
import type { ProductCountKey, ProductCounts } from '@/app/state/demoTypes'
import { roundMoney } from '@/data/exchangeRates'

type ProductCountDefinition = {
  key: ProductCountKey
  categoryKey: ProductCategory['key']
  targetType: ProductType
  sourceTypes: ProductType[]
  fallbackType: ProductType
  title: string
  idPrefix: string
  accountSeed: string
}

const PRODUCT_COUNT_DEFINITIONS: ProductCountDefinition[] = [
  {
    key: 'accounts',
    categoryKey: 'accounts',
    targetType: 'current_account',
    sourceTypes: ['current_account'],
    fallbackType: 'current_account',
    title: 'Primary Account',
    idPrefix: 'acc',
    accountSeed: '1234567890123456',
  },
  {
    key: 'creditCards',
    categoryKey: 'cards',
    targetType: 'credit_card',
    sourceTypes: ['credit_card'],
    fallbackType: 'credit_card',
    title: 'Credit Card',
    idPrefix: 'card-credit',
    accountSeed: '5173500087654321',
  },
  {
    key: 'debitCards',
    categoryKey: 'cards',
    targetType: 'debit_card',
    sourceTypes: ['debit_card'],
    fallbackType: 'debit_card',
    title: 'Debit Card',
    idPrefix: 'card-debit',
    accountSeed: '5173400012345678',
  },
  {
    key: 'mealCards',
    categoryKey: 'cards',
    targetType: 'meal_card',
    sourceTypes: ['meal_card'],
    fallbackType: 'debit_card',
    title: 'Meal Card',
    idPrefix: 'card-meal',
    accountSeed: '5173600098765432',
  },
  {
    key: 'savingsAccounts',
    categoryKey: 'savings_deposits',
    targetType: 'saving_account',
    sourceTypes: ['saving_account'],
    fallbackType: 'saving_account',
    title: 'Savings Account',
    idPrefix: 'sav',
    accountSeed: '5678901234567890',
  },
  {
    key: 'deposits',
    categoryKey: 'savings_deposits',
    targetType: 'term_deposit',
    sourceTypes: ['term_deposit'],
    fallbackType: 'term_deposit',
    title: 'Term Deposit',
    idPrefix: 'term',
    accountSeed: '4567890123456789',
  },
  {
    key: 'loans',
    categoryKey: 'mortgages_loans',
    targetType: 'loan',
    sourceTypes: ['loan'],
    fallbackType: 'loan',
    title: 'Personal Loan',
    idPrefix: 'loan',
    accountSeed: '5678901234567890',
  },
  {
    key: 'mortgages',
    categoryKey: 'mortgages_loans',
    targetType: 'mortgage',
    sourceTypes: ['mortgage'],
    fallbackType: 'mortgage',
    title: 'Mortgage Loan',
    idPrefix: 'mort',
    accountSeed: '6789012345678901',
  },
  {
    key: 'investments',
    categoryKey: 'investments',
    targetType: 'investment_account',
    sourceTypes: ['investment_account'],
    fallbackType: 'investment_account',
    title: 'Investment Portfolio',
    idPrefix: 'inv',
    accountSeed: '7890123456789012',
  },
]

const CURRENT_ACCOUNT_BALANCE_FACTORS = [1, 0.72, 1.28, 0.54, 1.62]

function replaceTailDigits(seed: string, index: number): string {
  const suffix = String(index + 1).padStart(2, '0')
  return `${seed.slice(0, -2)}${suffix}`
}

function cardSecurityCode(index: number): string {
  return String((214 + index * 137) % 1000).padStart(3, '0')
}

function productName(baseName: string, count: number, index: number): string {
  return count === 1 ? baseName : `${baseName} ${index + 1}`
}

function sourceForDefinition(definition: ProductCountDefinition, allProducts: Product[]): Product {
  const source =
    allProducts.find((product) => definition.sourceTypes.includes(product.type)) ??
    allProducts.find((product) => product.type === definition.fallbackType) ??
    allProducts[0]

  if (!source) {
    throw new Error(`Product source invariant failed for count key "${definition.key}"`)
  }

  return source
}

function indexedCurrentAccountBalance(baseBalance: number, index: number): number {
  const factor = CURRENT_ACCOUNT_BALANCE_FACTORS[index] ?? Math.max(0.35, 1 - index * 0.13)
  return roundMoney(baseBalance * factor)
}

function cloneProductForCount(
  definition: ProductCountDefinition,
  allProducts: Product[],
  count: number,
  index: number,
): Product {
  const source = sourceForDefinition(definition, allProducts)
  const sourceCreditCard = source.type === 'credit_card' ? source : undefined
  const accountNumber = replaceTailDigits(definition.accountSeed, index)
  const id = `${definition.idPrefix}-${index + 1}`
  const baseProduct = {
    ...source,
    id,
    name: productName(definition.title, count, index),
    accountNumber,
  }

  switch (definition.targetType) {
    case 'debit_card': {
      const product = {
        ...baseProduct,
        type: 'debit_card' as const,
        linkedAccountId: `acc-${index + 1}`,
        cardType: 'Standard' as const,
        cardNumber: accountNumber,
        expiryDate: '12/29',
        cardHolderName: 'PETER JAGODIĆ',
        securityCode: cardSecurityCode(index),
        balance: 0,
      }
      return product
    }
    case 'meal_card': {
      const product = {
        ...baseProduct,
        type: 'meal_card' as const,
        linkedAccountId: `acc-${index + 1}`,
        cardType: 'Standard' as const,
        cardNumber: accountNumber,
        expiryDate: '12/29',
        cardHolderName: 'PETER JAGODIĆ',
        securityCode: cardSecurityCode(index),
        balance: 0,
      }
      return product
    }
    case 'credit_card': {
      const product = {
        ...baseProduct,
        type: 'credit_card' as const,
        cardType: 'Standard' as const,
        cardNumber: accountNumber,
        expiryDate: '12/29',
        cardHolderName: 'PETER JAGODIĆ',
        securityCode: cardSecurityCode(index),
        creditLimit: sourceCreditCard?.creditLimit ?? 5000,
        availableCredit: sourceCreditCard?.availableCredit ?? 3200,
        balance: sourceCreditCard?.availableCredit ?? 3200,
      }
      return product
    }
    case 'current_account': {
      const product = {
        ...baseProduct,
        type: 'current_account' as const,
        balance: indexedCurrentAccountBalance(baseProduct.balance, index),
        iban: accountNumber,
      }
      return product
    }
    case 'saving_account': {
      const product = {
        ...baseProduct,
        type: 'saving_account' as const,
        iban: accountNumber,
      }
      return product
    }
    case 'term_deposit': {
      const product = {
        ...baseProduct,
        type: 'term_deposit' as const,
      }
      return product
    }
    case 'loan': {
      const product = {
        ...baseProduct,
        type: 'loan' as const,
        balance: -Math.abs(baseProduct.balance || 45000),
        loanAmount: Math.abs(baseProduct.balance || 45000),
        remainingAmount: Math.abs(baseProduct.balance || 45000),
        monthlyPayment: 900,
      }
      return product
    }
    case 'mortgage': {
      const product = {
        ...baseProduct,
        type: 'mortgage' as const,
        balance: -Math.abs(baseProduct.balance || 2850000),
        loanAmount: Math.abs(baseProduct.balance || 2850000),
        remainingAmount: Math.abs(baseProduct.balance || 2850000),
        propertyValue: Math.abs(baseProduct.balance || 2850000) * 1.2,
        monthlyPayment: 3500,
      }
      return product
    }
    case 'investment_account': {
      const product = {
        ...baseProduct,
        type: 'investment_account' as const,
        portfolioValue: Math.abs(baseProduct.balance || 42500),
        totalGainLoss: 728.45,
        totalGainLossPercentage: 1.74,
      }
      return product
    }
  }
}

export function applyProductCounts(categories: ProductCategory[], productCounts: ProductCounts): ProductCategory[] {
  const allProducts = categories.flatMap((category) => category.products)

  return categories
    .map((category) => {
      const definitions = PRODUCT_COUNT_DEFINITIONS.filter((definition) => definition.categoryKey === category.key)

      if (definitions.length === 0) {
        return category
      }

      const products = definitions.flatMap((definition) => {
        const count = productCounts[definition.key] ?? 0
        return Array.from({ length: count }, (_, index) => cloneProductForCount(definition, allProducts, count, index))
      })

      return {
        ...category,
        products,
      }
    })
    .filter((category) => category.products.length > 0)
}
