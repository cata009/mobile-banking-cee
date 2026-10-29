import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { primaryButtonWeb } from '@/app/components/contracts/primaryButtonWeb'

export const panelClass =
  'rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[20px] text-[var(--uc-text)]'
const fieldClass =
  'min-h-[44px] w-full rounded border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[12px] py-[8px] text-[var(--uc-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--uc-action)] disabled:opacity-50'
/** Uses the existing approved button contract; no new DS variant. */
export function Action({
  secondary = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  const binding = primaryButtonWeb(
    { variant: secondary ? 'secondary' : 'action', disabled: props.disabled },
    'min-w-[100px]',
  )
  return (
    <button {...props} type={props.type ?? 'button'} className={binding.buttonClass}>
      <span className={binding.labelClass}>{children}</span>
    </button>
  )
}
export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-[6px] text-sm">
      <span>{label}</span>
      <input {...props} className={fieldClass} />
    </label>
  )
}
export function Multiline({ label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="grid gap-[6px] text-sm">
      <span>{label}</span>
      <textarea {...props} className={fieldClass} rows={props.rows ?? 3} />
    </label>
  )
}
export function Choice({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-[6px] text-sm">
      <span>{label}</span>
      <select {...props} className={fieldClass}>
        {children}
      </select>
    </label>
  )
}
