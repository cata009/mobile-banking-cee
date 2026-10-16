export function resolveAmountVisibility(hidden: boolean) {
  return {
    hidden,
    controlled: true,
    label: hidden ? 'Show amounts' : 'Hide amounts',
    icon: hidden ? 'amount-show' : 'amount-hide',
    slotSize: 32,
    iconToken: '--uc-icon',
    hoverOpacity: 0.7,
  } as const
}
