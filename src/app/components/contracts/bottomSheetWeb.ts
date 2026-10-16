import { BOTTOM_SHEET_CONTRACT, resolveBottomSheet } from './bottomSheet'

export const BOTTOM_SHEET_WEB = {
  backdrop: 'absolute inset-0 z-50 flex items-end bg-[var(--uc-overlay)]',
  panel:
    'relative w-full overflow-y-auto rounded-t-[12px] bg-[var(--uc-sheet-bg)] p-[16px] shadow-[0_-8px_24px_rgb(var(--uc-shadow-rgb)_/_0.18)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
} as const

export function bottomSheetSize(fillHeight: boolean, maxHeightOffsetPx: number) {
  const state = resolveBottomSheet({ fillHeight, maxHeightOffsetPx })
  return { [state.sizeProperty]: `calc(100% - ${state.maxHeightOffsetPx}px)` }
}
export const BOTTOM_SHEET_CLOSE_DURATION = BOTTOM_SHEET_CONTRACT.closeDurationMs
