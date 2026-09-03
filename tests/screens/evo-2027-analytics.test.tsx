// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import AnalyticsScreen from '@/app/screens/analytics/AnalyticsScreen'
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

/** The dot rail: how many periods this granularity holds, and which one is on. */
function periodDots() {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-evo-analytics-period-dots] button'))
}

describe('Evo 2027 analytics overview', () => {
  it('can open directly on one account and the requested money direction', () => {
    const { container } = render(
      <AnalyticsScreen initialScopeId="acc-1" initialDirection="income" />,
      { wrapper: Providers },
    )

    expect(container.querySelector('[data-evo-analytics-summary]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-evo-analytics-scope-trigger]')).toHaveTextContent('Primary Account')
    expect(screen.getByRole('heading', { name: 'Income' })).toBeInTheDocument()
    expect(container.querySelector('[data-evo-expense-chart]')).toBeInTheDocument()
  })

  it('scopes the overview to All accounts or one selected current account', () => {
    const { container } = render(<AnalyticsScreen />, { wrapper: Providers })

    const overview = container.querySelector<HTMLElement>('[data-evo-analytics-summary]')
    const hero = container.querySelector<HTMLElement>('[data-evo-analytics-summary-hero]')

    expect(overview).toHaveAttribute('data-evo-analytics-scope', 'all-accounts')
    const scopeTrigger = container.querySelector<HTMLElement>('[data-evo-analytics-scope-trigger]') as HTMLElement
    expect(scopeTrigger).toHaveTextContent('All accounts')
    expect(scopeTrigger).not.toHaveTextContent(/transactions/i)

    const allAccountsSpend = hero?.textContent
    fireEvent.click(scopeTrigger)
    fireEvent.click(screen.getByRole('option', { name: /Primary Account$/ }))

    expect(overview).toHaveAttribute('data-evo-analytics-scope', 'acc-1')
    expect(container.querySelector('[data-evo-analytics-scope-trigger]')).toHaveTextContent('Primary Account')
    expect(container.querySelector('[data-evo-analytics-scope-trigger]')).not.toHaveTextContent(/transactions/i)
    expect(container.querySelector('[data-evo-analytics-summary-hero]')).not.toHaveTextContent(allAccountsSpend ?? '')
  })

  it('opens with the family L1 composition: swipeable month cards and a category section', () => {
    const { container } = render(<AnalyticsScreen />, { wrapper: Providers })

    expect(container.querySelector('[data-evo-analytics-period-carousel]')).toBeInTheDocument()
    expect(container.querySelector('[data-evo-analytics-summary-hero]')).toBeInTheDocument()
    // A rail, so the neighbouring card peeks in and says "swipe": the months
    // oldest-first, then the year totals newest-first closing the axis.
    const periodCards = container.querySelectorAll('[data-evo-analytics-period-card]')
    expect(periodCards.length).toBeGreaterThan(1)
    expect(Array.from(periodCards).some((card) => card.textContent?.includes('Total 2026'))).toBe(true)
    expect(Array.from(periodCards).some((card) => card.textContent?.includes('Total 2025'))).toBe(true)
    // The rail is the period control here — swipe it, or tap a dot. A dropdown
    // beside the scope repeated the card's own title back at the customer.
    expect(container.querySelector('[data-evo-analytics-period-trigger]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-evo-analytics-period-dots]')).toBeInTheDocument()
    expect(container.querySelector('[data-evo-analytics-month-bars]')).not.toBeInTheDocument()
    expect(screen.getAllByText('Money out').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('heading', { name: 'Money out' }).length).toBeGreaterThan(0)
    expect(container.querySelectorAll('[data-evo-analytics-top-category]').length).toBeGreaterThan(0)

    // The scope control sits above the card, not inside its pastel ground.
    const heroText = container.querySelector('[data-evo-analytics-summary-hero]')?.textContent ?? ''
    expect(heroText).not.toContain('All accounts')
    expect(container.querySelector('[data-evo-analytics-scope-trigger]')).toHaveTextContent('All accounts')
    expect(container.querySelector('[data-evo-analytics-see-all] svg')).toBeInTheDocument()
    expect(container.querySelector('[data-evo-analytics-see-all-chevron]')).toHaveAttribute('viewBox', '0 0 16 16')
    expect(screen.queryByText(/transactions need a category/)).not.toBeInTheDocument()
    const [firstCategory] = Array.from(container.querySelectorAll<HTMLElement>('[data-evo-analytics-top-category]'))
    expect(firstCategory).toHaveClass('min-h-[80px]', 'items-center')
    expect(firstCategory).toHaveTextContent('Household')
    expect(firstCategory).not.toHaveTextContent('HOUSEHOLD')
    expect(firstCategory!.querySelector('.font-bold')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show next monthly interval' })).not.toBeInTheDocument()

    // The chart-tool furniture the other L1 destinations never had.
    expect(screen.queryByText('Monthly interval')).not.toBeInTheDocument()
    expect(screen.queryByText('My Cash Flow')).not.toBeInTheDocument()
    expect(container.querySelector('[data-evo-analytics-kpi]')).not.toBeInTheDocument()
    expect(screen.queryByText(/moved into investments, not spending/)).not.toBeInTheDocument()
  })

  it('offers presets and a custom range, and closes the axis with the year totals', () => {
    const { container } = render(<AnalyticsScreen />, { wrapper: Providers })

    // The rail opens on the newest month, and the year totals sit after it.
    const dots = periodDots()
    expect(dots.length).toBeGreaterThan(1)
    expect(dots.find((dot) => dot.getAttribute('aria-current') === 'true'))
      .toHaveAttribute('aria-label', 'April 2026')
    expect(dots[dots.length - 1]).toHaveAttribute('aria-label', 'Total 2025')

    fireEvent.click(dots.find((dot) => dot.getAttribute('aria-label') === 'March 2026') as HTMLElement)
    expect(container.querySelector('[data-evo-analytics-period-carousel]'))
      .toHaveAttribute('data-evo-analytics-period-key', 'month:2026-03')

    // Presets and the custom range are reached from the analysis screen, where
    // the period is the page's heading rather than one filter among several.
    fireEvent.click(screen.getByRole('button', { name: 'All spending categories' }))
    fireEvent.click(container.querySelector('[data-evo-analytics-period-trigger]') as HTMLElement)
    expect(screen.getByRole('option', { name: /Last 3 months/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Year to date/ })).toBeInTheDocument()

    fireEvent.click(document.querySelector('[data-evo-analytics-period-option="last-3-months"]') as HTMLElement)
    expect(container.querySelector('[data-evo-expense-interval]')).toHaveAttribute('data-evo-expense-interval', 'range')
    expect(container.querySelector('[data-evo-analytics-period-trigger]')).toHaveTextContent('Last 3 months')
  })

  it('reaches a custom span of months, which no preset covers', () => {
    const { container } = render(<AnalyticsScreen />, { wrapper: Providers })
    fireEvent.click(screen.getByRole('button', { name: 'All spending categories' }))

    fireEvent.click(container.querySelector('[data-evo-analytics-period-trigger]') as HTMLElement)
    fireEvent.click(document.querySelector('[data-evo-analytics-period-option="custom"]') as HTMLElement)

    const from = document.querySelector<HTMLSelectElement>('[data-evo-analytics-period-from]')
    const to = document.querySelector<HTMLSelectElement>('[data-evo-analytics-period-to]')
    expect(from).toBeInTheDocument()
    expect(to).toBeInTheDocument()

    const months = Array.from(from!.options).map((option) => option.value)
    fireEvent.change(from!, { target: { value: months[0] } })
    fireEvent.change(to!, { target: { value: months[2] } })
    fireEvent.click(document.querySelector('[data-evo-analytics-period-apply]') as HTMLElement)

    expect(container.querySelector('[data-evo-analytics-period-trigger]')).toHaveTextContent('–')
  })

  it('uses 16px flow labels and keeps the scope selector 16px from the period carousel', () => {
    const { container } = render(<AnalyticsScreen />, { wrapper: Providers })
    const hero = container.querySelector<HTMLElement>('[data-evo-analytics-summary-hero]')
    const controls = container.querySelector<HTMLElement>('[data-evo-analytics-overview-controls]')

    expect(controls).toBeInTheDocument()
    expect(controls).toHaveClass('gap-[0px]')
    expect(hero?.querySelector('[data-evo-analytics-open-expenses] > span:first-child')).toHaveClass('text-[16px]')
    expect(hero?.querySelector('[data-evo-analytics-open-income] > span:first-child')).toHaveClass('text-[16px]')
    expect(hero?.querySelector('[data-evo-analytics-summary-net-label]')).toHaveClass('text-[16px]')
    expect(hero?.textContent).toMatch(/\d{1,3}\.\d{3},\d{2} CZK/)
    expect(hero?.textContent).not.toMatch(/\d{1,3} \d{3},\d{2} CZK/)
  })

  it('uses the portfolio trend badge for positive and negative net cashflow', () => {
    const { container } = render(<AnalyticsScreen />, { wrapper: Providers })
    const nets = container.querySelectorAll('[data-evo-analytics-summary-net]')

    expect(nets.length).toBeGreaterThan(0)
    // One column: the mark sits on the label's centre line, and the amount and
    // the sentence under it start at the same left edge as the mark.
    expect(nets[0]).toHaveClass('min-w-0')
    expect(nets[0]?.firstElementChild).toHaveClass('flex', 'items-center')
    const upBadge = container.querySelector('[data-evo-analytics-summary-net] [role="img"][aria-label="Portfolio up"]')
    expect(upBadge).toBeInTheDocument()
    expect(upBadge).toHaveStyle({ width: '16px', height: '16px' })
    expect(upBadge).not.toHaveClass('rounded-full', 'bg-[var(--uc-surface-raised)]', 'shadow-[0_3px_9px_rgb(0_0_0/0.12)]')

    // A month that spent more than it took in wears the other badge, and every
    // month in the rail is reachable from the dots.
    const down = () => container.querySelector('[data-evo-analytics-summary-net] [role="img"][aria-label="Portfolio down"]')
    const dots = periodDots()
    for (let index = 0; index < dots.length && !down(); index += 1) {
      fireEvent.click(periodDots()[index] as HTMLElement)
    }
    expect(down()).toBeInTheDocument()
  })

  it('leads the summary card with the net figure and puts each flow under its own bar', () => {
    const { container } = render(<AnalyticsScreen />, { wrapper: Providers })
    const hero = container.querySelector<HTMLElement>('[data-evo-analytics-summary-hero]')
    const net = hero?.querySelector('[data-evo-analytics-summary-net]') as HTMLElement
    const bars = hero?.querySelector('[data-evo-analytics-flow-bars]') as HTMLElement
    const income = hero?.querySelector('[data-evo-analytics-open-income]') as HTMLElement
    const expenses = hero?.querySelector('[data-evo-analytics-open-expenses]') as HTMLElement

    expect(hero).toHaveClass('gap-[12px]', 'p-[16px]')
    // The answer, then the bars in the rule's place, then the two figures.
    const order = (a: HTMLElement, b: HTMLElement) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    expect(order(net, bars)).toBe(true)
    expect(order(bars, income)).toBe(true)
    // Money in reads left, money out right, each under the bar it fills.
    expect(order(income, expenses)).toBe(true)
    expect(expenses).toHaveClass('text-right')
    expect(income).toHaveClass('text-left')
  })

  it('shows matching top money-out and money-in sections on the overview', () => {
    const { container } = render(<AnalyticsScreen />, { wrapper: Providers })

    const moneyOut = container.querySelector<HTMLElement>('[data-evo-analytics-top-categories]')
    const moneyIn = container.querySelector<HTMLElement>('[data-evo-analytics-money-in-categories]')

    expect(moneyOut).toBeInTheDocument()
    expect(moneyIn).toBeInTheDocument()
    expect(moneyOut?.querySelectorAll('[data-evo-analytics-top-category]')).toHaveLength(3)
    expect(moneyIn?.querySelectorAll('[data-evo-analytics-money-in-category]')).toHaveLength(3)
    expect(moneyOut).toHaveTextContent('Money out')
    expect(moneyIn).toHaveTextContent('Money in')
    // Section headings share one type token across the app.
    expect(screen.getByRole('heading', { name: 'Money out' })).toHaveClass('uc-type-l1')
    expect(screen.getByRole('heading', { name: 'Money in' })).toHaveClass('uc-type-l1')
    expect(screen.getByRole('heading', { name: 'Money out' })).not.toHaveTextContent(/\d/)
    expect(screen.getByRole('heading', { name: 'Money in' })).not.toHaveTextContent(/\d/)
    // The two blocks name what they open: they used to carry the same label.
    expect(screen.getByRole('button', { name: 'All spending categories' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All income categories' })).toBeInTheDocument()
    expect(moneyIn).toHaveTextContent('Income')
    expect(moneyIn).toHaveTextContent('Transfers')
    expect(moneyIn?.querySelector('[data-evo-analytics-money-in-category]')).toHaveTextContent('Income')
  })

  it('opens the money-in category detail with the income direction', () => {
    const { container } = render(<AnalyticsScreen />, { wrapper: Providers })
    const incomeRow = container.querySelector<HTMLElement>('[data-evo-analytics-money-in-category]')

    expect(incomeRow).toBeInTheDocument()
    fireEvent.click(incomeRow as HTMLElement)

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(container.querySelector('[data-evo-analytics-breakdown="Income"]')).toBeInTheDocument()
    expect(screen.getByText('Transactions')).toBeInTheDocument()
  })

})

describe('Evo 2027 expense chart and split-by breakdown', () => {
  function openExpenses() {
    const rendered = render(<AnalyticsScreen />, { wrapper: Providers })
    fireEvent.click(screen.getByRole('button', { name: 'All spending categories' }))
    return rendered
  }

  function donutCategoryButtons() {
    const donut = screen.getByTestId('evo-expense-donut-chart')
    return Array.from(donut.querySelectorAll<HTMLElement>('button[data-evo-expense-category]'))
  }

  function arcStrokes() {
    const donut = screen.getByTestId('evo-expense-donut-chart')
    return Array.from(donut.querySelectorAll('circle')).map((arc) => arc.getAttribute('stroke'))
  }

  function breakdownRows() {
    return Array.from(document.querySelectorAll<HTMLElement>('[data-evo-expense-breakdown-row]'))
  }

  function selectSplitMode(label: string) {
    fireEvent.click(screen.getByRole('button', { name: 'Select how transactions are split' }))
    fireEvent.click(screen.getByRole('option', { name: label }))
  }

  it('shows the donut and a category breakdown instead of a raw transaction list', () => {
    openExpenses()

    expect(screen.getByTestId('evo-expense-donut-chart')).toBeInTheDocument()
    expect(screen.getByText('Transactions split by')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add transaction' })).toBeInTheDocument()
    expect(screen.queryByText('Monthly interval')).not.toBeInTheDocument()
    expect(document.querySelectorAll('[data-evo-analytics-scope-trigger]')).toHaveLength(1)
    expect(breakdownRows().length).toBeGreaterThan(1)
    expect(periodDots().length).toBeGreaterThan(1)
    expect(screen.queryByTestId('evo-expense-transaction')).not.toBeInTheDocument()
  })

  it('matches the Figma chart toggle geometry and keeps it anchored to the chart', () => {
    openExpenses()

    const chartToggle = screen.getByRole('group', { name: 'Chart type' })
    expect(chartToggle).toHaveClass('gap-[2px]', 'px-[4px]', 'py-[2px]', 'bg-[var(--uc-neutral-200)]')
    const chartButtons = Array.from(chartToggle.querySelectorAll('button'))
    expect(chartButtons).toHaveLength(2)
    chartButtons.forEach((button) => {
      expect(button).toHaveClass('h-[24px]', 'w-[40px]')
      expect(button.querySelector('svg')).toHaveAttribute('width', '16')
      expect(button.querySelector('svg')).toHaveAttribute('height', '16')
    })
    const [donutButton, barsButton] = chartButtons
    if (!donutButton || !barsButton) throw new Error('Expected both chart toggle buttons')
    // The selected mode wears the action colour: a --uc-surface pill was 1.25:1 on the dark track.
    expect(donutButton).toHaveClass('bg-[var(--uc-action-strong)]', 'text-[var(--uc-static-white)]')
    expect(Array.from(donutButton.querySelectorAll('path')).map((path) => path.getAttribute('d'))).toEqual([
      'M7.54175 0.666016V3.1135C5.25696 3.34404 3.43921 5.11366 3.13396 7.37461L3.11425 7.54098H0.666748C0.89179 3.84133 3.84208 0.891056 7.54175 0.666016Z',
      'M12.858 8.4439H15.3334C15.2417 9.99489 14.6537 11.4735 13.66 12.6633L13.5001 12.8485L11.7492 11.1022C12.3235 10.3959 12.6971 9.54985 12.8318 8.65198L12.858 8.4439Z',
      'M3.14633 8.45765C3.31454 10.2552 4.46404 11.8122 6.13237 12.502C7.80071 13.1922 9.71425 12.9021 11.1025 11.7485L12.8492 13.4993C11.5141 14.6873 9.78712 15.3404 8.00008 15.3326C4.12212 15.3404 0.909206 12.3273 0.666748 8.45765H3.14633Z',
      'M15.2615 7.34757C14.9791 3.746 12.0838 0.885556 8.45842 0.666016V3.1135L8.62342 3.13367C10.8711 3.44442 12.6205 5.26628 12.8263 7.54098H15.2738L15.2615 7.34757Z',
    ])
    // currentColor, not a literal hex: the glyph has to follow the button's own colour in dark.
    expect(Array.from(donutButton.querySelectorAll('path')).every((path) => path.getAttribute('fill') === 'currentColor')).toBe(true)
    expect(Array.from(barsButton.querySelectorAll('path')).map((path) => path.getAttribute('d'))).toEqual([
      'M11.6667 4.33268V15.3327C13.6917 15.3327 15.3334 13.6909 15.3334 11.666V0.666016C13.3085 0.666016 11.6667 2.30777 11.6667 4.33268Z',
      'M0.666748 11.666V15.3327C2.69166 15.3327 4.33341 13.6909 4.33341 11.666V7.99935C2.3085 7.99935 0.666748 9.6411 0.666748 11.666Z',
      'M6.16675 15.3327V7.08268C6.16675 5.05777 7.8085 3.41602 9.83342 3.41602V11.666C9.83342 13.6909 8.19167 15.3327 6.16675 15.3327Z',
    ])
    expect(Array.from(barsButton.querySelectorAll('path')).every((path) => path.getAttribute('fill') === 'currentColor')).toBe(true)

    // The toggle rides the scope row and stays there in both modes: a control
    // that moves when you use it cannot be learned.
    const controls = screen.getByRole('region', { name: 'Analytics scope' })
    expect(controls.contains(chartToggle)).toBe(true)
    fireEvent.click(barsButton)
    expect(screen.getByRole('region', { name: 'Analytics scope' })
      .contains(screen.getByRole('group', { name: 'Chart type' }))).toBe(true)
  })

  it('moves to adjacent periods when the chart itself is swiped', () => {
    openExpenses()

    const period = document.querySelector<HTMLElement>('[data-evo-analytics-period-key]')
    const chart = screen.getByLabelText('Expense chart')
    const initialKey = period?.getAttribute('data-evo-analytics-period-key')

    // Dragging right pulls the previous period in behind the finger.
    fireEvent.pointerDown(chart, { pointerType: 'touch', pointerId: 1, clientX: 120 })
    fireEvent.pointerMove(chart, { pointerType: 'touch', pointerId: 1, clientX: 200 })
    fireEvent.pointerUp(chart, { pointerType: 'touch', pointerId: 1, clientX: 220 })

    expect(period).not.toHaveAttribute('data-evo-analytics-period-key', initialKey ?? '')

    // Dragging left walks forward again, back to where it started.
    fireEvent.pointerDown(chart, { pointerType: 'touch', pointerId: 2, clientX: 220 })
    fireEvent.pointerUp(chart, { pointerType: 'touch', pointerId: 2, clientX: 120 })
    expect(period).toHaveAttribute('data-evo-analytics-period-key', initialKey ?? '')

    // Past the newest month the axis hands over to the year totals, newest first.
    fireEvent.pointerDown(chart, { pointerType: 'touch', pointerId: 3, clientX: 220 })
    fireEvent.pointerUp(chart, { pointerType: 'touch', pointerId: 3, clientX: 120 })
    expect(period).toHaveAttribute('data-evo-analytics-period-key', 'year:2026')

    fireEvent.pointerDown(chart, { pointerType: 'touch', pointerId: 4, clientX: 220 })
    fireEvent.pointerUp(chart, { pointerType: 'touch', pointerId: 4, clientX: 120 })
    expect(period).toHaveAttribute('data-evo-analytics-period-key', 'year:2025')

    // And there the axis ends: the gesture springs back rather than pretending
    // to travel.
    fireEvent.pointerDown(chart, { pointerType: 'touch', pointerId: 5, clientX: 220 })
    fireEvent.pointerUp(chart, { pointerType: 'touch', pointerId: 5, clientX: 120 })
    expect(period).toHaveAttribute('data-evo-analytics-period-key', 'year:2025')

    // Back the other way returns to the month it came from.
    fireEvent.pointerDown(chart, { pointerType: 'touch', pointerId: 6, clientX: 120 })
    fireEvent.pointerUp(chart, { pointerType: 'touch', pointerId: 6, clientX: 240 })
    expect(period).toHaveAttribute('data-evo-analytics-period-key', 'year:2026')

    fireEvent.pointerDown(chart, { pointerType: 'touch', pointerId: 7, clientX: 120 })
    fireEvent.pointerUp(chart, { pointerType: 'touch', pointerId: 7, clientX: 240 })
    expect(period).toHaveAttribute('data-evo-analytics-period-key', initialKey ?? '')
  })

  it('keeps Income on the same period control, with the year totals closing the axis', () => {
    render(<AnalyticsScreen />, { wrapper: Providers })
    fireEvent.click(screen.getByRole('button', { name: 'All income categories' }))

    expect(document.querySelector('[data-evo-analytics-direction="income"]')).toBeInTheDocument()
    // The newest month is where the rail opens; the year totals sit past it.
    const dots = periodDots()
    expect(dots.find((dot) => dot.getAttribute('aria-current') === 'true'))
      .toHaveAttribute('aria-label', 'April 2026')
    expect(dots[dots.length - 1]).toHaveAttribute('aria-label', 'Total 2025')
    expect(document.querySelector('[data-evo-expense-interval]')).toHaveAttribute('data-evo-expense-interval', 'month')

    fireEvent.click(document.querySelector('[data-evo-analytics-period-trigger]') as HTMLElement)
    fireEvent.click(document.querySelector('[data-evo-analytics-period-option="last-year"]') as HTMLElement)
    expect(document.querySelector('[data-evo-expense-interval="year"]')).toBeInTheDocument()
    expect(screen.queryByText('Monthly interval')).not.toBeInTheDocument()
  })

  it('inhibits the other arcs when one category is picked and restores them when it is picked again', () => {
    openExpenses()

    expect(arcStrokes().every((stroke) => stroke !== 'var(--uc-neutral-300)')).toBe(true)

    const [first] = donutCategoryButtons()
    if (!first) throw new Error('Expected a donut category')
    const category = first.getAttribute('data-evo-expense-category')

    fireEvent.click(first)

    expect(first).toHaveAttribute('aria-pressed', 'true')
    expect(arcStrokes().filter((stroke) => stroke === 'var(--uc-neutral-300)')).toHaveLength(arcStrokes().length - 1)
    expect(breakdownRows().map((row) => row.getAttribute('data-evo-expense-breakdown-row'))).toEqual([category])

    fireEvent.click(donutCategoryButtons()[0] as HTMLElement)

    expect(arcStrokes().every((stroke) => stroke !== 'var(--uc-neutral-300)')).toBe(true)
    expect(screen.queryByRole('button', { name: 'Clear expense filters' })).not.toBeInTheDocument()
    expect(breakdownRows().length).toBeGreaterThan(1)
  })

  it('draws only arcs big enough to carry a marker and folds the rest into Other', () => {
    openExpenses()

    // Up to six named arcs, but only while each one is worth drawing: an arc
    // under 8% renders as a stub whose marker lands on its neighbours', which is
    // how the ring ended up with a pile of icons in one corner.
    const donutButtons = donutCategoryButtons()
    expect(donutButtons.length).toBeGreaterThan(1)
    expect(donutButtons.length).toBeLessThanOrEqual(7)
    const otherButton = donutButtons.find((button) => button.getAttribute('data-evo-expense-category') === 'Other')
    if (!otherButton) throw new Error('Expected an Other donut segment')

    expect(otherButton).toHaveClass('size-[32px]', 'text-[var(--uc-static-white)]')
    // Quiet, but never the pale grey an inhibited arc wears.
    expect(otherButton).toHaveStyle({ backgroundColor: 'var(--uc-neutral-600)' })
    // The marker counts what is folded in. Three dots meant "more options"
    // everywhere else in the app, which is not what this arc opens.
    expect(otherButton.textContent?.trim()).toMatch(/^\+\d+$/)

    const primaryKeys = donutButtons
      .map((button) => button.getAttribute('data-evo-expense-category'))
      .filter((key): key is string => Boolean(key) && key !== 'Other')
    const allRowCount = breakdownRows().length

    fireEvent.click(otherButton)

    expect(otherButton).toHaveAttribute('aria-pressed', 'true')
    // Other is one arc but many categories, so the headline counts what it folds
    // in rather than naming the arc.
    const foldedCount = Number(otherButton.textContent?.trim().replace('+', ''))
    expect(screen.getAllByText(`${foldedCount} categories`).length).toBeGreaterThan(0)
    // Picking Other narrows the list to what the ring folded away: fewer rows
    // than the full breakdown, and not one of them is a named arc.
    const remaining = breakdownRows().map((row) => row.getAttribute('data-evo-expense-breakdown-row'))
    expect(remaining.length).toBeGreaterThan(0)
    expect(remaining.length).toBeLessThan(allRowCount)
    expect(remaining.some((key) => key !== null && primaryKeys.includes(key))).toBe(false)
  })

  it('keeps several categories coloured and breaks all of them down', () => {
    openExpenses()

    const [first, second] = donutCategoryButtons()
    if (!first || !second) throw new Error('Expected at least two donut categories')
    const categories = [first.getAttribute('data-evo-expense-category'), second.getAttribute('data-evo-expense-category')]

    fireEvent.click(first)
    fireEvent.click(donutCategoryButtons()[1] as HTMLElement)

    expect(arcStrokes().filter((stroke) => stroke === 'var(--uc-neutral-300)')).toHaveLength(arcStrokes().length - 2)
    expect(breakdownRows().map((row) => row.getAttribute('data-evo-expense-breakdown-row')).sort())
      .toEqual([...categories].sort())
  })

  it('opens a category row and lists its subcategories and transactions', () => {
    openExpenses()

    const [row] = breakdownRows()
    if (!row) throw new Error('Expected a breakdown row')
    const category = row.getAttribute('data-evo-expense-breakdown-row')

    fireEvent.click(row)

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(document.querySelector('[data-evo-analytics-breakdown="' + category + '"]')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-pfm-subcategory-bubble]').length).toBeGreaterThan(0)
    const transactions = screen.getAllByTestId('evo-expense-transaction')
    expect(transactions).not.toHaveLength(0)
    expect(transactions.every(
      (transaction) => transaction.getAttribute('data-evo-expense-transaction-category') === category,
    )).toBe(true)
  })

  it('breaks spending down by merchant and drills into one merchant', () => {
    openExpenses()

    const categoryRowKeys = breakdownRows().map((row) => row.getAttribute('data-evo-expense-breakdown-row'))

    selectSplitMode('Merchants')

    const merchantRows = breakdownRows()
    expect(merchantRows.length).toBeGreaterThan(0)
    expect(merchantRows.map((row) => row.getAttribute('data-evo-expense-breakdown-row'))).not.toEqual(categoryRowKeys)

    const [firstMerchant] = merchantRows
    if (!firstMerchant) throw new Error('Expected a merchant row')
    const merchant = firstMerchant.getAttribute('data-evo-expense-breakdown-row')

    fireEvent.click(firstMerchant)

    const transactions = screen.getAllByTestId('evo-expense-transaction')
    expect(transactions).not.toHaveLength(0)
    expect(transactions.every((transaction) => transaction.textContent?.includes(merchant ?? ''))).toBe(true)
    expect(document.querySelectorAll('[data-evo-expense-subcategory]')).toHaveLength(0)
  })

  it('offers the currency split only when the scope actually mixes currencies', () => {
    openExpenses()

    fireEvent.click(screen.getByRole('button', { name: 'Select how transactions are split' }))
    expect(screen.getAllByRole('option').map((option) => option.textContent)).not.toContain('Currency')
    fireEvent.click(screen.getByRole('option', { name: 'Categories' }))

    cleanup()
    mockedProductState.categories = [{
      key: 'test-products',
      title: 'Test products',
      products: [
        ...mockProducts,
        { id: 'acc-eur', type: 'current_account', name: 'Euro Account', accountNumber: '9876543210987654', balance: 1200, currency: 'EUR' },
      ],
    }]

    openExpenses()

    fireEvent.click(screen.getByRole('button', { name: 'Select how transactions are split' }))
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toContain('Currency')
    fireEvent.click(screen.getByRole('option', { name: 'Currency' }))
    expect(breakdownRows().length).toBeGreaterThan(0)
  })

  it('gives currency rows the shared currency roundel rather than a letter badge', () => {
    cleanup()
    mockedProductState.categories = [{
      key: 'test-products',
      title: 'Test products',
      products: [
        ...mockProducts,
        { id: 'acc-eur', type: 'current_account', name: 'Euro Account', accountNumber: '9876543210987654', balance: 1200, currency: 'EUR' },
      ],
    }]

    openExpenses()

    fireEvent.click(screen.getByRole('button', { name: 'Select how transactions are split' }))
    fireEvent.click(screen.getByRole('option', { name: 'Currency' }))

    const [row] = breakdownRows()
    if (!row) throw new Error('Expected a currency row')
    expect(row.querySelector('[data-currency-badge], [data-ds-label*="Currency"]') ?? row.firstElementChild).toBeTruthy()
    expect(row.textContent).toMatch(/CZK|EUR/)
  })

  it('switches to the bar chart, isolates a bucket and carries it into the breakdown', () => {
    openExpenses()

    fireEvent.click(screen.getByRole('button', { name: 'Show spending over time' }))

    expect(screen.queryByTestId('evo-expense-donut-chart')).not.toBeInTheDocument()
    const chart = screen.getByLabelText('Expense bar chart')
    expect(chart).toHaveTextContent(/\d+(?:\.\d+)?K/)
    expect(chart).toHaveTextContent('Total spent')
    expect(chart).toHaveTextContent('Week 1')
    expect(chart).toHaveTextContent('1–7')
    const chartLayout = chart.querySelector('[data-evo-expense-plot]')
    const yAxis = chartLayout?.firstElementChild
    // The scale is money and used to say so nowhere: the currency is named once,
    // on the top tick, rather than on every label or on none.
    expect(yAxis).toHaveTextContent('CZK')
    expect((yAxis?.textContent?.match(/CZK/g) ?? []).length).toBe(1)
    // Round steps: rounding the maximum and dividing by four produced 6.3K / 18.8K.
    // Round steps only: rounding the maximum and dividing by four produced
    // labels like 6.3K and 18.8K.
    expect(yAxis?.textContent).not.toMatch(/\d+\.\d+K/)
    expect(chartLayout).toHaveClass('gap-[6px]')
    expect(yAxis).toHaveClass('w-[32px]')
    const bars = Array.from(chart.querySelectorAll<HTMLElement>('button[data-evo-expense-bar]'))
    const spentBar = bars.find((bar) => {
      const fill = bar.querySelector<HTMLElement>('span > span')
      return fill ? Number.parseFloat(fill.style.height) > 0 : false
    })
    if (!spentBar) throw new Error('Expected at least one bar with spending')
    // A month is split into fixed 7-day slices, so the bucket key is the week ordinal.
    expect(bars.length).toBeGreaterThanOrEqual(4)
    expect(bars.length).toBeLessThanOrEqual(5)
    const weekIndex = Number(spentBar.getAttribute('data-evo-expense-bar')?.replace('w', '')) - 1

    fireEvent.click(spentBar)

    expect(spentBar).toHaveAttribute('aria-pressed', 'true')

    const [row] = breakdownRows()
    if (!row) throw new Error('Expected a breakdown row for the selected week')
    fireEvent.click(row)

    // The day now lives on the group divider, so every visible row sits under a date in that week.
    expect(screen.getAllByTestId('evo-expense-transaction').every((transaction) => {
      const dateKey = transaction.closest('[data-transaction-date-group]')?.getAttribute('data-transaction-date-group')
      const day = Number(dateKey?.slice(-2))
      return Number.isFinite(day) && Math.floor((day - 1) / 7) === weekIndex
    })).toBe(true)
  })

  it('uses the overview amount scale in the full expense breakdown', () => {
    render(<AnalyticsScreen />, { wrapper: Providers })
    const overviewAmount = Array.from(document.querySelectorAll<HTMLElement>('[data-evo-analytics-top-category] span'))
      .find((node) => node.classList.contains('text-[18px]'))
    fireEvent.click(document.querySelector('[data-evo-analytics-top-categories] button[data-evo-analytics-see-all]') as HTMLElement)

    const breakdownAmount = Array.from(breakdownRows()[0]?.querySelectorAll<HTMLElement>('span') ?? [])
      .find((node) => node.classList.contains('text-[18px]'))

    expect(overviewAmount).toHaveClass('text-[18px]')
    expect(breakdownAmount).toHaveClass('text-[18px]')
  })

  it('returns to the overview when a drill-in started there', () => {
    const { container } = render(<AnalyticsScreen />, { wrapper: Providers })

    const [topCategory] = Array.from(container.querySelectorAll<HTMLElement>('[data-evo-analytics-top-category]'))
    if (!topCategory) throw new Error('Expected a top category row on the overview')

    fireEvent.click(topCategory)
    expect(document.querySelector('[data-evo-analytics-breakdown]')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))

    expect(container.querySelector('[data-evo-analytics-summary-hero]')).toBeInTheDocument()
    expect(screen.queryByTestId('evo-expense-donut-chart')).not.toBeInTheDocument()
  })
})
