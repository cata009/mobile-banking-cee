export function resolveAmountSuggestionChip({ selected }: { selected: boolean }) {
  return {
    selected,
    height: 34,
    radius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: 700,
    borderWidth: selected ? 1 : 0,
    backgroundToken: selected ? '--uc-action-strong' : '--uc-neutral-100',
    textToken: selected ? '--uc-static-white' : '--uc-text',
    borderToken: '--uc-action',
    transition: 'colors',
  } as const
}
