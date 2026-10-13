import type { ReactNode } from 'react'
import PfmCategoryIcon from '@/app/components/pfm/PfmCategoryIcon'
import { useDemo } from '@/app/state/demoStore'
import { pfmAssets as a } from './pfmAssets'
import type { PfmCategory, PfmMovement } from './pfmContent'

export function PfmAmount({ value, large = false }: { value: number; large?: boolean }) {
  const { amountsHidden } = useDemo()
  const [integer, decimals] = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(value)
    .split(',')
  return (
    <span className={`mf-pfm-amount${large ? ' mf-pfm-amount-large' : ''}`}>
      <strong>{amountsHidden ? '••••' : integer}</strong>
      {!amountsHidden && <span>,{decimals} €</span>}
    </span>
  )
}

export function PfmMark({ category }: { category: PfmCategory }) {
  const exactIcons: Record<string, string> = {
    'Cura della persona': a.s.imgPath2,
    Trasporti: a.s.imgPath3,
    'Alimentari e spesa': a.s.imgPath4,
    Investimenti: a.w.imgBankProductAndServiceInvestments,
    'Beni personali': a.w.imgMiscellaneousSocialActivity,
    'Mezzi di trasporto': a.w.imgTransportAndUtilityPrivateTransport,
    'Tempo libero e viaggi': a.b.imgLifeAndPeopleLeisureTime,
    'Mutuo e prestito': a.l.imgBankProductAndServiceMortgages,
    'Carta di credito': a.l.imgHomeBankingAndPaymentsCash,
    Liquidità: a.l.imgBankProductAndServiceLoans,
    Utenze: a.r.imgPath2,
    'Assicurazioni e finanziamenti': a.grid.imgPath7,
    'Tasse e sanzioni': a.grid.imgPath3,
    'Scuola e formazione': a.grid.imgPath8,
    Salute: a.grid.imgPath12,
    Shopping: a.grid.imgPath6,
    'Alimentari e spese': a.grid.imgPath6,
    'Investimenti e patrimonio': a.grid.imgPath13,
    Contanti: a.grid.imgPath1,
  }
  const exact =
    exactIcons[category.name] ??
    (category.name === 'Altro'
      ? category.color === '#b9595a'
        ? a.l.imgNomeAltroTipologiaImpegniFinanziari
        : a.w.imgIconsPfmGrafico
      : null)
  return (
    <span className="mf-pfm-mark" style={{ backgroundColor: category.color }}>
      {exact ? (
        <img src={exact} alt="" />
      ) : (
        <PfmCategoryIcon
          category={category.glyph === 'Uncategorized' ? 'Finance' : category.glyph}
          color="white"
          size={16}
        />
      )}
    </span>
  )
}

export function PfmRow({
  label,
  value,
  category,
  detail,
  children,
  onClick,
}: {
  label: string
  value?: number
  category?: PfmCategory
  detail?: string
  children?: ReactNode
  onClick?: () => void
}) {
  const body = (
    <>
      {category && <PfmMark category={category} />}
      <span className="mf-pfm-row-copy">
        <span>{label}</span>
        {detail && <small>{detail}</small>}
      </span>
      {children}
      {value !== undefined && <PfmAmount value={value} />}
    </>
  )
  return onClick ? (
    <button type="button" className="mf-pfm-row" onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className="mf-pfm-row">{body}</div>
  )
}

export function PfmMovements({
  movements,
  onOpen,
}: {
  movements: readonly PfmMovement[]
  onOpen: (movement: PfmMovement) => void
}) {
  return (
    <div className="mf-pfm-movements">
      {movements.map((movement, i) => (
        <div key={movement.id}>
          {movement.group !== movements[i - 1]?.group && <h3>{movement.group}</h3>}
          <PfmRow
            label={movement.name}
            value={Math.abs(movement.amount)}
            detail={`${movement.subcategory} · ${movement.date}`}
            onClick={() => onOpen(movement)}
          />
        </div>
      ))}
    </div>
  )
}

export function PfmSegment({
  labels,
  value,
  onChange,
  label,
}: {
  labels: readonly string[]
  value: string
  onChange: (value: string) => void
  label: string
}) {
  return (
    <div className="mf-pfm-segment" role="tablist" aria-label={label}>
      {labels.map((name) => (
        <button
          type="button"
          key={name}
          role="tab"
          aria-selected={name === value}
          tabIndex={name === value ? 0 : -1}
          onClick={() => onChange(name)}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
            event.preventDefault()
            const next =
              labels[(labels.indexOf(name) + (event.key === 'ArrowRight' ? 1 : labels.length - 1)) % labels.length]!
            onChange(next)
            const buttons = event.currentTarget.parentElement?.querySelectorAll('button')
            buttons?.[labels.indexOf(next)]?.focus()
          }}
        >
          {name}
        </button>
      ))}
    </div>
  )
}

export function PfmQuickAction({ label, src, onClick }: { label: string; src: string; onClick: () => void }) {
  return (
    <button type="button" className="mf-pfm-quick" onClick={onClick}>
      <span>
        <img src={src} alt="" />
      </span>
      <small>{label}</small>
    </button>
  )
}

export function PfmLink({
  children,
  onClick,
  arrow = false,
}: {
  children: ReactNode
  onClick: () => void
  arrow?: boolean
}) {
  return (
    <button type="button" className="mf-pfm-link" onClick={onClick}>
      {!arrow && <img src={a.s.imgDeviceAndTechnologyScreenRotationK10} alt="" />}
      {children}
      {arrow && <img src={a.b.imgNavigationAndActionForthT2} alt="" />}
    </button>
  )
}

export function PfmSuggestion() {
  return <div className="mf-pfm-suggestion">Consulta le categorie per capire come cambiano le tue spese.</div>
}

export function PfmChips({
  labels,
  value,
  onChange,
}: {
  labels: readonly string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="mf-pfm-chips">
      {labels.map((name) => (
        <button type="button" key={name} aria-pressed={name === value} onClick={() => onChange(name)}>
          {name === value && <img src={a.s.imgNavigationAndActionSingleTickT2} alt="" />}
          {name}
        </button>
      ))}
    </div>
  )
}

export function PfmDonut({
  kind = 'spend',
  value,
  categories = [],
  onCategory,
}: {
  kind?: 'spend' | 'wealth' | 'report' | 'liabilities'
  value: number
  categories?: readonly PfmCategory[]
  onCategory?: (index: number) => void
}) {
  const { amountsHidden } = useDemo()
  const label = kind === 'wealth' || kind === 'liabilities' ? 'Totali' : 'Spese totali'
  const total = categories.reduce((sum, item) => sum + item.amount, 0)
  let offset = 0
  return (
    <div className={`mf-pfm-donut mf-pfm-donut-${kind}`}>
      <div
        className="mf-pfm-arcs"
        role="img"
        aria-label={`${label}: ${amountsHidden ? 'importo nascosto' : new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2 }).format(value)} €`}
      >
        <svg className="mf-pfm-live-ring" viewBox="0 0 234 234" aria-hidden="true">
          <circle cx="117" cy="117" r="101" fill="none" stroke="#eee" strokeWidth="30" />
          {categories.map((item) => {
            const share = total ? (item.amount / total) * 100 : 0
            const start = offset
            offset += share
            return (
              <circle
                key={item.name}
                cx="117"
                cy="117"
                r="101"
                fill="none"
                stroke={item.color}
                strokeWidth="30"
                pathLength="100"
                strokeDasharray={`${share} ${100 - share}`}
                strokeDashoffset={-start}
                transform="rotate(-90 117 117)"
              />
            )
          })}
        </svg>
        <div className="mf-pfm-donut-total">
          <span>{label}</span>
          <PfmAmount value={value} />
        </div>
      </div>
      {categories.slice(0, 5).map((item, index) => (
        <button
          type="button"
          key={item.name}
          className={`mf-pfm-chart-mark mf-pfm-chart-mark-${index}`}
          style={{ backgroundColor: item.color }}
          aria-label={`Dettaglio ${item.name}`}
          onClick={() => onCategory?.(index)}
        >
          <PfmMark category={item} />
        </button>
      ))}
    </div>
  )
}
