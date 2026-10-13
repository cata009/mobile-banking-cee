import { useState, type ReactNode } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { useDemo } from '@/app/state/demoStore'
import back from '@/assets/mobile-first/it/investments/common/back.svg'
import close from '@/assets/mobile-first/it/investments/common/close.svg'
import help from '@/assets/mobile-first/it/investments/common/help.svg'
import './mobile-first-investments.css'

export function InvestmentPage({
  title,
  onBack,
  onClose,
  children,
  footer,
  header,
  hideHeading = false,
  contentClassName = '',
}: {
  title: string
  onBack?: () => void
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  header?: ReactNode
  hideHeading?: boolean
  contentClassName?: string
}) {
  const [helpOpen, setHelpOpen] = useState(false)
  return (
    <BottomSheet
      title={title}
      titleClassName="sr-only"
      headerClassName="mfix-hidden-header"
      showCloseButton={false}
      fillHeight
      maxHeightOffsetPx={0}
      className="mfix-page"
      bodyClassName="mfix-page-body"
      closeLabel="Chiudi"
      onClose={onClose}
    >
      {header ?? (
        <header className="mfix-toolbar">
          {onBack && (
            <button type="button" onClick={onBack} aria-label="Indietro">
              <img src={back} alt="" />
            </button>
          )}
          <span />
          <button type="button" aria-label="Aiuto" aria-expanded={helpOpen} onClick={() => setHelpOpen(!helpOpen)}>
            <img src={help} alt="" />
          </button>
          <button type="button" aria-label="Chiudi" onClick={onClose}>
            <img src={close} alt="" />
          </button>
        </header>
      )}
      <ScrollableRegion key={title} className={`mfix-page-scroll ${contentClassName}`} aria-label={title}>
        <h2 className={hideHeading ? 'sr-only' : undefined}>{title}</h2>
        {helpOpen && (
          <p className="mfix-help" role="status">
            Controlla i dati dell’operazione prima di confermare. Per assistenza, contatta il tuo consulente UniCredit.
          </p>
        )}
        {children}
      </ScrollableRegion>
      {footer && <footer className="mfix-page-footer">{footer}</footer>}
    </BottomSheet>
  )
}

export function InvestmentAmount({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const { amountsHidden } = useDemo()
  const [integer, fraction] = new Intl.NumberFormat('it-IT', {
    useGrouping: true,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
    .format(value)
    .split(',')
  return (
    <span className="mfix-amount">
      <strong>{amountsHidden ? '••••' : integer}</strong>
      {!amountsHidden && <span>{fraction ? `,${fraction}` : ''} €</span>}
    </span>
  )
}

export function InvestmentButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button type={type} className="mfix-primary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function InvestmentRows({ rows }: { rows: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="mfix-rows">
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function InvestmentTabs({
  labels,
  value,
  onChange,
}: {
  labels: readonly string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <ScrollableRegion className="mfix-tabs" aria-label="Sezioni">
      <div role="tablist">
        {labels.map((label) => (
          <button key={label} type="button" role="tab" aria-selected={value === label} onClick={() => onChange(label)}>
            {label}
          </button>
        ))}
      </div>
    </ScrollableRegion>
  )
}
