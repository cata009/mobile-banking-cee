import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation'
import type { ReactNode } from 'react'
import { useDemo } from '@/app/state/demoStore'
import { InvestmentAmount, InvestmentRows } from './MobileFirstInvestmentPrimitives'
import type { Security } from '@/features/investments/mobileFirstSecurities'
import down from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionDownK10.svg'
import info from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionInfoSmall.svg'
import graph from '@/assets/mobile-first/it/investments/securities/imgGraphLine.svg'
import apple from '@/assets/mobile-first/it/investments/securities/imgBrandApple.png'

export function SecuritiesField({
  label,
  value,
  onChange,
  type = 'text',
  children,
  hint,
  min,
  max,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  children?: ReactNode
  hint?: string
  min?: number
  max?: number
}) {
  return (
    <label className="mfis-field">
      <span>{label}</span>
      {children ? (
        <span className="mfis-select">
          <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
            {children}
          </select>
          <img alt="" src={down} />
        </span>
      ) : (
        <input
          aria-label={label}
          type={type}
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          inputMode={type === 'number' ? 'decimal' : undefined}
        />
      )}{' '}
      {hint && <small>{hint}</small>}
    </label>
  )
}
export function SecuritiesCheck({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="mfis-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  )
}
export function SecuritiesError({ children }: { children: ReactNode }) {
  return children ? (
    <p role="alert" className="mfis-error">
      {children}
    </p>
  ) : null
}
export function SecuritiesLink({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button type="button" className="mfis-link" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
export function SecuritiesQuote({
  security,
  position = false,
  advanced = false,
  onClick,
}: {
  security: Security
  position?: boolean
  advanced?: boolean
  onClick?: () => void
}) {
  const averageCost = security.averageCost
  const performance = position
    ? security.quantity > 0 && averageCost !== undefined && averageCost > 0
      ? (security.price / averageCost - 1) * 100
      : undefined
    : security.change
  const content = (
    <>
      <div className="mfis-card-heading">
        <div>
          <strong>{security.name}</strong>
          <small>{security.market}</small>
        </div>
        <div>
          <small>{position ? 'CTV Mercato' : 'Ultimo prezzo'}</small>
          <InvestmentAmount
            value={position ? Math.round(security.price * security.quantity * 100) / 100 : security.price}
            decimals={!position && security.price < 1 ? 4 : 2}
          />
        </div>
      </div>
      <div className="mfis-card-heading">
        <div>
          <small>{position ? 'Qtà.' : 'ISIN'}</small>
          <strong>{position ? security.quantity : security.isin}</strong>
        </div>
        <div>
          <small>{position ? 'P&L | %' : 'Variazione | %'}</small>
          <span className={performance !== undefined && performance < 0 ? 'mfis-negative' : 'mfis-positive'}>
            {performance === undefined
              ? 'N.D.'
              : `${performance > 0 ? '+' : ''}${performance.toFixed(2).replace('.', ',')}%`}
          </span>
        </div>
      </div>
      {advanced && (
        <InvestmentRows
          rows={[
            {
              label: 'Prezzo medio di carico',
              value: averageCost === undefined ? 'N.D.' : <InvestmentAmount value={averageCost} />,
            },
            {
              label: 'Valore di carico',
              value: security.costCents === undefined ? 'N.D.' : <InvestmentAmount value={security.costCents / 100} />,
            },
            { label: 'Performance 1A', value: `${security.performance}%` },
            { label: 'Dividend Yield', value: `${((security.dividend / security.price) * 100).toFixed(2)}%` },
          ]}
        />
      )}
      <small>Aggiornato al {formatInvestmentReferenceDate()} (dati demo)</small>
    </>
  )
  return onClick ? (
    <button type="button" className="mfis-quote" onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className="mfis-quote">{content}</div>
  )
}
export function SecuritiesChart({
  period,
  onPeriod,
  advanced = false,
  security,
}: {
  security: Security
  period: string
  onPeriod: (period: string) => void
  advanced?: boolean
}) {
  const { amountsHidden } = useDemo()
  return (
    <div className={advanced ? 'mfis-chart mfis-chart-advanced' : 'mfis-chart'}>
      <div className="mfis-periods">
        {['1G', '1M', '3M', 'YTD', '1A', '5A', 'MAX'].map((label) => (
          <button type="button" key={label} aria-pressed={period === label} onClick={() => onPeriod(label)}>
            {label}
          </button>
        ))}
      </div>
      <div className="mfis-chart-plot">
        <img src={graph} alt={`Andamento del prezzo, periodo ${period}`} />
        <div className="mfis-axis">
          {[security.price, security.price / (1 + security.change / 100)]
            .map((value) => value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 4 }))
            .map((value) => (
              <span key={value}>{amountsHidden ? '••••' : value}</span>
            ))}
        </div>
      </div>
      <div className="mfis-axis-x">
        <span>9:00</span>
        <span>12:00</span>
        <span>15:00</span>
        <span>18:00</span>
        <span>21:00</span>
      </div>
      <div className="mfis-performance">
        <small>Performance</small>
        <strong>
          {security.change > 0 ? '+' : ''}
          {security.change.toLocaleString('it-IT')}%
        </strong>
        <div />
        <span>
          Min.{' '}
          {amountsHidden
            ? '••••'
            : Math.min(security.price, security.price / (1 + security.change / 100)).toLocaleString('it-IT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}
        </span>
        <span>
          Max.{' '}
          {amountsHidden
            ? '••••'
            : Math.max(security.price, security.price / (1 + security.change / 100)).toLocaleString('it-IT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}
        </span>
      </div>
    </div>
  )
}
export function SecuritiesBrand({ security }: { security: Security }) {
  return security.id === 'apple' ? <img src={apple} className="mfis-brand" alt="Apple" /> : null
}
export function SecuritiesInfo({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="mfis-info" aria-label={label} onClick={onClick}>
      <img src={info} alt="" />
    </button>
  )
}
