// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Section from '@/app/components/SectionHeadingDivider'
import Month from '@/app/components/accounts/AccountTransactionMonthDivider'
import Row, { type NavigationRowProps } from '@/app/components/NavigationRow'
import Link from '@/app/components/ui/NavigationLink'
import CardRow from '@/app/components/cards/CardNavigationRow'
import FrozenSection from '../fixtures/baseline-rows-before/SectionHeadingDivider'
import FrozenMonth from '../fixtures/baseline-rows-before/AccountTransactionMonthDivider'
import FrozenRow from '../fixtures/baseline-rows-before/NavigationRow'
import FrozenLink from '../fixtures/baseline-rows-before/NavigationLink'
import FrozenCardRow from '../fixtures/baseline-rows-before/CardNavigationRow'
import type { SectionHeadingDividerVariant } from '@/app/components/contracts/sectionDivider'
vi.mock('@/app/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (_key: string, fallback: string) => fallback }),
}))
afterEach(cleanup)
function normalized(html: string) {
  const ids = new Map<string, number>()
  return html
    .replace(/:[\w]+:/g, (id) => {
      if (!ids.has(id)) ids.set(id, ids.size)
      return `:id${ids.get(id)}:`
    })
    .replace(/-r[\w]+-/g, '-generated-')
    .replace(/\s+/g, ' ')
}
const variants: SectionHeadingDividerVariant[] = [
  'section',
  'small-title-data',
  'small-two-line-title-data',
  'medium-title',
  'with-counter',
  'medium-two-line-title',
  'large-title',
  'large-two-line-title',
  'action-date',
  'name-action',
  'action-date-checkbox',
  'light-title',
  'light-date',
  'light-small-title-data',
]
describe('baseline Web frozen preservation', () => {
  it.each(variants)('preserves divider %s and zero/missing/end counters', (variant) => {
    for (const options of [{}, { count: 0 }, { count: 3, countAlign: 'end' as const }]) {
      const props = {
        title: 'MONTHLY ACTIVITY',
        secondaryText: 'Second line',
        className: 'test-class',
        variant,
        ...options,
      }
      const { container, rerender, unmount } = render(<FrozenSection {...props} />)
      const before = normalized(container.innerHTML)
      rerender(<Section {...props} />)
      expect(normalized(container.innerHTML)).toBe(before)
      unmount()
    }
  })
  it.each([false, true])('preserves transaction separator date=%s', (dateSeparator) => {
    for (const total of [undefined, '', '0.00', '−1,200.00']) {
      const props = { title: 'OCTOBER 2026', currency: 'RON', total, dateSeparator }
      const { container, rerender, unmount } = render(<FrozenMonth {...props} />)
      const before = normalized(container.innerHTML)
      rerender(<Month {...props} />)
      expect(normalized(container.innerHTML)).toBe(before)
      unmount()
    }
  })
  const rowCases: Partial<NavigationRowProps>[] = [
    {},
    { onClick: vi.fn() },
    { onClick: vi.fn(), trailingAccessory: 'chevron', leadingIconName: 'chevron-link' },
    { rowHeight: 64, description: 'Description', titleTone: 'action' },
    { rowHeight: 64, centerContent: true, leadingVisual: <span>Artwork</span> },
    { linkLabel: 'Details' },
    { onClick: vi.fn(), linkLabel: 'Details', onLinkClick: vi.fn() },
    { onClick: vi.fn(), trailingAccessory: 'toggle', toggleChecked: true, onToggle: vi.fn() },
    {
      onClick: vi.fn(),
      trailing: <span>Custom</span>,
      titleClassName: 'text-[18px]',
      titleStyle: { letterSpacing: 1 },
      descriptionClassName: 'text-[14px]',
    },
  ]
  it.each(rowCases)('preserves row DOM %#', (options) => {
    const props = { title: 'Settings', ariaLabel: 'Row', className: 'test-class', ...options }
    const { container, rerender } = render(<FrozenRow {...props} />)
    const before = normalized(container.innerHTML)
    rerender(<Row {...props} />)
    expect(normalized(container.innerHTML)).toBe(before)
  })
  it('keeps div row onClick inert while nested link/toggle callbacks run once', () => {
    const rowClick = vi.fn(),
      linkClick = vi.fn(),
      onToggle = vi.fn()
    const { container, rerender } = render(
      <Row title="Settings" onClick={rowClick} linkLabel="Details" onLinkClick={linkClick} />,
    )
    expect(container.firstElementChild?.tagName).toBe('DIV')
    fireEvent.click(screen.getByRole('button', { name: 'Details' }))
    expect(linkClick).toHaveBeenCalledTimes(1)
    expect(rowClick).not.toHaveBeenCalled()
    rerender(<Row title="Settings" onClick={rowClick} trailingAccessory="toggle" toggleChecked onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('switch', { name: 'Settings' }))
    expect(onToggle).toHaveBeenCalledExactlyOnceWith(false)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    expect(rowClick).not.toHaveBeenCalled()
  })
  it('retains inline-link and card-row inert button semantics and original SVG', () => {
    const { container, rerender } = render(<FrozenLink text="Details" />)
    const before = normalized(container.innerHTML)
    rerender(<Link text="Details" />)
    expect(normalized(container.innerHTML)).toBe(before)
    rerender(<FrozenCardRow />)
    const cardBefore = normalized(container.innerHTML)
    rerender(<CardRow />)
    expect(normalized(container.innerHTML)).toBe(cardBefore)
    expect(screen.getByRole('button')).not.toBeDisabled()
    expect(container.querySelector('svg')).toBeTruthy()
  })
  it('binds the real legacy renderers to the extracted contracts', () => {
    for (const [file, contract] of [
      ['SectionHeadingDivider.tsx', 'sectionDivider'],
      ['accounts/AccountTransactionMonthDivider.tsx', 'transactionDivider'],
      ['NavigationRow.tsx', 'navigationRow'],
      ['ui/NavigationLink.tsx', 'navigationLink'],
      ['cards/CardNavigationRow.tsx', 'cardNavigationRow'],
    ])
      expect(readFileSync(`src/app/components/${file}`, 'utf8')).toContain(`contracts/${contract}`)
  })
})
