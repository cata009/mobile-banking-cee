export type IndicatorItem = { type: 'item'; index: number } | { type: 'mini'; key: string }

export function getIndicatorItems(count: number, activeIndex: number, windowSize: number): IndicatorItem[] {
  if (count <= windowSize) {
    return Array.from({ length: count }, (_, index) => ({ type: 'item', index }))
  }

  if (activeIndex <= 1) {
    return [
      ...Array.from({ length: windowSize }, (_, index) => ({ type: 'item' as const, index })),
      { type: 'mini', key: 'end' },
    ]
  }

  if (activeIndex >= count - 2) {
    return [
      { type: 'mini', key: 'start' },
      ...Array.from({ length: windowSize }, (_, index) => ({
        type: 'item' as const,
        index: count - windowSize + index,
      })),
    ]
  }

  return [
    { type: 'mini', key: 'start' },
    { type: 'item', index: activeIndex - 2 },
    { type: 'item', index: activeIndex - 1 },
    { type: 'item', index: activeIndex },
    { type: 'item', index: activeIndex + 1 },
    { type: 'item', index: activeIndex + 2 },
    { type: 'mini', key: 'end' },
  ]
}

export function resolveCarouselIndicator({
  count,
  activeIndex,
  windowSize = 4,
  tone = 'default',
  withBackdropBlur = true,
}: {
  count: number
  activeIndex: number
  windowSize?: number
  tone?: 'default' | 'inverse'
  withBackdropBlur?: boolean
}) {
  return {
    items: getIndicatorItems(count, activeIndex, windowSize),
    height: 32,
    gap: 6,
    activeWidth: 30,
    dotSize: 6,
    miniSize: 4,
    hitTarget: 24,
    blur: withBackdropBlur ? 13.591408729553223 : undefined,
    inverse: tone === 'inverse',
    activeToken: '--uc-action',
    inactiveToken: '--uc-text-muted',
  } as const
}

/** Resolve overlapping targets using measured ink centers, without changing geometry. */
export function nearestIndicatorIndex(
  pointerX: number,
  centers: readonly { index: number; center: number }[],
  fallbackIndex: number,
) {
  if (!Number.isFinite(pointerX)) return fallbackIndex
  let selected = fallbackIndex
  let closest = Infinity
  for (const item of centers) {
    const distance = Math.abs(pointerX - item.center)
    if (Number.isFinite(distance) && distance < closest) {
      closest = distance
      selected = item.index
    }
  }
  return selected
}
