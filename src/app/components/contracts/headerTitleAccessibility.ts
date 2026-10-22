/** Use one heading during cross-fade, preserving the host's standalone-toolbar fallback. */
export function resolveHeaderTitleAccessibility({
  largeTitleRendered,
  largeTitleOpacity,
  collapsedTitleOpacity,
  hideCollapsedTitleWhenHidden = false,
}: {
  largeTitleRendered: boolean
  largeTitleOpacity: number
  collapsedTitleOpacity: number
  hideCollapsedTitleWhenHidden?: boolean
}) {
  const largeTitleVisible = largeTitleRendered && largeTitleOpacity > 0
  return {
    largeTitleHidden: !largeTitleVisible,
    collapsedTitleHidden: largeTitleVisible || (hideCollapsedTitleWhenHidden && collapsedTitleOpacity <= 0),
  }
}
