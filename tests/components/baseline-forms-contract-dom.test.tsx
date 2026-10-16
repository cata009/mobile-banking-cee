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
    const before = normalized(container.innerHTML)
    rerender(<AmountField {...props} />)
    expect(normalized(container.innerHTML)).toBe(before)
  })
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
