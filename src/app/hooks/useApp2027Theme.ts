import { useEffect, useState } from 'react'
import { APP_2027_THEME_CHANGE_EVENT, getStoredApp2027Theme } from '@/features/products/evoAppearancePreferences'
import type { HomeTheme } from '@/features/products/evoAppearance'

export function useApp2027Theme() {
  const [theme, setTheme] = useState<HomeTheme>(getStoredApp2027Theme)

  useEffect(() => {
    const syncTheme = () => setTheme(getStoredApp2027Theme())
    window.addEventListener(APP_2027_THEME_CHANGE_EVENT, syncTheme)
    return () => window.removeEventListener(APP_2027_THEME_CHANGE_EVENT, syncTheme)
  }, [])

  return theme
}
