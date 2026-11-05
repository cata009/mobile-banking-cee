import type { HTMLAttributes, ReactNode } from 'react'
import { AppIcon } from '@/app/components/icons'

/** Web equivalent of the Native Messages delete reveal. */
export function DeleteActionReveal({
  actionsOpen,
  deleteLabel,
  deleteText = 'DELETE',
  contentId,
  onDelete,
  children,
  className = '',
  ...rootProps
}: HTMLAttributes<HTMLDivElement> & {
  actionsOpen: boolean
  deleteLabel: string
  deleteText?: string
  contentId: string
  onDelete: () => void
  children: ReactNode
}) {
  return (
    <div {...rootProps} className={`relative h-[80px] overflow-hidden ${className}`}>
      <button
        type="button"
        aria-label={deleteLabel}
        aria-hidden={!actionsOpen}
        aria-controls={contentId}
        tabIndex={actionsOpen ? 0 : -1}
        disabled={!actionsOpen}
        onClick={onDelete}
        className={`absolute right-0 top-0 z-20 flex h-full w-[80px] flex-col items-center justify-center gap-[8px] bg-[var(--uc-status-red)] text-[var(--uc-static-white)] transition-opacity duration-[210ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)] ${actionsOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <AppIcon name="trash-2" size={24} color="var(--uc-static-white)" />
        <span className="uc-type-n6-strong text-[14px] leading-[15px]">{deleteText}</span>
      </button>
      {children}
    </div>
  )
}

export function deleteRevealContentClass(actionsOpen: boolean, layoutClass: string) {
  return `relative z-10 h-full bg-[var(--uc-surface)] transition-transform duration-[260ms] ease-[cubic-bezier(0.33,1,0.68,1)] ${layoutClass} ${actionsOpen ? '-translate-x-[24px]' : 'translate-x-0'}`
}

export function MoreActionsButton({
  label,
  actionsOpen,
  contentId,
  onToggle,
}: {
  label: string
  actionsOpen: boolean
  contentId: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className="flex size-[32px] flex-col items-center justify-center gap-[3px] rounded-full transition-colors hover:bg-[var(--uc-border-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
      aria-label={label}
      aria-expanded={actionsOpen}
      aria-controls={contentId}
      onClick={onToggle}
    >
      <span className="size-[4px] rounded-full bg-[var(--uc-text)]" />
      <span className="size-[4px] rounded-full bg-[var(--uc-text)]" />
      <span className="size-[4px] rounded-full bg-[var(--uc-text)]" />
    </button>
  )
}
