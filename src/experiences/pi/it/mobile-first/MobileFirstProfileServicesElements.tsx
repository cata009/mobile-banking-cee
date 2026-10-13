import { useId, type ReactNode } from 'react'
import { createServiceDemoPdf, type ServiceItem } from '../../../../features/profile/mobileFirstProfileServices'
import { ProfileButton, ProfilePage } from './MobileFirstProfilePrimitives'
import { profileServicesAssets as a } from './profileServicesAssets'

export function downloadServicePdf(title: string, lines: string[]) {
  const url = URL.createObjectURL(createServiceDemoPdf(title, lines))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'UniCredit-demo.pdf'
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ServiceSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Seleziona...',
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  placeholder?: string
}) {
  const id = useId()
  return (
    <label className="mf-profile-field" htmlFor={id}>
      <span>{label}</span>
      <span className="mf-services-select-control">
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <img src={a.selectDown} alt="" />
      </span>
    </label>
  )
}
export function ServiceFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mf-services-fact">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  )
}
export function ServiceCard({
  item,
  onClick,
  selected,
  onSelect,
}: {
  item: ServiceItem
  onClick: () => void
  selected?: boolean
  onSelect?: () => void
}) {
  const date = new Date(`${item.date}T12:00:00Z`)
  return (
    <div className="mf-services-card-wrap">
      {onSelect && (
        <label className="mf-services-selection">
          <input type="checkbox" checked={selected} onChange={onSelect} aria-label={`Seleziona ${item.title}`} />
        </label>
      )}
      <button type="button" className={`mf-services-card${item.read ? '' : ' is-unread'}`} onClick={onClick}>
        <span className="mf-services-card-date">
          <strong>{date.getDate().toString().padStart(2, '0')}</strong>
          <small>
            {date
              .toLocaleDateString('it-IT', { month: 'short', year: '2-digit' })
              .replace('.', '')
              .toLocaleUpperCase('it')}
          </small>
        </span>
        <span className="mf-services-card-copy">
          <small>{item.category}</small>
          <strong>{item.title}</strong>
          {item.reference && (
            <span>{item.uploaded ? 'Titolare: Andrea Rossini' : `Riferimento: ${item.reference}`}</span>
          )}
          {item.status && (
            <span className={`mf-services-badge${item.status === 'Incompleta' ? ' is-warning' : ''}`}>
              {item.status}
            </span>
          )}
        </span>
      </button>
    </div>
  )
}
export function ServiceQuickAction({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button className="mf-services-quick" type="button" onClick={onClick}>
      <span>
        <img src={icon} alt="" />
      </span>
      <small>{label}</small>
    </button>
  )
}
export function ServiceTextAction({
  children,
  onClick,
  icon,
}: {
  children: ReactNode
  onClick: () => void
  icon?: string
}) {
  return (
    <button className="mf-services-text-action" type="button" onClick={onClick}>
      {children}
      {icon && <img src={icon} alt="" />}
    </button>
  )
}
export function ServiceSuccess({
  title,
  description,
  onBack,
  onClose,
  children,
  footer,
}: {
  title: string
  description: string
  onBack: () => void
  onClose: () => void
  children?: ReactNode
  footer?: ReactNode
}) {
  return (
    <ProfilePage
      className="mf-services-success"
      chrome="dark"
      title={
        <>
          <img src={a.success} alt="" />
          <span>{title}</span>
        </>
      }
      description={description}
      onBack={onBack}
      onClose={onClose}
      footer={
        footer ?? (
          <ProfileButton secondary onClick={onClose}>
            Chiudi
          </ProfileButton>
        )
      }
    >
      {children}
    </ProfilePage>
  )
}
export function ServiceDocumentPreview({
  title,
  category,
  reference,
  onBack,
  onClose,
  footer,
}: {
  title: string
  category: string
  reference?: string
  onBack: () => void
  onClose: () => void
  footer?: ReactNode
}) {
  return (
    <ProfilePage className="mf-services-preview" title={title} onBack={onBack} onClose={onClose} footer={footer}>
      <div className="mf-services-paper">
        <span className="mf-services-watermark">FACSIMILE</span>
        <header>
          <strong>UniCredit</strong>
          <span>Documenti online e altri documenti</span>
        </header>
        <h2>{title}</h2>
        <p>{category}</p>
        <ServiceFact label="Intestatario">Andrea Rossini</ServiceFact>
        <ServiceFact label="Rapporto">IT 123456789000000012</ServiceFact>
        {reference && <ServiceFact label="Riferimento">{reference}</ServiceFact>}
        <p>Documento dimostrativo del prototipo Mobile Banking. I dati sono esemplificativi.</p>
        <div className="mf-services-paper-lines" aria-hidden="true" />
      </div>
    </ProfilePage>
  )
}
