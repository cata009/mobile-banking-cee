// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PanelMenuSheet from '@/app/components/PanelMenuSheet'
import PanelWithTranslations from '@/app/components/PanelWithTranslations'
import PanelWithoutCoApping from '@/app/components/PanelWithoutCoApping'
import PanelWithoutCoAppingTranslations from '@/app/components/PanelWithoutCoAppingTranslations'
import InteractivePreLoginActive from '@/app/components/InteractivePreLoginActive'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'

const copy = {
  aboutSmartBanking: 'About smart banking',
  exchangeRates: 'Exchange rates',
  findAtmBranches: 'Find ATM and branches',
}

function Providers({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'CZ' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('shared panel menu sheet', () => {
  it('renders the three common rows and only adds Co-Apping when configured', () => {
    const { container, rerender } = render(<PanelMenuSheet {...copy} />)

    expect(container.querySelectorAll('[data-name="Light Restyle/Navigation"]')).toHaveLength(3)
    expect(screen.getByText(copy.aboutSmartBanking)).toBeInTheDocument()
    expect(screen.getByText(copy.exchangeRates)).toBeInTheDocument()
    expect(screen.getByText(copy.findAtmBranches)).toBeInTheDocument()
    expect(screen.queryByText('Start Co-Apping')).not.toBeInTheDocument()

    rerender(<PanelMenuSheet {...copy} startCoAppingSession="Start Co-Apping" />)
    expect(container.querySelectorAll('[data-name="Light Restyle/Navigation"]')).toHaveLength(4)
    expect(screen.getByText('Start Co-Apping')).toBeInTheDocument()
  })

  it('closes from the dimming layer and drag handle while common rows remain inert', () => {
    const onClose = vi.fn()
    const { container } = render(<PanelMenuSheet {...copy} onClose={onClose} />)

    fireEvent.click(screen.getByText(copy.aboutSmartBanking))
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(container.querySelector('[data-name="Screen Dimming"]')!)
    expect(onClose).toHaveBeenCalledOnce()

    fireEvent.click(container.querySelector('[data-name="11 Native/ContainerStatusBar/More"]')!.parentElement!)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('calls the optional Co-Apping action without coupling it to close', () => {
    const onClose = vi.fn()
    const onStartCoApping = vi.fn()
    render(
      <PanelMenuSheet
        {...copy}
        startCoAppingSession="Start Co-Apping"
        onClose={onClose}
        onStartCoApping={onStartCoApping}
      />,
    )

    fireEvent.click(screen.getByText('Start Co-Apping'))
    expect(onStartCoApping).toHaveBeenCalledOnce()
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('public panel wrappers', () => {
  it('preserves translated row parity and the optional fourth row', () => {
    const { container, rerender } = render(<PanelWithoutCoAppingTranslations {...copy} />)
    expect(container.querySelectorAll('[data-name="Light Restyle/Navigation"]')).toHaveLength(3)

    rerender(<PanelWithTranslations {...copy} startCoAppingSession="Start Co-Apping" />)
    expect(container.querySelectorAll('[data-name="Light Restyle/Navigation"]')).toHaveLength(4)
  })

  it('keeps the legacy English wrapper static and inert', () => {
    const { container } = render(<PanelWithoutCoApping />)

    expect(screen.getByText('ABOUT SMART BANKING')).toBeInTheDocument()
    expect(screen.getByText('EXCHANGE RATES')).toBeInTheDocument()
    expect(screen.getByText('FIND ATM & BRANCHES')).toBeInTheDocument()
    expect(
      container.querySelector('[data-name="11 Native/ContainerStatusBar/More"]')?.parentElement,
    ).not.toHaveClass('cursor-pointer')
    fireEvent.click(container.querySelector('[data-name="Screen Dimming"]')!)
    fireEvent.click(container.querySelector('[data-name="11 Native/ContainerStatusBar/More"]')!.parentElement!)
    expect(container.querySelector('[data-name="Panel"]')).toBeInTheDocument()
  })
})

describe('interactive pre-login delegation boundary', () => {
  it('retains the exact selectors used for delegated close and start actions', () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const onClose = vi.fn()
    const onStartCoApping = vi.fn()
    const { container } = render(
      <Providers>
        <InteractivePreLoginActive onClose={onClose} onStartCoApping={onStartCoApping} />
      </Providers>,
    )

    const closeSelector = container.querySelector('[data-name="11 Native/ContainerStatusBar/More"]')
    const rows = container.querySelectorAll('[data-name="Light Restyle/Navigation"]')
    expect(closeSelector).toBeInTheDocument()
    expect(rows).toHaveLength(4)

    fireEvent.click(closeSelector!)
    expect(onClose).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByText('START CO-APPING SESSION'))
    expect(onStartCoApping).toHaveBeenCalledOnce()
  })
})
