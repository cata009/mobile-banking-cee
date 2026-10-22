export type NavigationRowAccessory = 'none' | 'chevron' | 'toggle'
export type NavigationRowHeight = 64 | 80
export interface NavigationRowOptions {
  trailingAccessory?: NavigationRowAccessory
  rowHeight?: NavigationRowHeight
  centerContent?: boolean
  titleTone?: 'default' | 'action'
  hasLeading?: boolean
  hasTrailing?: boolean
  hasOnClick?: boolean
  hasOnLinkClick?: boolean
  toggleChecked?: boolean
}
/** Nested controls retain their own callback; the legacy div never gains a row handler. */
export function resolveNavigationRow({
  trailingAccessory = 'none',
  rowHeight = 80,
  centerContent = false,
  titleTone = 'default',
  hasLeading = false,
  hasTrailing = false,
  hasOnClick = false,
  hasOnLinkClick = false,
  toggleChecked = false,
}: NavigationRowOptions = {}) {
  const hasToggle = trailingAccessory === 'toggle' && !hasTrailing
  // Payment type's source content was centered 2px outside its nominal 16px inset.
  const paymentType = rowHeight === 64 && hasToggle && hasLeading && !centerContent
  const compactSpecial = rowHeight === 64 && centerContent && !hasLeading && !hasTrailing && trailingAccessory === 'none'
  return {
    trailingAccessory,
    rowHeight,
    centerContent,
    toggleChecked,
    rootKind: hasOnClick && !hasOnLinkClick && trailingAccessory !== 'toggle' && !hasTrailing ? 'button' : 'div',
    paddingLeft: paymentType ? 14 : centerContent ? 24 : rowHeight === 64 || (hasLeading && !hasToggle) ? 16 : 24,
    paddingRight: centerContent ? 24 : rowHeight === 64 || hasToggle ? 16 : 12,
    gap: 16,
    iconSlot: 32,
    titleFontSize: compactSpecial ? 14 : 16,
    titleMaxLines: compactSpecial ? 1 : 2,
    titleLineHeight: 'normal',
    descriptionFontSize: 16,
    descriptionLineHeight: 'normal',
    linkFontSize: 14,
    linkLineHeight: 'normal',
    titleToken: titleTone === 'action' ? '--uc-action' : '--uc-text',
    backgroundToken: '--uc-surface',
    textToken: '--uc-text',
    actionToken: '--uc-action',
    linkKind: hasOnLinkClick ? 'button' : 'text',
    accessory: hasTrailing ? 'custom' : trailingAccessory,
  } as const
}
