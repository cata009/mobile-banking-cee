// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render as rtlRender, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import TransactionsScreen from '@/app/screens/accounts/TransactionsScreen'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { getAccountTransactions } from '@/data/accountDetails'
import { mockProducts, type Product } from '@/data/products'
import { loadActualNativeAnalyticsModule, productCountsForNative, resetNativeAnalyticsRenderer, waitForNativeAnalyticsScreen } from './nativeAnalyticsL6Harness'

const nativeLoader = vi.hoisted(() => ({ load: vi.fn() }))

vi.mock('@/app/components/demo/nativeDemoLoader', () => ({
  loadNativeDemoModule: nativeLoader.load,
}))

const mockedProductState = vi.hoisted(() => ({
  categories: [] as Array<{ key: string; title: string; products: Product[] }>,
}))

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => mockedProductState,
}))

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027', productCounts: productCountsForNative(mockedProductState.categories.flatMap(category => category.products)) }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

async function renderNative(ui: React.ReactElement, options?: Parameters<typeof rtlRender>[1]) {
  const view = rtlRender(ui, options)
  await waitForNativeAnalyticsScreen(view.container)
  return view
}

async function renderScreen() {
  return renderNative(<TransactionsScreen onBack={() => undefined} />, { wrapper: Providers })
}

function monthChips() {
  return screen.queryAllByRole('button', { name: /^Month \d{4}-\d{2}$/ })
}

function transactionButtons() {
  return screen.queryAllByRole('button', { name: /^Transaction / })
}

function monthSections() {
  const monthNumbers: Record<string, string> = {
    January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
    July: '07', August: '08', September: '09', October: '10', November: '11', December: '12',
  }
  return Array.from(new Set(dateSeparators().map((date) => {
    const [, month, year] = date.split(' ')
    return `${year}-${monthNumbers[month ?? ''] ?? '00'}`
  })))
}

function dateSeparators() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-testid="transactions-date-divider"]'))
    .map((element) => element.textContent?.replace(/\s+/g, ' ').match(/\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December) \d{4}/)?.[0] ?? '')
}

function dateGroups() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-testid="transactions-date-divider"]'))
    .map((element) => element.textContent?.replace(/\s+/g, ' ').trim() ?? '')
}

async function scrollTransactionsTo(scrollTop: number) {
  const container = screen.getByTestId('transactions-list')

  Object.defineProperty(container, 'scrollTop', { configurable: true, value: scrollTop, writable: true })
  fireEvent.scroll(container, { target: { scrollTop } })
  if (scrollTop > 0) {
    await screen.findByRole('tablist', { name: 'Jump to month' })
  } else {
    await waitFor(() => expect(screen.queryByRole('tablist', { name: 'Jump to month' })).not.toBeInTheDocument())
  }
}

async function accountScopeOptions() {
  fireEvent.click(screen.getByRole('button', { name: 'Account scope' }))
  await screen.findByRole('button', { name: 'All accounts' })
  const labels = ['All accounts', ...mockProducts
    .filter((product) => product.type === 'current_account')
    .map((product) => product.name)]
  return screen.getAllByRole('button').filter((button) =>
    labels.includes(button.getAttribute('aria-label') ?? ''),
  )
}

function scopeBand() {
  return screen.getByTestId('transactions-scope-band')
}

function nativePanelForRow(row: HTMLElement) {
  const panel = row.closest<HTMLElement>('[data-testid="transactions-date-card"]')
  if (!panel) throw new Error('Expected a Native transaction date card')
  return panel
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn() })
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() })
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

describe('transactions screen', () => {
  it('pools every current account and leaves savings and deposits out', async () => {
    await renderScreen()

    const scopeOptions = await accountScopeOptions()
    const scopeLabels = scopeOptions.map((option) => option.getAttribute('aria-label')?.trim())

    const currentAccountNames = mockProducts
      .filter((product) => product.type === 'current_account')
      .map((product) => product.name)

    expect(scopeLabels).toEqual(['All accounts', ...currentAccountNames])
    expect(scopeLabels.some((label) => /saving|deposit/i.test(label ?? ''))).toBe(false)
  })

  it('groups the pooled ledger into daily sections, newest first, with one separator per date', async () => {
    await renderScreen()
    await scrollTransactionsTo(80)

    const sections = monthSections()
    expect(sections.length).toBeGreaterThan(1)
    expect([...sections].sort((a, b) => (b ?? '').localeCompare(a ?? ''))).toEqual(sections)
    expect(new Set(sections).size).toBe(sections.length)
    expect(dateSeparators().filter((title) => title?.includes('April 2026')).length).toBeGreaterThan(0)
    expect(monthChips().map((chip) => chip.getAttribute('aria-label'))).toEqual(
      expect.arrayContaining(['Month 2026-04', 'Month 2025-12']),
    )
  })

  it('starts on the newest month and moves the active chip when another is picked', async () => {
    await renderScreen()
    await scrollTransactionsTo(80)

    const [railNewest] = monthChips()
    const newestLabel = railNewest?.getAttribute('aria-label')
    if (!newestLabel) throw new Error('Expected a labeled Native month chip')
    expect(newestLabel).toBe(`Month ${monthSections()[0]}`)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: newestLabel })).toHaveAttribute('aria-selected', 'true'),
    )

    const [newest, second] = monthChips()
    if (!newest || !second) throw new Error('Expected at least two months in the rail')
    const secondLabel = second.getAttribute('aria-label')
    if (!secondLabel) throw new Error('Expected a labeled Native month chip')

    fireEvent.click(second)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: secondLabel })).toHaveAttribute('aria-selected', 'true'),
    )
    expect(screen.getByRole('button', { name: newestLabel })).toHaveAttribute('aria-selected', 'false')
  })

  it('shows search initially and leaves only the month rail after scrolling', async () => {
    await renderScreen()

    expect(screen.getByRole('searchbox', { name: 'Search transactions' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist', { name: 'Jump to month' })).not.toBeInTheDocument()

    await scrollTransactionsTo(80)

    await waitFor(() => expect(screen.queryByRole('searchbox', { name: 'Search transactions' })).not.toBeInTheDocument())
    expect(await screen.findByRole('tablist', { name: 'Jump to month' })).toBeInTheDocument()
  })

  it('searches matching transactions across every month', async () => {
    await renderScreen()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search transactions' }), {
      target: { value: 'Media Markt' },
    })

    await screen.findAllByRole('button', { name: /^Transaction / })
    await waitFor(() => expect(transactionButtons().filter((row) => row.textContent?.includes('Media Markt')).length).toBeGreaterThan(2))
    expect(dateSeparators().some((title) => title.includes('December 2025'))).toBe(true)
    const rows = transactionButtons()
    const matchingRows = rows.filter((row) => row.textContent?.includes('Media Markt'))
    expect(matchingRows.length).toBeGreaterThan(2)
    expect(matchingRows.every((row) => row.textContent?.includes('Media Markt'))).toBe(true)
    expect(document.body).toHaveTextContent('Media Markt')
    expect(document.body).not.toHaveTextContent('ATM UniCredit')
  })

  it('keeps search available when filtering clamps the list back to the top', async () => {
    await renderScreen()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search transactions' }), {
      target: { value: 'Media Markt' },
    })
    await waitFor(() => expect(transactionButtons().length).toBeGreaterThan(0))
    await scrollTransactionsTo(80)
    await scrollTransactionsTo(0)

    expect(await screen.findByRole('searchbox', { name: 'Search transactions' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist', { name: 'Jump to month' })).not.toBeInTheDocument()
    expect(document.body).toHaveTextContent('Media Markt')
  })

  it('uses a comfortable field height for transaction search', async () => {
    await renderScreen()

    const searchField = screen.getByTestId('transactions-search-field').firstElementChild as HTMLElement | null
    if (!searchField) throw new Error('Expected the Native SearchField frame')
    expect(searchField).toHaveStyle({ minHeight: '40px' })
  })

  it('does not use the page-wide scrollIntoView when jumping between months', async () => {
    await renderScreen()
    await scrollTransactionsTo(80)

    await screen.findByRole('tablist', { name: 'Jump to month' })
    const [newest, , , december] = monthChips()
    if (!newest || !december) throw new Error('Expected a December month chip')

    const scrollIntoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView')
    fireEvent.click(december)

    await waitFor(() => expect(december).toHaveAttribute('aria-selected', 'true'))
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('narrows the list to one account and keeps its rows only', async () => {
    await renderScreen()

    const allAccountsRows = transactionButtons().length
    await accountScopeOptions()
    const firstAccountName = mockProducts.find((product) => product.type === 'current_account')?.name
    const firstAccount = firstAccountName ? screen.getByRole('button', { name: firstAccountName }) : undefined
    if (!firstAccount) throw new Error('Expected a single-account scope option')
    fireEvent.click(firstAccount)

    await waitFor(() => expect(transactionButtons().length).toBeLessThan(allAccountsRows))
    const scopedRows = transactionButtons().length
    expect(scopedRows).toBeGreaterThan(0)
    expect(scopedRows).toBeLessThan(allAccountsRows)
  })

  it('pins the scope and month band below the header instead of over it', async () => {
    await renderScreen()

    const header = screen.getByTestId('transactions-header')
    const band = scopeBand()
    const list = screen.getByTestId('transactions-list')
    const follows = (first: HTMLElement, second: HTMLElement) =>
      Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

    expect(follows(header, band)).toBe(true)
    expect(follows(band, list)).toBe(true)
    expect(list).not.toContainElement(band)
    expect(band).toContainElement(screen.getByRole('button', { name: 'Account scope' }))
    expect(band).toContainElement(screen.getByTestId('transactions-search-field'))

    await scrollTransactionsTo(80)
    expect(screen.getByTestId('transactions-list').scrollTop).toBe(80)
    expect(scopeBand()).toBeInTheDocument()
  })

  it('puts each month in the same rounded card the home activity list uses', async () => {
    await renderScreen()

    const cards = transactionButtons().map(nativePanelForRow)
    const uniqueDatePanels = new Set(cards)
    expect(uniqueDatePanels.size).toBe(dateSeparators().length)
    // Native EVo uses rounded date panels instead of Source's monthly DOM cards.
    // Keep the surface and grouping proof against the actual Native component contract.
    cards.forEach((card) => {
      const style = window.getComputedStyle(card)
      expect(window.getComputedStyle(card).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
      expect(Number.parseFloat(style.borderTopLeftRadius || style.borderRadius)).toBe(18)
    })
  })

  it('leads its rows with the statement identity rather than the PFM category', async () => {
    await renderScreen()

    const list = within(document.body)
    expect(transactionButtons().length).toBeGreaterThan(0)
    expect(list.getAllByLabelText(/merchant logo$/).length).toBeGreaterThan(0)
    expect(list.queryByLabelText(/PFM category$/i)).not.toBeInTheDocument()
  })

  it('uses the Evo 2027 row format and Source account currencies in the daily separators', async () => {
    await renderScreen()

    const row = transactionButtons()[0]
    if (!row) throw new Error('Expected an Evo 2027 transaction row')

    expect(row.getAttribute('aria-label')).toMatch(/^Transaction /)
    const dates = dateSeparators()
    const groups = dateGroups()
    expect(groups.length).toBeGreaterThan(0)
    expect(groups.some((group) => dates.some((date) => group.includes(date)))).toBe(true)
    const accountCurrencies = new Set(
      mockProducts
        .filter((product) => product.type === 'current_account')
        .map((product) => product.currency),
    )
    expect(accountCurrencies.size).toBeGreaterThan(0)
    for (const currency of accountCurrencies) {
      expect(groups.some((group) => group.includes(currency))).toBe(true)
    }
  })

  it('uses the homepage green for positive transaction amounts', async () => {
    await renderScreen()

    const currentAccount = mockProducts.find((product) => product.type === 'current_account')
    const positive = getAccountTransactions('CZ', 0, currentAccount?.currency ?? 'CZK').find((transaction) => transaction.type === 'credit')
    if (!currentAccount || !positive) throw new Error('Expected a positive Native transaction fixture')
    const row = screen.getByRole('button', { name: `Transaction ${currentAccount.id}-${positive.id}` })
    const greenAmount = Array.from(row.querySelectorAll<HTMLElement>('*')).find((element) =>
      window.getComputedStyle(element).color === 'rgb(61, 125, 67)',
    )
    expect(greenAmount).toBeInTheDocument()
  })
})
