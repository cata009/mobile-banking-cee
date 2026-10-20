import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('baseline forms platform-independent contracts', () => {
  it('keeps the new empty-focus placeholder readable like the Figma variant', async () => {
    const { resolveTextField } = await import('@/app/components/contracts/textField')
    expect(resolveTextField({ label: 'Name', value: '', isFocused: true }).placeholderColor).toBe(
      'var(--uc-text-muted)',
    )
  })
  it('provides the canonical text-field state resolver before platform rendering', async () => {
    expect(existsSync('src/app/components/contracts/textField.ts')).toBe(true)
    const { resolveTextField } = await import('@/app/components/contracts/textField')
    expect(resolveTextField({ label: 'Name', value: '', disabled: true, visualState: 'filled' })).toMatchObject({
      isDisabled: false,
      hasValue: true,
      shouldFloatLabel: true,
    })
    expect(resolveTextField({ label: 'Name', value: 'A', errorText: 'Invalid', isFocused: true })).toMatchObject({
      derivedState: 'error-filled',
      isActive: false,
      dividerColor: 'var(--uc-status-red)',
    })
    expect(
      resolveTextField({ label: 'Name', value: '', visualState: 'multiple-filled', multipleValues: ['A', 'B'] }),
    ).toMatchObject({ displayedMultipleValues: 'A; B', effectiveMultipleCount: 2, shouldFloatLabel: true })
  })
  it('preserves amount currency disabled precedence separately from text state', async () => {
    expect(existsSync('src/app/components/contracts/amountField.ts')).toBe(true)
    const { resolveAmountField } = await import('@/app/components/contracts/amountField')
    expect(resolveAmountField({ disabled: true, visualState: 'filled' })).toMatchObject({
      isDisabled: true,
      currencyColor: 'var(--uc-text-muted)',
      currencyTitleColor: 'var(--uc-text-muted)',
      currencyIconColor: 'var(--uc-text-subtle)',
    })
  })
  it.each(['disabled-empty', 'disabled-filled'] as const)(
    'uses the approved Figma disabled palette for %s',
    async (visualState) => {
      const { resolveTextField } = await import('@/app/components/contracts/textField')
      expect(
        resolveTextField({ label: 'Name', value: visualState === 'disabled-filled' ? 'Ana' : '', visualState }),
      ).toMatchObject({
        isDisabled: true,
        labelColor: 'var(--uc-text-muted)',
        valueColor: 'var(--uc-text-muted)',
        helperColor: 'var(--uc-text-muted)',
        placeholderColor: 'var(--uc-text-muted)',
        dividerColor: 'var(--uc-text-subtle)',
        iconColor: 'var(--uc-text-subtle)',
        dividerWidth: 0.5,
      })
    },
  )
  it('keeps query-clear priority and remove-filter geometry without controller policy', async () => {
    expect(existsSync('src/app/components/contracts/searchBar.ts')).toBe(true)
    const { resolveSearchBar } = await import('@/app/components/contracts/searchBar')
    expect(resolveSearchBar({ searchValue: 'abc', filtersActive: true, showTrailingAction: false })).toMatchObject({
      hasSearchValue: true,
      showRemoveFilters: false,
      trailingVisible: true,
      trailingAction: 'clear',
    })
    expect(
      resolveSearchBar({ searchValue: '', filtersActive: true, fieldPadding: '8', fieldSize: 'comfortable' }),
    ).toMatchObject({ showRemoveFilters: true, paddedField: false, innerHeight: 36, iconSlot: 32, minimumHeight: 63 })
  })
})
