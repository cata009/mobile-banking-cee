/** Composition flags and selection are supplied by the owner, without runtime imports. */
export type NavItem = 'home' | 'analytics' | 'investments' | 'payments' | 'products' | 'more'
export const DEFAULT_NAV_ITEMS: readonly NavItem[] = ['home', 'analytics', 'payments', 'products', 'more']
export const MY_BANKER_NAV_ITEMS: readonly NavItem[] = ['home', 'investments', 'payments', 'products', 'more']
export const BOTTOM_NAVIGATION_CONTRACT = {
  width: 375, height: 54, gap: 8, paddingHorizontal: 24, paddingBottom: 5,
  iconSlotSize: 32, indicatorWidth: 24, indicatorHeight: 2, indicatorRadius: 2,
  buttonRadius: 8, fontSize: 14, lineHeight: 15,
  activeToken: '--uc-action', iconMutedToken: '--uc-icon-muted', labelMutedToken: '--uc-text-muted',
} as const
const NAV_ITEMS = [
  { id: 'home', labelKey: 'navigation.home', icon: 'nav-home' },
  { id: 'analytics', labelKey: 'navigation.analytics', icon: 'nav-analytics' },
  { id: 'investments', labelKey: 'runtime.myBanker.nav.investments', icon: 'investment-trend-up' },
  { id: 'payments', labelKey: 'navigation.payments', icon: 'nav-payments' },
  { id: 'products', labelKey: 'navigation.products', icon: 'nav-products' },
  { id: 'more', labelKey: 'navigation.more', icon: 'nav-more' },
] as const
export function resolveBottomNavigation({ items, myBanker = false }: { items?: readonly NavItem[]; myBanker?: boolean }) {
  const resolvedItems = items ?? (myBanker ? MY_BANKER_NAV_ITEMS : DEFAULT_NAV_ITEMS)
  // Compatibility: membership selection retains the Source order, including duplicates/empty sets.
  return NAV_ITEMS.filter(item => resolvedItems.includes(item.id))
}
export function resolveNavigationSelection(internalTab: NavItem, requestedTab: NavItem, hasCallback: boolean) {
  return { callbackTab: hasCallback ? requestedTab : undefined, internalTab: hasCallback ? internalTab : requestedTab }
}
