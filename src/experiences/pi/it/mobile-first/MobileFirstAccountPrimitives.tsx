import { createContext, useContext, useState, type ReactNode } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import edit from '@/assets/mobile-first/it/account/edit.svg'
import forth from '@/assets/mobile-first/it/account/imgNavigationAndActionForthT2.svg'
import { useDemo } from '@/app/state/demoStore'
import MobileFirstDetailHeader from './MobileFirstDetailHeader'

export const AccountProfileContext = createContext<(() => void) | null>(null)

export function AccountAmount({ value, hidden, signed = false }: { value: number; hidden: boolean; signed?: boolean }) {
  const [integer = '', decimals = '00'] = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: 'always',
    signDisplay: signed ? 'always' : 'auto',
  })
    .format(value)
    .split(',')
  return (
    <span className="mf-account-amount">
      <strong>{hidden ? integer.replace(/\d/g, '*') : integer}</strong>
      <span>,{hidden ? '**' : decimals} €</span>
    </span>
  )
}

/** Keeps the application's focus trap and Escape restoration in full-page account views. */
export function AccountPage({
  title,
  subtitle,
  onClose,
  onBack,
  onProfile,
  children,
  footer,
  helpText,
  list = false,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  onBack?: () => void
  onProfile?: () => void
  children: ReactNode
  footer?: ReactNode
  helpText?: string
  list?: boolean
}) {
  const [helpOpen, setHelpOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const inheritedProfile = useContext(AccountProfileContext)
  const openProfile = onProfile ?? inheritedProfile
  const { amountsHidden, toggleAmountsHidden } = useDemo()
  const navigationHeader = list || title === 'Modifica nome del conto'
  return (
    <BottomSheet
      title={title}
      titleClassName="sr-only"
      headerClassName="mf-account-overlay-hidden"
      showCloseButton={false}
      fillHeight
      maxHeightOffsetPx={0}
      className="mf-account-overlay"
      bodyClassName="mf-account-overlay-body"
      closeLabel="Chiudi"
      onClose={onClose}
    >
      <MobileFirstDetailHeader
        className="mf-account-overlay-toolbar"
        layout="flow"
        onBack={navigationHeader ? (onBack ?? onClose) : undefined}
        onClose={!navigationHeader ? onClose : undefined}
        onHelp={helpText ? () => setHelpOpen(!helpOpen) : undefined}
        helpExpanded={helpText ? helpOpen : undefined}
        onProfile={list && !helpText ? (openProfile ?? (() => setProfileOpen(!profileOpen))) : undefined}
        profileExpanded={openProfile ? undefined : profileOpen}
      />
      <div className="mf-account-overlay-scroll">
        <div className="mf-account-overlay-title" data-account-page-title={title}>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {helpOpen && (
          <p className="mf-account-help" role="status">
            {helpText}
          </p>
        )}
        {profileOpen && (
          <div className="mf-account-help" role="region" aria-label="Profilo">
            <AccountButton onClick={toggleAmountsHidden}>
              {amountsHidden ? 'Mostra importi' : 'Nascondi importi'}
            </AccountButton>
          </div>
        )}
        {children}
      </div>
      {footer && <footer className="mf-account-overlay-footer">{footer}</footer>}
    </BottomSheet>
  )
}

export function AccountButton({
  children,
  onClick,
  disabled = false,
  secondary = false,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  secondary?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      className={`mf-account-primary${secondary ? ' mf-account-secondary' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function AccountSettingRow({
  label,
  value,
  action = 'Visualizza',
  onClick,
  editIcon = false,
}: {
  label: string
  value?: ReactNode
  action?: string
  onClick: () => void
  editIcon?: boolean
}) {
  return (
    <button type="button" className="mf-account-setting-row" aria-label={`${label} ${action}`} onClick={onClick}>
      <span>
        <span>{label}</span>
        {value && <strong>{value}</strong>}
      </span>
      <span className="mf-account-text-action">
        {action}
        <img src={editIcon ? edit : forth} alt="" />
      </span>
    </button>
  )
}

export function AccountField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mf-account-info-field">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  )
}
