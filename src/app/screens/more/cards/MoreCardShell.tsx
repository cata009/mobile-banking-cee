import type { ReactNode } from 'react'
import { moreCardWeb } from '@/app/components/contracts/moreCardWeb'
import type { MoreCardVariant } from '@/app/components/contracts/moreCard'

/** Exact common shell; each named wrapper supplies its unchanged art node and crop. */
export function MoreCardShell({
  variant,
  title,
  onClick,
  badgeCount,
  artwork,
}: {
  variant: MoreCardVariant
  title: string
  onClick: () => void
  badgeCount?: number
  artwork: ReactNode
}) {
  const contract = moreCardWeb({ variant, badgeCount })
  return (
    <button
      onClick={onClick}
      className={contract.buttonClass}
      style={{ boxShadow: 'var(--pi-menu-card-shadow, none)' }}
    >
      <div className="absolute inset-0" style={{ background: contract.background }} />
      {artwork}
      <div className="absolute inset-0 p-[16px] flex items-start">
        <p className={contract.titleClass}>{title}</p>
      </div>
      {contract.badgeText !== null && (
        <div className="absolute right-0 top-0 size-[32px] z-20">
          <div className="absolute right-0 top-0 h-[30px] w-[30px] rounded-bl-[30px] bg-[var(--uc-brand)]" />
          <div className="absolute right-[7px] top-[4px]">
            <span className={contract.badgeClass} style={contract.badgeStyle}>
              {contract.badgeText}
            </span>
          </div>
        </div>
      )}
    </button>
  )
}
