export type CodeFieldVisualState = 'empty' | 'filled' | 'error' | 'disabled'
export const CODE_SLOT_SIZE = { width: 44, height: 64 } as const
export function normalizeCode(value: string, length: number) {
  return value.replace(/\D/g, '').slice(0, length)
}
export function resolveCodeField({
  value,
  length = 4,
  disabled = false,
  visualState,
  errorText,
  errorText2,
}: {
  value: string
  length?: number
  disabled?: boolean
  visualState?: CodeFieldVisualState
  errorText?: string
  errorText2?: string
}) {
  const normalizedValue = normalizeCode(value, length)
  const isDisabled = disabled || visualState === 'disabled'
  const isError = Boolean(errorText || errorText2) || visualState === 'error'
  return {
    normalizedValue,
    slots: Array.from({ length }, (_, index) => normalizedValue[index] ?? ''),
    isDisabled,
    isError,
    slotSize: CODE_SLOT_SIZE,
    gap: 16,
    radius: 8,
    fontSize: 30,
    helperWidth: 224,
    helperGap: 3,
    helperTop: 8,
    borderToken: isDisabled ? '--uc-neutral-650' : isError ? '--uc-status-red' : '--uc-neutral-700',
    textToken: isDisabled ? '--uc-neutral-650' : '--uc-text',
  } as const
}
export function updateCodeSlot(
  slots: readonly string[],
  index: number,
  next: string,
  length: number,
  disabled: boolean,
) {
  if (disabled) return { value: undefined, focusIndex: undefined }
  const digits = normalizeCode(next, length),
    nextSlots = [...slots]
  if (digits.length > 1) {
    digits.split('').forEach((d, offset) => {
      if (index + offset < length) nextSlots[index + offset] = d
    })
    return { value: nextSlots.join(''), focusIndex: Math.min(index + digits.length, length - 1) }
  }
  nextSlots[index] = digits
  return { value: nextSlots.join(''), focusIndex: digits && index < length - 1 ? index + 1 : undefined }
}
export function backspaceCodeSlot(slots: readonly string[], index: number, disabled: boolean) {
  if (disabled) return { value: undefined, focusIndex: undefined }
  const next = [...slots]
  if (next[index]) {
    next[index] = ''
    return { value: next.join(''), focusIndex: undefined }
  }
  if (index > 0) {
    next[index - 1] = ''
    return { value: next.join(''), focusIndex: index - 1 }
  }
  return { value: undefined, focusIndex: undefined }
}
