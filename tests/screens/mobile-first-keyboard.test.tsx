// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import MobileFirstKeyboard from '@/experiences/pi/it/mobile-first/MobileFirstKeyboard'

afterEach(cleanup)

describe('Italy Mobile First phone keyboard', () => {
  it('emits text, space, backspace and search values from the corresponding keys', () => {
    const keys: string[] = []
    render(<MobileFirstKeyboard onKey={(key) => keys.push(key)} pressedKey={null} />)

    expect(screen.getByRole('region', { name: 'Tastiera italiana' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tasto c' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tasto i' }))
    fireEvent.click(screen.getByRole('button', { name: 'spazio' }))
    fireEvent.click(screen.getByRole('button', { name: 'Elimina' }))
    fireEvent.click(screen.getByRole('button', { name: 'cerca' }))
    expect(keys).toEqual(['c', 'i', ' ', 'Backspace', 'Enter'])
  })

  it('uses one-shot Shift for uppercase text and returns to lowercase after typing', () => {
    const keys: string[] = []
    render(<MobileFirstKeyboard onKey={(key) => keys.push(key)} pressedKey={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'Maiuscole' }))
    expect(screen.getByRole('button', { name: 'Tasto a' })).toHaveTextContent('A')
    fireEvent.click(screen.getByRole('button', { name: 'Tasto a' }))
    expect(screen.getByRole('button', { name: 'Tasto a' })).toHaveTextContent('a')
    fireEvent.click(screen.getByRole('button', { name: 'Tasto a' }))
    expect(keys).toEqual(['A', 'a'])
  })

  it('switches between numbers, symbols and letters while emitting literal characters', () => {
    const keys: string[] = []
    render(<MobileFirstKeyboard onKey={(key) => keys.push(key)} pressedKey={null} />)
    fireEvent.click(screen.getByRole('button', { name: '123' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tasto 7' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tasto €' }))
    fireEvent.click(screen.getByRole('button', { name: '#+=' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tasto [' }))
    fireEvent.click(screen.getByRole('button', { name: 'ABC' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tasto z' }))
    expect(keys).toEqual(['7', '€', '[', 'z'])
  })

  it('highlights uppercase hardware letters and reflects a held physical Shift', () => {
    const { rerender } = render(<MobileFirstKeyboard onKey={() => undefined} pressedKey="A" physicalShift />)
    expect(screen.getByRole('button', { name: 'Tasto a' })).toHaveAttribute('data-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Tasto a' })).toHaveTextContent('A')
    expect(screen.getByRole('button', { name: 'Maiuscole' })).toHaveAttribute('data-pressed', 'true')

    rerender(<MobileFirstKeyboard onKey={() => undefined} pressedKey={null} physicalShift={false} />)
    expect(screen.getByRole('button', { name: 'Tasto a' })).toHaveAttribute('data-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Tasto a' })).toHaveTextContent('a')
  })

  it('shows the matching number or symbol layout while a hardware key is held', () => {
    const { rerender } = render(<MobileFirstKeyboard onKey={() => undefined} pressedKey="8" />)
    expect(screen.getByRole('button', { name: 'Tasto 8' })).toHaveAttribute('data-pressed', 'true')
    rerender(<MobileFirstKeyboard onKey={() => undefined} pressedKey="[" />)
    expect(screen.getByRole('button', { name: 'Tasto [' })).toHaveAttribute('data-pressed', 'true')
  })

  it('cancels pointer focus transfer and shows the held key bubble until release', () => {
    render(
      <>
        <input aria-label="Ricerca" />
        <MobileFirstKeyboard onKey={() => undefined} pressedKey={null} />
      </>,
    )
    const input = screen.getByRole('textbox', { name: 'Ricerca' })
    input.focus()
    const key = screen.getByRole('button', { name: 'Tasto a' })
    expect(fireEvent.pointerDown(key)).toBe(false)
    expect(input).toHaveFocus()
    expect(key).toHaveAttribute('data-pressed', 'true')
    expect(key.querySelector('.mf-key-bubble')).toHaveTextContent('a')
    fireEvent.pointerUp(key)
    expect(key).toHaveAttribute('data-pressed', 'false')
    expect(key.querySelector('.mf-key-bubble')).toBeNull()
    expect(input).toHaveFocus()
  })
})
