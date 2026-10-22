// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import AnalyticsScreen from '@/app/screens/analytics/AnalyticsScreen'
import PfmCategoryDetailScreen from '@/app/screens/analytics/PfmCategoryDetailScreen'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics'
import { mockProducts, type Product } from '@/data/products'
import {
  loadActualNativeAnalyticsModule,
  productCountsForNative,
  resetNativeAnalyticsRenderer,
  waitForNativeAnalyticsScreen,
} from './nativeAnalyticsL6Harness'

const mockedProductState = vi.hoisted(() => ({
  categories: [] as Array<{ key: string; title: string; products: Product[] }>,
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

describe('PFM Spending category details', () => {
  it('renders connected Shopping bubbles and opens a matching transaction', async () => {
    const timeline = createSpendingAnalyticsTimeline('RO', mockProducts)
    const onTransactionClick = vi.fn()

    await renderNative(
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

    expect(screen.getAllByRole('heading', { name: 'SHOPPING' })).toHaveLength(1)
    expect(screen.getAllByText('SHOPPING')).toHaveLength(2)
    expect(screen.getAllByText('SHOPPING').filter(node => node.closest('[aria-hidden="true"]'))).toHaveLength(1)
    expect(screen.getAllByText('SHOPPING (OTHER)').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Add Transaction' })).toBeInTheDocument()
    expect(screen.getByText('APRIL')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /eMAG/i })[0]!)
    expect(onTransactionClick).toHaveBeenCalledWith(expect.objectContaining({ pfmCategory: 'Shopping' }))
  })

  it('shows and dismisses the Uncategorized transaction helper', async () => {
    const timeline = createSpendingAnalyticsTimeline('RO', mockProducts)

    await renderNative(
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
    await waitFor(() => expect(screen.queryByText('Uncategorized transaction')).not.toBeInTheDocument())
  })

  it('toggles a bubble inactive and active while recalculating the category total and transaction list', async () => {
    const timeline = createSpendingAnalyticsTimeline('RO', mockProducts)

    await renderNative(
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

    expect(screen.getByTestId('ro-pfm-category-detail')).toHaveTextContent('711,83 RON')
    expect(screen.getByText('06')).toBeInTheDocument()

    const electronicsBubble = screen.getByRole('button', {
      name: 'Filter out subcategory: ELECTRONICS & COMPUTERS',
    })
    fireEvent.click(electronicsBubble)

    const inactiveElectronicsBubble = await screen.findByRole('button', {
      name: 'Include subcategory: ELECTRONICS & COMPUTERS',
    })
    expect(inactiveElectronicsBubble).toHaveAttribute('aria-pressed', 'true')
    expect(inactiveElectronicsBubble).toHaveAttribute('data-pfm-subcategory-active', 'false')
    await waitFor(() => {
      expect(screen.queryByText('06')).not.toBeInTheDocument()
      expect(screen.getByTestId('ro-pfm-category-detail')).toHaveTextContent('321,61 RON')
    })

    fireEvent.click(inactiveElectronicsBubble)

    const restoredElectronicsBubble = await screen.findByRole('button', {
      name: 'Filter out subcategory: ELECTRONICS & COMPUTERS',
    })
    expect(restoredElectronicsBubble).toHaveAttribute('aria-pressed', 'false')
    expect(restoredElectronicsBubble).toHaveAttribute('data-pfm-subcategory-active', 'true')
    await waitFor(() => {
      expect(screen.getByText('06')).toBeInTheDocument()
      expect(screen.getByTestId('ro-pfm-category-detail')).toHaveTextContent('711,83 RON')
    })
  })

  it('drags the category period carousel from the latest month to the current-year summary', async () => {
    const timeline = createSpendingAnalyticsTimeline('RO', mockProducts)
    const onPeriodChange = vi.fn()

    const { container } = await renderNative(
      <PfmCategoryDetailScreen
        category="Finance"
        direction="out"
        timeline={timeline}
        activePeriodKey="2026-04"
        onPeriodChange={onPeriodChange}
        onBack={() => undefined}
      />,
      { wrapper: Providers },
    )

    const carousel = container.querySelector<HTMLElement>('[data-testid="ro-pfm-category-period-carousel"]')
    expect(carousel).not.toBeNull()

    const activeIndex = timeline.periods.findIndex((period) => period.key === '2026-04')
    carousel!.scrollLeft = activeIndex * 375

    fireEvent.mouseDown(carousel!, { button: 0, clientX: 300 })
    fireEvent.mouseMove(document, { buttons: 1, clientX: -100 })
    fireEvent.mouseUp(document)

    await waitFor(() => expect(onPeriodChange).toHaveBeenCalledWith('year-2026'))
  })

  it('opens Money Out and Money In category pages from the analytics overview and returns with Back', async () => {
    const onTransactionClick = vi.fn()
    await renderNative(<AnalyticsScreen onTransactionClick={onTransactionClick} />, { wrapper: Providers })

    fireEvent.click(screen.getByRole('button', { name: 'Open category details: SHOPPING' }))
    expect(await screen.findAllByRole('heading', { name: 'SHOPPING' })).toHaveLength(1)
    expect(screen.queryByRole('heading', { name: 'Spending' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('heading', { name: 'Spending' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open category details: INCOME' }))
    expect(await screen.findAllByRole('heading', { name: 'INCOME' })).toHaveLength(1)
    expect(screen.getAllByText('INCOME')).toHaveLength(2)
    expect(screen.getAllByText('SALARY').length).toBeGreaterThan(0)

    fireEvent.click(screen.getAllByRole('button', { name: /Dante International/i })[0]!)
    await waitFor(() =>
      expect(onTransactionClick).toHaveBeenCalledWith(
        expect.objectContaining({ pfmCategory: 'Income' }),
      ),
    )
  })
})
