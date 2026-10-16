/** Inactive prelogin composition, distinct from active Home accordions. Controllers retain lifecycle. */
export const PRELOGIN_ACCORDION_CONTRACT = {
  gap: 24,
  expandedTitleGap: 16,
  collapsedPadding: 24,
  collapsedGap: 16,
  separatorWidth: 327,
  separatorHeight: 1,
  separatorOpacity: 0.4,
  titleFontSize: 24,
  descriptionFontSize: 18,
  actionFontSize: 14,
  hoverOpacity: 0.8,
  animationDuration: 0.35,
  easing: [0.4, 0, 0.2, 1],
  initialY: '100%',
  exitY: '-100%',
} as const
export function accordionEntries<T>(products: readonly T[], order: readonly number[]) {
  return order.flatMap((index) => {
    const product = products[index]
    return product ? [{ index, product }] : []
  })
}
export function promoteAccordionIndex(order: number[], clickedIndex: number): number[] {
  const position = order.indexOf(clickedIndex)
  if (position === 0) return order
  const next = [...order]
  next.splice(position, 1)
  next.unshift(clickedIndex)
  return next
}
