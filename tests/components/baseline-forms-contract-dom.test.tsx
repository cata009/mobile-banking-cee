// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import TextField from '@/app/components/TextField'
import AmountField from '@/app/components/AmountField'
import AccountSearchBar from '@/app/components/accounts/AccountSearchBar'
import { AmountSuggestionChip } from '@/app/components/AmountSuggestionChip'
import FrozenTextField from '../fixtures/baseline-forms-before/TextField'
import FrozenAmountField from '../fixtures/baseline-forms-before/AmountField'
import FrozenSearch from '../fixtures/baseline-forms-before/AccountSearchBar'
import { AmountSuggestionChip as FrozenChip } from '../fixtures/baseline-forms-before/AmountSuggestionChip'
vi.mock('@/app/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (_key: string, fallback: string) => fallback }),
}))
afterEach(cleanup)
const normalized = (s: string) => s.replace(/:[a-zA-Z]*[a-zA-Z0-9]+:/g, ':generated:').replace(/\s+/g, ' ')

// Keep frozen structure/labels exact while making the approved paint delta explicit.
function approvedDisabledPaint(container: HTMLElement) {
  for (const element of container.querySelectorAll<HTMLElement>('[style]')) {
    if (element.style.color === 'var(--uc-neutral-650)') element.style.color = 'var(--uc-text-muted)'
    if (element.style.borderBottomColor === 'var(--uc-neutral-650)')
      element.style.borderBottomColor = 'var(--uc-text-subtle)'
  }
  for (const svg of container.querySelectorAll<SVGElement>('svg')) {
    if (svg.style.color === 'var(--uc-neutral-650)') svg.style.color = 'var(--uc-text-subtle)'
    if (svg.getAttribute('color') === 'var(--uc-neutral-650)') svg.setAttribute('color', 'var(--uc-text-subtle)')
  }
  for (const input of container.querySelectorAll('input:disabled'))
    input.className = input.className.replace(
      /placeholder:text-\[var\(--uc-(neutral-650|text-subtle)\)\]/g,
      'placeholder:text-[var(--uc-text-muted)]',
    )
}
describe('frozen baseline form DOM and owner behavior', () => {
  it.each([
    'empty',
    'on-focus',
    'filled',
    'error-filled',
    'error-empty',
    'disabled-empty',
    'disabled-filled',
    'multiple-filled',
  ] as const)('keeps TextField %s', (visualState) => {
    const props = {
      label: 'Amount',
      value: '123',
      onChange: vi.fn(),
      visualState,
      helperText: 'First helper',
      helperText2: 'Second helper',
      errorText: 'Invalid',
      errorText2: 'Try again',
      trailingIconName: 'chevron-down' as const,
      multipleValues: ['A', 'B'],
      suffix: 'RON',
      suffixOutsideDivider: true,
    }
    const { container, rerender } = render(<FrozenTextField {...props} />)
    if (visualState.startsWith('disabled')) approvedDisabledPaint(container)
    if (['on-focus', 'error-filled', 'error-empty'].includes(visualState)) {
      const boundary = container.querySelector<HTMLElement>('[style*="border-bottom-width"]')!
      boundary.style.borderBottomWidth = '1px'
    }
    const before = normalized(container.innerHTML)
    rerender(<TextField {...props} />)
    expect(normalized(container.innerHTML)).toBe(before)
  })
  it('preserves floating trailing action bubbling and controlled input events', () => {
    const onChange = vi.fn(),
      onActivate = vi.fn(),
      onFocus = vi.fn(),
      onBlur = vi.fn(),
      trailing = vi.fn()
    render(
      <TextField
        label="Name"
        value="A"
        onChange={onChange}
        onActivate={onActivate}
        onFocus={onFocus}
        onBlur={onBlur}
        trailingIconName="chevron-down"
        trailingIconPlacement="floating"
        trailingIconAction={{ ariaLabel: 'Choose', onClick: trailing }}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Choose' }))
    expect(trailing).toHaveBeenCalledTimes(1)
    expect(onActivate).not.toHaveBeenCalled()
    const input = screen.getByRole('textbox', { name: 'Name' })
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'B' } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledExactlyOnceWith('B')
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onBlur).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onActivate).toHaveBeenCalledTimes(1)
  })
  it.each([false, true])('keeps AmountField fixed currency selector hidden=%s', (hideCurrencySelector) => {
    const props = {
      label: 'Amount',
      value: '20',
      onChange: vi.fn(),
      currency: 'RON',
      hideCurrencySelector,
      disabled: true,
      visualState: 'filled' as const,
    }
    const { container, rerender } = render(<FrozenAmountField {...props} />)
    approvedDisabledPaint(container)
    const currency = screen.getByRole('button', { name: 'Currency: RON' })
    const column = currency.querySelector<HTMLElement>('.min-w-\\[64px\\]')!
    column.className = column.className.replace('min-w-[64px]', 'min-w-[66px]')
    const value = currency.querySelector<HTMLElement>('.uc-type-p1')!
    value.className = value.className.replace(' mt-[4px]', '')
    value.style.marginTop = '0px'
    const before = normalized(container.innerHTML)
    rerender(<AmountField {...props} />)
    expect(normalized(container.innerHTML)).toBe(before)
  })
  it.each(['inline', 'floating'] as const)(
    'blocks every disabled TextField activation with %s action',
    (trailingIconPlacement) => {
      const activate = vi.fn(),
        choose = vi.fn(),
        change = vi.fn()
      const { container } = render(
        <TextField
          label="Beneficiary"
          value="Ana"
          onChange={change}
          visualState="disabled-filled"
          onActivate={activate}
          trailingIconName="chevron-down"
          trailingIconPlacement={trailingIconPlacement}
          trailingIconAction={{ ariaLabel: 'Choose', onClick: choose }}
        />,
      )
      const input = screen.getByRole('textbox', { name: 'Beneficiary' })
      expect(input).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Choose' })).toBeDisabled()
      fireEvent.click(container.querySelector('[data-component="TextField"]')!)
      fireEvent.click(screen.getByRole('button', { name: 'Choose' }))
      fireEvent.keyDown(input, { key: 'Enter' })
      fireEvent.change(input, { target: { value: 'Changed' } })
      expect(activate).not.toHaveBeenCalled()
      expect(choose).not.toHaveBeenCalled()
      expect(change).not.toHaveBeenCalled()
    },
  )
  it.each(['compact', 'comfortable'] as const)('keeps SearchBar %s variants', (fieldSize) => {
    for (const fieldSurface of ['muted', 'raised'] as const)
      for (const fieldPadding of ['none', '8'] as const)
        for (const filtersActive of [false, true]) {
          const props = { fieldSize, fieldSurface, fieldPadding, filtersActive, value: '', placeholder: 'Search' }
          const { container, rerender, unmount } = render(<FrozenSearch {...props} />)
          const before = normalized(container.innerHTML)
          rerender(<AccountSearchBar {...props} />)
          expect(normalized(container.innerHTML)).toBe(before)
          unmount()
        }
  })
  it('keeps controlled clear/reset semantics and focuses without owning parent query', () => {
    const onValueChange = vi.fn(),
      onClearClick = vi.fn(),
      onFilterClick = vi.fn()
    render(
      <AccountSearchBar
        value="query"
        onValueChange={onValueChange}
        onClearClick={onClearClick}
        onFilterClick={onFilterClick}
        showTrailingAction={false}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Clear search results' }))
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('')
    expect(onClearClick).toHaveBeenCalledTimes(1)
    expect(onFilterClick).not.toHaveBeenCalled()
    expect(screen.getByRole('searchbox')).toHaveValue('query')
    expect(screen.getByRole('searchbox')).toHaveFocus()
  })
  it.each([true, false])('keeps suggestion-chip class merging and selected=%s', (selected) => {
    const props = { selected, onSelect: vi.fn(), className: '!h-[40px]', children: '100 RON' }
    const { container, rerender } = render(<FrozenChip {...props} />)
    const before = container.innerHTML
    rerender(<AmountSuggestionChip {...props} />)
    expect(container.innerHTML).toBe(before)
  })
})
