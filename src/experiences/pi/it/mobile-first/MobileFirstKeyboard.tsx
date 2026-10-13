import { useState, type ReactNode } from 'react'
import shiftImage from '@/assets/mobile-first/it/keyboard-imgDarkModeFalseTypeShiftActive.svg'
import deleteImage from '@/assets/mobile-first/it/keyboard-imgDarkModeFalseTypeDelete.svg'
import emojiImage from '@/assets/mobile-first/it/keyboard-imgIconEmoji.svg'
import dictationImage from '@/assets/mobile-first/it/keyboard-imgIconDictation.svg'
import './mobile-first-keyboard.css'

export interface MobileFirstKeyboardProps {
  onKey: (key: string) => void
  pressedKey: string | null
  physicalShift?: boolean
}

type KeyboardLayout = 'letters' | 'numbers' | 'symbols'

const LETTER_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map((row) => [...row])
const NUMBER_ROWS = [[...'1234567890'], ['-', '/', ':', ';', '(', ')', '€', '&', '@', '"'], ['.', ',', '?', '!', "'"]]
const SYMBOL_ROWS = [
  ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
  ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
  ['.', ',', '?', '!', "'"],
]

function hardwareLayout(key: string | null): KeyboardLayout | null {
  if (!key || key.length !== 1 || key === ' ') return null
  if (/^[a-z]$/i.test(key)) return 'letters'
  if (NUMBER_ROWS.some((row) => row.includes(key))) return 'numbers'
  if (SYMBOL_ROWS.some((row) => row.includes(key))) return 'symbols'
  return null
}

function ShiftIcon() {
  return <img src={shiftImage} alt="" aria-hidden="true" width="32" height="41" />
}

function DeleteIcon() {
  return <img src={deleteImage} alt="" aria-hidden="true" width="32" height="41" />
}

export default function MobileFirstKeyboard({ onKey, pressedKey, physicalShift = false }: MobileFirstKeyboardProps) {
  const [selectedLayout, setSelectedLayout] = useState<KeyboardLayout>('letters')
  const [shift, setShift] = useState(false)
  const [pointerKey, setPointerKey] = useState<string | null>(null)
  const layout = hardwareLayout(pressedKey) ?? selectedLayout
  const uppercase = shift || physicalShift
  const hardwareKey = pressedKey?.length === 1 ? pressedKey.toLowerCase() : pressedKey
  const rows = layout === 'letters' ? LETTER_ROWS : layout === 'numbers' ? NUMBER_ROWS : SYMBOL_ROWS

  const pressKey = (key: string) => {
    if (key === 'Shift') {
      setShift((value) => !value)
      return
    }
    if (key === '123' || key === '#+=' || key === 'ABC') {
      setSelectedLayout(key === 'ABC' ? 'letters' : key === '123' ? 'numbers' : 'symbols')
      setShift(false)
      return
    }
    const letter = /^[a-z]$/.test(key)
    onKey(letter && uppercase ? key.toUpperCase() : key)
    if (letter) setShift(false)
  }

  const renderKey = (key: string, label: string, content: ReactNode, className = '') => {
    const pressed = pointerKey === key || hardwareKey === key || (key === 'Shift' && physicalShift)
    const hasBubble = key.length === 1 && key !== ' '
    const display = /^[a-z]$/.test(key) && uppercase ? key.toUpperCase() : key
    return (
      <button
        key={key}
        type="button"
        aria-label={label}
        aria-pressed={key === 'Shift' ? uppercase : undefined}
        data-pressed={pressed}
        className={`mf-key ${className}${key === 'Shift' && uppercase ? ' mf-key--selected' : ''}`}
        onPointerDown={(event) => {
          event.preventDefault()
          setPointerKey(key)
        }}
        onPointerUp={() => setPointerKey(null)}
        onPointerCancel={() => setPointerKey(null)}
        onPointerLeave={() => setPointerKey(null)}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => pressKey(key)}
      >
        <span className="mf-key-label">{hasBubble ? display : content}</span>
        {pressed && hasBubble && (
          <span className="mf-key-bubble" aria-hidden="true">
            {display}
          </span>
        )}
      </button>
    )
  }

  const characterKeys = (characters: readonly string[]) => characters.map((key) => renderKey(key, `Tasto ${key}`, key))

  return (
    <section className="mf-keyboard" aria-label="Tastiera italiana" data-layout={layout}>
      <div className="mf-keyboard-row">{characterKeys(rows[0]!)}</div>
      <div className={`mf-keyboard-row${layout === 'letters' ? ' mf-keyboard-row--middle' : ''}`}>
        {characterKeys(rows[1]!)}
      </div>
      <div className="mf-keyboard-row">
        {layout === 'letters'
          ? renderKey('Shift', 'Maiuscole', <ShiftIcon />, 'mf-key--modifier mf-key--shift')
          : renderKey(
              layout === 'numbers' ? '#+=' : '123',
              layout === 'numbers' ? '#+=' : '123',
              layout === 'numbers' ? '#+=' : '123',
              'mf-key--modifier mf-key--layout',
            )}
        <div className="mf-keyboard-letters">{characterKeys(rows[2]!)}</div>
        {renderKey('Backspace', 'Elimina', <DeleteIcon />, 'mf-key--modifier')}
      </div>
      <div className="mf-keyboard-row mf-keyboard-row--bottom">
        {renderKey(
          layout === 'letters' ? '123' : 'ABC',
          layout === 'letters' ? '123' : 'ABC',
          layout === 'letters' ? '123' : 'ABC',
          'mf-key--layout mf-key--modifier',
        )}
        {renderKey(' ', 'spazio', 'spazio', 'mf-key--space')}
        {renderKey('Enter', 'cerca', 'cerca', 'mf-key--return')}
      </div>
      <div className="mf-keyboard-utilities" aria-hidden="true">
        <img src={emojiImage} alt="" width="27" height="27" />
        <img src={dictationImage} alt="" width="19" height="28" />
      </div>
      <div className="mf-keyboard-home" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}
