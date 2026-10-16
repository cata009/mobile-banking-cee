import { resolveSectionDivider, type SectionDividerOptions } from './sectionDivider'

/** Literal compatibility classes retained for Tailwind discovery and DOM parity. */
export function sectionDividerWeb(options: SectionDividerOptions) {
  const state = resolveSectionDivider(options)
  return {
    ...state,
    titleTone:
      state.titleToken === '--uc-action'
        ? 'text-[var(--uc-action)]'
        : state.titleToken === '--uc-text-muted'
          ? 'text-[var(--uc-text-muted)]'
          : 'text-[var(--uc-text)]',
    rowHeight: state.height === 20 ? 'h-[20px]' : 'h-[24px]',
    horizontalPadding: state.paddingHorizontal === 16 ? 'px-[16px]' : 'px-[24px]',
    containerHeight: state.twoLine ? 'min-h-[51px]' : 'min-h-[36px]',
  }
}
