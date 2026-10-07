// @vitest-environment jsdom
import React from 'react'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from '@/app/App'
import { useDemo } from '@/app/state/demoStore'
import { useNavigationContext } from '@/app/contexts/NavigationContext'
import { useProducts } from '@/hooks/useProducts'
import { getAccountTransactions } from '@/data/accountDetails'
import type { Product, CreditCard } from '@/data/products'
import type { AccountTransaction } from '@/data/accountDetails'

let controls: ReturnType<typeof useDemo>
let navigation: ReturnType<typeof useNavigationContext>
let toolsBroken = false
let toolsMounts = 0

// Keep orchestration, providers, product derivation and URL sync real. The
// presentation doubles expose the callbacks/props at App's feature boundaries.
vi.mock('@/app/components/demo/DemoShell', () => ({
  DemoShell: ({ children }: React.PropsWithChildren) => {
    controls = useDemo()
    navigation = useNavigationContext()
    return <section>{children}</section>
  },
}))
vi.mock('@/app/components/MobileFrame', () => ({
  default: ({ children, overlay }: React.PropsWithChildren<{ overlay?: React.ReactNode }>) => (
    <main>
      {children}
      {overlay}
    </main>
  ),
}))
vi.mock('@/app/screens/home/App2027ThemePicker', () => ({ useApp2027Theme: () => 'standard' }))
vi.mock('@/app/components/PanelOverlay', () => ({ default: () => null }))
vi.mock('@/app/components/PreLoginActiveScreen', () => ({
  default: ({ onLoginClick }: { onLoginClick: () => void }) => <button onClick={onLoginClick}>Login</button>,
}))
vi.mock('@/app/screens/home/HomeScreen', () => ({
  default: ({ onAccountClick }: { onAccountClick: (product: Product) => void }) => {
    const { categories } = useProducts()
    return (
      <div>
        Home
        {categories
          .flatMap((category) => category.products)
          .map((product) => (
            <button key={product.id} onClick={() => onAccountClick(product)}>
              Open {product.id}
            </button>
          ))}
      </div>
    )
  },
}))
vi.mock('@/app/screens/cards/CardDetailScreen', () => ({
  default: ({
    selectedCardId,
    creditLimitOverrides,
    onTransactionClick,
  }: {
    selectedCardId?: string | null
    creditLimitOverrides: Record<string, number>
    onTransactionClick: (transaction: AccountTransaction, product: Product) => void
  }) => {
    const { country } = useDemo()
    const { categories } = useProducts()
    const products = categories.flatMap((category) => category.products)
    const card =
      products.find((product) => product.id === selectedCardId) ??
      products.find((product) => product.type === 'credit_card' || product.type === 'debit_card')
    if (!card) return <span>No card available</span>
    const transaction = getAccountTransactions(country, 0, card.currency)[0]!
    return (
      <>
        <output aria-label="Current credit limit">
          {creditLimitOverrides[card.id] ?? ('creditLimit' in card ? card.creditLimit : 0)} {card.currency} {country}
        </output>
        <output aria-label="Current card">{card.id}</output>
        <button onClick={() => onTransactionClick(transaction, card)}>Open card transaction</button>
      </>
    )
  },
}))
vi.mock('@/app/screens/cards/CreditLimitOfferFlow', () => ({
  default: ({ card, onComplete }: { card: CreditCard; onComplete: (id: string, limit: number) => void }) => (
    <button onClick={() => onComplete(card.id, card.creditLimit + 5000)}>Accept credit offer</button>
  ),
}))
vi.mock('@/app/screens/accounts/AccountDetailScreen', () => ({
  default: ({
    onTransactionClick,
    onOpenSpending,
  }: {
    onTransactionClick: (transaction: AccountTransaction, product: Product) => void
    onOpenSpending: () => void
  }) => {
    const { country } = useDemo()
    const { categories } = useProducts()
    const account = categories
      .flatMap((category) => category.products)
      .find((product) => product.type === 'current_account')!
    const transaction = getAccountTransactions(country, 0, account.currency)[0]!
    return (
      <>
        <button onClick={() => onTransactionClick(transaction, account)}>Open account transaction</button>
        <button onClick={onOpenSpending}>Open account spending</button>
      </>
    )
  },
}))
vi.mock('@/app/screens/payments/DomesticPaymentFlowScreens', () => ({
  DomesticPaymentCreateScreen: () => null,
  PaymentReviewScreen: () => null,
  PaymentSignScreen: () => null,
  PaymentSuccessScreen: () => null,
  TransactionDetailScreen: () => <div>Transaction detail</div>,
}))
vi.mock('@/app/screens/payments/Evo2027DomesticPaymentFlow', () => ({
  Evo2027DomesticPaymentCreateScreen: () => null,
  Evo2027PaymentReviewScreen: () => null,
}))
vi.mock('@/app/screens/tools/ToolsScreen', () => ({
  default: () => {
    if (toolsBroken) throw new Error('Tools destination failed')
    const [count, setCount] = React.useState(0)
    React.useEffect(() => {
      toolsMounts += 1
    }, [])
    return (
      <>
        <p>Tools ready</p>
        <button onClick={() => setCount(count + 1)}>Local count {count}</button>
      </>
    )
  },
}))

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
  toolsBroken = false
  vi.restoreAllMocks()
})

async function openCreditOffer() {
  fireEvent.click(screen.getByRole('button', { name: 'Open CZ - Chatbot' }))
  fireEvent.click(await screen.findByRole('button', { name: 'For you' }))
  fireEvent.click(await screen.findByRole('button', { name: "I'm interested" }))
  fireEvent.click(await screen.findByRole('button', { name: 'Review offer' }))
  await screen.findByText('Accept credit offer')
}

it('restores an unavailable My Banker link to a usable homepage', async () => {
  window.history.replaceState({}, '', '/?product=PI&country=RO&release=release-current&screen=my-banker')
  render(<App />)
  await screen.findByText('Home')
  expect(navigation.currentScreen).toBe('homepage')
  expect(new URLSearchParams(window.location.search).get('screen')).toBe('homepage')
})

it('keeps an approved CZ credit limit within its data context and restores it on return', async () => {
  window.history.replaceState(
    {},
    '',
    '/?product=PI&country=CZ&release=release-future-cz-coapping&screen=card-detail&card=card-credit-1',
  )
  render(<App />)
  await screen.findByLabelText('Current credit limit')
  await openCreditOffer()
  fireEvent.click(await screen.findByText('Accept credit offer'))
  await waitFor(() => expect(screen.getByLabelText('Current credit limit').textContent).toBe('15000 CZK CZ'))
  act(() => controls.setCountry('RO'))
  fireEvent.click(await screen.findByText('Login'))
  fireEvent.click(await screen.findByText('Open card-credit-1'))
  expect((await screen.findByLabelText('Current credit limit')).textContent).toBe('2156.93 RON RO')
  act(() => controls.setCountry('CZ'))
  fireEvent.click(await screen.findByText('Login'))
  fireEvent.click(await screen.findByText('Open card-credit-1'))
  expect((await screen.findByLabelText('Current credit limit')).textContent).toBe('15000 CZK CZ')
  act(() => controls.setRelease('release-current'))
  fireEvent.click(await screen.findByText('Login'))
  fireEvent.click(await screen.findByText('Open card-credit-1'))
  expect((await screen.findByLabelText('Current credit limit')).textContent).toBe('15000 CZK CZ')
  act(() => controls.setBaseline('uat-current'))
  fireEvent.click(await screen.findByText('Login'))
  fireEvent.click(await screen.findByText('Open card-credit-1'))
  expect((await screen.findByLabelText('Current credit limit')).textContent).toBe('15000 CZK CZ')
})

it('shares an account transaction through its account after visiting a card', async () => {
  window.history.replaceState({}, '', '/?product=PI&country=RO&screen=homepage')
  render(<App />)
  fireEvent.click(await screen.findByText('Open card-credit-1'))
  await screen.findByLabelText('Current credit limit')
  act(() => navigation.goBack())
  fireEvent.click(await screen.findByText('Open acc-1'))
  fireEvent.click(await screen.findByText('Open account transaction'))
  await screen.findByText('Transaction detail')
  const parameters = new URLSearchParams(window.location.search)
  expect(navigation.currentScreen).toBe('transaction-detail')
  expect(parameters.get('screen')).toBe('account-detail')
  expect(parameters.get('account')).toBe('acc-1')
  expect(parameters.has('card')).toBe(false)
  act(() => navigation.goBack())
  await screen.findByText('Open account transaction')
  expect(navigation.currentRoute).toEqual({ screen: 'account-detail', accountId: 'acc-1' })
})

it('shares a card transaction through the actual selected card and preserves back navigation', async () => {
  window.history.replaceState({}, '', '/?product=PI&country=RO&screen=card-detail&card=card-credit-1')
  render(<App />)
  fireEvent.click(await screen.findByText('Open card transaction'))
  await screen.findByText('Transaction detail')
  expect(navigation.currentRoute).toEqual({ screen: 'transaction-detail', source: 'card', cardId: 'card-credit-1' })
  const parameters = new URLSearchParams(window.location.search)
  expect(parameters.get('screen')).toBe('card-detail')
  expect(parameters.get('card')).toBe('card-credit-1')
  expect(parameters.has('account')).toBe(false)
  act(() => navigation.goBack())
  expect((await screen.findByLabelText('Current card')).textContent).toBe('card-credit-1')
})

it('does not resume an old offer after its card is removed and restored', async () => {
  window.history.replaceState(
    {},
    '',
    '/?product=PI&country=CZ&release=release-future-cz-coapping&screen=card-detail&card=card-credit-1',
  )
  render(<App />)
  await screen.findByLabelText('Current credit limit')
  await openCreditOffer()
  act(() => controls.setProductCount('creditCards', 0))
  await waitFor(() => expect(screen.queryByText('Accept credit offer')).toBeNull())
  act(() => controls.setProductCount('creditCards', 1))
  act(() => navigation.navigateTo({ screen: 'card-detail', cardId: 'card-credit-1' }))
  await screen.findByLabelText('Current card')
  await waitFor(() => expect(screen.queryByText('Accept credit offer')).toBeNull())
})

it('does not display another card offer when the active card changes', async () => {
  window.history.replaceState(
    {},
    '',
    '/?product=PI&country=CZ&release=release-future-cz-coapping&screen=card-detail&card=card-credit-1',
  )
  render(<App />)
  await screen.findByLabelText('Current credit limit')
  await openCreditOffer()
  act(() => navigation.navigateTo({ screen: 'card-detail', cardId: 'card-debit-1' }))
  expect((await screen.findByLabelText('Current card')).textContent).toBe('card-debit-1')
  expect(screen.queryByText('Accept credit offer')).toBeNull()
})

it.each(['baseline', 'scenario', 'flags'] as const)(
  'recovers a failed platform screen after %s changes without changing its route',
  async (changed) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    window.history.replaceState({}, '', '/?product=PI&country=RO&screen=tools')
    toolsBroken = true
    render(<App />)
    await screen.findByText('Unable to open this screen')
    toolsBroken = false
    act(() => {
      if (changed === 'baseline') controls.setBaseline('uat-current')
      else if (changed === 'scenario') controls.setScenario('inactive')
      else controls.setFlag('fx_transactionsFilters', true)
    })
    expect(await screen.findByText('Tools ready')).toBeTruthy()
    expect(navigation.currentScreen).toBe('tools')
  },
)

vi.mock('@/app/screens/analytics/AnalyticsScreen', () => ({
  default: ({ initialScopeId, initialDirection }: { initialScopeId?: string; initialDirection?: string }) => (
    <output aria-label="Analytics entry">
      {initialScopeId ?? 'all'}:{initialDirection ?? 'both'}
    </output>
  ),
}))

it('stores an account analytics entry on its route for back restoration', async () => {
  window.history.replaceState({}, '', '/?product=PI&country=RO&screen=homepage')
  render(<App />)
  fireEvent.click(await screen.findByText('Open acc-1'))
  fireEvent.click(await screen.findByText('Open account spending'))
  await screen.findByLabelText('Analytics entry')
  expect(navigation.currentRoute).toEqual({ screen: 'analytics', scopeId: 'acc-1', direction: 'expense' })
})

it('keeps healthy platform state mounted across theme privacy and feature changes', async () => {
  window.history.replaceState({}, '', '/?product=PI&country=RO&screen=tools')
  toolsMounts = 0
  render(<App />)
  fireEvent.click(await screen.findByText('Local count 0'))
  expect(toolsMounts).toBe(1)
  act(() => {
    controls.setThemeMode('dark')
    controls.setAmountsHidden(true)
    controls.setFlag('fx_transactionsFilters', true)
  })
  expect(await screen.findByText('Local count 1')).toBeTruthy()
  expect(toolsMounts).toBe(1)
})
