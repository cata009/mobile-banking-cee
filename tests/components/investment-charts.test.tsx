// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import InvestmentDistributionChart from '@/app/components/investments/InvestmentDistributionChart'
import InvestmentPortfolioChart from '@/app/components/investments/InvestmentPortfolioChart'
import type {
  InvestmentChartPoint,
  InvestmentDistributionItem,
} from '@/app/config/investmentsPortfolioConfig'

const PORTFOLIO_POINTS: readonly InvestmentChartPoint[] = [
  { label: 'Point Alpha', dateLabel: 'JAN', yearLabel: '2025', value: 10_000 },
  { label: 'Point Beta', dateLabel: 'APR', yearLabel: '2025', value: 10_750 },
  { label: 'Point Gamma', dateLabel: 'JUL', yearLabel: '2025', value: 10_250 },
  { label: 'Point Omega', dateLabel: 'OCT', yearLabel: '2025', value: 11_200 },
]

const DISTRIBUTION_ITEMS: readonly InvestmentDistributionItem[] = [
  { id: 'funds', label: 'Funds', percent: 48, value: 4_800, currency: 'EUR', color: '#A44A3F' },
  { id: 'bonds', label: 'Bonds', percent: 24, value: 2_400, currency: 'EUR', color: '#337D87' },
  { id: 'stocks', label: 'Stocks', percent: 18, value: 1_800, currency: 'EUR', color: '#6B5CA5' },
  { id: 'cash', label: 'Cash', percent: 10, value: 1_000, currency: 'EUR', color: '#598B4C' },
]

class TestResizeObserver implements ResizeObserver {
  readonly #callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback
  }

  observe(target: Element) {
    this.#callback(
      [{
        target,
        contentRect: createBounds(375, 210),
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      }],
      this,
    )
  }

  unobserve() {}
  disconnect() {}
}

function createBounds(width: number, height: number): DOMRect {
  return {
    x: 0,
    y: 0,
    width,
    height,
    top: 0,
    right: width,
    bottom: height,
    left: 0,
    toJSON: () => ({}),
  }
}

function renderPortfolio(points: readonly InvestmentChartPoint[] = PORTFOLIO_POINTS) {
  return render(
    <InvestmentPortfolioChart
      points={points}
      country="RO"
      currency="EUR"
      amountsHidden={false}
    />,
  )
}

async function getPortfolioDots(container: HTMLElement): Promise<SVGGElement[]> {
  await waitFor(() => {
    expect(container.querySelectorAll<SVGCircleElement>('g[aria-hidden="true"] circle[r="18"]')).not.toHaveLength(0)
  }, { timeout: 3_000 })

  return Array.from(
    container.querySelectorAll<SVGCircleElement>('g[aria-hidden="true"] circle[r="18"]'),
    (hitTarget) => hitTarget.parentElement as unknown as SVGGElement,
  )
}

function expectTooltip(label: string) {
  expect(screen.getByText(label).closest('[data-ds-label="Investments chart point tooltip"]')).toBeInTheDocument()
}

function formatAmount(value: number, currency: string) {
  const [integer = '0', decimal = '00'] = value.toFixed(2).split('.')
  return { integer, decimal: `.${decimal}`, currency }
}

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', TestResizeObserver)
  vi.spyOn(SVGSVGElement.prototype, 'getBoundingClientRect').mockImplementation(() => createBounds(375, 210))
})

afterEach(cleanup)

describe('InvestmentPortfolioChart', () => {
  it('shows the pressed point until pointer release and clears it on an outside press', async () => {
    const { container } = renderPortfolio()
    const dots = await getPortfolioDots(container)
    const firstDot = dots[0]
    const lastDot = dots[dots.length - 1]

    expect(firstDot).toBeDefined()
    expect(lastDot).toBeDefined()
    if (!firstDot || !lastDot) return

    fireEvent.pointerDown(firstDot)
    expectTooltip('Point Alpha')
    fireEvent.pointerUp(firstDot)
    expect(screen.queryByText('Point Alpha')).not.toBeInTheDocument()

    fireEvent.pointerDown(lastDot)
    expectTooltip('Point Omega')
    fireEvent.pointerDown(document.body)
    expect(screen.queryByText('Point Omega')).not.toBeInTheDocument()
  })

  it('selects first and last points while dragging by touch, then clears on end or cancel', async () => {
    const { container } = renderPortfolio()
    await getPortfolioDots(container)
    const chart = container.querySelector<HTMLElement>('[data-ds-label="Investments portfolio chart"]')

    expect(chart).toBeInTheDocument()
    if (!chart) return

    fireEvent.touchStart(chart, { touches: [{ clientX: 0, clientY: 80 }] })
    expectTooltip('Point Alpha')
    fireEvent.touchMove(chart, { touches: [{ clientX: 400, clientY: 80 }] })
    expectTooltip('Point Omega')
    fireEvent.touchEnd(chart, { touches: [] })
    expect(screen.queryByText('Point Omega')).not.toBeInTheDocument()

    fireEvent.touchStart(chart, { touches: [{ clientX: 400, clientY: 80 }] })
    expectTooltip('Point Omega')
    fireEvent.touchCancel(chart, { touches: [] })
    expect(screen.queryByText('Point Omega')).not.toBeInTheDocument()

    expect(() => fireEvent.touchStart(chart, { touches: [] })).not.toThrow()
    expect(() => fireEvent.touchMove(chart, { touches: [] })).not.toThrow()
  })

  it('does not render a selectable target for points whose showDot flag is false', async () => {
    const points = PORTFOLIO_POINTS.map((point, index) => index === 1 ? { ...point, showDot: false } : point)
    const { container } = renderPortfolio(points)
    const dots = await getPortfolioDots(container)

    expect(dots).toHaveLength(PORTFOLIO_POINTS.length - 1)
  })
})

describe('InvestmentDistributionChart', () => {
  it.each([
    { count: 0, expectedSlots: [] },
    { count: 1, expectedSlots: ['70px'] },
    { count: 4, expectedSlots: ['106px', '18px', '106px', '18px'] },
  ])('renders finite geometry and stable labels for $count items', ({ count, expectedSlots }) => {
    const items = DISTRIBUTION_ITEMS.slice(0, count)
    const { container } = render(
      <InvestmentDistributionChart
        title="Allocation"
        items={items}
        formatAmount={formatAmount}
        totalLabel="portfolio"
      />,
    )

    const chart = container.querySelector('[aria-label="100% portfolio"]')
    const paths = Array.from(chart?.querySelectorAll('path') ?? [])
    const labels = Array.from(chart?.querySelectorAll<HTMLDivElement>('div.absolute.max-w-\\[70px\\]') ?? [])
    const buttons = screen.queryAllByRole('button')

    expect(paths).toHaveLength(count)
    expect(labels).toHaveLength(count)
    expect(buttons).toHaveLength(count)
    expect(labels.map((label) => label.style.top)).toEqual(expectedSlots)
    expect(chart?.innerHTML).not.toMatch(/NaN|Infinity/)
    for (const path of paths) {
      expect(path.getAttribute('d')).toMatch(/^M [-\d.]+ [-\d.]+ L [-\d.]+ [-\d.]+ L [-\d.]+ [-\d.]+$/)
    }

    if (count === 4) {
      expect(labels.filter((label) => label.className.includes('left-[16px]'))).toHaveLength(2)
      expect(labels.filter((label) => label.className.includes('right-[16px]'))).toHaveLength(2)
      expect(new Set(paths.map((path) => path.getAttribute('d'))).size).toBe(4)
    }
  })

  it('returns the exact source item object when a distribution row is selected', () => {
    const onItemClick = vi.fn()
    render(
      <InvestmentDistributionChart
        title="Allocation"
        items={DISTRIBUTION_ITEMS}
        formatAmount={formatAmount}
        totalLabel="portfolio"
        onItemClick={onItemClick}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /Stocks/ }))
    expect(onItemClick).toHaveBeenCalledWith(DISTRIBUTION_ITEMS[2])
  })
})
