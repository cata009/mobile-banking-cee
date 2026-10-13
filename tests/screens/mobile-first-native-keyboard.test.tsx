// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import MobileFirstSearch from '@/experiences/pi/it/mobile-first/MobileFirstSearch'

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
})

describe('Italy search on a real phone', () => {
  it('allows the system keyboard in device mode and accepts paste and composed text', () => {
    window.history.replaceState({}, '', '/?product=PI&country=IT&frame=0')
    render(<MobileFirstSearch onClose={() => undefined} />)
    const input = screen.getByRole('searchbox')
    expect(input).toHaveAttribute('inputmode', 'search')
    expect(input).toHaveAttribute('enterkeyhint', 'search')
    expect(screen.queryByRole('region', { name: 'Tastiera italiana' })).not.toBeInTheDocument()
    expect(input).not.toHaveAttribute('readonly')
    fireEvent.change(input, { target: { value: 'caffè € 1.234,50' } })
    expect(input).toHaveValue('caffè € 1.234,50')
    fireEvent.click(screen.getByRole('button', { name: 'Cancella ricerca' }))
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    fireEvent.submit(screen.getByRole('search'))
    expect(input).not.toHaveFocus()
  })

  it('preserves the simulated keyboard in the desktop preview', () => {
    render(<MobileFirstSearch onClose={() => undefined} />)
    expect(screen.getByRole('searchbox')).toHaveAttribute('inputmode', 'none')
    fireEvent.click(screen.getByRole('button', { name: 'Tasto a' }))
    expect(screen.getByRole('searchbox')).toHaveValue('a')
  })
})
