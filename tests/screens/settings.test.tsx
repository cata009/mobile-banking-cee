// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import { SETTINGS_SECTIONS } from '@/app/config/settingsConfig'
import SettingsScreen from '@/app/screens/settings/SettingsScreen'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', () => ({
  loadNativeDemoModule: async () => (await import('../helpers/nativeWebRenderer')).loadNativeDemoModuleForWebTest(),
}))

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
  vi.restoreAllMocks()
})

it('keeps the Settings Source entry on Native and preserves the appearance flow', async () => {
  const onBack = vi.fn()
  const rendered = render(
    <DemoProvider initialState={{ product: 'PI', country: 'CZ', designSystem: 'current', scenario: 'active', release: 'release-future-evo-2027' }}>
      <LanguageProvider initialLanguage="en">
        <SettingsScreen onBack={onBack} />
      </LanguageProvider>
    </DemoProvider>,
  )
  await asyncNativeReady(rendered.container)

  const mobileAppItems = SETTINGS_SECTIONS.find(section => section.id === 'mobile-app')?.items ?? []
  expect(mobileAppItems.map(item => item.id).slice(0, 2)).toEqual(['appearance', 'language'])
  await waitFor(() => expect(screen.getAllByText('Settings').length).toBeGreaterThan(0))
  fireEvent.click(screen.getByRole('button', { name: 'Appearance' }))
  await waitFor(() => expect(screen.getByText('Home appearance')).toBeInTheDocument())
  expect(screen.getByText('Home visual style')).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'light' })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'dark' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Apply current theme' })).toBeEnabled()
})

// Native settings appearance, language, Back, and Apply behavior stays covered by
// native-spike/__tests__/current-profile.test.tsx. HU Kids Settings remains Source-backed.
