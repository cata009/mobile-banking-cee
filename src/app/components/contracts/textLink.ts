/**
 * Inline text link: a plain text action inside copy, a form or a list header ("Edit", "Add another driver",
 * "Cancel"). Sentence or upper case is the caller's text; the control adds no chevron and no fill.
 *
 * It is not the Figma "Text button / Primary" (uppercase with a trailing chevron). Metadata only: no UI imports.
 */
export interface TextLinkOptions {
  disabled?: boolean
}

export function resolveTextLink({ disabled = false }: TextLinkOptions = {}) {
  return {
    disabled,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: 700,
    colorToken: '--uc-action',
    /** Minimum touch target, taller than the 16px text on purpose. */
    minHeight: 44,
    gap: 5,
    pressedOpacity: 0.65,
    disabledOpacity: 0.4,
    focusRing: true,
  } as const
}
