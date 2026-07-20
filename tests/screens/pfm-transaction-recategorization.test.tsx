// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import { TransactionDetailScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { getAccountTransactions } from '@/data/accountDetails'
import { mockProducts, type Product } from '@/data/products'

const mockedProductState = vi.hoisted(() => ({
  categories: [] as Array<{
    key: string
    title: string
    products: Product[]
  }>,
}))

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => mockedProductState,
}))

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider initialState={{ country: 'RO' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

beforeEach(() => {
  mockedProductState.categories = [{ key: 'test-products', title: 'Test products', products: mockProducts }]
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('PFM transaction recategorization entry points', () => {
  it('opens the category sheet from a list icon without invoking transaction navigation', () => {
    const onTransactionClick = vi.fn()
    render(
      <AccountDetailScreen
        selectedProductId="acc-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
        onTransactionClick={onTransactionClick}
        onTransactionCategoryChange={() => undefined}
      />,
      { wrapper: Providers },
    )

    fireEvent.click(screen.getAllByRole('button', { name: /Change category for/i })[0]!)

    expect(screen.getByRole('dialog', { name: 'Change category' })).toBeInTheDocument()
    expect(onTransactionClick).not.toHaveBeenCalled()
  })

  it('keeps the rest of a split transaction row connected to Transaction Details', () => {
    const onTransactionClick = vi.fn()
    render(
      <AccountDetailScreen
        selectedProductId="acc-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
        onTransactionClick={onTransactionClick}
        onTransactionCategoryChange={() => undefined}
      />,
      { wrapper: Providers },
    )

    fireEvent.click(screen.getAllByRole('button', { name: /Open transaction/i })[0]!)

    expect(onTransactionClick).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog', { name: 'Change category' })).not.toBeInTheDocument()
  })

  it('uses the same picker from Transaction Details and emits the full connected selection', () => {
    const transaction = getAccountTransactions('RO', 0, 'RON').find((item) => item.type === 'debit')
    if (!transaction) throw new Error('RO fixture must expose a debit transaction')
    const onCategoryChange = vi.fn()

    render(
      <TransactionDetailScreen
        country="RO"
        transaction={transaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
        onCategoryChange={onCategoryChange}
      />,
      { wrapper: Providers },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Change category' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'mortgage' } })
    fireEvent.click(screen.getByRole('radio', { name: 'MORTGAGE' }))
    fireEvent.click(screen.getByRole('button', { name: 'CHANGE CATEGORY' }))

    expect(onCategoryChange).toHaveBeenCalledWith(transaction, {
      groupId: 'financial',
      groupLabel: 'FINANCIAL',
      category: 'Finance',
      subcategory: 'MORTGAGE',
    })
    expect(screen.queryByRole('dialog', { name: 'Change category' })).not.toBeInTheDocument()
  })
})
