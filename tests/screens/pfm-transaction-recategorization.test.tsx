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
  it('shows a completed-month report for current accounts but never for saving accounts', () => {
    const onOpenSpending = vi.fn()
    const onOpenIncome = vi.fn()
    const onOpenExpenses = vi.fn()
    const current = render(
      <AccountDetailScreen
        selectedProductId="acc-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
        onOpenSpending={onOpenSpending}
        onOpenIncome={onOpenIncome}
        onOpenExpenses={onOpenExpenses}
      />,
      { wrapper: Providers },
    )

    expect(current.container.querySelectorAll('[data-monthly-account-report]')).not.toHaveLength(0)
    const decemberReport = current.container.querySelector<HTMLElement>('[data-monthly-account-report="2025-12"]')
    expect(decemberReport).toHaveTextContent(/Total December 2025/i)
    expect(decemberReport).toHaveTextContent(/4\.399,84\s*CZK/)
    expect(decemberReport?.querySelector('h3')).toHaveClass('uc-type-h2')
    expect(decemberReport).toHaveClass('rounded-[8px]', 'bg-[var(--uc-surface)]')
    expect(decemberReport?.querySelector('[data-monthly-report-total]')).toHaveClass('uc-type-n2-strong', 'text-[var(--uc-text-muted)]')
    expect(decemberReport?.querySelector('[data-monthly-report-total]')).toHaveTextContent(/[-+]\s*.*CZK/)
    expect(decemberReport?.querySelector('[data-ds-label="AccountTransactionMonthDivider"]')).not.toBeInTheDocument()
    expect(decemberReport?.previousElementSibling).toBeNull()
    expect(decemberReport).not.toHaveClass('border-b')
    // The report draws the same in/out bar pair the Evo spending card uses, not the old 160px column chart.
    const cashFlow = decemberReport?.querySelector('[data-monthly-cash-flow-chart]')
    expect(cashFlow).not.toHaveClass('h-[160px]')
    expect(cashFlow?.querySelector('[data-cash-flow-bars]')).toBeInTheDocument()
    expect(cashFlow?.querySelector('[data-cash-flow-bar="in"] > span')).toHaveStyle({ backgroundColor: 'var(--uc-green-success)' })
    expect(decemberReport?.querySelector('[data-cash-flow-total="inflow"]')).toHaveTextContent('4.399,84 CZK')
    fireEvent.click(decemberReport?.querySelector('[data-monthly-report-open]') as HTMLElement)
    fireEvent.click(decemberReport?.querySelector('[data-cash-flow-direction="income"]') as HTMLElement)
    fireEvent.click(decemberReport?.querySelector('[data-cash-flow-direction="expense"]') as HTMLElement)
    expect(onOpenSpending).toHaveBeenCalledTimes(1)
    expect(onOpenIncome).toHaveBeenCalledTimes(1)
    expect(onOpenExpenses).toHaveBeenCalledTimes(1)
    current.unmount()

    const saving = render(
      <AccountDetailScreen
        selectedProductId="sav-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: Providers },
    )

    expect(saving.container.querySelectorAll('[data-monthly-account-report]')).toHaveLength(0)
  })

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

  it('keeps two pending transactions above booked activity on only the first current account', () => {
    const firstCurrent = render(
      <AccountDetailScreen
        selectedProductId="acc-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: Providers },
    )

    const pendingSection = firstCurrent.container.querySelector<HTMLElement>('[data-pending-transactions]')
    expect(pendingSection).toHaveAttribute('data-pending-count', '2')
    expect(pendingSection?.querySelectorAll('[data-pending-transaction-row]')).toHaveLength(2)
    expect(pendingSection).toHaveTextContent('Pending')
    expect(pendingSection?.querySelectorAll('[aria-label^="Change category"]')).toHaveLength(0)
    firstCurrent.unmount()

    const secondCurrent = render(
      <AccountDetailScreen
        selectedProductId="acc-2"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: Providers },
    )

    expect(secondCurrent.container.querySelector('[data-pending-transactions]')).toBeNull()
  })

  it('removes PFM content and category actions from a pending transaction detail', () => {
    const pendingTransaction = getAccountTransactions('RO', 0, 'RON').find((item) => item.status === 'Pending')
    if (!pendingTransaction) throw new Error('RO fixture must expose a pending transaction')

    render(
      <TransactionDetailScreen
        country="RO"
        transaction={pendingTransaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
        onCategoryChange={() => undefined}
      />,
      { wrapper: Providers },
    )

    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.queryByTestId('transaction-pfm-summary')).not.toBeInTheDocument()
    expect(screen.queryByText('Spending Insight')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change category' })).not.toBeInTheDocument()
  })
})
