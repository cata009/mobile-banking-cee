// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LanguageSelector from '@/app/components/LanguageSelector'

const language = vi.hoisted(() => ({ setLanguage: vi.fn() }))
vi.mock('@/app/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', setLanguage: language.setLanguage }),
}))
vi.mock('@/app/state/demoStore', () => ({ useCountry: () => 'RO' }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('language save pilot behavior', () => {
  it('previews the selected language without saving and applies it exactly once on Save', () => {
    const onBack = vi.fn()
    render(<LanguageSelector onBack={onBack} />)
    fireEvent.click(screen.getByRole('radio', { name: /Rom/ }))
    expect(language.setLanguage).not.toHaveBeenCalled()
    expect(onBack).not.toHaveBeenCalled()
    const save = screen.getByRole('button', { name: 'Salvează' })
    expect(save).not.toHaveAttribute('type')
    expect(save).toHaveClass('bg-[var(--uc-action)]', 'h-[48px]', 'rounded-[4px]')
    expect(save.firstElementChild).toHaveClass('uc-type-h2', 'text-[var(--uc-static-white)]')
    fireEvent.click(save)
    expect(language.setLanguage).toHaveBeenCalledExactlyOnceWith('ro')
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('Back cancels the pending language rather than saving it', () => {
    const onBack = vi.fn()
    render(<LanguageSelector onBack={onBack} />)
    fireEvent.click(screen.getByRole('radio', { name: /Rom/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(language.setLanguage).not.toHaveBeenCalled()
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
