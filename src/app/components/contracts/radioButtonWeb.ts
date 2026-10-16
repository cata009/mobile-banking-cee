import { resolveRadioButton, type RadioButtonOptions } from './radioButton'

const foregrounds = {
  '--uc-primary-k1': 'text-[var(--uc-primary-k1)]',
  '--uc-text': 'text-[var(--uc-text)]',
} as const
const typography = { 14: 'text-[14px] font-bold leading-[18px]', 16: 'uc-type-n4-strong' } as const
const gutters = { 16: 'px-[16px]', 24: 'px-[24px]' } as const

/** The date preset intentionally preserves its original DOM and absent hover classes. */
export function radioButtonWeb(options: RadioButtonOptions, className = '') {
  const state = resolveRadioButton(options)
  const dateFilter = state.variant === 'date-filter'
  return {
    ...state,
    explicitLabel: !dateFilter,
    markTag: dateFilter ? 'span' : 'div',
    markHidden: dateFilter ? true : undefined,
    buttonClass: dateFilter
      ? `flex h-[80px] w-full items-center gap-[8px] bg-[var(--uc-surface)] ${gutters[state.paddingHorizontal]} text-left${className ? ` ${className}` : ''}`
      : `w-full flex items-center gap-[8px] ${gutters[state.paddingHorizontal]} py-[20px] text-left cursor-pointer transition-opacity hover:opacity-80 ${className}`,
    markClass: dateFilter
      ? 'grid size-[32px] shrink-0 place-items-center'
      : 'grid h-[32px] w-[32px] flex-shrink-0 place-items-center',
    labelClass: `${typography[state.fontSize]} ${foregrounds[state.labelToken]}`,
  } as const
}
