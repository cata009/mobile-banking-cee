import { resolvePrimaryButton, type PrimaryButtonOptions } from './primaryButton'

// Explicit platform bindings: new contract tokens or sizes require a Web mapping.
const backgrounds = {
  '--uc-action': 'bg-[var(--uc-action)]',
  '--uc-action-strong': 'bg-[var(--uc-action-strong)]',
  '--uc-surface': 'bg-[var(--uc-surface)]',
} as const
const foregrounds = {
  '--uc-static-white': 'text-[var(--uc-static-white)]',
  '--uc-text': 'text-[var(--uc-text)]',
} as const
const heights = { 48: 'h-[48px]' } as const
const radii = { 4: 'rounded' } as const
const typography = { 16: 'uc-type-n4-strong', 18: 'uc-type-h2' } as const

/** Legacy DOM and utility classes are deliberately preserved, including overrides. */
export function primaryButtonWeb(options: PrimaryButtonOptions, className = '') {
  const state = resolvePrimaryButton(options)
  const background = backgrounds[state.backgroundToken]
  const foreground = foregrounds[state.textToken]
  if (state.variant === 'language-save') {
    return {
      type: undefined,
      disabled: state.disabled || undefined,
      buttonClass: `w-full ${heights[state.height]} ${background} rounded-[4px] flex items-center justify-center ${state.disabled ? 'cursor-not-allowed transition-opacity opacity-30' : 'cursor-pointer transition-opacity hover:opacity-90'}${className ? ` ${className}` : ''}`,
      labelClass: `${typography[state.fontSize]} ${foreground}`,
    } as const
  }
  const action = state.variant === 'action'
  return {
    type: 'button',
    disabled: state.disabled,
    buttonClass: `
        flex ${heights[state.height]} w-full px-0 py-3
        justify-center items-center gap-4
        ${radii[state.radius]}
        ${background} ${foreground}${state.disabled ? ' opacity-30' : ''}
        ${typography[state.fontSize]}
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]
        ${state.disabled ? 'cursor-not-allowed' : `opacity-100 cursor-pointer ${action ? 'hover:bg-[var(--uc-action-hover)]' : 'hover:opacity-90'} active:scale-[0.98]`}
        ${className}
      `,
    labelClass: 'block max-w-full truncate',
  } as const
}
