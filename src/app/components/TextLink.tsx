import type { ReactNode } from 'react'
import { resolveTextLink } from './contracts/textLink'

interface TextLinkProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  /** Defaults to the visible text; set it when the text alone is not self-explanatory. */
  ariaLabel?: string
  /** Decorative glyph before the text (16px). */
  leadingIcon?: ReactNode
  /** Layout only (margins, alignment). Keep visual styling out of here. */
  className?: string
}

/**
 * The Design System inline text link. Colour follows the action token, so it changes with the
 * single color source (src/app/registry/colorTokens.ts) in light and dark.
 */
export default function TextLink({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  leadingIcon,
  className,
}: TextLinkProps) {
  const link = resolveTextLink({ disabled })
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-ds-label="TextLink"
      className={`inline-flex min-h-[44px] items-center gap-[5px] whitespace-nowrap uc-type-n5-strong text-[var(--uc-action)] transition-opacity active:opacity-[0.65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)] disabled:cursor-not-allowed disabled:opacity-40 ${className ?? ''}`}
      style={{ minHeight: link.minHeight }}
    >
      {leadingIcon ? (
        <span aria-hidden="true" className="inline-flex size-[16px] shrink-0 items-center justify-center">
          {leadingIcon}
        </span>
      ) : null}
      {children}
    </button>
  )
}
