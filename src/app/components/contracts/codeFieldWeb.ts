import { resolveCodeField } from './codeField'
const borders = {
  '--uc-neutral-650': 'border-[var(--uc-neutral-650)]',
  '--uc-status-red': 'border-[var(--uc-status-red)]',
  '--uc-neutral-700': 'border-[var(--uc-neutral-700)]',
} as const
const texts = { '--uc-neutral-650': 'text-[var(--uc-neutral-650)]', '--uc-text': 'text-[var(--uc-text)]' } as const
export function codeFieldWeb(options: Parameters<typeof resolveCodeField>[0]) {
  const state = resolveCodeField(options)
  return { ...state, slotBorder: borders[state.borderToken], slotText: texts[state.textToken] }
}
