export type HeaderActionIconName = 'profile' | 'messages' | 'help' | 'search' | 'logout' | 'contact-phone' | 'edit' | 'spending'
const icons = {
  profile: 'header-profile', messages: 'header-messages', help: 'help-circle', search: 'search',
  logout: 'logout', 'contact-phone': 'contact-phone', edit: 'edit-pencil', spending: 'nav-analytics',
} as const
export const HEADER_ACTIONS_CONTRACT = {
  size: 32, railHeight: 32, railGap: 8, iconToken: '--uc-icon',
  badgeSize: 20, badgeBackgroundToken: '--uc-brand', badgeTextToken: '--uc-static-white',
  badgeFontSize: 14, badgeLetterSpacing: 0.35, hoverOpacity: 0.7,
} as const
export function resolveHeaderAction(icon: HeaderActionIconName, badgeCount = 0) {
  return { ...HEADER_ACTIONS_CONTRACT, icon: icons[icon] ?? 'help-circle', badgeText: badgeCount > 0 ? badgeCount > 99 ? '99+' : badgeCount : null }
}
