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
}: { layout?: 'equal' | 'scrollable'; minTabWidth?: number; withTopMargin?: boolean } = {}) {
  return {
    isScrollable: layout === 'scrollable',
    minTabWidth,
    withTopMargin,
    height: 48,
    topMargin: withTopMargin ? 22 : 0,
    tabPadding: 16,
    fontSize: 16,
    badgeSize: 12,
    badgeGap: 8,
    underlineHeight: 2,
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
