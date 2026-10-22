export type TextFieldVisualState =
  | 'empty'
  | 'on-focus'
  | 'filled'
  | 'error-filled'
  | 'error-empty'
  | 'disabled-empty'
  | 'disabled-filled'
  | 'multiple-filled'

export interface TextFieldOptions {
  label: string
  value: string
  helperText?: string
  helperText2?: string
  errorText?: string
  errorText2?: string
  placeholder?: string
  disabled?: boolean
  visualState?: TextFieldVisualState
  trailingIconName?: string
  trailingIconPlacement?: 'inline' | 'floating'
  multipleValues?: string[]
  multipleCount?: number
  forceFloatLabel?: boolean
  isFocused?: boolean
}
// Approved Meniga disabled palette: readable text; quieter external action/boundary.
const DISABLED_COLOR = 'var(--uc-text-muted)'
export function resolveTextField({
  label,
  value,
  helperText,
  helperText2,
  errorText,
  errorText2,
  placeholder = '',
  disabled = false,
  visualState,
  trailingIconName,
  trailingIconPlacement = 'inline',
  multipleValues,
  multipleCount,
  forceFloatLabel = false,
  isFocused = false,
}: TextFieldOptions) {
  const derivedState: TextFieldVisualState = (() => {
    if (visualState) return visualState
    if (disabled) return value.trim().length > 0 ? 'disabled-filled' : 'disabled-empty'
    if (errorText || errorText2) return value.trim().length > 0 ? 'error-filled' : 'error-empty'
    if (isFocused) return 'on-focus'
    return value.trim().length > 0 ? 'filled' : 'empty'
  })()
  const isDisabled = derivedState === 'disabled-empty' || derivedState === 'disabled-filled'
  const isError = derivedState === 'error-filled' || derivedState === 'error-empty'
  const isActive = derivedState === 'on-focus'
  const isMultiple = derivedState === 'multiple-filled'
  const hasValue =
    derivedState === 'filled' ||
    derivedState === 'error-filled' ||
    derivedState === 'disabled-filled' ||
    isMultiple ||
    value.trim().length > 0
  const shouldFloatLabel = forceFloatLabel || isActive || hasValue

  const labelColor = isDisabled ? DISABLED_COLOR : isActive ? 'var(--uc-action)' : 'var(--uc-text-muted)'

  const valueColor = isDisabled ? DISABLED_COLOR : 'var(--uc-text)'
  const dividerColor = isDisabled
    ? 'var(--uc-text-subtle)'
    : isError
      ? 'var(--uc-status-red)'
      : isActive
        ? 'var(--uc-action)'
        : 'var(--uc-text-subtle)'
  const helperColor = isDisabled ? DISABLED_COLOR : isError ? 'var(--uc-status-red)' : 'var(--uc-text-muted)'

  const descriptionText1 = isError ? errorText : helperText
  const descriptionText2 = isError ? errorText2 : helperText2
  const hasFloatingTrailingIcon = trailingIconPlacement === 'floating' && Boolean(trailingIconName)
  const helperTextWidth = trailingIconName && trailingIconPlacement === 'inline' ? 'calc(100% - 44px)' : '100%'
  const displayedMultipleValues = multipleValues?.join('; ') ?? value
  const effectiveMultipleCount = multipleCount ?? multipleValues?.length ?? 0
  const inputPlaceholder = shouldFloatLabel ? placeholder : label

  return {
    derivedState,
    isDisabled,
    isError,
    isActive,
    isMultiple,
    hasValue,
    shouldFloatLabel,
    labelColor,
    valueColor,
    dividerColor,
    helperColor,
    iconColor: isDisabled ? 'var(--uc-text-subtle)' : 'var(--uc-text)',
    placeholderColor:
      isDisabled || (isActive && !hasValue)
        ? DISABLED_COLOR
        : shouldFloatLabel
          ? 'var(--uc-text-subtle)'
          : 'var(--uc-text)',
    descriptionText1,
    descriptionText2,
    hasFloatingTrailingIcon,
    helperTextWidth,
    displayedMultipleValues,
    effectiveMultipleCount,
    inputPlaceholder,
    dividerWidth: isActive || isError ? 1 : 0.5,
    iconSlot: 32,
    iconGap: 12,
    labelGap: 4,
    helperGap: 6,
    helperLineGap: 3,
    valueFontSize: 18,
    helperFontSize: 14,
    labelFontSize: 14,
    labelLineHeight: 15,
    helperLineHeight: 15,
    valueLineHeight: 20,
  } as const
}
