/** White inline link remains a button even without an action handler. */
export const NAVIGATION_LINK = {
  rootKind: 'button',
  gap: 0,
  iconSlot: 32,
  fontSize: 14,
  lineHeight: 'normal',
  colorToken: '--uc-static-white',
  hoverOpacity: 0.8,
  rootClass: 'flex items-center gap-[0px] cursor-pointer hover:opacity-80 transition-opacity',
  labelClass: 'uc-type-n5-strong whitespace-nowrap text-[var(--uc-static-white)]',
} as const
