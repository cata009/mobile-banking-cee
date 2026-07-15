// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNavigation } from '@/app/hooks/useNavigation'

describe('legacy navigation', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  it('keeps root back-navigation as a no-op', () => {
    const { result } = renderHook(() => useNavigation())

    act(() => result.current.goBack())

    expect(result.current.currentScreen).toBe('prelogin-inactive')
    expect(result.current.canGoBack).toBe(false)
  })

  it('returns to root after navigating to another screen', () => {
    const { result } = renderHook(() => useNavigation())

    act(() => result.current.navigateTo('homepage'))
    expect(result.current.currentScreen).toBe('homepage')
    expect(result.current.canGoBack).toBe(true)

    act(() => result.current.goBack())
    expect(result.current.currentScreen).toBe('prelogin-inactive')
    expect(result.current.canGoBack).toBe(false)
  })

  it('stays safe after repeated root back-navigation', () => {
    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.goBack()
      result.current.goBack()
      result.current.goBack()
    })

    expect(result.current.currentScreen).toBe('prelogin-inactive')
    expect(result.current.canGoBack).toBe(false)
  })
})
