/**
 * Choice chip: one option in a row of amount or term shortcuts (Future Gain simulators). The chosen chip is filled
 * with the action colour and carries white text; the others sit on a soft neutral fill. Metadata only: no UI imports.
 *
 * Not the amount suggestion chip (13 px, action-strong fill, no scrolling row) and not the pill (black when chosen).
 */
export interface ChoiceChipOptions {
  selected?: boolean
}

export function resolveChoiceChip({ selected = false }: ChoiceChipOptions = {}) {
  return {
    selected,
    radius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    lineHeight: 15,
    bold: true,
    borderWidth: selected ? 1 : 0,
    backgroundToken: selected ? '--uc-action' : '--uc-neutral-100',
    borderToken: selected ? '--uc-action' : '--uc-neutral-100',
    textToken: selected ? '--uc-static-white' : '--uc-text',
  } as const
}

/** The row the chips sit in: scrolls sideways, 16 px between chips. */
export const CHOICE_CHIP_ROW = {
  gap: 16,
  paddingVertical: 23.5,
} as const
