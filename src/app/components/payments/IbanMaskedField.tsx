import { useId, useRef, type ChangeEvent, type KeyboardEvent } from 'react'
import { AppIcon } from '@/app/components/icons'
import { formatIbanInput, getIbanGhostSuffix, normalizeIbanInput } from '@/app/utils/ibanInputMask'

export default function IbanMaskedField({
  value,
  countryCode,
  length,
  onChange,
  onScan,
}: {
  value: string
  countryCode: string
  length: number
  onChange: (value: string) => void
  onScan: () => void
}) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const displayValue = formatIbanInput(value, length)
  const ghostSuffix = getIbanGhostSuffix(value, countryCode, length)

  const restoreCaret = (rawValue: string, rawCharactersBeforeCaret: number) => {
    window.requestAnimationFrame(() => {
      const input = inputRef.current
      if (!input || document.activeElement !== input) return
      const caret = formatIbanInput(rawValue.slice(0, rawCharactersBeforeCaret), length).length
      input.setSelectionRange(caret, caret)
    })
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const rawCharactersBeforeCaret = normalizeIbanInput(
      input.value.slice(0, input.selectionStart ?? input.value.length),
      length,
    ).length
    const nextValue = normalizeIbanInput(input.value, length)
    onChange(nextValue)
    restoreCaret(nextValue, rawCharactersBeforeCaret)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const caret = input.selectionStart ?? 0
    if (event.key !== 'Backspace' || caret !== input.selectionEnd || displayValue[caret - 1] !== ' ') return
    event.preventDefault()
    const rawPosition = normalizeIbanInput(displayValue.slice(0, caret), length).length
    const nextValue = value.slice(0, rawPosition - 1) + value.slice(rawPosition)
    onChange(nextValue)
    restoreCaret(nextValue, rawPosition - 1)
  }

  const clearIban = () => {
    onChange('')
    inputRef.current?.focus()
    restoreCaret('', 0)
  }

  return (
    <div className="w-full">
      <span id={`${id}-label`} className="uc-type-n4 block text-[var(--uc-text)]">
        IBAN
      </span>
      <span id={`${id}-hint`} className="sr-only">
        IBAN must contain {length} characters.
      </span>
      <div className="relative mt-[8px] h-[52px] rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] focus-within:border-[var(--uc-action)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--uc-action)_18%,transparent)]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-[14px] right-[82px] z-0 flex items-center overflow-hidden whitespace-pre font-mono text-[14px] leading-[20px] text-[var(--uc-text-subtle)]"
        >
          <span className="invisible">{displayValue}</span>
          <span>{ghostSuffix}</span>
        </span>
        <input
          ref={inputRef}
          id={id}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-hint`}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="relative z-10 h-full w-full bg-transparent pl-[14px] pr-[82px] font-mono text-[14px] leading-[20px] text-[var(--uc-text)] outline-none"
        />
        {value ? (
          <button
            type="button"
            onClick={clearIban}
            aria-label="Clear IBAN"
            className="absolute right-[42px] top-[9px] z-20 grid size-[32px] place-items-center rounded-full text-[var(--uc-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
          >
            <AppIcon name="clear-results" size={18} color="var(--uc-text-muted)" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onScan}
          aria-label="Scan IBAN"
          className="absolute right-[7px] top-[9px] z-20 grid size-[32px] place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
        >
          <AppIcon name="payment-scan-qr" size={20} color="var(--uc-text)" />
        </button>
      </div>
    </div>
  )
}
