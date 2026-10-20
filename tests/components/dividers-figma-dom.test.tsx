// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Divider from '@/app/components/SectionHeadingDivider'
import TransactionDivider from '@/app/components/accounts/AccountTransactionMonthDivider'
import { dividerFigmaCases } from '../fixtures/dividersFigma'

afterEach(cleanup)
describe('Dividers match all 13 original source variants', () => {
  it.each(dividerFigmaCases)('$variant has source typography and the correct reading role', (sample) => {
    const { container } = render(<Divider {...sample} />)
    const title = container.querySelector('[data-divider-title]') as HTMLElement
    expect(title).toBeTruthy()
    expect(title.style.lineHeight).toBe(`${sample.lineHeight}px`)
    expect(title.style.fontSize).toBe(`${sample.fontSize}px`)
    expect(screen.queryAllByRole('heading')).toHaveLength(sample.heading ? 1 : 0)
    const geometry = container.querySelector('[data-divider-geometry]') as HTMLElement
    expect(geometry.style.width).toBe(`${sample.width}px`)
    const rules = container.querySelectorAll('[data-divider-rule]')
    expect(rules).toHaveLength(sample.ruleY === null ? 0 : 1)
    if (rules[0]) expect(rules[0]).toHaveAttribute('aria-hidden', 'true')
  })

  it('runs primary and secondary actions once, and never presents dates as headings', () => {
    const action = vi.fn()
    const { rerender } = render(
      <Divider variant="action-date" title="SELECT ALL" secondaryText="1–31 OCT" onAction={action} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'SELECT ALL' }))
    expect(action).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    rerender(<Divider variant="name-action" title="PAYMENT DETAILS 2" secondaryText="REMOVE" onAction={action} />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('PAYMENT DETAILS 2')
    fireEvent.click(screen.getByRole('button', { name: 'REMOVE' }))
    expect(action).toHaveBeenCalledTimes(2)
    rerender(<Divider variant="action-date" title="SELECT ALL" onAction={action} disabled />)
    fireEvent.click(screen.getByRole('button', { name: 'SELECT ALL' }))
    expect(action).toHaveBeenCalledTimes(2)
  })

  it('provides one named, controlled checkbox including label activation', () => {
    const change = vi.fn()
    const { rerender } = render(
      <Divider variant="action-date-checkbox" title="SELECT ALL" checked={false} onCheckedChange={change} />,
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'SELECT ALL' }))
    expect(change).toHaveBeenCalledExactlyOnceWith(true)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    rerender(<Divider variant="action-date-checkbox" title="SELECT ALL" checked onCheckedChange={change} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
    fireEvent.click(screen.getByText('SELECT ALL'))
    expect(change).toHaveBeenLastCalledWith(false)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('keeps date separators readable without a heading or a decorative rule', () => {
    render(<TransactionDivider title="TODAY" dateSeparator currency="RON" />)
    expect(screen.getByText('TODAY')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByText('TODAY')).toHaveStyle({ lineHeight: '15px' })
  })
  it('does not expose controls without an implementation as enabled actions', () => {
    const { rerender } = render(<Divider variant="action-date" title="SELECT ALL" />)
    expect(screen.getByRole('button')).toBeDisabled()
    rerender(<Divider variant="action-date-checkbox" title="SELECT ALL" />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })
  it('keeps the quarter-pixel Light rule in its original 1px SVG viewport so browser images rasterize it', () => {
    const { container } = render(<Divider variant="light-date" title="15 JULY 2022" />)
    const image = container.querySelector('[data-divider-rule] img') as HTMLImageElement
    expect(image.style.height).toBe('1px')
    expect(decodeURIComponent(image.src)).toContain('viewBox="0 0 343 1"')
    expect(decodeURIComponent(image.src)).toContain('stroke-width="0.25"')
  })
})
