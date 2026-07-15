// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AccountActionBar from '@/app/components/accounts/AccountActionBar'
import { BottomSheet } from '@/app/components/BottomSheet'
import LanguageSelector from '@/app/components/LanguageSelector'
import { LanguageProvider, useLanguage } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'

function RomanianAppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'RO' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('AccountActionBar', () => {
  it('renders the four default actions and dispatches configured callbacks', () => {
    const onDetailsClick = vi.fn()
    const onOptionsClick = vi.fn()
    render(
      <AccountActionBar onDetailsClick={onDetailsClick} onOptionsClick={onOptionsClick} />,
      { wrapper: RomanianAppProviders },
    )

    expect(screen.getAllByRole('button')).toHaveLength(4)
    fireEvent.click(screen.getByRole('button', { name: 'Details' }))
    fireEvent.click(screen.getByRole('button', { name: 'Options' }))
    expect(onDetailsClick).toHaveBeenCalledOnce()
    expect(onOptionsClick).toHaveBeenCalledOnce()
  })

  it('preserves custom aria labels, colors, alignment, and hidden actions', () => {
    const { container } = render(
      <AccountActionBar
        align="center"
        items={[
          { id: 'visible', iconName: 'account-details', label: 'Visible', ariaLabel: 'Custom action', iconColor: 'rebeccapurple' },
          { id: 'hidden', iconName: 'account-options', label: 'Hidden', hidden: true },
        ]}
      />,
      { wrapper: RomanianAppProviders },
    )

    expect(screen.getByRole('button', { name: 'Custom action' })).toBeEnabled()
    const hidden = container.querySelector<HTMLButtonElement>('button[aria-hidden="true"]')
    expect(hidden).toBeDisabled()
    expect(hidden).toHaveAttribute('tabindex', '-1')
    expect(container.firstElementChild).toHaveClass('justify-center')
    expect(container.querySelector('svg[color="rebeccapurple"]')).toBeInTheDocument()
  })
})

describe('BottomSheet', () => {
  it('enters focus, wraps Tab in both directions, closes on Escape, and restores focus', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    const { unmount } = render(
      <BottomSheet title="Sheet" onClose={onClose}>
        <button type="button">First body action</button>
        <button type="button">Last body action</button>
      </BottomSheet>,
    )

    act(() => vi.runOnlyPendingTimers())
    const builtInClose = screen.getByRole('button', { name: 'Close' })
    const lastBodyAction = screen.getByRole('button', { name: 'Last body action' })
    expect(builtInClose).toHaveFocus()

    lastBodyAction.focus()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(builtInClose).toHaveFocus()

    builtInClose.focus()
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(lastBodyAction).toHaveFocus()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
    unmount()
    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('traps focus safely when the built-in close is the only focusable element', () => {
    vi.useFakeTimers()
    render(<BottomSheet onClose={() => undefined}><span>Static content</span></BottomSheet>)
    act(() => vi.runOnlyPendingTimers())

    const close = screen.getByRole('button', { name: 'Close' })
    expect(close).toHaveFocus()
    expect(() => fireEvent.keyDown(window, { key: 'Tab' })).not.toThrow()
    expect(() => fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })).not.toThrow()
    expect(close).toHaveFocus()
  })
})

function LanguageProbe() {
  const { language } = useLanguage()
  return <output aria-label="Current language">{language}</output>
}

describe('LanguageSelector', () => {
  it('previews and saves the local language before navigating back', () => {
    const onBack = vi.fn()
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    render(
      <>
        <LanguageSelector onBack={onBack} />
        <LanguageProbe />
      </>,
      { wrapper: RomanianAppProviders },
    )

    fireEvent.click(screen.getByRole('radio', { name: 'Română' }))
    expect(screen.getByRole('radio', { name: 'Română' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByLabelText('Current language')).toHaveTextContent('en')
    fireEvent.click(screen.getByRole('button', { name: /salvează/i }))
    expect(screen.getByLabelText('Current language')).toHaveTextContent('ro')
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('can select and save English', () => {
    const onBack = vi.fn()
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    render(<LanguageSelector onBack={onBack} />, { wrapper: RomanianAppProviders })

    fireEvent.click(screen.getByRole('radio', { name: 'English' }))
    expect(screen.getByRole('radio', { name: 'English' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
