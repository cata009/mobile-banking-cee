/** Owner keeps state and React child cloning; contract describes the existing leaf shell. */
export function resolveAccordion({ productCount, isOpen }: { productCount: number; isOpen: boolean }) {
  return {
    single: productCount === 1,
    interactive: productCount !== 1,
    isOpen,
    headerHeight: 48,
    gutter: 24,
    contentPaddingTop: 8,
    iconSlot: 32,
    rotation: isOpen ? 180 : 0,
    durationMs: 300,
    easing: [0.4, 0, 0.2, 1],
    hoverOpacity: 0.8,
    chevron: 'chevron-down-wide',
    iconToken: '--uc-icon',
    textToken: '--uc-text',
  } as const
}
