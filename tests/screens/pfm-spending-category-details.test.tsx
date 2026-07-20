// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import AnalyticsScreen from '@/app/screens/analytics/AnalyticsScreen'
import PfmCategoryDetailScreen from '@/app/screens/analytics/PfmCategoryDetailScreen'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics'
import { mockProducts, type Product } from '@/data/products'

const mockedProductState = vi.hoisted(() => ({
  categories: [] as Array<{ key: string; title: string; products: Product[] }>,
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

describe('PFM Spending category details', () => {
  it('renders connected Shopping bubbles and opens a matching transaction', () => {
    const timeline = createSpendingAnalyticsTimeline('RO', mockProducts)
    const onTransactionClick = vi.fn()

    render(
      <PfmCategoryDetailScreen
        category="Shopping"
        direction="out"
        timeline={timeline}
        activePeriodKey="2026-04"
        onPeriodChange={() => undefined}
        onBack={() => undefined}
        onTransactionClick={onTransactionClick}
      />,
      { wrapper: Providers },
    )

    expect(screen.getAllByRole('heading', { name: 'SHOPPING' })).toHaveLength(2)
    expect(screen.getAllByText('SHOPPING (OTHER)').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Add Transaction' })).toBeInTheDocument()
    expect(screen.getByText('APRIL')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /eMAG/i })[0]!)
    expect(onTransactionClick).toHaveBeenCalledWith(expect.objectContaining({ pfmCategory: 'Shopping' }))
  })

  it('shows and dismisses the Uncategorized transaction helper', () => {
    const timeline = createSpendingAnalyticsTimeline('RO', mockProducts)

    render(
      <PfmCategoryDetailScreen
        category="Uncategorized"
        direction="out"
        timeline={timeline}
        activePeriodKey="2026-04"
        onPeriodChange={() => undefined}
        onBack={() => undefined}
      />,
      { wrapper: Providers },
    )

    expect(screen.getByText('Uncategorized transaction')).toBeInTheDocument()
    expect(screen.getByText(/Choose a category for this transaction/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss uncategorized transaction tip' }))
    expect(screen.queryByText('Uncategorized transaction')).not.toBeInTheDocument()
  })

  it('removes a tapped bubble and recalculates the category total and transaction list', () => {
    const timeline = createSpendingAnalyticsTimeline('RO', mockProducts)

    render(
      <PfmCategoryDetailScreen
        category="Shopping"
        direction="out"
        timeline={timeline}
        activePeriodKey="2026-04"
        onPeriodChange={() => undefined}
        onBack={() => undefined}
      />,
      { wrapper: Providers },
    )

    expect(screen.getAllByText('599,21 RON').length).toBeGreaterThan(0)
    expect(screen.getByText('06')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', {
      name: 'Filter out subcategory: ELECTRONICS & COMPUTERS',
    }))

    expect(screen.queryByText('ELECTRONICS & COMPUTERS')).not.toBeInTheDocument()
    expect(screen.queryByText('06')).not.toBeInTheDocument()
    expect(screen.getAllByText('208,99 RON').length).toBeGreaterThan(0)
  })

  it('opens Money Out and Money In category pages from the analytics overview and returns with Back', () => {
    const onTransactionClick = vi.fn()
    render(<AnalyticsScreen onTransactionClick={onTransactionClick} />, { wrapper: Providers })

    fireEvent.click(screen.getByRole('button', { name: 'Open category details: SHOPPING' }))
    expect(screen.getAllByRole('heading', { name: 'SHOPPING' })).toHaveLength(2)
    expect(screen.queryByRole('heading', { name: 'My Spendings' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { name: 'My Spendings' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open category details: INCOME' }))
    expect(screen.getAllByRole('heading', { name: 'INCOME' })).toHaveLength(2)
    expect(screen.getAllByText('SALARY').length).toBeGreaterThan(0)

    fireEvent.click(screen.getAllByRole('button', { name: /Dante International/i })[0]!)
    expect(onTransactionClick).toHaveBeenCalledWith(expect.objectContaining({ pfmCategory: 'Income' }))
  })
})
