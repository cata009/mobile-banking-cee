import type { TextFieldVisualState } from './textField'
export function resolveAmountField({
  disabled = false,
  visualState,
  currency = 'RSD',
  currencyLabel = 'Currency',
  hideCurrencySelector = false,
}: {
  disabled?: boolean
  visualState?: TextFieldVisualState
  currency?: string
  currencyLabel?: string
  hideCurrencySelector?: boolean
} = {}) {
  const isDisabled = disabled || visualState === 'disabled-empty' || visualState === 'disabled-filled'
  return {
    isDisabled,
    currency,
    currencyLabel,
    hideCurrencySelector,
    currencyColor: isDisabled ? 'var(--uc-text-muted)' : 'var(--uc-text)',
    currencyTitleColor: 'var(--uc-text-muted)',
    currencyIconColor: isDisabled ? 'var(--uc-text-subtle)' : 'var(--uc-text)',
    currencyLabelGap: 0,
    trailingInset: 9,
    gap: 24,
    currencyMinimumWidth: 66,
    iconSlot: 32,
  } as const
}
