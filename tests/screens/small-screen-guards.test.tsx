// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { createRef, type PropsWithChildren } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import AnalyticsScreen from '@/app/screens/analytics/AnalyticsScreen'
import CardDetailScreen from '@/app/screens/cards/CardDetailScreen'
import { TransactionDetailScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import PaymentsScreen from '@/app/screens/payments/PaymentsScreen'
import { BankingContent } from '@/app/screens/products/SmeProductsScreen'
import { TutorialsFlow } from '@/app/screens/more/tutorials/TutorialsFlow'
import { getPaymentsMenuForCountry } from '@/app/config/paymentsMenuConfig'
import { getTutorialsForCountry } from '@/app/config/tutorialsConfig'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { getAccountTransactions } from '@/data/accountDetails'
import { createTransactionDetailData } from '@/data/paymentFlow'
import { mockProducts, type Product } from '@/data/products'
import type { ProductCounts } from '@/app/state/demoTypes'
import { createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics'
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting'
import {
  asyncNativeReady,
  nativeWebRendererDiagnostics,
  resetNativeWebRendererDiagnostics,
} from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

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

function productCountsFor(products: readonly Product[]): ProductCounts {
  return {
    accounts: products.filter(product => product.type === 'current_account').length,
    debitCards: products.filter(product => product.type === 'debit_card').length,
    creditCards: products.filter(product => product.type === 'credit_card').length,
    mealCards: products.filter(product => product.type === 'meal_card').length,
    deposits: products.filter(product => product.type === 'term_deposit').length,
    savingsAccounts: products.filter(product => product.type === 'saving_account').length,
    loans: products.filter(product => product.type === 'loan').length,
    mortgages: products.filter(product => product.type === 'mortgage').length,
    investments: products.filter(product => product.type === 'investment_account').length,
  }
}

function AppProviders({ children }: PropsWithChildren) {
  const products = mockedProductState.categories.flatMap(category => category.products)
  return (
    <DemoProvider initialState={{ product: 'PI', country: 'RO', productCounts: productCountsFor(products) }}>
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

let originalMatchMedia: typeof window.matchMedia

beforeEach(() => {
  resetNativeWebRendererDiagnostics()
  originalMatchMedia = window.matchMedia
  window.matchMedia = vi.fn((media: string) => ({ media, matches: false })) as unknown as typeof window.matchMedia
})

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
  window.matchMedia = originalMatchMedia
  vi.unstubAllGlobals()
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

    const view = render(<AnalyticsScreen />, { wrapper: AppProviders })
    return asyncNativeReady(view.container).then(() => {
      expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.route).toEqual({ screen: 'pfm' })
      expect(view.container.querySelector('[data-native-current-host="true"]')).toHaveTextContent(
        'No transactions for this period',
      )
      expect(screen.getByText('APRIL')).toBeInTheDocument()
    })
  })

  it('falls back from invalid account and card IDs to the first Source product and preserves callbacks', async () => {
    setProducts(mockProducts)
    const firstAccount = mockProducts.find(product => product.type === 'current_account')
    const firstCard = mockProducts.find(product => product.type === 'credit_card' || product.type === 'debit_card')
    if (!firstAccount || !firstCard) throw new Error('Expected Native account and card fixtures')
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
    await asyncNativeReady(account.container)
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.route).toMatchObject({
      screen: 'account',
      params: { productId: 'missing-account', accountId: 'missing-account' },
    })
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.bankingPresentation?.productCategories)
      .toEqual(mockedProductState.categories)
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.bankingPresentation?.productId).toBe(firstAccount.id)
    expect(within(account.container).getByRole('button', { name: firstAccount.name })).toBeInTheDocument()
    fireEvent.click(within(account.container).getByRole('button', { name: 'Details' }))
    expect(onDetailsClick).toHaveBeenCalledWith(expect.objectContaining({ id: firstAccount.id }))
    account.unmount()

    const onCardOptionsClick = vi.fn()
    const card = render(
      <CardDetailScreen
        selectedCardId="missing-card"
        onBack={() => undefined}
        onCardOptionsClick={onCardOptionsClick}
      />,
      { wrapper: AppProviders },
    )
    await asyncNativeReady(card.container)
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.route).toMatchObject({
      screen: 'card',
      params: { productId: 'missing-card', cardId: 'missing-card' },
    })
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.bankingPresentation?.productCategories)
      .toEqual(mockedProductState.categories)
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.bankingPresentation?.productId).toBe(firstCard.id)
    expect(within(card.container).getByRole('button', { name: firstCard.name })).toBeInTheDocument()
    fireEvent.click(within(card.container).getByRole('button', { name: 'Options' }))
    expect(onCardOptionsClick).toHaveBeenCalledWith(expect.objectContaining({ id: firstCard.id }))
  })

  it('forwards a session credit-limit override to the active Native card', async () => {
    const creditCard = mockProducts.find((product) => product.type === 'credit_card')
    if (!creditCard || creditCard.type !== 'credit_card') throw new Error('Expected a credit card fixture')
    setProducts([creditCard])
    const onCardOptionsClick = vi.fn()
    const nextAvailableCredit = formatEvo2027Number(creditCard.availableCredit + 5000)

    const view = render(
      <CardDetailScreen
        selectedCardId={creditCard.id}
        creditLimitOverrides={{ [creditCard.id]: creditCard.creditLimit + 5000 }}
        onBack={() => undefined}
        onCardOptionsClick={onCardOptionsClick}
      />,
      { wrapper: AppProviders },
    )
    await asyncNativeReady(view.container)
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.creditLimitOverrides).toEqual({
      [creditCard.id]: creditCard.creditLimit + 5000,
    })
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.bankingPresentation?.productCategories)
      .toEqual(mockedProductState.categories)
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.route).toMatchObject({
      screen: 'card',
      params: { productId: creditCard.id, cardId: creditCard.id },
    })
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.bankingPresentation?.productId).toBe(creditCard.id)
    const nativeHost = view.container.querySelector('[data-native-current-host="true"]') as HTMLElement
    expect(nativeHost).toHaveTextContent('Free To Spend')
    expect(nativeHost).toHaveTextContent(nextAvailableCredit)
    fireEvent.click(within(view.container).getByRole('button', { name: 'Options' }))
    expect(onCardOptionsClick).toHaveBeenCalledWith(expect.objectContaining({ id: creditCard.id }))
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
    return asyncNativeReady(account.container).then(async () => {
      expect(screen.getByText('My Products')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Details' })).not.toBeInTheDocument()
      expect(onAccountDetails).not.toHaveBeenCalled()
      account.unmount()

      const onCardDetails = vi.fn()
      const card = render(
        <CardDetailScreen
          selectedCardId="missing-card"
          onBack={() => undefined}
          onCardDetailsClick={onCardDetails}
        />,
        { wrapper: AppProviders },
      )
      await asyncNativeReady(card.container)
      expect(screen.getByText('Cards')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Card Details' })).not.toBeInTheDocument()
      expect(onCardDetails).not.toHaveBeenCalled()
    })
  })
})

describe('small-screen interaction boundaries', () => {
  it('does not open a sheet when a configured payment item has no correlated hero config', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    setProducts(mockProducts)
    const menu = getPaymentsMenuForCountry('RO')
    const item = menu.primaryItems[0]
    if (!item) throw new Error('RO payments must expose at least one primary item')
    const heroConfig = menu.heroSheets[item.id]
    Reflect.deleteProperty(menu.heroSheets, item.id)

    try {
      const view = render(<PaymentsScreen />, { wrapper: AppProviders })
      await asyncNativeReady(view.container)
      fireEvent.click(await screen.findByRole('button', { name: new RegExp(item.title, 'i') }))
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

  it('renders one exact domestic transaction breakdown heading', async () => {
    const transaction = getAccountTransactions('RO', 0, 'RON')[0]
    if (!transaction) throw new Error('RO account profile must expose a transaction')
    const detail = createTransactionDetailData(transaction, 'RO', null)
    const expectedHeading = `BREAKDOWN FOR ${detail.categoryTag}`

    const view = render(
      <TransactionDetailScreen
        country="RO"
        transaction={transaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
      />,
      { wrapper: AppProviders },
    )

    await asyncNativeReady(view.container)
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
