import { resolveBottomNavigation } from './bottomNavigation'
export function bottomNavigationWeb(options: Parameters<typeof resolveBottomNavigation>[0]) {
  return resolveBottomNavigation(options).map(item => ({ ...item, iconBoxClassName: 'grid size-[32px] place-items-center' }))
}
