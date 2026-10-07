import type { Product, ProductCategory } from '@/data/products'

const CZ_APP_2027_CURRENT_ACCOUNTS: ReadonlyArray<
  Pick<Product, 'id' | 'name' | 'accountNumber' | 'balance' | 'currency'>
> = [
  {
    id: 'acc-1',
    name: 'Everyday account',
    accountNumber: '123456789/2700',
    balance: 22850.5,
    currency: 'CZK',
  },
  {
    id: 'acc-2',
    name: 'Euro account',
    accountNumber: '987654321/2700',
    balance: 620.75,
    currency: 'EUR',
  },
  {
    id: 'acc-3',
    name: 'Dollar account',
    accountNumber: '245813579/2700',
    balance: 334.39,
    currency: 'USD',
  },
]

const CZ_APP_2027_TERM_DEPOSITS: ReadonlyArray<
  Pick<Product, 'id' | 'name' | 'accountNumber' | 'balance' | 'currency'>
> = [
  {
    id: 'term-1',
    name: 'Term Deposits',
    accountNumber: '4567890123456789',
    balance: 206414,
    currency: 'CZK',
  },
  {
    id: 'term-2',
    name: 'Term Deposits',
    accountNumber: '4567890123456790',
    balance: 85000,
    currency: 'CZK',
  },
  {
    id: 'term-3',
    name: 'Term Deposits',
    accountNumber: '4567890123456791',
    balance: 420000,
    currency: 'CZK',
  },
]

export function applyCzApp2027CurrentAccounts(categories: ProductCategory[]): ProductCategory[] {
  const sourceAccount = categories
    .flatMap((category) => category.products)
    .find((product) => product.type === 'current_account')

  if (!sourceAccount) return categories

  return categories.map((category) => {
    if (category.key !== 'accounts') return category

    return {
      ...category,
      products: CZ_APP_2027_CURRENT_ACCOUNTS.map((account) => ({
        ...sourceAccount,
        ...account,
        type: 'current_account' as const,
      })),
    }
  })
}

export function applyCzApp2027TermDeposits(categories: ProductCategory[]): ProductCategory[] {
  const sourceDeposit = categories
    .flatMap((category) => category.products)
    .find((product) => product.type === 'term_deposit')

  if (!sourceDeposit) return categories

  return categories.map((category) => {
    if (category.key !== 'savings_deposits') return category

    return {
      ...category,
      products: [
        ...category.products.filter((product) => product.type !== 'term_deposit'),
        ...CZ_APP_2027_TERM_DEPOSITS.map((deposit) => ({
          ...sourceDeposit,
          ...deposit,
          type: 'term_deposit' as const,
        })),
      ],
    }
  })
}

export function applyCzApp2027DebitCards(categories: ProductCategory[]): ProductCategory[] {
  return categories.map((category) => {
    if (category.key !== 'cards') return category

    let debitCardIndex = 0
    return {
      ...category,
      products: category.products.map((product) => {
        if (product.type !== 'debit_card') return product

        const linkedAccount = CZ_APP_2027_CURRENT_ACCOUNTS[debitCardIndex] ?? CZ_APP_2027_CURRENT_ACCOUNTS[0]
        debitCardIndex += 1
        if (!linkedAccount) return product

        return {
          ...product,
          name: linkedAccount.currency === 'CZK' ? 'Debit Standard' : `Debit Standard ${linkedAccount.currency}`,
          currency: linkedAccount.currency,
          linkedAccountId: linkedAccount.id,
        }
      }),
    }
  })
}
