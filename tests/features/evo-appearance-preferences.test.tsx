// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useApp2027Theme } from '@/app/hooks/useApp2027Theme'
import {
  getStoredApp2027Theme as getLegacyApp2027Theme,
  storeApp2027Theme as storeLegacyApp2027Theme,
  useApp2027Theme as useLegacyApp2027Theme,
} from '@/app/screens/home/App2027ThemePicker'
import { getStoredApp2027Theme, storeApp2027Theme } from '@/features/products/evoAppearancePreferences'

const HOME_THEME_KEY = 'app-2027-home-theme'
const HOME_THEME_CHANGE_EVENT = 'app-2027-theme-change'

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

describe('Evo Home appearance preferences', () => {
  it('retains the legacy picker exports while moving ownership to the preference modules', () => {
    expect(getLegacyApp2027Theme).toBe(getStoredApp2027Theme)
    expect(storeLegacyApp2027Theme).toBe(storeApp2027Theme)
    expect(useLegacyApp2027Theme).toBe(useApp2027Theme)
  })

  it('defaults missing or unrecognized stored themes to standard', () => {
    expect(getStoredApp2027Theme()).toBe('standard')

    window.localStorage.setItem(HOME_THEME_KEY, 'not-a-theme')
    expect(getStoredApp2027Theme()).toBe('standard')

    window.localStorage.setItem(HOME_THEME_KEY, 'aurora')
    expect(getStoredApp2027Theme()).toBe('aurora')
  })

  it('stores the selected theme, emits the Source event, and updates the hook', () => {
    const onThemeChange = vi.fn()
    window.addEventListener(HOME_THEME_CHANGE_EVENT, onThemeChange)
    const { result } = renderHook(() => useApp2027Theme())
    expect(result.current).toBe('standard')

    act(() => storeApp2027Theme('aurora'))

    expect(window.localStorage.getItem(HOME_THEME_KEY)).toBe('aurora')
    expect(onThemeChange).toHaveBeenCalledTimes(1)
    expect(result.current).toBe('aurora')

    window.removeEventListener(HOME_THEME_CHANGE_EVENT, onThemeChange)
  })
})
