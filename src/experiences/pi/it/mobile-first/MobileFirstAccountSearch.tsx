import { useState } from 'react'
import { useDemo } from '@/app/state/demoStore'
import {
  accountFilterError,
  accountPeriod,
  matchesAccountMovement,
  type AccountMovement,
  type AccountSearchFilters,
} from '@/features/accounts-payments/mobileFirstAccounts'
import { createAccountExcel, createAccountPdf } from '@/features/accounts-payments/mobileFirstAccountExports'
import search from '@/assets/mobile-first/it/account/imgNavigationAndActionSearchK10.svg'
import share from '@/assets/mobile-first/it/account/imgNavigationAndActionShareK10.svg'
import calendar from '@/assets/mobile-first/it/account/calendar.svg'
import down from '@/assets/mobile-first/it/account/down.svg'
import utilities from '@/assets/mobile-first/it/account/utilities.svg'
import taxes from '@/assets/mobile-first/it/account/taxes.svg'
import expenses from '@/assets/mobile-first/it/account/expenses.svg'
import incomes from '@/assets/mobile-first/it/account/incomes.svg'
import { AccountAmount, AccountButton, AccountPage } from './MobileFirstAccountPrimitives'
import { ACCOUNT_REFERENCE_DATE } from './accountContent'

export default function MobileFirstAccountSearch({
  movements,
  initialFilters,
  initialResults = false,
  onClose,
  onClear,
  onOpenMovement,
  asOf = ACCOUNT_REFERENCE_DATE,
}: {
  movements: readonly AccountMovement[]
  initialFilters: AccountSearchFilters
  initialResults?: boolean
  onClose: () => void
  onClear: () => void
  onOpenMovement: (movement: AccountMovement, filters: AccountSearchFilters) => void
  asOf?: string
}) {
  const { amountsHidden } = useDemo()
  const [view, setView] = useState<'filters' | 'results' | 'share'>(initialResults ? 'results' : 'filters')
  const [draft, setDraft] = useState(initialFilters)
  const [filters, setFilters] = useState(initialFilters)
  const [period, setPeriod] = useState<number | null>(null)
  const [customDates, setCustomDates] = useState(false)
  const [amountRange, setAmountRange] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const update = (key: keyof AccountSearchFilters, value: string) => {
    setDraft({ ...draft, [key]: value })
    setError(null)
  }
  const results = movements.filter((movement) => matchesAccountMovement(movement, filters))
  const icons = { utilities, taxes, expenses, incomes }
  const date = (value: string) => (value ? value.split('-').reverse().join('/') : 'Qualsiasi data')
  const download = (kind: 'xlsx' | 'pdf') => {
    if (amountsHidden) return
    const bytes = kind === 'xlsx' ? createAccountExcel(results) : createAccountPdf(results)
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(bytes).buffer], {
        type: kind === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf',
      }),
    )
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `movimenti.${kind}`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Documento scaricato.')
  }

  if (view === 'filters')
    return (
      <AccountPage
        title="Filtri di ricerca"
        onClose={onClose}
        helpText="Cerca i movimenti per parola chiave, tag, periodo e importo."
        footer={
          <>
            <AccountButton secondary onClick={onClear}>
              Rimuovi Filtri
            </AccountButton>
            <AccountButton
              onClick={() => {
                const problem = accountFilterError(draft)
                setError(problem)
                if (!problem) {
                  setFilters(draft)
                  setView('results')
                }
              }}
            >
              Applica
            </AccountButton>
          </>
        }
      >
        <section className="mf-account-filter-section">
          <h3>Ricerca per Tag</h3>
          <label className="mf-account-tag-search">
            <img src={search} alt="" />
            <input
              type="search"
              aria-label="Ricerca per Tag"
              value={draft.tag}
              placeholder="Scrivi la parola chiave o il tag..."
              onChange={(e) => update('tag', e.target.value)}
            />
          </label>
        </section>
        <section className="mf-account-filter-section">
          <h3>Data</h3>
          <p>Seleziona periodo</p>
          <div className="mf-account-chips">
            {[1, 3, 6, 12].map((months) => (
              <button
                type="button"
                key={months}
                aria-pressed={period === months}
                onClick={() => {
                  setDraft({ ...draft, ...accountPeriod(months, asOf) })
                  setPeriod(months)
                  setCustomDates(true)
                }}
              >
                {months}M
              </button>
            ))}
          </div>
          <div className="mf-account-label">
            <span>Personalizza periodo</span>
            <button
              type="button"
              aria-label="Personalizza periodo"
              className="mf-account-date-trigger"
              onClick={() => setCustomDates(!customDates)}
            >
              <span>
                {draft.from || draft.to ? `${date(draft.from)} - ${date(draft.to)}` : 'gg/mm/aaaa - gg/mm/aaaa'}
              </span>
              <img src={calendar} alt="" />
            </button>
          </div>
          {customDates && (
            <div className="mf-account-filter-grid">
              <label className="mf-account-label">
                Da
                <input
                  type="date"
                  value={draft.from}
                  onChange={(e) => {
                    setPeriod(null)
                    update('from', e.target.value)
                  }}
                />
              </label>
              <label className="mf-account-label">
                A
                <input
                  type="date"
                  value={draft.to}
                  onChange={(e) => {
                    setPeriod(null)
                    update('to', e.target.value)
                  }}
                />
              </label>
            </div>
          )}
        </section>
        <section className="mf-account-filter-section">
          <h3>Importo</h3>
          <p>Seleziona importo</p>
          <button
            type="button"
            className="mf-account-date-trigger"
            aria-label="Seleziona importo"
            aria-expanded={amountRange}
            onClick={() => setAmountRange(!amountRange)}
          >
            <span>
              {amountsHidden
                ? '**,** / **,** €'
                : draft.min || draft.max
                  ? `${draft.min || '0,00'} / ${draft.max || '0,00'} €`
                  : '0,00 / 0,00€'}
            </span>
            <img src={down} alt="" />
          </button>
          {amountRange && (
            <div className="mf-account-filter-grid mf-account-amount-range">
              <label className="mf-account-label">
                Importo minimo
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00 €"
                  disabled={amountsHidden}
                  value={amountsHidden ? '' : draft.min}
                  onChange={(e) => update('min', e.target.value)}
                />
              </label>
              <label className="mf-account-label">
                Importo massimo
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00 €"
                  disabled={amountsHidden}
                  value={amountsHidden ? '' : draft.max}
                  onChange={(e) => update('max', e.target.value)}
                />
              </label>
            </div>
          )}
        </section>
        {error && (
          <p role="alert" className="mf-account-error">
            {error}
          </p>
        )}
      </AccountPage>
    )

  if (view === 'share')
    return (
      <AccountPage title="Condividi movimenti" onClose={() => setView('results')} onBack={() => setView('results')}>
        <AccountButton disabled={amountsHidden || results.length === 0} onClick={() => download('xlsx')}>
          Condividi Excel
        </AccountButton>
        <AccountButton disabled={amountsHidden || results.length === 0} onClick={() => download('pdf')}>
          Condividi PDF
        </AccountButton>
        {notice && (
          <p role="status" className="mf-account-help">
            {notice}
          </p>
        )}
      </AccountPage>
    )

  return (
    <AccountPage title="Risultati di ricerca" onClose={onClose} onBack={() => setView('filters')}>
      <button
        type="button"
        className="mf-account-results-filter"
        aria-label="Filtri di ricerca"
        onClick={() => setView('filters')}
      >
        <img src={search} alt="" />
      </button>
      <div className="mf-account-applied-filters">
        <p>Filtri applicati:</p>
        {filters.tag && (
          <p>
            Tag <strong>{filters.tag}</strong>
          </p>
        )}
        {(filters.from || filters.to) && (
          <p>
            Periodo{' '}
            <strong>
              Da {date(filters.from)} a {date(filters.to)}
            </strong>
          </p>
        )}
        {(filters.min || filters.max) && (
          <p>
            Importo{' '}
            <strong>{amountsHidden ? '**,** € / **,** €' : `${filters.min || '0'}€ / ${filters.max || '∞'}€`}</strong>
          </p>
        )}
      </div>
      <div className="mf-account-results-heading">
        <h3>Movimenti</h3>
        <button
          type="button"
          className="mf-account-text-action"
          disabled={amountsHidden || results.length === 0}
          onClick={() => setView('share')}
        >
          Condividi
          <img src={share} alt="" />
        </button>
      </div>
      {results.length === 0 ? (
        <div className="mf-account-empty">
          <h3>Nessun risultato</h3>
          <p>Non ci sono movimenti corrispondenti ai filtri selezionati.</p>
          <AccountButton secondary onClick={() => setView('filters')}>
            Modifica filtri
          </AccountButton>
        </div>
      ) : (
        results.map((movement) => (
          <button
            type="button"
            className="mf-account-transaction mf-account-result-row"
            key={movement.id}
            onClick={() => onOpenMovement(movement, filters)}
          >
            <span className={`mf-account-category mf-account-category-${movement.icon}`}>
              <img src={icons[movement.icon]} alt="" />
            </span>
            <span className="mf-account-transaction-copy">
              <strong>{movement.name}</strong>
              <span>{movement.category}</span>
              <small>{date(movement.date)}</small>
            </span>
            <span className={movement.amount > 0 ? 'mf-account-incoming' : ''}>
              <AccountAmount value={movement.amount} hidden={amountsHidden} signed />
            </span>
          </button>
        ))
      )}
    </AccountPage>
  )
}
