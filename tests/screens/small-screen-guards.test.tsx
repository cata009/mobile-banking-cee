// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef, type PropsWithChildren } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import AnalyticsScreen from '@/app/screens/analytics/AnalyticsScreen'
import CardDetailScreen from '@/app/screens/cards/CardDetailScreen'
import { TransactionDetailScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import PaymentsScreen from '@/app/screens/payments/PaymentsScreen'
import { BankingContent } from '@/app/screens/products/ProductsScreen'
import { TutorialsFlow } from '@/app/screens/more/tutorials/TutorialsFlow'
import { getPaymentsMenuForCountry } from '@/app/config/paymentsMenuConfig'
import { getTutorialsForCountry } from '@/app/config/tutorialsConfig'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { getAccountTransactions } from '@/data/accountDetails'
import { createTransactionDetailData } from '@/data/paymentFlow'
import { mockProducts, type Product } from '@/data/products'
import { createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics'

const mockedProductState = vi.hoisted(() => ({
  categories: [] as Array<{ key: string; title: string; products: Product[] }>,
}))

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => mockedProductState,
}))

vi.mock('@/app/components/payments/PaymentHeroCard', () => ({
  default: ({
    item,
    onSelect,
  }: {
    item: { id: string; title: string }
    onSelect?: (item: { id: string; title: string }) => void
  }) => (
    <button type="button" onClick={() => onSelect?.(item)}>
      {item.title}
    </button>
  ),
}))

vi.mock('@/app/components/products/ProductMenuCard', () => ({
  default: ({ card }: { card: { title: string } }) => <button type="button">{card.title}</button>,
}))

vi.mock('@/app/components/products/ProductOfferCard', () => ({
  default: ({ offer }: { offer: { title: string } }) => <button type="button">{offer.title}</button>,
}))

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'RO' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function setProducts(products: Product[]) {
  mockedProductState.categories = products.length > 0
    ? [{ key: 'test-products', title: 'Test products', products }]
    : []
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  cleanup()
  setProducts([])
  vi.restoreAllMocks()
})

describe('small-screen empty and invalid state guards', () => {
  it('renders the deterministic zero analytics period without crashing', () => {
    setProducts([])
    const timeline = createSpendingAnalyticsTimeline('RO', [])
    const activeSummary = timeline.summariesByPeriodKey[timeline.activePeriodKey]

    expect(timeline.periods).toHaveLength(1)
    expect(activeSummary).toMatchObject({ incomeTotal: 0, spendingTotal: 0, netTotal: 0 })

    render(<AnalyticsScreen />, { wrapper: AppProviders })

    expect(screen.getByText('APRIL')).toBeInTheDocument()
    expect(screen.getAllByText('No transactions for this period')).toHaveLength(2)
  })

  it('falls back from invalid account and card IDs to the first matching product', () => {
    setProducts(mockProducts)
    const onDetailsClick = vi.fn()
    const account = render(
      <AccountDetailScreen
        selectedProductId="missing-account"
        onBack={() => undefined}
        onDetailsClick={onDetailsClick}
        onOptionsClick={() => undefined}
      />,
      { wrapper: AppProviders },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Details' }))
    expect(onDetailsClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'acc-1' }))
    account.unmount()

    const onCardOptionsClick = vi.fn()
    render(
      <CardDetailScreen
        selectedCardId="missing-card"
        onBack={() => undefined}
        onCardOptionsClick={onCardOptionsClick}
      />,
      { wrapper: AppProviders },
    )

    fireEvent.click(screen.getByRole('button', { name: 'Options' }))
    expect(onCardOptionsClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'card-2' }))
  })

  it('renders header-only account and card screens for zero products without detail actions', () => {
    setProducts([])
    const onAccountDetails = vi.fn()
    const account = render(
      <AccountDetailScreen
        selectedProductId="missing-account"
        onBack={() => undefined}
        onDetailsClick={onAccountDetails}
        onOptionsClick={() => undefined}
      />,
      { wrapper: AppProviders },
    )

    expect(screen.getByText('My Products')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Details' })).not.toBeInTheDocument()
    expect(onAccountDetails).not.toHaveBeenCalled()
    account.unmount()

    const onCardDetails = vi.fn()
    render(
      <CardDetailScreen
        selectedCardId="missing-card"
        onBack={() => undefined}
        onCardDetailsClick={onCardDetails}
      />,
      { wrapper: AppProviders },
    )

    expect(screen.getByText('Cards')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Card Details' })).not.toBeInTheDocument()
    expect(onCardDetails).not.toHaveBeenCalled()
  })
})

describe('small-screen interaction boundaries', () => {
  it('does not open a sheet when a configured payment item has no correlated hero config', () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const menu = getPaymentsMenuForCountry('RO')
    const item = menu.primaryItems[0]
    if (!item) throw new Error('RO payments must expose at least one primary item')
    const heroConfig = menu.heroSheets[item.id]
    Reflect.deleteProperty(menu.heroSheets, item.id)

    try {
      render(<PaymentsScreen />, { wrapper: AppProviders })
      fireEvent.click(screen.getByRole('button', { name: new RegExp(item.title, 'i') }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    } finally {
      menu.heroSheets[item.id] = heroConfig
    }
  })

  it('keeps tutorial Previous, NEXT, and DONE controls inside a non-empty slide tuple', () => {
    const tutorials = getTutorialsForCountry('RO')
    expect(tutorials.every((tutorial) => tutorial.slides.length > 0)).toBe(true)
    const tutorial = tutorials[0]
    if (!tutorial) throw new Error('RO tutorials must expose at least one tutorial')
    const onClose = vi.fn()

    render(<TutorialsFlow country="RO" isOpen onClose={onClose} />, { wrapper: AppProviders })
    fireEvent.click(screen.getByRole('button', { name: `Open tutorial: ${tutorial.title}` }))

    expect(screen.getByRole('button', { name: 'Previous tutorial step' })).toBeDisabled()
    for (let index = 1; index < tutorial.slides.length; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'NEXT' }))
    }
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'DONE' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders one exact domestic transaction breakdown heading', () => {
    const transaction = getAccountTransactions('RO', 0, 'RON')[0]
    if (!transaction) throw new Error('RO account profile must expose a transaction')
    const detail = createTransactionDetailData(transaction, 'RO', null)
    const expectedHeading = `BREAKDOWN FOR ${detail.categoryTag}`

    render(
      <TransactionDetailScreen
        country="RO"
        transaction={transaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
      />,
      { wrapper: AppProviders },
    )

    expect(screen.getAllByText(expectedHeading)).toHaveLength(1)
  })

  it('accepts an HTMLElement ref and points it at the banking shelf', () => {
    const shelfRef = createRef<HTMLElement>()

    render(
      <BankingContent
        offersTitle="Offers"
        offers={[]}
        productsTitle="Products"
        products={[]}
        otherSolutionsTitle="Other solutions"
        otherSolutions={[]}
        onProductCardClick={() => undefined}
        productsSectionRef={shelfRef}
      />,
    )

    expect(shelfRef.current).toBeInstanceOf(HTMLElement)
    expect(shelfRef.current).toHaveAttribute('data-products-banking-shelf', 'true')
  })
})
