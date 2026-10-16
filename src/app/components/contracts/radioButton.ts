/** Controlled selection and the two shipped row compositions, without platform imports. */
export type RadioButtonVariant = 'standard' | 'date-filter'
export interface RadioButtonOptions {
  selected: boolean
  variant?: RadioButtonVariant
}

export function resolveRadioButton({ selected, variant = 'standard' }: RadioButtonOptions) {
  const dateFilter = variant === 'date-filter'
  return {
    variant,
    selected,
    height: dateFilter ? 80 : undefined,
    slotSize: 32,
    iconSize: 20,
    gap: 8,
    paddingHorizontal: dateFilter ? 16 : 24,
    paddingVertical: dateFilter ? 0 : 20,
    fontSize: dateFilter ? 14 : 16,
    fontWeight: 700,
    lineHeight: dateFilter ? 18 : 'normal',
    backgroundToken: dateFilter ? '--uc-surface' : undefined,
    labelToken: dateFilter ? '--uc-text' : '--uc-primary-k1',
    iconToken: '--uc-text',
    selectedIcon: selected ? 'radio-selected' : 'radio-unselected',
    hoverOpacity: dateFilter ? 1 : 0.8,
    // Selection is owned by the caller; selected-row activation is not suppressed.
    controlled: true,
  } as const
}
