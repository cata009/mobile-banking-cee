export type AccountActionAlignment = 'start' | 'center' | 'end' | 'between'
export type AccountActionTreatment = 'bare' | 'bubble'
export const ACCOUNT_ACTION_ALIGNMENT = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const
export function resolveAccountActions({
  align = 'between',
  iconTreatment = 'bare',
  hidden = false,
  label = '',
  pressed,
}: {
  align?: AccountActionAlignment
  iconTreatment?: AccountActionTreatment
  hidden?: boolean
  label?: string
  pressed?: boolean
} = {}) {
  const bubble = iconTreatment === 'bubble'
  return {
    align,
    iconTreatment,
    bubble,
    stretch: align === 'between',
    actionLimit: 4,
    normalizedLabel: label.replace(/\s+/g, ' ').trim(),
    hidden,
    pressed,
    gutter: 16,
    paddingVertical: 8,
    gap: align === 'between' ? 0 : 8,
    itemGap: bubble ? 6 : 4,
    itemWidth: align === 'between' ? undefined : 82,
    iconSlot: bubble ? 48 : 32,
    glyphSize: bubble ? 24 : 24,
    labelFontSize: 14,
    labelLineHeight: bubble ? 16 : 15,
    bubbleToken: '--pi-shortcut-icon-bg',
    bubbleFallbackToken: '--uc-surface',
    foregroundToken: '--pi-shortcut-icon-fg',
    foregroundFallbackToken: '--uc-text',
  } as const
}
