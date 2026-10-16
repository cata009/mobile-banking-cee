import type { PrimaryButtonOptions } from './contracts/primaryButton'
import { primaryButtonWeb } from './contracts/primaryButtonWeb'

interface PrimaryButtonProps extends PrimaryButtonOptions {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'action',
  labelSize = '16',
}: PrimaryButtonProps) {
  const web = primaryButtonWeb({ variant, labelSize, disabled }, className)

  return (
    <button
      type={web.type}
      onClick={onClick}
      disabled={web.disabled}
      className={web.buttonClass}
    >
      <span className={web.labelClass}>{children}</span>
    </button>
  )
}
