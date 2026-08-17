// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import SettingsScreen from '@/app/screens/settings/SettingsScreen'
import { DemoProvider } from '@/app/state/demoStore'
import { SETTINGS_SECTIONS } from '@/app/config/settingsConfig'

afterEach(cleanup)

describe('Settings appearance', () => {
  it('places Appearance before Language and opens the shared Home appearance studio', () => {
    render(
      <DemoProvider initialState={{ release: 'release-future-evo-2027' }}>
        <LanguageProvider initialLanguage="en">
          <SettingsScreen onBack={vi.fn()} />
        </LanguageProvider>
      </DemoProvider>,
    )

    const mobileAppItems = SETTINGS_SECTIONS.find((section) => section.id === 'mobile-app')?.items ?? []
    expect(mobileAppItems.map((item) => item.id).slice(0, 2)).toEqual(['appearance', 'language'])

    const appearance = screen.getByRole('button', { name: 'Appearance' })

    fireEvent.click(appearance)
    expect(screen.getByRole('heading', { name: 'Home appearance' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'light' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'dark' })).toBeInTheDocument()
    expect(screen.getByTestId('app-2027-phone-theme-preview')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply current theme' })).toHaveClass('w-[327px]', 'rounded')
  })
})
