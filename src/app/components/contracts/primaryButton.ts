/** Preserves the shipped web behavior. Platform renderers consume this contract. */
export type PrimaryButtonVariant = 'action' | 'surface' | 'language-save'
export type PrimaryButtonLabelSize = '16' | '18'

export interface PrimaryButtonOptions {
  variant?: PrimaryButtonVariant
  labelSize?: PrimaryButtonLabelSize
  disabled?: boolean
}

export function resolvePrimaryButton({
  variant = 'action',
  labelSize = '16',
  disabled = false,
}: PrimaryButtonOptions = {}) {
  const languageSave = variant === 'language-save'
  const action = variant === 'action'
  const largeLabel = languageSave || labelSize === '18' || (disabled && action)
  return {
    variant,
    disabled,
    height: 48,
    radius: 4,
    fontSize: largeLabel ? 18 : 16,
    // Web uses the UniCredit font's normal metrics, not an invented fixed height.
    lineHeight: 'normal',
    fontWeight: 700,
    backgroundToken: languageSave ? '--uc-action' : action ? '--uc-action-strong' : '--uc-surface',
    textToken: action || languageSave ? '--uc-static-white' : '--uc-text',
    hoverBackgroundToken: action && !disabled ? '--uc-action-hover' : undefined,
    hoverOpacity: !action && !disabled ? 0.9 : 1,
    opacity: disabled ? 0.3 : 1,
    pressedScale: !disabled && !languageSave ? 0.98 : 1,
    truncateLabel: !languageSave,
    focusRing: !languageSave,
  } as const
}
