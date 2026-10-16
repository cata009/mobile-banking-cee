export const TOGGLE_BUTTON_SOURCE = {
  schema: 'codex-figma-component-spec/v1',
  figmaComponentName: 'Toggle',
  sourceNodeIds: { checked: '9105:1688', unchecked: '9105:1689' },
  width: 60,
  height: 30,
  knobSize: 22,
  knobInset: 4,
  borderWidth: 2,
} as const

export type ToggleButtonVariant = 'baseline' | 'prime-mail'
export interface ToggleButtonOptions {
  checked: boolean
  disabled?: boolean
  interactive?: boolean
  variant?: ToggleButtonVariant
}

export function resolveToggleButton({
  checked,
  disabled = false,
  interactive = false,
}: ToggleButtonOptions) {
  return {
    // Legacy Prime callers retain their prop, but styling now has one canonical source.
    variant: 'baseline',
    checked,
    disabled,
    mode: interactive ? 'interactive' : 'visual',
    width: TOGGLE_BUTTON_SOURCE.width,
    height: TOGGLE_BUTTON_SOURCE.height,
    knobSize: TOGGLE_BUTTON_SOURCE.knobSize,
    knobTop: TOGGLE_BUTTON_SOURCE.knobInset,
    knobLeft: checked ? 34 : 4,
    trackColor: 'var(--uc-surface)',
    borderColor: checked ? 'var(--uc-action)' : 'var(--uc-text-muted)',
    knobColor: checked ? 'var(--uc-action)' : 'var(--uc-text-muted)',
    borderWidth: TOGGLE_BUTTON_SOURCE.borderWidth,
    opacity: interactive && disabled ? 0.5 : 1,
    movementDurationMs: 200,
    transitionProperty: 'left',
    trackTransitionDurationMs: 0,
    trackEasing: [0.4, 0, 0.2, 1],
    easing: [0, 0, 0.2, 1],
    knobShadow: undefined,
  } as const
}
