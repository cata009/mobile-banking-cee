// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import TransactionsScreen from '@/app/screens/accounts/TransactionsScreen'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { mockProducts, type Product } from '@/data/products'

const mockedProductState = vi.hoisted(() => ({
  categories: [] as Array<{ key: string; title: string; products: Product[] }>,
}))

vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => mockedProductState,
}))

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function renderScreen() {
  return render(<TransactionsScreen onBack={() => undefined} />, { wrapper: Providers })
}

function monthChips() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-transaction-month]'))
}

function monthSections() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-transactions-month-section]'))
    .map((section) => section.getAttribute('data-transactions-month-section'))
}

function dateSeparators() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-transaction-date-separator]'))
    .map((separator) => separator.textContent?.trim())
}

function scrollTransactionsTo(scrollTop: number) {
  const container = document.querySelector<HTMLElement>('[data-screen="transactions"] > div')
  if (!container) throw new Error('Expected the transactions scroll container')

  document.querySelectorAll<HTMLElement>('[data-transactions-month-section]').forEach((section, index) => {
    Object.defineProperty(section, 'offsetTop', { configurable: true, value: index * 1000 })
  })

  Object.defineProperty(container, 'scrollTop', { configurable: true, value: scrollTop, writable: true })
  fireEvent.scroll(container)
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn() })
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() })
})

beforeEach(() => {
  mockedProductState.categories = [{ key: 'test-products', title: 'Test products', products: mockProducts }]
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('transactions screen', () => {
  it('pools every current account and leaves savings and deposits out', () => {
    renderScreen()

    const options = () => {
      fireEvent.click(screen.getByRole('button', { name: /All accounts/ }))
      return Array.from(document.querySelectorAll<HTMLElement>('[data-transactions-scope-option]'))
        .map((option) => option.textContent?.trim())
    }

    const scopeLabels = options()
    const currentAccountNames = mockProducts
      .filter((product) => product.type === 'current_account')
      .map((product) => product.name)

    expect(scopeLabels).toEqual(['All accounts', ...currentAccountNames])
    expect(scopeLabels.some((label) => /saving|deposit/i.test(label ?? ''))).toBe(false)
  })

  it('groups the pooled ledger into daily sections, newest first, with one separator per date', () => {
    renderScreen()
    scrollTransactionsTo(80)

    const sections = monthSections()
    expect(sections.length).toBeGreaterThan(1)
    expect([...sections].sort((a, b) => (b ?? '').localeCompare(a ?? ''))).toEqual(sections)
    expect(new Set(sections).size).toBe(sections.length)
    expect(dateSeparators().filter((title) => title?.includes('April 2026')).length).toBeGreaterThan(0)
    expect(monthChips().map((chip) => chip.getAttribute('data-transaction-month'))).toEqual(
      expect.arrayContaining(['2026-04', '2025-12']),
    )
  })

  it('starts on the newest month and moves the active chip when another is picked', () => {
    renderScreen()
    scrollTransactionsTo(80)

    const [newest, second] = monthChips()
    if (!newest || !second) throw new Error('Expected at least two months in the rail')

    expect(newest).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(second)

    expect(second).toHaveAttribute('aria-selected', 'true')
    expect(newest).toHaveAttribute('aria-selected', 'false')
  })

  it('shows search initially and leaves only the month rail after scrolling', () => {
    renderScreen()

    expect(screen.getByRole('searchbox', { name: 'Search transactions' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist', { name: 'Jump to month' })).not.toBeInTheDocument()

    scrollTransactionsTo(80)

    expect(screen.queryByRole('searchbox', { name: 'Search transactions' })).not.toBeInTheDocument()
    expect(screen.getByRole('tablist', { name: 'Jump to month' })).toBeInTheDocument()
  })

  it('searches matching transactions across every month', () => {
    renderScreen()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search transactions' }), {
      target: { value: 'Media Markt' },
    })

    expect(Array.from(document.querySelectorAll<HTMLElement>('[data-transactions-month-section]'))
      .map((section) => section.getAttribute('data-transactions-month')))
      .toContain('2025-12')
    const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-ds-label="AccountTransactionRow 375x80"]'))
    expect(rows.length).toBeGreaterThan(2)
    expect(rows.every((row) => row.textContent?.includes('Media Markt'))).toBe(true)
    expect(document.body).toHaveTextContent('Media Markt')
    expect(document.body).not.toHaveTextContent('ATM UniCredit')
  })

  it('keeps search available when filtering clamps the list back to the top', () => {
    renderScreen()

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search transactions' }), {
      target: { value: 'Media Markt' },
    })
    scrollTransactionsTo(80)
    scrollTransactionsTo(0)

    expect(screen.getByRole('searchbox', { name: 'Search transactions' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist', { name: 'Jump to month' })).not.toBeInTheDocument()
    expect(document.body).toHaveTextContent('Media Markt')
  })

  it('uses a comfortable field height for transaction search', () => {
    renderScreen()

    expect(screen.getByRole('searchbox', { name: 'Search transactions' })).toHaveClass('h-[40px]')
  })

  it('does not use the page-wide scrollIntoView when jumping between months', () => {
    renderScreen()
    scrollTransactionsTo(80)

    const [newest, , , december] = monthChips()
    if (!newest || !december) throw new Error('Expected a December month chip')

    const scrollIntoView = vi.spyOn(HTMLElement.prototype, 'scrollIntoView')
    fireEvent.click(december)

    expect(december).toHaveAttribute('aria-selected', 'true')
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('narrows the list to one account and keeps its rows only', () => {
    renderScreen()

    const allAccountsRows = document.querySelectorAll('[data-ds-label="AccountTransactionRow 375x80"]').length

    fireEvent.click(screen.getByRole('button', { name: /All accounts/ }))
    const [, firstAccount] = Array.from(document.querySelectorAll<HTMLElement>('[data-transactions-scope-option]'))
    if (!firstAccount) throw new Error('Expected a single-account scope option')
    fireEvent.click(firstAccount)

    const scopedRows = document.querySelectorAll('[data-ds-label="AccountTransactionRow 375x80"]').length
    expect(scopedRows).toBeGreaterThan(0)
    expect(scopedRows).toBeLessThan(allAccountsRows)
  })

  it('pins the scope and month band below the header instead of over it', () => {
    renderScreen()

    const header = document.querySelector<HTMLElement>('[data-screen="transactions"] .sticky.z-10')
    const band = document.querySelector<HTMLElement>('[data-transactions-sticky-band]')
    if (!header || !band) throw new Error('Expected a sticky header and a sticky band')

    // The header reserves the safe area plus its 48px row; the band starts where it ends.
    expect(header.className).toContain('pt-[var(--uc-phone-top-reserve,54px)]')
    expect(band.style.top).toBe('102px')
    expect(band.className).not.toContain('top-0')
  })

  it('puts each month in the same rounded card the home activity list uses', () => {
    renderScreen()

    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-transactions-month-section] > div'))
      .filter((element) => element.className.includes('rounded-[22px]'))

    expect(cards).toHaveLength(monthSections().length)
    cards.forEach((card) => {
      expect(card.className).toContain('bg-[var(--uc-surface)]')
      // A hairline between rows, none above the first or below the last.
      expect(card.className).toContain('divide-y')
      expect(card.querySelectorAll('[data-ds-label="AccountTransactionRow 375x80"]').length).toBeGreaterThan(0)
    })
  })

  it('leads its rows with the statement identity rather than the PFM category', () => {
    renderScreen()

    const list = within(document.body)
    expect(list.getAllByLabelText(/merchant logo$/).length).toBeGreaterThan(0)
    expect(document.querySelectorAll('[data-transaction-party]').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('[data-transaction-pair]').length).toBeGreaterThan(0)
  })

  it('uses the Evo 2027 row format and keeps the date in the daily separator', () => {
    renderScreen()

    const row = document.querySelector<HTMLElement>('[data-evo2027-transaction-row]')
    if (!row) throw new Error('Expected an Evo 2027 transaction row')

    expect(row.querySelector('[data-transaction-detail]')).toBeInTheDocument()
    expect(row.querySelector('[data-transaction-date]')).not.toBeInTheDocument()
    const dateSeparators = Array.from(document.querySelectorAll<HTMLElement>('[data-transaction-date-separator]'))
    expect(dateSeparators.length).toBeGreaterThan(0)
    expect(dateSeparators.some((separator) => /CZK/.test(separator.textContent ?? ''))).toBe(true)
    expect(dateSeparators.some((separator) => !/CZK/.test(separator.textContent ?? ''))).toBe(true)
    expect(dateSeparators.every((separator) => !separator.querySelector('.h-px'))).toBe(true)
  })

  it('uses the homepage green for positive transaction amounts', () => {
    renderScreen()

    const positiveAmount = document.querySelector<HTMLElement>('[data-transaction-amount="positive"]')
    if (!positiveAmount) throw new Error('Expected a positive transaction amount')

    expect(positiveAmount).toHaveClass('text-[var(--uc-green-success)]')
  })
})
