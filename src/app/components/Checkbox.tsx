import { resolveCanonicalCheckbox } from '@/app/components/contracts/checkbox'

export interface CheckboxProps {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  /** A fixed selection: cannot be changed (the control is disabled for assistive tech) but is shown at full strength, not dimmed. */
  readOnly?: boolean
  /** Accessible name; a checkbox has no visible label of its own. */
  label: string
  className?: string
}

/**
 * The Design System selection checkbox (web). Canonical presentation: 32 px slot, 22 px box, 14 px tick, see
 * `contracts/checkbox.ts`. The native counterpart is `BaselineCheckbox presentation="canonical"`. The generic 16 px
 * form checkbox is `ui/checkbox.tsx`.
 */
export default function Checkbox({
  checked,
  onCheckedChange,
  disabled = false,
  readOnly = false,
  label,
  className = '',
}: CheckboxProps) {
  const state = resolveCanonicalCheckbox({ checked, disabled })
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || readOnly}
      onClick={() => {
        if (!readOnly) onCheckedChange?.(!checked)
      }}
      data-ds-label="Checkbox"
      data-checked={checked ? 'true' : 'false'}
      className={`relative grid size-[32px] shrink-0 place-items-center rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] disabled:cursor-not-allowed ${className}`}
      style={{ opacity: state.opacity }}
    >
      <span
        aria-hidden="true"
        className="grid size-[22px] place-items-center rounded-[4px] border border-[var(--uc-text)] bg-[var(--uc-surface)]"
      >
        {state.checked === true ? (
          <svg
            data-testid="checkbox-mark"
            xmlns="http://www.w3.org/2000/svg"
            width={state.markSize}
            height={state.markSize}
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.3181 3.76108C11.2141 2.82964 12.6664 2.82964 13.5625 3.76108L6.22952 11.375L0.875 5.81907C1.77066 4.88804 3.22338 4.88804 4.11943 5.81907L6.22952 8.00209L10.3181 3.76108Z"
              fill="var(--uc-action)"
            />
          </svg>
        ) : null}
      </span>
    </button>
  )
}
