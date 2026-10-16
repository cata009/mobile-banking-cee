// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render as rtlRender, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import { TransactionDetailScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { getAccountTransactions } from '@/data/accountDetails'
import { getPfmCategorySelection } from '@/data/pfmCategories'
import { mockProducts, type Product } from '@/data/products'
import {
  loadActualNativeAnalyticsModule,
  productCountsForNative,
  resetNativeAnalyticsRenderer,
  waitForNativeAnalyticsScreen,
} from './nativeAnalyticsL6Harness'

const mockedProductState = vi.hoisted(() => ({
  categories: [] as Array<{
    key: string
    title: string
    products: Product[]
  }>,
}))
const nativeLoader = vi.hoisted(() => ({ load: vi.fn() }))

vi.mock('@/app/components/demo/nativeDemoLoader', () => ({
  loadNativeDemoModule: nativeLoader.load,
}))

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => mockedProductState,
}))

async function renderNative(ui: React.ReactElement, options?: Parameters<typeof rtlRender>[1]) {
  const view = rtlRender(ui, options)
  await waitForNativeAnalyticsScreen(view.container)
  return view
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider initialState={{ country: 'RO', productCounts: productCountsForNative(mockProducts) }}>
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
  resetNativeAnalyticsRenderer()
  nativeLoader.load.mockReset()
  nativeLoader.load.mockImplementation(loadActualNativeAnalyticsModule)
  mockedProductState.categories = [{ key: 'test-products', title: 'Test products', products: mockProducts }]
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('PFM transaction recategorization entry points', () => {
  it('shows a completed-month report for current accounts but never for saving accounts', async () => {
    const onOpenSpending = vi.fn()
    const onOpenIncome = vi.fn()
    const onOpenExpenses = vi.fn()
    const current = await renderNative(
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

    const decemberReport = current.container.querySelector<HTMLElement>('[data-testid="monthly-report-2025-12"]')
    expect(decemberReport).toBeInTheDocument()
    // The baseline keeps its original report — a plain heading over the two-bar
    // chart. The Spending-card treatment below belongs to Evo 2027 alone.
    expect(decemberReport).toHaveTextContent(/Monthly report/i)
    expect(decemberReport).not.toHaveTextContent(/Net cashflow/i)
    expect(decemberReport).not.toHaveTextContent(/Net cashflow/i)
    expect(decemberReport).toHaveTextContent('4.399,84 CZK')
    const monthlyBars = Array.from(decemberReport!.querySelectorAll<HTMLElement>('*'))
      .filter((element) => window.getComputedStyle(element).height === '172px')
    expect(monthlyBars.length).toBeGreaterThan(0)
    fireEvent.click(within(decemberReport!).getByRole('button', { name: /Open December 2025 spending/i }))
    await waitFor(() => expect(onOpenSpending).toHaveBeenCalledTimes(1))
    fireEvent.click(within(decemberReport!).getByRole('button', { name: 'Open income analytics' }))
    await waitFor(() => expect(onOpenIncome).toHaveBeenCalledTimes(1))
    fireEvent.click(within(decemberReport!).getByRole('button', { name: 'Open expenses analytics' }))
    await waitFor(() => expect(onOpenExpenses).toHaveBeenCalledTimes(1))
    current.unmount()

    const saving = await renderNative(
      <AccountDetailScreen
        selectedProductId="sav-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: Providers },
    )

    expect(saving.container.querySelector('[data-testid^="monthly-report-"]')).toBeNull()
    saving.unmount()

    // Evo 2027 keeps the Spending-card treatment: the month named in the brand
    // colour and uppercase, with the signed total under the two flows.
    await renderNative(
      <AccountDetailScreen
        selectedProductId="acc-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
        onOpenSpending={() => undefined}
      />,
      {
        wrapper: ({ children }) => (
          <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027' }}>
            <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
          </DemoProvider>
        ),
      },
    )
    const evoReport = screen.getByRole('button', { name: /Open Total December 2025 spending/i }).parentElement
    expect(evoReport).toHaveTextContent(/Net cashflow/i)
    expect(evoReport).toHaveTextContent(/December 2025/i)
    const flowBars = Array.from(evoReport?.querySelectorAll<HTMLElement>('*') ?? [])
      .filter(element => getComputedStyle(element).height === '12px')
    expect(flowBars.length).toBeGreaterThanOrEqual(2)
  })

  it('opens the category sheet from a list icon without invoking transaction navigation', async () => {
    const onTransactionClick = vi.fn()
    await renderNative(
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

    expect(await screen.findByText('Change category')).toBeInTheDocument()
    expect(onTransactionClick).not.toHaveBeenCalled()
  })

  it('keeps the rest of a split transaction row connected to Transaction Details', async () => {
    const onTransactionClick = vi.fn()
    await renderNative(
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

    await waitFor(() => expect(onTransactionClick).toHaveBeenCalledOnce())
    expect(screen.queryByText('CATEGORY GROUPS')).not.toBeInTheDocument()
  })

  it('uses the same Native picker from Transaction Details and emits the full connected selection', async () => {
    const transaction = getAccountTransactions('RO', 0, 'RON').find((item) =>
      item.type === 'debit' &&
      getPfmCategorySelection(item.pfmCategory, item.pfmSubcategory).subcategory !== 'MORTGAGE',
    )
    if (!transaction) throw new Error('RO fixture must expose a debit transaction')
    const onCategoryChange = vi.fn()

    await renderNative(
      <TransactionDetailScreen
        country="RO"
        transaction={transaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
        onCategoryChange={onCategoryChange}
      />,
      { wrapper: Providers },
    )

    fireEvent.click(await screen.findByRole('button', { name: /Change category/i }))
    fireEvent.change(await screen.findByRole('searchbox', { name: 'Search' }), { target: { value: 'mortgage' } })
    const mortgageOption = await screen.findByRole('radio', { name: 'MORTGAGE' })
    fireEvent.click(mortgageOption)
    const confirm = screen.getByRole('button', { name: 'CHANGE CATEGORY' })
    await waitFor(() => expect(confirm).not.toBeDisabled())
    fireEvent.click(confirm)

    await waitFor(() =>
      expect(onCategoryChange).toHaveBeenCalledWith(transaction, {
        groupId: 'financial',
        groupLabel: 'FINANCIAL',
        category: 'Finance',
        subcategory: 'MORTGAGE',
      }),
    )
    expect(screen.queryByText('CATEGORY GROUPS')).not.toBeInTheDocument()
  })

  it('keeps two pending transactions above booked activity on only the first current account', async () => {
    const firstCurrent = await renderNative(
      <AccountDetailScreen
        selectedProductId="acc-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: Providers },
    )

    const pendingSection = firstCurrent.container.querySelector<HTMLElement>('[data-testid="ro-pending-transactions"]')
    expect(pendingSection).toBeInTheDocument()
    const pendingRows = pendingSection ? within(pendingSection).getAllByRole('button') : []
    expect(pendingRows).toHaveLength(2)
    expect(pendingRows.every((row) => row.textContent?.includes('Pending'))).toBe(true)
    expect(pendingSection).toHaveTextContent('Pending')
    expect(pendingSection?.querySelectorAll('[aria-label^="Change category"]')).toHaveLength(0)
    firstCurrent.unmount()

    const secondCurrent = await renderNative(
      <AccountDetailScreen
        selectedProductId="acc-2"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: Providers },
    )

    expect(secondCurrent.container.querySelector('[data-testid="ro-pending-transactions"]')).toBeNull()
  })

  it('removes PFM content and category actions from a pending Native transaction detail', async () => {
    const pendingTransaction = getAccountTransactions('RO', 0, 'RON').find((item) => item.status === 'Pending')
    if (!pendingTransaction) throw new Error('RO fixture must expose a pending transaction')

    await renderNative(
      <TransactionDetailScreen
        country="RO"
        transaction={pendingTransaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
        onCategoryChange={() => undefined}
      />,
      { wrapper: Providers },
    )

    expect(await screen.findByText('Pending')).toBeInTheDocument()
    expect(screen.queryByTestId('transaction-pfm-summary')).not.toBeInTheDocument()
    expect(screen.queryByText('Spending Insight')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Change category/i })).not.toBeInTheDocument()
  })
})
