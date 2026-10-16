import { resolveNavigationRow, type NavigationRowOptions } from './navigationRow'
export function navigationRowWeb(options: NavigationRowOptions = {}) {
  const state = resolveNavigationRow(options)
  return {
    ...state,
    rootClass: 'flex w-full items-center gap-[16px] bg-[var(--uc-surface)]',
    alignmentClass: state.centerContent ? 'justify-center text-center' : 'text-left',
    heightClass: state.rowHeight === 64 ? 'h-[64px]' : 'h-[80px]',
    paddingClass: state.centerContent
      ? 'px-[24px]'
      : state.rowHeight === 64
        ? 'px-[16px]'
        : state.paddingLeft === 16
          ? 'pl-[16px] pr-[12px]'
          : 'pl-[24px] pr-[12px]',
    titleColor: state.titleToken === '--uc-action' ? 'text-[var(--uc-action)]' : 'text-[var(--uc-text)]',
  }
}
