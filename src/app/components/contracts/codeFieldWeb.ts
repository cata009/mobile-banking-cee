import { resolveCodeField } from './codeField'
const borders = {
  '--uc-text-subtle': 'border-[var(--uc-text-subtle)]',
  '--uc-status-red': 'border-[var(--uc-status-red)]',
  '--uc-neutral-700': 'border-[var(--uc-neutral-700)]',
} as const
const texts = { '--uc-text-muted': 'text-[var(--uc-text-muted)]', '--uc-text': 'text-[var(--uc-text)]' } as const
export function codeFieldWeb(options: Parameters<typeof resolveCodeField>[0]) {
  const state = resolveCodeField(options)
  return { ...state, slotBorder: borders[state.borderToken], slotText: texts[state.textToken] }
}
