import { resolveTextField, type TextFieldOptions } from './textField'
export function textFieldWeb(options: TextFieldOptions) {
  const state = resolveTextField(options)
  const { shouldFloatLabel, isDisabled } = state
  const placeholderColorClass = shouldFloatLabel
    ? 'placeholder:text-[var(--uc-text-subtle)]'
    : isDisabled
      ? 'placeholder:text-[var(--uc-neutral-650)]'
      : 'placeholder:text-[var(--uc-text)]'

  return { ...state, placeholderColorClass }
}
