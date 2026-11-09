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
  // 18 px: the Figma Button and the native PrimaryButton. Pass '16' or '14' only where a screen needs a smaller label.
  labelSize = '18',
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
