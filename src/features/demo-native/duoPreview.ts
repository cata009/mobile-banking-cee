/** ASEE RO UAT report, 8 Oct 2026. These are preview fixtures, not OS-reported insets. */
export interface DuoPreviewViewport {
  width: number
  height: number
  rightInset: number
  /** Space above the app controls for the illustrative system strip. */
  systemRailTop?: number
  /** Existing authoring/reference unit for bounded components, not a universal app-column width. */
  referenceWidth: number
}

export function isDuoPreview(id: string): boolean {
  return id === 'apple-foldable-closed' || id === 'apple-foldable-open'
}

/** Preview-only exclusion for system chrome; values are not native iOS insets. */
export function resolveDuoOverlayInsets(viewport: DuoPreviewViewport) {
  return { top: viewport.rightInset === 0 && viewport.height > viewport.width ? 54 : 0, right: viewport.rightInset }
}

export function duoPreviewViewport(
  id: string,
  size: { width: number; height: number },
): DuoPreviewViewport | undefined {
  if (!isDuoPreview(id)) return undefined
  const innerPortrait = id === 'apple-foldable-open' && size.height > size.width
  return {
    ...size,
    rightInset: innerPortrait ? 0 : 84,
    referenceWidth: 375,
    systemRailTop: innerPortrait ? 0 : id === 'apple-foldable-closed' ? 152 : 110,
  }
}

export function resolveDuoContent(viewport: DuoPreviewViewport, screen?: string) {
  const safeWidth = Math.max(0, viewport.width - viewport.rightInset)
  const readable = safeWidth >= 560 + 48
  const maximum =
    screen && screen !== 'prelogin' && screen !== 'login'
      ? readable
        ? 560
        : viewport.referenceWidth
      : viewport.referenceWidth
  const width = Math.min(safeWidth, maximum)
  return { width, height: viewport.height, left: (safeWidth - width) / 2, top: 0 }
}
