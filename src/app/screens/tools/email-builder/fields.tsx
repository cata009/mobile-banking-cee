import { useId, useState, type ReactNode } from 'react'
import PrimaryButton from '@/app/components/PrimaryButton'
import { AppIcon, type IconName } from '@/app/components/icons'

/** Thin compositions of the approved CTA and native host inputs, not new DS families. */
export function Action({
  children,
  onClick,
  disabled = false,
  primary = false,
  icon,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  icon?: IconName
}) {
  return (
    <PrimaryButton
      variant={primary ? 'action' : 'secondary'}
      labelSize="14"
      onClick={onClick}
      disabled={disabled}
      className="email-action"
    >
      <span className="email-action-label">
        {icon && <AppIcon name={icon} size={16} />}
        <span>{children}</span>
      </span>
    </PrimaryButton>
  )
}
export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  const id = useId()
  return (
    <div className="email-field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} value={value} rows={rows} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
type NumberFieldProps = { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number }
export function NumberField(props: NumberFieldProps) {
  return <NumberDraft key={`${props.label}:${props.value}`} {...props} />
}
function NumberDraft({ label, value, onChange, min = 1, max = 2400 }: NumberFieldProps) {
  const id = useId()
  const [draft, setDraft] = useState(String(value))
  const number = Number(draft)
  const valid = draft !== '' && Number.isInteger(number) && number >= min && number <= max
  return (
    <div className="email-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={draft}
        aria-invalid={!valid || undefined}
        onChange={(e) => {
          setDraft(e.target.value)
        }}
        onBlur={() => {
          if (valid) onChange(number)
          else setDraft(String(value))
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
        }}
      />
    </div>
  )
}
