// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import InvestmentPortfolioChart from '@/app/components/investments/InvestmentPortfolioChart'

afterEach(cleanup)

const points = [
  { label: '12 Jun 2026', dateLabel: '12 Jun', yearLabel: '2026', value: 20000 },
  { label: '18 Sep 2026', dateLabel: '18 Sep', yearLabel: '2026', value: 12000 },
  { label: '25 Sep 2026', dateLabel: '25 Sep', yearLabel: '2026', value: 0 },
  { label: '08 Oct 2026', dateLabel: '08 Oct', yearLabel: '2026', value: 0 },
]

function mount(czRoboPresentation = true, empty = false) {
  return render(
    <InvestmentPortfolioChart
      points={empty ? points.map((point) => ({ ...point, value: 0 })) : points}
      country="CZ"
      currency="CZK"
      amountsHidden={false}
      compact
      czRoboPresentation={czRoboPresentation}
      zeroBaselineOnly={empty}
      curveType="stepAfter"
      showTooltipPerformance={false}
    />,
  )
}

describe('CZ Robo chart axis alignment', () => {
  it.each([false, true])('aligns amount labels with chart content without extra indentation (empty %s)', (empty) => {
    const { container } = mount(true, empty)
    const amounts = container.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick text')
    expect(amounts.length).toBeGreaterThan(0)
    for (const label of amounts) {
      expect(label.getAttribute('x')).toBe('0')
      expect(label.getAttribute('text-anchor')).toBe('start')
    }
    const curve = container.querySelector('.recharts-area-curve')!.getAttribute('d')!
    const plotStart = Number(curve.match(/^M([^,]+)/)![1])
    expect(plotStart).toBeLessThanOrEqual(36)
    expect(plotStart).toBeGreaterThanOrEqual(20)
    const dateLabels = container.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick text')
    expect(dateLabels[0]!.getAttribute('text-anchor')).toBe('start')
    expect(dateLabels[dateLabels.length - 1]!.getAttribute('text-anchor')).toBe('end')
    for (const element of container.querySelectorAll('svg *')) {
      for (const attribute of element.attributes) expect(attribute.value).not.toMatch(/NaN|Infinity/)
    }
  })

  it('preserves the ordinary portfolio chart label placement and gutter', () => {
    const { container } = mount(false)
    const amounts = container.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick text')
    for (const label of amounts) {
      expect(label.getAttribute('x')).toBe('30')
      expect(label.getAttribute('text-anchor')).toBe('end')
    }
    const curve = container.querySelector('.recharts-area-curve')!.getAttribute('d')!
    expect(Number(curve.match(/^M([^,]+)/)![1])).toBe(56)
  })

  it('retains the sign of the padded negative axis tick without changing the zero-valued endpoint', () => {
    const { container } = mount()
    const amounts = [...container.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick text')].map(
      (label) => label.textContent,
    )
    expect(amounts).toContain('-2k')
    expect(amounts).toContain('22k')
    fireEvent.pointerDown(container.querySelectorAll('.recharts-area-dots > g')[3]!)
    expect(container.querySelector('[data-ds-label="Investments chart point tooltip"]')).toHaveTextContent('0,00 CZK')
  })

  it('keeps rounded zero labels unsigned in an ordinary flat portfolio chart', () => {
    const { container } = render(
      <InvestmentPortfolioChart
        points={points.map((point) => ({ ...point, value: 0 }))}
        country="CZ"
        currency="CZK"
        amountsHidden={false}
        compact
      />,
    )
    const amounts = [...container.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick text')]
    expect(amounts.length).toBeGreaterThan(0)
    expect(amounts.every((label) => label.textContent === '0')).toBe(true)
  })
})
