export type CheckboxCheckedState = boolean | 'indeterminate'
export function resolveCheckbox({
  checked = false,
  disabled = false,
  invalid = false,
}: { checked?: CheckboxCheckedState; disabled?: boolean; invalid?: boolean } = {}) {
  return {
    checked,
    ariaChecked: checked === 'indeterminate' ? 'mixed' : checked,
    disabled,
    invalid,
    size: 16,
    radius: 4,
    iconSize: 14,
    borderWidth: 1,
    opacity: disabled ? 0.5 : 1,
    showIndicator: checked === true || checked === 'indeterminate',
    nextChecked: checked === 'indeterminate' ? true : !checked,
  } as const
}
const sizes = { 16: 'size-4' } as const
export function checkboxWeb(options: Parameters<typeof resolveCheckbox>[0] = {}) {
  const state = resolveCheckbox(options)
  return {
    ...state,
    rootClass:
      'peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50'.replace(
        'size-4',
        sizes[state.size],
      ),
    indicatorClass: 'flex items-center justify-center text-current transition-none',
    iconClass: 'size-3.5',
  }
}
