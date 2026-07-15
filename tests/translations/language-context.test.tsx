// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { LanguageProvider, useLanguage } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'

const PROTOTYPE_PROBE = '__languageContextInheritedProbe__'

function wrapper({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'RO' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

afterEach(() => {
  Reflect.deleteProperty(Object.prototype, PROTOTYPE_PROBE)
  vi.restoreAllMocks()
})

describe('LanguageContext translation lookup', () => {
  it('resolves a known dot-path key', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })

    expect(result.current.t('preLogin.welcome')).toBe('Welcome!')
  })

  it('returns a missing key and warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { result } = renderHook(() => useLanguage(), { wrapper })

    expect(result.current.t('missing.translation.key')).toBe('missing.translation.key')
    expect(warn).toHaveBeenCalledOnce()
  })

  it('returns a supplied fallback without warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { result } = renderHook(() => useLanguage(), { wrapper })

    expect(result.current.t('missing.translation.key', 'Fallback')).toBe('Fallback')
    expect(warn).not.toHaveBeenCalled()
  })

  it('never returns a terminal translation object', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })

    expect(result.current.t('preLogin')).toBe('preLogin')
  })

  it('does not resolve inherited properties as translations', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    Object.defineProperty(Object.prototype, PROTOTYPE_PROBE, {
      configurable: true,
      enumerable: false,
      value: 'Inherited translation',
    })
    const { result } = renderHook(() => useLanguage(), { wrapper })

    expect(result.current.t(PROTOTYPE_PROBE)).toBe(PROTOTYPE_PROBE)
    expect(warn).toHaveBeenCalledOnce()
  })
})
