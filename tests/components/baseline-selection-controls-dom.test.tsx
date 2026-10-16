// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import Mailbox from '@/app/components/messages/MessagesMailboxTabs'
import Portfolio from '@/app/components/investments/InvestmentPortfolioTabs'
import Carousel from '@/app/components/accounts/AccountCarouselIndicator'
import Analytics from '@/app/screens/analytics/AnalyticsPeriodIndicator'
import Code from '@/app/components/CodeField'
import { Checkbox } from '@/app/components/ui/checkbox'
import FrozenMailbox from '../fixtures/baseline-selection-controls-before/MessagesMailboxTabs'
import FrozenPortfolio from '../fixtures/baseline-selection-controls-before/InvestmentPortfolioTabs'
import FrozenCarousel from '../fixtures/baseline-selection-controls-before/AccountCarouselIndicator'
import FrozenAnalytics from '../fixtures/baseline-selection-controls-before/AnalyticsPeriodIndicator'
import FrozenCode from '../fixtures/baseline-selection-controls-before/CodeField'
import { Checkbox as FrozenCheckbox } from '../fixtures/baseline-selection-controls-before/checkbox'
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn() })
})
afterEach(cleanup)
const normalize = (html: string) => html.replace(/:[a-zA-Z]*[a-zA-Z0-9]+:/g, ':generated:').replace(/\s+/g, ' ')
const tabs = [
  { id: 'inbox', label: 'Inbox', hasNewItems: true },
  { id: 'sent', label: 'Sent' },
]
describe('frozen selection control DOM and controllers', () => {
  it('routes overlapping pointer hit areas to the intended ink center while retaining keyboard index', () => {
    const onSelect = vi.fn()
    render(<Carousel count={3} activeIndex={0} onSelect={onSelect} />)
    const buttons = screen.getAllByRole('button')
    const bounds = [
      { left: 0, width: 30 },
      { left: 36, width: 6 },
      { left: 48, width: 6 },
    ]
    buttons.forEach((button, index) => {
      const box = bounds[index]!
      vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
        x: box.left,
        y: 0,
        left: box.left,
        right: box.left + box.width,
        top: 0,
        bottom: 6,
        width: box.width,
        height: 6,
        toJSON: () => ({}),
      })
    })
    fireEvent.click(buttons[2]!, { detail: 1, clientX: 39 })
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(1)
    onSelect.mockClear()
    fireEvent.click(buttons[2]!, { detail: 0 })
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(2)
  })
  it('keeps Radix uncontrolled default state, disabled activation and form reset semantics', () => {
    const onCheckedChange = vi.fn()
    const { rerender } = render(
      <form aria-label="Consent form">
        <Checkbox defaultChecked onCheckedChange={onCheckedChange} aria-label="Consent" />
      </form>,
    )
    const checkbox = screen.getByRole('checkbox', { name: 'Consent' })
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(checkbox)
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
    fireEvent.reset(screen.getByRole('form'))
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
    rerender(
      <form aria-label="Consent form">
        <Checkbox defaultChecked disabled onCheckedChange={onCheckedChange} aria-label="Consent" />
      </form>,
    )
    onCheckedChange.mockClear()
    fireEvent.click(checkbox)
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
  it.each(['equal', 'scrollable'] as const)('preserves mailbox %s layout and controlled tab activation', (layout) => {
    const onChange = vi.fn(),
      props = { tabs, activeTabId: 'inbox', onChange, layout, minTabWidth: 150, className: 'bg-[var(--uc-surface)]' }
    const { container, rerender } = render(<FrozenMailbox {...props} />)
    const before = normalize(container.innerHTML)
    rerender(<Mailbox {...props} />)
    expect(normalize(container.innerHTML)).toBe(before)
    fireEvent.click(screen.getByRole('tab', { name: 'Sent' }))
    expect(onChange).toHaveBeenCalledExactlyOnceWith('sent')
    expect(screen.getByRole('tab', { name: 'Inbox' })).toHaveAttribute('aria-selected', 'true')
  })
  it.each(['underline', 'chips'] as const)('preserves portfolio %s alias/composition', (variant) => {
    const props = {
      tabs: [
        { id: 'performance' as const, label: 'Portfolio' },
        { id: 'product-type' as const, label: 'Funds' },
      ],
      selectedTabId: 'performance' as const,
      onChange: vi.fn(),
      variant,
    }
    const { container, rerender } = render(<FrozenPortfolio {...props} />)
    const before = normalize(container.innerHTML)
    rerender(<Portfolio {...props} />)
    expect(normalize(container.innerHTML)).toBe(before)
  })
  it.each([0, 1, 3, 10])('preserves account dots count=%s including no-callback buttons', (count) => {
    const props = { count, activeIndex: 5, windowSize: 4, tone: 'inverse' as const, withBackdropBlur: false }
    const { container, rerender } = render(<FrozenCarousel {...props} />)
    const before = container.innerHTML
    rerender(<Carousel {...props} />)
    expect(container.innerHTML).toBe(before)
  })
  it('keeps analytics dots aria-hidden, gap10 and without buttons', () => {
    const props = { activePeriodKey: 'B', periodKeys: ['A', 'B', 'C'] }
    const { container, rerender } = render(<FrozenAnalytics {...props} />)
    const before = container.innerHTML
    rerender(<Analytics {...props} />)
    expect(container.innerHTML).toBe(before)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
  it.each(['empty', 'filled', 'error', 'disabled'] as const)('preserves CodeField %s DOM', (visualState) => {
    const props = {
      value: '12x34',
      onChange: vi.fn(),
      visualState,
      errorText: visualState === 'error' ? 'Invalid code' : undefined,
      errorText2: visualState === 'error' ? 'Try again' : undefined,
      length: 4,
    }
    const { container, rerender } = render(<FrozenCode {...props} />)
    const before = normalize(container.innerHTML)
    rerender(<Code {...props} />)
    expect(normalize(container.innerHTML)).toBe(before)
  })
  it('keeps code paste/focus and empty-slot backspace owner payload', () => {
    const onChange = vi.fn(),
      { rerender } = render(<Code value="" onChange={onChange} />)
    const inputs = screen.getAllByRole('textbox')
    fireEvent.paste(inputs[0]!, { clipboardData: { getData: () => '12A34' } })
    expect(onChange).toHaveBeenCalledExactlyOnceWith('1234')
    expect(inputs[3]).toHaveFocus()
    rerender(<Code value="1" onChange={onChange} />)
    onChange.mockClear()
    fireEvent.keyDown(inputs[1]!, { key: 'Backspace' })
    expect(onChange).toHaveBeenCalledExactlyOnceWith('')
    expect(inputs[0]).toHaveFocus()
  })
  it.each([false, true, 'indeterminate'] as const)('keeps Radix checked=%s and controlled semantics', (checked) => {
    const onCheckedChange = vi.fn(),
      props = { checked, onCheckedChange, 'aria-label': 'Consent' }
    const { container, rerender } = render(<FrozenCheckbox {...props} />)
    const before = normalize(container.innerHTML)
    rerender(<Checkbox {...props} />)
    expect(normalize(container.innerHTML)).toBe(before)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(checked === 'indeterminate' ? true : !checked)
  })
})
