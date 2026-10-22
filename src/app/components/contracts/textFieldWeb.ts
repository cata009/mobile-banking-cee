import { resolveTextField, type TextFieldOptions } from './textField'
export function textFieldWeb(options: TextFieldOptions) {
  const state = resolveTextField(options)
  const { shouldFloatLabel, isDisabled } = state
  const placeholderColorClass =
    isDisabled || (state.isActive && !state.hasValue)
      ? 'placeholder:text-[var(--uc-text-muted)]'
      : shouldFloatLabel
        ? 'placeholder:text-[var(--uc-text-subtle)]'
        : 'placeholder:text-[var(--uc-text)]'

  return { ...state, placeholderColorClass }
}
