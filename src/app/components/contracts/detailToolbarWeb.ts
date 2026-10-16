import { resolveDetailToolbar, type DetailToolbarOptions } from './detailToolbar'
export function detailToolbarWeb(options: DetailToolbarOptions) {
  const state = resolveDetailToolbar(options)
  return {
    ...state,
    rootClass: 'sticky top-0 z-30 bg-[var(--uc-app-bg)] pt-[var(--uc-phone-top-reserve,54px)]',
    rowClass: 'grid h-[48px] grid-cols-[40px_1fr_40px] items-center px-[8px] pt-[8px]',
    actionClass: 'flex h-[40px] w-[40px] items-center justify-center',
    titleClass: 'uc-type-n4-strong pointer-events-none truncate text-center text-[var(--uc-text)]',
    emptyActionClass: 'h-[40px] w-[40px]',
    titleStyle: { opacity: state.progress, transform: `translateY(${state.translateY}px)` },
  } as const
}
