// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ToggleButton, { TOGGLE_BUTTON_SOURCE } from '@/app/components/ToggleButton'
import FrozenToggle, { TOGGLE_BUTTON_SOURCE as FROZEN_SOURCE } from '../fixtures/toggle-button-before'
import { PrimeContactActionFlow, type PrimeMailPreferences } from '@/app/screens/prime/PrimeContactActionFlow'

afterEach(cleanup)

describe('toggle pilot preservation', () => {
  it('gives the newly supported decorative Prime preset an explicit display box', () => {
    const { container } = render(<ToggleButton variant="prime-mail" checked disabled />)
    expect(container.firstElementChild).toHaveClass('inline-flex', 'w-[60px]', 'h-[30px]')
    expect(container.firstElementChild).not.toHaveClass('opacity-50')
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })
  it('keeps the new Prime disabled API state inert and aligned with the contract', () => {
    const onToggle = vi.fn()
    render(<ToggleButton variant="prime-mail" checked disabled onToggle={onToggle} ariaLabel="Ask every time" />)
    const control = screen.getByRole('switch')
    expect(control).toHaveClass('disabled:opacity-50')
    fireEvent.click(control)
    expect(onToggle).not.toHaveBeenCalled()
  })
  it.each([true, false])('keeps frozen DOM in both modes checked=%s', (checked) => {
    for (const interactive of [true, false])
      for (const disabled of [true, false]) {
        const props = {
          checked,
          disabled,
          ariaLabel: 'Notifications',
          className: 'align-middle',
          onToggle: interactive ? vi.fn() : undefined,
        }
        const { container, rerender, unmount } = render(<FrozenToggle {...props} />)
        // Explicit approved color normalization: theme surface replaces a fixed white track.
        const before = container.innerHTML.replace(/fill="var\(--uc-static-white\)"/g, 'fill="var(--uc-surface)"').replace(/\s+/g, ' ')
        rerender(<ToggleButton {...props} />)
        expect(container.innerHTML.replace(/\s+/g, ' ')).toBe(before)
        unmount()
      }
    expect(TOGGLE_BUTTON_SOURCE).toEqual(FROZEN_SOURCE)
  })
  it('passes the inverse checked value once and blocks disabled activation', () => {
    const onToggle = vi.fn()
    const { rerender } = render(<ToggleButton checked onToggle={onToggle} ariaLabel="Notifications" />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onToggle).toHaveBeenCalledExactlyOnceWith(false)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
    rerender(<ToggleButton checked={false} disabled onToggle={onToggle} ariaLabel="Notifications" />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
  it('keeps static indicators decorative even when disabled is supplied', () => {
    const { container } = render(<ToggleButton checked disabled className="align-middle" />)
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstElementChild).toHaveClass('align-middle')
  })
  it('preserves the Prime preference owner and previously selected mail app', () => {
    const onMailPreferencesChange = vi.fn()
    const onClose = vi.fn()
    const preferences: PrimeMailPreferences = { askEveryTime: true, preferredApp: 'mail' }
    render(
      <PrimeContactActionFlow
        initialAction="email"
        advisorName="Advisor"
        phoneNumber="123"
        emailAddress="advisor@example.test"
        mailPreferences={preferences}
        onMailPreferencesChange={onMailPreferencesChange}
        onClose={onClose}
        text={(_key, fallback) => fallback}
      />,
    )
    fireEvent.click(screen.getByRole('switch', { name: 'Ask me which app to use every time' }))
    expect(onMailPreferencesChange).toHaveBeenCalledExactlyOnceWith({ askEveryTime: false, preferredApp: 'mail' })
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'mail-chooser-title')
  })
})
