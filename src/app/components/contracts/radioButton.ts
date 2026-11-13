/** Controlled selection and the two shipped row compositions, without platform imports. */
export type RadioButtonVariant = 'standard' | 'date-filter' | 'option-sheet'
export interface RadioButtonOptions {
  selected: boolean
  variant?: RadioButtonVariant
}

export function resolveRadioButton({ selected, variant = 'standard' }: RadioButtonOptions) {
  const dateFilter = variant === 'date-filter'
  const optionSheet = variant === 'option-sheet'
  return {
    variant,
    selected,
    height: dateFilter || optionSheet ? 80 : undefined,
    slotSize: 32,
    iconSize: 20,
    gap: optionSheet ? 16 : 8,
    paddingHorizontal: optionSheet ? 0 : dateFilter ? 16 : 24,
    paddingVertical: dateFilter || optionSheet ? 0 : 20,
    fontSize: dateFilter || optionSheet ? 14 : 16,
    fontWeight: 700,
    lineHeight: dateFilter || optionSheet ? 18 : 'normal',
    backgroundToken: dateFilter ? '--uc-surface' : undefined,
    labelToken: optionSheet ? (selected ? '--uc-action' : '--uc-text') : dateFilter ? '--uc-text' : '--uc-primary-k1',
    iconToken: '--uc-text',
    selectedIcon: selected ? 'radio-selected' : 'radio-unselected',
    hoverOpacity: dateFilter || optionSheet ? 1 : 0.8,
    // Selection is owned by the caller; selected-row activation is not suppressed.
    controlled: true,
  } as const
}
