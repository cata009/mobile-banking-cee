import { APP_2027_THEMES, type HomeTheme } from './evoAppearance'

export const APP_2027_HOME_THEME_STORAGE_KEY = 'app-2027-home-theme'
export const APP_2027_THEME_CHANGE_EVENT = 'app-2027-theme-change'

export function getStoredApp2027Theme(): HomeTheme {
  if (typeof window === 'undefined') return 'standard'
  const stored = window.localStorage.getItem(APP_2027_HOME_THEME_STORAGE_KEY)
  return APP_2027_THEMES.some((theme) => theme.id === stored) ? (stored as HomeTheme) : 'standard'
}

export function storeApp2027Theme(theme: HomeTheme) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(APP_2027_HOME_THEME_STORAGE_KEY, theme)
    window.dispatchEvent(new Event(APP_2027_THEME_CHANGE_EVENT))
  }
}
