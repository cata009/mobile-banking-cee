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
    currencyColor: isDisabled ? 'var(--uc-neutral-650)' : 'var(--uc-text)',
    currencyTitleColor: isDisabled ? 'var(--uc-neutral-650)' : 'var(--uc-text-muted)',
    gap: 24,
    currencyMinimumWidth: 64,
    iconSlot: 32,
  } as const
}
