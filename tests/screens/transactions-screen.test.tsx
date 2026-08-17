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

  it('groups the pooled ledger into months, newest first', () => {
    renderScreen()

    const sections = monthSections()
    expect(sections.length).toBeGreaterThan(1)
    expect([...sections].sort((a, b) => (b ?? '').localeCompare(a ?? ''))).toEqual(sections)
    expect(monthChips().map((chip) => chip.getAttribute('data-transaction-month'))).toEqual(sections)
  })

  it('starts on the newest month and moves the active chip when another is picked', () => {
    renderScreen()

    const [newest, second] = monthChips()
    if (!newest || !second) throw new Error('Expected at least two months in the rail')

    expect(newest).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(second)

    expect(second).toHaveAttribute('aria-selected', 'true')
    expect(newest).toHaveAttribute('aria-selected', 'false')
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
})
