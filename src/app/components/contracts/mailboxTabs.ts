export type MessagesMailboxTabId = string

export interface MessagesMailboxTab {
  id: MessagesMailboxTabId
  label: string
  hasNewItems?: boolean
}
export function resolveMailboxTabs({
  layout = 'equal',
  minTabWidth = 0,
  withTopMargin = true,
  itemCount,
}: { layout?: 'equal' | 'scrollable'; minTabWidth?: number; withTopMargin?: boolean; itemCount?: number } = {}) {
  const sourceTwoItems = layout === 'equal' && itemCount === 2
  return {
    sourceTwoItems,
    isScrollable: layout === 'scrollable',
    minTabWidth,
    withTopMargin,
    height: 48,
    topMargin: withTopMargin ? 22 : 0,
    tabPadding: 16,
    fontSize: sourceTwoItems ? 18 : 16,
    lineHeight: sourceTwoItems ? 20 : undefined,
    contentInsetTop: sourceTwoItems ? 1 : 0,
    badgeSize: 12,
    badgeGap: sourceTwoItems ? 12 : 8,
    underlineHeight: sourceTwoItems ? 3 : 2,
    dragThreshold: 10,
    activeTextToken: '--uc-text',
    inactiveTextToken: '--uc-text-muted',
    badgeToken: '--uc-action',
  } as const
}
export function centeredMailboxScroll(tabLeft: number, listWidth: number, tabWidth: number, scrollWidth: number) {
  const target = tabLeft - (listWidth - tabWidth) / 2
  const max = scrollWidth - listWidth
  return Math.max(0, Math.min(target, max))
}
