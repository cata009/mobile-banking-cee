import { Children, cloneElement, isValidElement, useId, useState, type ReactNode } from 'react'
import { useDemo } from '@/app/state/demoStore'
import { InvestmentAmount, InvestmentButton, InvestmentPage, InvestmentRows } from './MobileFirstInvestmentPrimitives'
import {
  investmentServicesDemoCode,
  isValidMobileCode,
  validateInvestmentServiceMobileCode,
} from '@/features/investments/mobileFirstInvestmentServices'
import { servicesAssets } from './investmentsServicesContent'

export function ServiceFrame({
  title,
  embedded,
  onBack,
  onClose,
  children,
  footer,
}: {
  title: string
  embedded?: boolean
  onBack: () => void
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  if (embedded)
    return (
      <section className="mfiv-service">
        <h3>{title}</h3>
        {children}
        {footer && <footer className="mfiv-footer">{footer}</footer>}
      </section>
    )
  const actions: ReactNode[] = []
  const body = moveActions(children)
  function moveActions(nodes: ReactNode): ReactNode {
    return Children.map(nodes, (node) => {
      if (!isValidElement<{ children?: ReactNode }>(node)) return node
      if (node.type === InvestmentButton) {
        actions.push(cloneElement(node, { key: `service-action-${actions.length}` }))
        return null
      }
      return node.props.children === undefined
        ? node
        : cloneElement(node, { children: moveActions(node.props.children) })
    })
  }
  return (
    <InvestmentPage
      title={title}
      onBack={onBack}
      onClose={onClose}
      footer={(footer || actions.length > 0) && <div className="mfiv-footer">{footer ?? actions}</div>}
    >
      <div className="mfiv-service">{body}</div>
    </InvestmentPage>
  )
}

export function ServiceLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="mfiv-link" onClick={onClick}>
      {children}
      <img src={servicesAssets.NavigationAndActionForthT2} alt="" />
    </button>
  )
}

export function ServiceCheck({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="mfiv-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

export function ServiceDocument({
  title,
  image,
  rows,
  reviewed,
  onReview,
}: {
  title: string
  image?: string
  rows?: Array<{ label: string; value: ReactNode }>
  reviewed: boolean
  onReview: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <section className="mfiv-document">
      <h3>{title}</h3>
      <p>Ti raccomandiamo l’attenta lettura della documentazione e delle dichiarazioni contenute.</p>
      {image && <img className="mfiv-document-preview" src={image} alt={title} />}
      <ServiceLink onClick={() => setOpen(!open)}>{open ? 'CHIUDI IL DOCUMENTO' : 'APRI IL DOCUMENTO'}</ServiceLink>
      {open && (
        <div className="mfiv-document-open">
          {image ? <img src={image} alt={`${title} - documento completo`} /> : <InvestmentRows rows={rows ?? []} />}
          <ServiceCheck
            label="Ho preso visione del documento"
            checked={reviewed}
            onChange={(value) => {
              if (value) onReview()
            }}
          />
        </div>
      )}
      {image && (
        <a className="mfiv-link" href={image} download={`${title}.png`}>
          SALVA IL DOCUMENTO
          <img src={servicesAssets.imgNavigationAndActionDownloadT2} alt="" />
        </a>
      )}
      {reviewed && (
        <p role="status" className="mfiv-positive">
          Documento consultato
        </p>
      )}
    </section>
  )
}

export function ServiceMobileCode({ onConfirm }: { onConfirm: () => void }) {
  const [code, setCode] = useState('')
  const [help, setHelp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hintId = useId()
  const changeCode = (value: string) => {
    setCode(value.replace(/\D/g, '').slice(0, 5))
    setError(null)
  }
  return (
    <div className="mfiv-code" data-node-id="24262:779433">
      <p>Inserisci il tuo</p>
      <h3>Mobile Code</h3>
      <label>
        Inserisci il tuo PIN
        <input
          type="password"
          aria-label="Mobile Code"
          aria-describedby={hintId}
          aria-invalid={Boolean(error)}
          inputMode="numeric"
          autoComplete="off"
          maxLength={5}
          value={code}
          onChange={(e) => changeCode(e.target.value)}
        />
      </label>
      <p id={hintId} className="mfiv-disclaimer">
        Per questa demo usa il Mobile Code {investmentServicesDemoCode}.
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="mfiv-keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((value) => (
          <button type="button" key={value} onClick={() => changeCode(code + value)}>
            {value}
          </button>
        ))}
        <button type="button" aria-label="Cancella cifra" onClick={() => changeCode(code.slice(0, -1))}>
          ⌫
        </button>
      </div>
      <ServiceLink onClick={() => setHelp(!help)}>Ho dimenticato il Mobile Code</ServiceLink>
      {help && <p role="status">Puoi reimpostare il Mobile Code dalla sezione Mobile Token del tuo profilo.</p>}
      <InvestmentButton
        disabled={!isValidMobileCode(code)}
        onClick={() => {
          const message = validateInvestmentServiceMobileCode(code)
          if (message) setError(message)
          else onConfirm()
        }}
      >
        Conferma
      </InvestmentButton>
    </div>
  )
}

export function ServiceSuccess({
  title,
  description,
  onClose,
}: {
  title: string
  description?: string
  onClose: () => void
}) {
  return (
    <div className="mfiv-success">
      <img src={servicesAssets.imgNavigationAndActionSuccessLargeTkyPage} alt="" />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <InvestmentButton onClick={onClose}>Chiudi</InvestmentButton>
    </div>
  )
}

export const serviceAmount = (value: number) => <InvestmentAmount value={value} />

export function ServiceCurrencyAmount({ value, currency }: { value: number; currency: string }) {
  const { amountsHidden } = useDemo()
  return (
    <span className="mfix-amount">
      {amountsHidden ? '••••' : new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(value)}
    </span>
  )
}
