export const BOTTOM_SHEET_CONTRACT = {
  defaultMaxHeightOffset: 54,
  radius: 12,
  padding: 16,
  closeDurationMs: 360,
  backdropDurationMs: 260,
  enteringOffset: 12,
  easing: [0, 0, 0.2, 1],
  zIndex: 50,
  closeSize: 32,
  headerGap: 16,
  titleToken: 'h1',
  surface: 'var(--uc-sheet-bg)',
  overlay: 'var(--uc-overlay)',
} as const

export function resolveBottomSheet({
  fillHeight = false,
  maxHeightOffsetPx = BOTTOM_SHEET_CONTRACT.defaultMaxHeightOffset,
  animated = false,
  reducedMotion = false,
}: { fillHeight?: boolean; maxHeightOffsetPx?: number; animated?: boolean; reducedMotion?: boolean } = {}) {
  return {
    ...BOTTOM_SHEET_CONTRACT,
    fillHeight,
    maxHeightOffsetPx,
    sizeProperty: fillHeight ? 'height' : 'maxHeight',
    closeDelay: animated && !reducedMotion ? BOTTOM_SHEET_CONTRACT.closeDurationMs : 0,
  } as const
}
