// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import CardDetailScreen from '@/app/screens/cards/CardDetailScreen'
import CardDetailsInfoScreen from '@/app/screens/cards/CardDetailsInfoScreen'
import { TransactionDetailScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import { DemoProvider } from '@/app/state/demoStore'
import { getAccountTransactions, getCardTransactions } from '@/data/accountDetails'
import { mockProducts, type Product } from '@/data/products'
import { formatMaskedCardNumber } from '@/app/utils/cardNumber'

const mockedProductState = vi.hoisted(() => ({
  categories: [] as Array<{ key: string; title: string; products: Product[] }>,
}))

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => mockedProductState,
}))

function AppProviders({ children, release = 'release-current' }: PropsWithChildren<{ release?: 'release-current' | 'release-future-evo-2027' }>) {
  return (
    <DemoProvider initialState={{ country: 'CZ', product: 'PI', release }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

const creditCard = mockProducts.find((product) => product.type === 'credit_card')
if (!creditCard || creditCard.type !== 'credit_card') throw new Error('Expected credit-card fixture')
const firstDebitCard = mockProducts.find((product) => product.type === 'debit_card')
const secondDebitCard = mockProducts.filter((product) => product.type === 'debit_card')[1]
const firstCurrentAccount = mockProducts.find((product) => product.type === 'current_account')
if (
  !firstDebitCard || firstDebitCard.type !== 'debit_card' ||
  !secondDebitCard || secondDebitCard.type !== 'debit_card' ||
  !firstCurrentAccount || firstCurrentAccount.type !== 'current_account'
) {
  throw new Error('Expected linked current-account and debit-card fixtures')
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  vi.useRealTimers()
  cleanup()
  mockedProductState.categories = []
})

describe('card-detail action boundaries', () => {
  it('opens Card Details directly but keeps Show Card Details behind Face ID', () => {
    vi.useFakeTimers()
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: [creditCard] }]
    const onCardDetailsClick = vi.fn()
    const onShowCardDetailsClick = vi.fn()

    render(
      <CardDetailScreen
        selectedCardId={creditCard.id}
        onBack={() => undefined}
        onCardDetailsClick={onCardDetailsClick}
        onShowCardDetailsClick={onShowCardDetailsClick}
      />,
      { wrapper: AppProviders },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Card Details' }))
    expect(onCardDetailsClick).toHaveBeenCalledWith(creditCard)
    expect(onShowCardDetailsClick).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Show Card Details' }))
    expect(onShowCardDetailsClick).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(840))
    expect(onShowCardDetailsClick).toHaveBeenCalledWith(creditCard)
  })

  it('reserves an unclipped overlay lane for the card shadow', () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: [creditCard] }]

    const { container } = render(
      <CardDetailScreen selectedCardId={creditCard.id} onBack={() => undefined} />,
      { wrapper: AppProviders },
    )

    const carousel = container.querySelector('[data-card-carousel]')
    expect(carousel).toHaveClass('relative', 'z-10', 'pb-[20px]', '-mb-[20px]')
  })

  it('uses the Virtual Standard Electric artwork for the EUR debit card in Evo 2027', () => {
    const euroDebitCard = {
      ...secondDebitCard,
      name: 'Debit Standard EUR',
      currency: 'EUR' as const,
    }
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: [euroDebitCard] }]

    const { container } = render(
      <CardDetailScreen selectedCardId={euroDebitCard.id} onBack={() => undefined} />,
      { wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders> },
    )

    expect(container.querySelector('[data-card-variant="mc-virtual-standard-violet"]')).toBeInTheDocument()
  })

  it('circles the category fallback in every release, so it matches the merchant marks beside it', () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: mockProducts }]

    // A card list now leads with merchant marks, which are filled roundels. A
    // bare category glyph next to them reads as a second icon language, so the
    // circled variant is the rule on statement surfaces rather than an Evo one.
    for (const release of ['release-future-evo-2027', undefined] as const) {
      const rendered = render(
        <CardDetailScreen selectedCardId={firstDebitCard.id} onBack={() => undefined} />,
        {
          wrapper: ({ children }) => release
            ? <AppProviders release={release}>{children}</AppProviders>
            : <AppProviders>{children}</AppProviders>,
        },
      )

      expect(rendered.container.querySelector('[data-merchant-logo]'), release ?? 'baseline').toBeInTheDocument()
      expect(
        rendered.container.querySelector('[data-pfm-icon-variant="category-circle"]'),
        release ?? 'baseline',
      ).toBeInTheDocument()
      rendered.unmount()
    }
  })

  it('groups a card month into the shared transaction card in Evo 2027 only', () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: mockProducts }]

    const groupCards = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('div'))
      .filter((element) => element.className.includes('rounded-[22px]') && element.className.includes('mx-[16px]'))

    const evo = render(
      <CardDetailScreen selectedCardId={firstDebitCard.id} onBack={() => undefined} />,
      { wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders> },
    )
    expect(groupCards(evo.container).length).toBeGreaterThan(0)
    evo.unmount()

    const current = render(
      <CardDetailScreen selectedCardId={firstDebitCard.id} onBack={() => undefined} />,
      { wrapper: AppProviders },
    )
    expect(groupCards(current.container)).toHaveLength(0)
  })

  it('uses the homepage success green for positive transaction rows in Evo 2027 only', () => {
    mockedProductState.categories = [{ key: 'accounts', title: 'Accounts', products: mockProducts }]

    const evo = render(
      <AccountDetailScreen
        selectedProductId={firstCurrentAccount.id}
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders> },
    )

    expect(evo.container.querySelector('[data-transaction-amount="positive"]')).toHaveClass('text-[#3D7D43]')
    evo.unmount()

    const current = render(
      <AccountDetailScreen
        selectedProductId={firstCurrentAccount.id}
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: AppProviders },
    )

    expect(current.container.querySelector('[data-transaction-amount="positive"]')).not.toHaveClass('text-[#3D7D43]')
  })

  it('keeps the direct Card Details page informational and non-sensitive', () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: [creditCard] }]

    render(
      <CardDetailsInfoScreen selectedCardId={creditCard.id} onBack={() => undefined} />,
      { wrapper: AppProviders },
    )

    expect(screen.getByText('Card product')).toBeInTheDocument()
    expect(screen.getByText('Card status')).toBeInTheDocument()
    expect(screen.getByText('Credit limit')).toBeInTheDocument()
    expect(screen.queryByText(creditCard.cardNumber)).not.toBeInTheDocument()
    expect(screen.queryByText(creditCard.securityCode ?? '')).not.toBeInTheDocument()
  })

  it('shows pending transactions only for the first debit card linked to the first current account', () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: mockProducts }]

    const firstDebit = render(
      <CardDetailScreen selectedCardId={firstDebitCard.id} onBack={() => undefined} />,
      { wrapper: AppProviders },
    )

    expect(firstDebit.container.querySelector('[data-pending-transactions]')).toHaveAttribute('data-pending-count', '2')
    firstDebit.unmount()

    const secondDebit = render(
      <CardDetailScreen selectedCardId={secondDebitCard.id} onBack={() => undefined} />,
      { wrapper: AppProviders },
    )

    expect(secondDebit.container.querySelector('[data-pending-transactions]')).toBeNull()
  })

  it('shares debit-card transactions with the linked current account but keeps credit-card activity separate', () => {
    const accountTransactions = getAccountTransactions('RO', 0, 'RON')
    const debitTransactions = getCardTransactions('RO', firstDebitCard, 'RON', 0)
    const creditTransactions = getCardTransactions('RO', creditCard, 'RON', 0)
    const accountTransactionIds = new Set(accountTransactions.map((transaction) => transaction.id))

    expect(debitTransactions.length).toBeGreaterThan(0)
    expect(debitTransactions.every((transaction) => transaction.source === 'card')).toBe(true)
    expect(debitTransactions.every((transaction) => accountTransactionIds.has(transaction.id))).toBe(true)
    expect(creditTransactions.every((transaction) => accountTransactionIds.has(transaction.id))).toBe(false)
  })

  it('uses a compact card transaction detail and reveals only the transaction date on Show more', () => {
    const transaction = getAccountTransactions('RO', 0, 'RON').find((item) => item.source === 'card')
    if (!transaction) throw new Error('Expected a debit-card transaction in the linked current account')

    render(
      <TransactionDetailScreen
        country="RO"
        product={firstDebitCard}
        transaction={transaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
      />,
      { wrapper: AppProviders },
    )

    expect(screen.getByText('Transaction description')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Posting date')).toBeInTheDocument()
    expect(screen.queryByText('Account number')).not.toBeInTheDocument()
    expect(screen.getByText('Spending Insight')).toBeInTheDocument()
    expect(screen.getByTestId('transaction-pfm-summary')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change category' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create Standing order' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Redo payment' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Request chargeback' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send payment' })).toBeInTheDocument()
    const actionBar = document.querySelector<HTMLElement>('[data-ds-label="AccountActionBar"]')
    expect(actionBar).not.toBeNull()
    const actionButtons = actionBar?.querySelectorAll('button')
    expect(actionButtons).toHaveLength(4)
    expect(actionButtons?.[1]).toHaveClass('invisible')
    expect(screen.getByText('Card used')).toBeInTheDocument()
    expect(screen.getByText(formatMaskedCardNumber(firstDebitCard.cardNumber))).toBeInTheDocument()
    expect(screen.queryByText('Transaction date')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Show more' }))
    expect(screen.getByText('Transaction date')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show less' })).toBeInTheDocument()
  })

  it('renders a verified merchant location as a clean static map with no external-map chrome', () => {
    const transaction = getAccountTransactions('RO', 0, 'RON').find((item) => item.label === 'Carrefour')
    if (!transaction) throw new Error('Expected the Carrefour card transaction fixture')

    render(
      <TransactionDetailScreen
        country="RO"
        product={firstDebitCard}
        transaction={transaction}
        merchantEnrichment={{
          cleanMerchantName: 'Carrefour',
          location: {
            label: 'Merchant location',
            address: 'Carrefour Băneasa · Șos. București-Ploiești 42D, Bucharest',
          },
        }}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
      />,
      { wrapper: AppProviders },
    )

    expect(screen.getByTestId('merchant-location-static-map')).toBeInTheDocument()
    expect(screen.getByTestId('merchant-location-static-map').querySelector('[fill="#D53A3A"]')).not.toBeInTheDocument()
    expect(screen.getByTestId('merchant-location-pin')).toHaveAttribute('data-icon-color', 'standard')
    expect(screen.queryByTitle('Google Maps — Merchant location')).not.toBeInTheDocument()
    expect(screen.queryByTestId('merchant-location-chevron')).not.toBeInTheDocument()
  })

  it('identifies the linked debit card when its transaction is opened from the current account', () => {
    const transaction = getAccountTransactions('RO', 0, 'RON').find((item) => item.source === 'card')
    if (!transaction) throw new Error('Expected a debit-card transaction in the linked current account')
    mockedProductState.categories = [{ key: 'products', title: 'Products', products: [firstCurrentAccount, firstDebitCard] }]

    render(
      <TransactionDetailScreen
        country="RO"
        product={firstCurrentAccount}
        transaction={transaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
      />,
      { wrapper: AppProviders },
    )

    expect(screen.getByText('Card used')).toBeInTheDocument()
    expect(screen.getByText(formatMaskedCardNumber(firstDebitCard.cardNumber))).toBeInTheDocument()
  })
})
