// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import AccountDetailScreen from '@/app/screens/accounts/AccountDetailScreen'
import CardDetailScreen from '@/app/screens/cards/CardDetailScreen'
import CardDetailsInfoScreen from '@/app/screens/cards/CardDetailsInfoScreen'
import { TransactionDetailScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import { DemoProvider } from '@/app/state/demoStore'
import { groupAccountTransactionsByDate, getAccountTransactions, getCardTransactions } from '@/data/accountDetails'
import { mockProducts, type Product } from '@/data/products'
import { formatMaskedCardNumber } from '@/app/utils/cardNumber'
import { getApp2027ActivityTransactions } from '@/features/products/evoAccountActivity'
import { resolveTransactionMerchant } from '@/data/merchantDirectory'
import {
  asyncNativeReady,
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

function AppProviders({
  children,
  release = 'release-current',
}: PropsWithChildren<{ release?: 'release-current' | 'release-future-evo-2027' }>) {
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
  !firstDebitCard ||
  firstDebitCard.type !== 'debit_card' ||
  !secondDebitCard ||
  secondDebitCard.type !== 'debit_card' ||
  !firstCurrentAccount ||
  firstCurrentAccount.type !== 'current_account'
) {
  throw new Error('Expected linked current-account and debit-card fixtures')
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

beforeEach(() => resetNativeWebRendererDiagnostics())

async function waitForNativeScreen(container: HTMLElement) {
  await asyncNativeReady(container)
}

afterEach(() => {
  vi.useRealTimers()
  cleanup()
  resetNativeWebRendererDiagnostics()
  mockedProductState.categories = []
})

describe('card-detail boundaries on the Native Web host', () => {
  it('routes Card Details directly and keeps Show Card Details behind Face ID', async () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: [creditCard] }]
    const onCardDetailsClick = vi.fn()
    const onShowCardDetailsClick = vi.fn()

    const { container } = render(
      <CardDetailScreen
        selectedCardId={creditCard.id}
        onBack={() => undefined}
        onCardDetailsClick={onCardDetailsClick}
        onShowCardDetailsClick={onShowCardDetailsClick}
      />,
      { wrapper: AppProviders },
    )
    await waitForNativeScreen(container)

    fireEvent.click(screen.getByRole('button', { name: 'Card Details' }))
    expect(onCardDetailsClick).toHaveBeenCalledWith(creditCard)
    expect(onShowCardDetailsClick).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Show Card Details' }))
    expect(onShowCardDetailsClick).not.toHaveBeenCalled()
    await waitFor(() => expect(onShowCardDetailsClick).toHaveBeenCalledWith(creditCard), { timeout: 2500 })
  })

  it('lets a flow preview intercept Show Card Details before Face ID', async () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: [firstDebitCard] }]
    const onShowCardDetailsRequest = vi.fn()
    const onShowCardDetailsClick = vi.fn()

    const { container } = render(
      <CardDetailScreen
        selectedCardId={firstDebitCard.id}
        onBack={() => undefined}
        onShowCardDetailsRequest={onShowCardDetailsRequest}
        onShowCardDetailsClick={onShowCardDetailsClick}
      />,
      { wrapper: AppProviders },
    )
    await waitForNativeScreen(container)

    fireEvent.click(screen.getByRole('button', { name: 'Show Card Details' }))

    expect(onShowCardDetailsRequest).toHaveBeenCalledWith(firstDebitCard)
    expect(onShowCardDetailsClick).not.toHaveBeenCalled()
  })

  it('reports Native carousel selection to the Source flow host', async () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: mockProducts }]
    const onActiveCardChange = vi.fn()

    const { container } = render(
      <CardDetailScreen selectedCardId={firstDebitCard.id} onBack={() => undefined} onActiveCardChange={onActiveCardChange} />,
      { wrapper: AppProviders },
    )
    await waitForNativeScreen(container)

    fireEvent.click(screen.getByRole('button', { name: 'Go to account 3' }))
    await waitFor(() => expect(onActiveCardChange).toHaveBeenLastCalledWith(secondDebitCard))
  })

  it('keeps the Native card carousel shadow lane above its transaction search', async () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: [creditCard] }]
    const { container } = render(
      <CardDetailScreen selectedCardId={creditCard.id} onBack={() => undefined} />,
      { wrapper: AppProviders },
    )
    await waitForNativeScreen(container)

    const carousel = container.querySelector<HTMLElement>('[data-testid="ro-card-carousel"]')
    expect(carousel).toBeInTheDocument()
    const ancestors: HTMLElement[] = []
    let parent = carousel?.parentElement ?? null
    while (parent) {
      ancestors.push(parent)
      parent = parent.parentElement
    }
    const shadowLane = ancestors.find(element => {
      const style = window.getComputedStyle(element)
      return style.zIndex === '10' && style.marginBottom === '-20px'
    })
    expect(shadowLane).toBeDefined()
    expect(screen.getByRole('button', { name: 'Card Details' })).toBeInTheDocument()
  })

  it('uses the violet EUR debit artwork for the Native Evo 2027 card', async () => {
    // The frozen Source selector gives Evo EUR precedence over card-3's standard-ID fallback.
    const euroDebitCard = {
      ...secondDebitCard,
      name: 'Debit Standard EUR',
      currency: 'EUR' as const,
    }
    const sourceProducts = mockProducts.map(product =>
      product.id === euroDebitCard.id ? euroDebitCard : product,
    )
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: sourceProducts }]
    const { container } = render(
      <CardDetailScreen selectedCardId={euroDebitCard.id} onBack={() => undefined} />,
      { wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders> },
    )
    await waitForNativeScreen(container)

    const euroCard = screen.getByRole('tab', { name: `Card ${secondDebitCard.id}` })
    expect(euroCard.querySelector('svg rect[fill="#772B8B"]')).toBeInTheDocument()
  })

  it('shows merchant logos in Native Evo statements and category glyphs in the baseline', async () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: mockProducts }]
    const cardTransactions = getCardTransactions('CZ', firstDebitCard, 'CZK', 0)
    const merchantTransaction = cardTransactions.find(transaction => resolveTransactionMerchant(transaction))
    if (!merchantTransaction) throw new Error('Expected a Czech card transaction with merchant identity')
    const merchant = resolveTransactionMerchant(merchantTransaction)
    if (!merchant) throw new Error('Expected a resolved transaction merchant')

    const evo = render(<CardDetailScreen selectedCardId={firstDebitCard.id} onBack={() => undefined} />, {
      wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders>,
    })
    await waitForNativeScreen(evo.container)
    const merchantLogoLabel = `${merchant.name} merchant logo`
    await waitFor(() => {
      expect(evo.container.querySelector(`[aria-label="${merchantLogoLabel}"]`)).toBeInTheDocument()
    })
    evo.unmount()

    const baseline = render(<CardDetailScreen selectedCardId={firstDebitCard.id} onBack={() => undefined} />, {
      wrapper: AppProviders,
    })
    await waitForNativeScreen(baseline.container)
    expect(baseline.container.querySelector(`[aria-label="${merchantLogoLabel}"]`)).not.toBeInTheDocument()
    const baselineMerchantRow = Array.from(
      baseline.container.querySelectorAll<HTMLElement>('[role="button"]'),
    ).find(row => row.textContent?.includes(merchantTransaction.label))
    expect(baselineMerchantRow?.querySelector('[aria-label$=" PFM category"]')).toBeInTheDocument()
  })

  it('groups Native Evo card rows by date while the baseline keeps its monthly list', async () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: mockProducts }]
    const booked = getCardTransactions('CZ', firstDebitCard, 'CZK', 0)
      .filter(row => row.status === 'Booked')
    const dateGroups = groupAccountTransactionsByDate(booked)
    const multiRowDay = dateGroups.find(group => group.transactions.length > 1)
    if (!multiRowDay) throw new Error('Expected a multi-transaction Czech card date')
    const otherDay = dateGroups.find(group =>
      group.dateKey !== multiRowDay.dateKey &&
      group.dateKey.slice(0, 7) === multiRowDay.dateKey.slice(0, 7),
    )
    if (!otherDay) throw new Error('Expected a second Czech card date in the same month')
    const sameDayPair = multiRowDay.transactions.find((transaction, index, rows) =>
      rows.slice(index + 1).some(candidate => candidate.label !== transaction.label),
    )
    if (!sameDayPair) throw new Error('Expected distinct card transactions on one date')
    const sameDaySecond = multiRowDay.transactions.find(transaction =>
      transaction.id !== sameDayPair.id && transaction.label !== sameDayPair.label,
    )!
    const sameDayRows = [sameDayPair, sameDaySecond]
    const otherDayRow = otherDay.transactions[0]!

    const evo = render(<CardDetailScreen selectedCardId={firstDebitCard.id} onBack={() => undefined} />, {
      wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders>,
    })
    await waitForNativeScreen(evo.container)
    const evoRows = sameDayRows.map(transaction =>
      screen.getByRole('button', { name: `Transaction ${transaction.id}` }),
    )
    const evoOtherDayRow = screen.getByRole('button', { name: `Transaction ${otherDayRow.id}` })
    expect(evoRows[0]!.parentElement).toBe(evoRows[1]!.parentElement)
    expect(evoRows[0]!.parentElement).not.toBe(evoOtherDayRow.parentElement)
    evo.unmount()

    const baseline = render(<CardDetailScreen selectedCardId={firstDebitCard.id} onBack={() => undefined} />, {
      wrapper: AppProviders,
    })
    await waitForNativeScreen(baseline.container)
    const findBaselineCardRow = (transaction: (typeof sameDayRows)[number]) =>
      Array.from(baseline.container.querySelectorAll<HTMLElement>('[role="button"]')).find(row => {
        const text = row.textContent?.toLocaleLowerCase('en') ?? ''
        return text.includes(transaction.label.toLocaleLowerCase('en')) &&
          text.includes(String(Number(transaction.day))) &&
          text.includes(transaction.month.toLocaleLowerCase('en'))
      })
    const baselineSameDayRows = sameDayRows.map(findBaselineCardRow)
    const baselineOtherDayRow = findBaselineCardRow(otherDayRow)
    expect(baselineSameDayRows.every(Boolean)).toBe(true)
    expect(baselineOtherDayRow).toBeInTheDocument()
    expect(baselineSameDayRows[0]!.parentElement).toBe(baselineSameDayRows[1]!.parentElement)
    expect(baselineSameDayRows[0]!.parentElement).toBe(baselineOtherDayRow!.parentElement)
  })

  it('renders a day separator for every booked card transaction date in Native Evo', async () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: mockProducts }]
    const transactions = getCardTransactions('CZ', firstDebitCard, 'CZK', 0).filter(row => row.status === 'Booked')
    const dateGroups = groupAccountTransactionsByDate(transactions)
    expect(dateGroups.length).toBeGreaterThan(0)

    const { container } = render(<CardDetailScreen selectedCardId={firstDebitCard.id} onBack={() => undefined} />, {
      wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders>,
    })
    await waitForNativeScreen(container)
    const nativeText = container.querySelector('[data-native-current-host]')?.textContent ?? ''
    for (const group of dateGroups) expect(nativeText).toContain(group.dateTitle)
  })

  it('uses the success color for positive transactions in the Native Evo account ledger', async () => {
    mockedProductState.categories = [{ key: 'accounts', title: 'Accounts', products: mockProducts }]
    const activity = getApp2027ActivityTransactions('CZ')
    const activityLabels = new Set(activity.map(transaction => transaction.label))
    const transactions = [
      ...activity,
      ...getAccountTransactions('CZ', 0, 'CZK').filter(
        transaction => transaction.status === 'Booked' && !activityLabels.has(transaction.label),
      ),
    ]
    const positive = transactions.find(transaction => transaction.type === 'credit' && transaction.amount > 0)
    if (!positive) throw new Error('Expected a positive Native Evo account transaction')

    const { container } = render(
      <AccountDetailScreen
        selectedProductId={firstCurrentAccount.id}
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders> },
    )
    await waitForNativeScreen(container)

    const row = screen.getByRole('button', { name: `Transaction ${positive.id}` })
    const greenAmount = Array.from(row.querySelectorAll<HTMLElement>('*')).find(element => {
      const text = element.textContent?.trim() ?? ''
      return text.startsWith('+') && text.includes('CZK') &&
        window.getComputedStyle(element).color === 'rgb(61, 125, 67)'
    })
    expect(greenAmount).toBeDefined()
  })

  it('keeps current-month daily labels without adding a separate month heading in Native Evo', async () => {
    mockedProductState.categories = [{ key: 'accounts', title: 'Accounts', products: mockProducts }]
    const activity = getApp2027ActivityTransactions('CZ')
    const activityLabels = new Set(activity.map(transaction => transaction.label))
    const transactions = [
      ...activity,
      ...getAccountTransactions('CZ', 0, 'CZK').filter(
        transaction => transaction.status === 'Booked' && !activityLabels.has(transaction.label),
      ),
    ]
    const augustDate = groupAccountTransactionsByDate(transactions.filter(row => row.status === 'Booked'))
      .find(group => group.dateTitle.includes('AUGUST 2026'))
    if (!augustDate) throw new Error('Expected a current-month transaction date')

    const { container } = render(
      <AccountDetailScreen
        selectedProductId={firstCurrentAccount.id}
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders> },
    )
    await waitForNativeScreen(container)
    expect(container.querySelector('[data-native-current-host]')).toHaveTextContent(augustDate.dateTitle)
    expect(screen.queryByText('AUGUST 2026', { exact: true })).not.toBeInTheDocument()
  })

  it('compacts single-day Native Evo account rows and keeps multi-row days expanded', async () => {
    mockedProductState.categories = [{ key: 'accounts', title: 'Accounts', products: mockProducts }]
    const activity = getApp2027ActivityTransactions('CZ')
    const activityLabels = new Set(activity.map(transaction => transaction.label))
    const transactions = [
      ...activity,
      ...getAccountTransactions('CZ', 0, 'CZK').filter(
        transaction => transaction.status === 'Booked' && !activityLabels.has(transaction.label),
      ),
    ]
    const groups = groupAccountTransactionsByDate(transactions.filter(row => row.status === 'Booked'))
    const singleDay = groups.find(group => group.transactions.length === 1)
    const expandedDay = groups.find(group => group.transactions.length > 1)
    if (!singleDay || !expandedDay) throw new Error('Expected single and multiple transaction dates')

    const { container } = render(
      <AccountDetailScreen
        selectedProductId={firstCurrentAccount.id}
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders> },
    )
    await waitForNativeScreen(container)
    const compactRow = screen.getByRole('button', { name: `Transaction ${singleDay.transactions[0]!.id}` })
    expect(window.getComputedStyle(compactRow).minHeight).toBe('64px')
    expect(window.getComputedStyle(compactRow).paddingTop).toBe('8px')
    const expandedRow = screen.getByRole('button', { name: `Transaction ${expandedDay.transactions[0]!.id}` })
    expect(window.getComputedStyle(expandedRow).minHeight).toBe('80px')
    expect(window.getComputedStyle(expandedRow).paddingTop).toBe('16px')
  })

  it('keeps the Native Evo account search inside the 48px Source field frame', async () => {
    mockedProductState.categories = [{ key: 'accounts', title: 'Accounts', products: mockProducts }]
    const { container } = render(
      <AccountDetailScreen
        selectedProductId={firstCurrentAccount.id}
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders> },
    )
    await waitForNativeScreen(container)

    const search = screen.getByRole('searchbox', { name: 'Search transactions' })
    expect(search).toBeInTheDocument()
    const frames: HTMLElement[] = []
    let parent = search.parentElement
    while (parent) {
      frames.push(parent)
      parent = parent.parentElement
    }
    const sourceFieldFrame = frames.find(frame => {
      const style = window.getComputedStyle(frame)
      return style.minHeight === '48px' && style.borderTopLeftRadius === '10px'
    })
    expect(sourceFieldFrame).toBeDefined()
    expect(window.getComputedStyle(sourceFieldFrame!).minHeight).toBe('48px')
    expect(window.getComputedStyle(sourceFieldFrame!).paddingLeft).toBe('8px')
    expect(window.getComputedStyle(search).height).toBe('32px')
  })

  it('keeps the direct Card Details page informational and non-sensitive', async () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: [creditCard] }]

    const { container } = render(
      <CardDetailsInfoScreen selectedCardId={creditCard.id} onBack={() => undefined} />,
      { wrapper: AppProviders },
    )
    await waitForNativeScreen(container)

    const native = container.querySelector('[data-native-current-host]')
    expect(native).toHaveTextContent('Card product')
    expect(native).toHaveTextContent('Card status')
    expect(native).toHaveTextContent('Credit limit')
    expect(screen.queryByText(creditCard.cardNumber, { exact: true })).not.toBeInTheDocument()
    expect(screen.queryByText(creditCard.securityCode ?? '', { exact: true })).not.toBeInTheDocument()
  })

  it('shows pending transactions only for the first debit card linked to the first current account', async () => {
    mockedProductState.categories = [{ key: 'cards', title: 'Cards', products: mockProducts }]

    const firstDebit = render(<CardDetailScreen selectedCardId={firstDebitCard.id} onBack={() => undefined} />, {
      wrapper: AppProviders,
    })
    await waitForNativeScreen(firstDebit.container)
    expect(firstDebit.container.querySelector('[data-testid="ro-pending-transactions"]')).toBeInTheDocument()
    firstDebit.unmount()

    const secondDebit = render(<CardDetailScreen selectedCardId={secondDebitCard.id} onBack={() => undefined} />, {
      wrapper: AppProviders,
    })
    await waitForNativeScreen(secondDebit.container)
    expect(secondDebit.container.querySelector('[data-testid="ro-pending-transactions"]')).not.toBeInTheDocument()
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

  it('uses a compact Native card transaction detail and reveals only the transaction date on Show more', async () => {
    const transaction = getAccountTransactions('RO', 0, 'RON').find((item) => item.source === 'card')
    if (!transaction) throw new Error('Expected a debit-card transaction in the linked current account')

    const { container } = render(
      <TransactionDetailScreen
        country="RO"
        product={firstDebitCard}
        transaction={transaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
      />,
      { wrapper: AppProviders },
    )
    await asyncNativeReady(container)

    expect(screen.getByText('Transaction description')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Posting date')).toBeInTheDocument()
    expect(screen.queryByText('Account number')).not.toBeInTheDocument()
    expect(screen.getByText('Spending Insight')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change category' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create Standing order' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Redo payment' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Request chargeback' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send payment' })).toBeInTheDocument()
    expect(screen.getByText('Card used')).toBeInTheDocument()
    expect(screen.getByText(formatMaskedCardNumber(firstDebitCard.cardNumber))).toBeInTheDocument()
    expect(screen.queryByText('Transaction date')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Show more' }))
    await waitFor(() => {
      expect(container.querySelector('[data-native-current-host]')).toHaveTextContent(/Transaction date/i)
      expect(screen.getByRole('button', { name: 'Show less' })).toBeInTheDocument()
    })
  })

  it('shows Native Evo card facts and expands the transaction date', async () => {
    const transaction = getAccountTransactions('CZ', 0, 'CZK').find((item) => item.source === 'card')
    if (!transaction) throw new Error('Expected a Czech debit-card transaction')

    const evo = render(
      <TransactionDetailScreen
        country="CZ"
        product={firstDebitCard}
        transaction={transaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
      />,
      { wrapper: ({ children }) => <AppProviders release="release-future-evo-2027">{children}</AppProviders> },
    )
    await asyncNativeReady(evo.container)

    expect(screen.getByText('Transaction description')).toBeInTheDocument()
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByText('Posting date')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Show more' }))
    await waitFor(() => {
      expect(evo.container.querySelector('[data-native-current-host]')).toHaveTextContent(/Transaction date/i)
    })
    evo.unmount()

    const current = render(
      <TransactionDetailScreen
        country="CZ"
        product={firstDebitCard}
        transaction={transaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
      />,
      { wrapper: AppProviders },
    )
    await asyncNativeReady(current.container)

    expect(screen.getByText('Transaction description')).toBeInTheDocument()
    expect(screen.getByText('Posting date')).toBeInTheDocument()
  })

  it('renders a verified merchant location as a clean static Native map with no external-map chrome', async () => {
    const transaction = getAccountTransactions('RO', 0, 'RON').find((item) => item.label === 'Carrefour')
    if (!transaction) throw new Error('Expected the Carrefour card transaction fixture')

    const { container } = render(
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
    await asyncNativeReady(container)

    const map = screen.getByTestId('merchant-location-static-map')
    expect(map).toBeInTheDocument()
    expect(map).toHaveAttribute('aria-label', expect.stringContaining('Map showing'))
    expect(screen.queryByRole('link', { name: /Google Maps/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Google Maps/i })).not.toBeInTheDocument()
  })

  it('identifies the linked debit card when its transaction is opened from the Native current account', async () => {
    const transaction = getAccountTransactions('RO', 0, 'RON').find((item) => item.source === 'card')
    if (!transaction) throw new Error('Expected a debit-card transaction in the linked current account')
    mockedProductState.categories = [
      { key: 'products', title: 'Products', products: [firstCurrentAccount, firstDebitCard] },
    ]

    const { container } = render(
      <TransactionDetailScreen
        country="RO"
        product={firstCurrentAccount}
        transaction={transaction}
        onBack={() => undefined}
        onRedoPayment={() => undefined}
      />,
      { wrapper: AppProviders },
    )
    await asyncNativeReady(container)

    expect(screen.getByText('Card used')).toBeInTheDocument()
    const nativeText = container.querySelector('[data-native-current-host]')?.textContent ?? ''
    expect(nativeText.replace(/\s+/g, '')).toContain(
      formatMaskedCardNumber(firstDebitCard.cardNumber).replace(/\s+/g, ''),
    )
  })
})
