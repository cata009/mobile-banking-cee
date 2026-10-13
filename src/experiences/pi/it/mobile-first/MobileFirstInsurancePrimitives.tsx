import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { useDemo } from '@/app/state/demoStore'
import { insuranceAssets as a } from './insuranceAssets'
import MobileFirstDetailHeader from './MobileFirstDetailHeader'

export function InsuranceAmount({ value }: { value: number }) {
  const { amountsHidden } = useDemo()
  const [integer = '', decimals = '00'] = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: 'always',
  })
    .format(value)
    .split(',')
  return (
    <span className="mf-ins-amount">
      <strong>{amountsHidden ? integer.replace(/\d/g, '*') : integer}</strong>
      <span>,{amountsHidden ? '**' : decimals} €</span>
    </span>
  )
}
export function insuranceDate(value: string) {
  return value.split('-').reverse().join('/')
}
export function InsuranceField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mf-ins-field">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  )
}
export function InsuranceButton({
  children,
  onClick,
  disabled = false,
  secondary = false,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  secondary?: boolean
}) {
  return (
    <button
      type="button"
      className={`mf-ins-button${secondary ? ' mf-ins-button-secondary' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
export function InsuranceLink({
  children,
  onClick,
  disabled = false,
  icon = a.forth,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  icon?: string
}) {
  return (
    <button type="button" className="mf-ins-link" onClick={onClick} disabled={disabled}>
      {children}
      <img src={icon} alt="" />
    </button>
  )
}

/** Existing BottomSheet provides Escape handling, focus trapping and focus restoration. */
export function InsurancePage({
  title,
  subtitle,
  onClose,
  children,
  footer,
  back = false,
  onHelp,
  showHeading = true,
  headerAction,
  modal = true,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  back?: boolean
  onHelp?: () => void
  showHeading?: boolean
  headerAction?: ReactNode
  modal?: boolean
}) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const stableClose = useCallback(() => closeRef.current(), [])
  useEffect(() => {
    if (modal) return
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('[role="dialog"][aria-modal="true"]')) onClose()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [modal, onClose])
  const content = (
    <>
      <MobileFirstDetailHeader
        className="mf-ins-toolbar"
        layout="flow"
        onBack={back ? onClose : undefined}
        onClose={!back ? onClose : undefined}
        onHelp={onHelp}
      />
      <div className="mf-ins-page-scroll">
        {showHeading && (
          <div className="mf-ins-page-heading">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
            {headerAction}
          </div>
        )}
        {children}
      </div>
      {footer && <footer className="mf-ins-footer">{footer}</footer>}
    </>
  )
  return modal ? (
    <BottomSheet
      title={title}
      titleClassName="sr-only"
      headerClassName="mf-ins-hidden-header"
      fillHeight
      maxHeightOffsetPx={0}
      showCloseButton={false}
      className="mf-ins-page"
      bodyClassName="mf-ins-page-body"
      onClose={stableClose}
      closeLabel="Chiudi"
    >
      {content}
    </BottomSheet>
  ) : (
    <main className="mf-ins-primary-page mf-ins-page-body" aria-label={title}>
      {content}
    </main>
  )
}

export function InsuranceQuickAction({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button type="button" className="mf-ins-quick" onClick={onClick} aria-label={label}>
      <span>
        <img src={icon} alt="" />
      </span>
      <span>{label}</span>
    </button>
  )
}
