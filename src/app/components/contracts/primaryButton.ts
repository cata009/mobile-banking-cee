/** Canonical CTA defaults; legacy renderers retain explicit contextual label sizes. */
export type PrimaryButtonVariant = 'action' | 'surface' | 'language-save' | 'secondary'
export type PrimaryButtonLabelSize = '14' | '16' | '18'

export interface PrimaryButtonOptions {
  variant?: PrimaryButtonVariant
  labelSize?: PrimaryButtonLabelSize
  disabled?: boolean
}

export function resolvePrimaryButton({
  variant = 'action',
  labelSize = '18',
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
    fontSize: labelSize === '14' ? 14 : largeLabel ? 18 : 16,
    transparent: variant === 'secondary',
    // Web uses the UniCredit font's normal metrics, not an invented fixed height.
    lineHeight: 'normal',
    fontWeight: 700,
    backgroundToken: languageSave ? '--uc-action' : action ? '--uc-action-strong' : '--uc-surface',
    textToken: languageSave
      ? '--uc-text-inverse'
      : action
        ? '--uc-static-white'
        : variant === 'secondary'
          ? '--uc-action'
          : '--uc-text',
    hoverBackgroundToken: action && !disabled ? '--uc-action-hover' : undefined,
    hoverOpacity: !action && !disabled ? 0.9 : 1,
    opacity: disabled ? 0.3 : 1,
    pressedScale: !disabled && !languageSave ? 0.98 : 1,
    truncateLabel: !languageSave,
    focusRing: true,
  } as const
}
