// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'
import { NavigationProvider, useNavigationContext } from '@/app/contexts/NavigationContext'

function wrapper({ children }: PropsWithChildren) {
  return <NavigationProvider>{children}</NavigationProvider>
}

describe('legacy navigation', () => {
  it('keeps root back-navigation as a no-op', () => {
    const { result } = renderHook(() => useNavigationContext(), { wrapper })

    act(() => result.current.goBack())

    expect(result.current.currentScreen).toBe('prelogin-inactive')
    expect(result.current.canGoBack).toBe(false)
  })

  it('returns to root after navigating to another screen', () => {
    const { result } = renderHook(() => useNavigationContext(), { wrapper })

    act(() => result.current.navigateTo('homepage'))
    expect(result.current.currentScreen).toBe('homepage')
    expect(result.current.canGoBack).toBe(true)

    act(() => result.current.goBack())
    expect(result.current.currentScreen).toBe('prelogin-inactive')
    expect(result.current.canGoBack).toBe(false)
  })

  it('stays safe after repeated root back-navigation', () => {
    const { result } = renderHook(() => useNavigationContext(), { wrapper })

    act(() => {
      result.current.goBack()
      result.current.goBack()
      result.current.goBack()
    })

    expect(result.current.currentScreen).toBe('prelogin-inactive')
    expect(result.current.canGoBack).toBe(false)
  })
})
