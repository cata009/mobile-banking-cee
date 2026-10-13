import type { ReactNode } from 'react'
import MobileFirstDetailHeader from './MobileFirstDetailHeader'

export function LoanAmount({ value, hidden, small = false }: { value: number; hidden: boolean; small?: boolean }) {
  const [integer, decimals] = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: 'always',
  })
    .format(value)
    .split(',')
  return (
    <span className={`mf-loan-amount${small ? ' mf-loan-amount-small' : ''}`}>
      <strong>{hidden ? '••••' : integer}</strong>
      {!hidden && <span>,{decimals} €</span>}
    </span>
  )
}

export function LoansHeader({
  onBack,
  onClose,
  onHelp,
  onPrivacy,
  hidden,
  onProfile,
}: {
  onBack?: () => void
  onClose?: () => void
  onHelp?: () => void
  onPrivacy?: () => void
  hidden?: boolean
  onProfile?: () => void
}) {
  return (
    <MobileFirstDetailHeader
      className="mf-loans-header"
      onBack={onBack}
      onClose={onClose}
      closeLabel="Chiudi dettaglio"
      onHelp={onHelp}
      onPrivacy={onPrivacy}
      amountsHidden={hidden}
      onProfile={onProfile}
    />
  )
}

export function LoanQuickAction({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button type="button" className="mf-loan-quick" onClick={onClick} aria-label={label}>
      <span>
        <img src={icon} alt="" />
      </span>
      <span>
        {label.startsWith('Info ') || label === 'Simulazione mutuo' ? (
          <>
            {label.split(' ')[0]}
            <br />
            {label.split(' ').slice(1).join(' ')}
          </>
        ) : (
          label
        )}
      </span>
    </button>
  )
}

export function LoanField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mf-loan-field">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  )
}

export function CreditDisclaimer({ expanded = false }: { expanded?: boolean }) {
  return (
    <p className="mf-loan-disclaimer">
      {expanded
        ? 'Messaggio pubblicitario con finalità promozionale. Per le condizioni contrattuali ed economiche del prodotto Mutuo UniCredit fare riferimento alle Informazioni Generali sul Credito Immobiliare ai Consumatori disponibili in filiale. Importo massimo finanziabile variabile in base alla finalità.'
        : 'Nel processo di simulazione sono presenti contenuti con finalità promozionale.'}
    </p>
  )
}

export function formatSimulationDate(value: string) {
  const [date, time] = value.split('T')
  const [year, month, day] = (date ?? '').split('-')
  return `${day}/${month}/${year} - ${(time ?? '').slice(0, 8)}`
}
