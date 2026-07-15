// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PanelOverlay from '@/app/components/PanelOverlay'
import PanelWithTranslations from '@/app/components/PanelWithTranslations'
import PanelWithoutCoAppingTranslations from '@/app/components/PanelWithoutCoAppingTranslations'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import type { CountryId } from '@/app/state/demoTypes'

const translatedPanelCopy = {
  aboutSmartBanking: 'About smart banking',
  exchangeRates: 'Exchange rates',
  findAtmBranches: 'Find ATM and branches',
}

function CountryProviders({ children, country }: PropsWithChildren<{ country: CountryId }>) {
  return (
    <DemoProvider initialState={{ country }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function renderOverlay(country: CountryId, onStartCoApping = vi.fn()) {
  const onClose = vi.fn()

  return {
    onClose,
    onStartCoApping,
    ...render(
      <CountryProviders country={country}>
        <PanelOverlay onClose={onClose} onStartCoApping={onStartCoApping} />
      </CountryProviders>,
    ),
  }
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('pre-login panel availability', () => {
  it.each(['CZ', 'SK'] as const)('offers and starts Co-Apping in %s', (country) => {
    const onStartCoApping = vi.fn()
    renderOverlay(country, onStartCoApping)

    fireEvent.click(screen.getByText(/start co-apping session/i))

    expect(onStartCoApping).toHaveBeenCalledOnce()
  })

  it('does not offer Co-Apping in RO', () => {
    renderOverlay('RO')

    expect(screen.queryByText(/start co-apping session/i)).not.toBeInTheDocument()
  })
})

describe('pre-login panel close boundaries', () => {
  it.each([
    ['with Co-Apping', true],
    ['without Co-Apping', false],
  ] as const)('closes %s panel from Screen Dimming', (_label, withCoApping) => {
    const onClose = vi.fn()
    const panel = withCoApping ? (
      <PanelWithTranslations
        {...translatedPanelCopy}
        startCoAppingSession="Start Co-Apping session"
        onClose={onClose}
      />
    ) : (
      <PanelWithoutCoAppingTranslations {...translatedPanelCopy} onClose={onClose} />
    )
    const { container } = render(panel)

    const dimming = container.querySelector('[data-name="Screen Dimming"]')
    expect(dimming).toBeInTheDocument()
    fireEvent.click(dimming!)

    expect(onClose).toHaveBeenCalledOnce()
  })

  it.each([
    ['with Co-Apping', true],
    ['without Co-Apping', false],
  ] as const)('keeps %s sheet clicks open while the X closes it', (_label, withCoApping) => {
    const onClose = vi.fn()
    const panel = withCoApping ? (
      <PanelWithTranslations
        {...translatedPanelCopy}
        startCoAppingSession="Start Co-Apping session"
        onClose={onClose}
      />
    ) : (
      <PanelWithoutCoAppingTranslations {...translatedPanelCopy} onClose={onClose} />
    )
    const { container } = render(panel)

    fireEvent.click(screen.getByText('About smart banking'))
    expect(onClose).not.toHaveBeenCalled()

    const closeHandle = container.querySelector('[data-name="11 Native/ContainerStatusBar/More"]')?.parentElement
    expect(closeHandle).toBeInTheDocument()
    fireEvent.click(closeHandle!)

    expect(onClose).toHaveBeenCalledOnce()
  })
})
