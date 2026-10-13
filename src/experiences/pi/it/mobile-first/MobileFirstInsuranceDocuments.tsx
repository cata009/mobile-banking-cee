import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import MobileFirstInsuranceHelp from './MobileFirstInsuranceHelp'
import { useDemo } from '@/app/state/demoStore'
import {
  filterInsuranceDocuments,
  getInsuranceSnapshot,
  insurancePeriod,
  markInsuranceDocumentRead,
  recordInsuranceRequest,
  saveInsuranceDocumentFilter,
  subscribeInsurance,
  validInsuranceCertificateYear,
  validateInsuranceDocumentFilter,
  type InsuranceDocument,
  type InsuranceDocumentFilter,
  type InsurancePolicy,
} from '@/features/insurance/mobileFirstInsurance'
import { createInsuranceExport } from '@/features/insurance/mobileFirstInsuranceExports'
import {
  DEFAULT_INSURANCE_DOCUMENT_FILTER,
  INSURANCE_DOCUMENT_CATEGORIES,
  INSURANCE_REFERENCE_DATE,
  INSURANCE_REFERENCE_YEAR,
  insuranceDocuments,
} from './insuranceContent'
import { insuranceAssets as a } from './insuranceAssets'
import { InsuranceButton, InsuranceLink, InsurancePage, insuranceDate } from './MobileFirstInsurancePrimitives'

type DocumentView = 'list' | 'filters' | 'dates' | 'category' | 'share' | 'pdf' | 'request'
function CalendarMonth({
  value,
  onChoose,
  onPrevious,
  onNext,
}: {
  value: string
  onChoose: (date: string) => void
  onPrevious: () => void
  onNext: () => void
}) {
  const date = new Date(`${value || INSURANCE_REFERENCE_DATE}T12:00:00Z`)
  const year = date.getUTCFullYear(),
    month = date.getUTCMonth(),
    days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const start = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7
  const caption = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
  return (
    <div className="mf-ins-calendar">
      <div>
        <button type="button" aria-label={`Mese precedente ${caption}`} onClick={onPrevious}>
          <img src={a.calendarBack} alt="" />
        </button>
        <strong>{caption}</strong>
        <button type="button" aria-label={`Mese successivo ${caption}`} onClick={onNext}>
          <span className="mf-ins-calendar-next">
            <img src={a.calendarBack} alt="" />
          </span>
        </button>
      </div>
      <div className="mf-ins-calendar-grid">
        {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, i) => (
          <span key={`day-${i}`}>{day}</span>
        ))}
        {Array.from({ length: start }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
          return (
            <button
              type="button"
              key={iso}
              aria-label={insuranceDate(iso)}
              aria-pressed={iso === value}
              onClick={() => onChoose(iso)}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function MobileFirstInsuranceDocuments({
  policy,
  onClose,
  onContact,
}: {
  policy: InsurancePolicy
  onClose: () => void
  onHelp?: () => void
  onContact?: (channel: 'chat' | 'phone') => void
}) {
  const { amountsHidden } = useDemo()
  const snapshot = useSyncExternalStore(subscribeInsurance, getInsuranceSnapshot, getInsuranceSnapshot)
  const documents = useMemo(() => insuranceDocuments(policy.id), [policy.id])
  const [view, setView] = useState<DocumentView>('list')
  const [filters, setFilters] = useState<InsuranceDocumentFilter>(
    snapshot.documentFilters[policy.id] ?? DEFAULT_INSURANCE_DOCUMENT_FILTER,
  )
  const [draft, setDraft] = useState<InsuranceDocumentFilter>(filters)
  const [period, setPeriod] = useState<number | null>(6)
  const [selected, setSelected] = useState<string[]>([])
  const [document, setDocument] = useState<InsuranceDocument | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [request, setRequest] = useState<'Attestazione ISEE' | 'Titolarità conto'>('Attestazione ISEE')
  const [year, setYear] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const showHelp = useCallback(() => setHelpOpen(true), [])
  const hideHelp = useCallback(() => setHelpOpen(false), [])
  const results = filterInsuranceDocuments(documents, filters)
  const selectedDocuments = results.filter((d) => selected.includes(d.id))
  const allSelected = results.length > 0 && selectedDocuments.length === results.length
  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    },
    [pdfUrl],
  )
  const download = (rows: readonly InsuranceDocument[], format: 'pdf' | 'xlsx') => {
    if (amountsHidden || !rows.length) return
    try {
      const bytes = createInsuranceExport(policy, rows, format)
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(bytes).buffer], {
          type:
            format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      )
      const anchor = window.document.createElement('a')
      anchor.href = url
      anchor.download = `documenti-polizza-${policy.number}.${format}`
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setNotice('Documento scaricato.')
    } catch {
      setError('Il documento non è disponibile. Riprova.')
    }
  }
  const openDocument = (item: InsuranceDocument) => {
    setDocument(item)
    markInsuranceDocumentRead(item.id)
    setNotice('')
    setView('pdf')
    if (typeof URL.createObjectURL === 'function')
      setPdfUrl(
        URL.createObjectURL(
          new Blob([new Uint8Array(createInsuranceExport(policy, [item], 'pdf', amountsHidden)).buffer], {
            type: 'application/pdf',
          }),
        ),
      )
  }
  const changeMonth = (key: 'from' | 'to', delta: number) => {
    const date = new Date(`${draft[key] || INSURANCE_REFERENCE_DATE}T12:00:00Z`)
    date.setUTCDate(1)
    date.setUTCMonth(date.getUTCMonth() + delta)
    setDraft({ ...draft, [key]: date.toISOString().slice(0, 10) })
    setPeriod(null)
  }
  const openRequest = (kind: typeof request) => {
    setRequest(kind)
    setYear('')
    setNotice('')
    setView('request')
  }

  if (helpOpen) return <MobileFirstInsuranceHelp onClose={hideHelp} onContact={onContact} />
  if (view === 'pdf' && document)
    return (
      <InsurancePage
        title={document.title}
        onClose={() => setView('list')}
        footer={
          <InsuranceButton disabled={amountsHidden} onClick={() => download([document], 'pdf')}>
            Condividi PDF
          </InsuranceButton>
        }
      >
        {pdfUrl ? (
          <iframe className="mf-ins-pdf" title={`${document.title} PDF`} src={pdfUrl} />
        ) : (
          <div className="mf-ins-pdf-fallback">
            <strong>FACSIMILE</strong>
            <p>{policy.name}</p>
            <p>Numero polizza {policy.number}</p>
            <p>{document.reference}</p>
          </div>
        )}
        {notice && <p role="status">{notice}</p>}
        {error && <p role="alert">{error}</p>}
      </InsurancePage>
    )
  if (view === 'request')
    return (
      <InsurancePage
        title={request}
        subtitle={policy.name}
        onClose={() => setView('list')}
        footer={
          <InsuranceButton
            disabled={
              !!notice ||
              (request === 'Attestazione ISEE' && !validInsuranceCertificateYear(year, INSURANCE_REFERENCE_YEAR))
            }
            onClick={() => {
              recordInsuranceRequest(policy.id, request, year || undefined)
              setNotice('Richiesta registrata. Il documento sarà disponibile nella sezione Documenti.')
            }}
          >
            Richiedi
          </InsuranceButton>
        }
      >
        {request === 'Attestazione ISEE' ? (
          <label className="mf-ins-label">
            Anno di riferimento
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Seleziona anno</option>
              {[2024, 2023, 2022, 2021, 2020].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        ) : (
          <p>Richiedi il documento di titolarità del conto associato alla polizza.</p>
        )}
        {notice && (
          <p className="mf-ins-notice" role="status">
            {notice}
          </p>
        )}
      </InsurancePage>
    )
  if (view === 'dates')
    return (
      <InsurancePage
        title="Data"
        onClose={() => setView('filters')}
        footer={
          <InsuranceButton
            onClick={() => {
              const problem = validateInsuranceDocumentFilter(draft)
              setError(problem)
              if (!problem) setView('filters')
            }}
          >
            Salva
          </InsuranceButton>
        }
      >
        <div className="mf-ins-field-grid">
          <label className="mf-ins-label">
            Data iniziale
            <input
              type="date"
              value={draft.from}
              onChange={(e) => {
                setDraft({ ...draft, from: e.target.value })
                setPeriod(null)
              }}
            />
          </label>
          <label className="mf-ins-label">
            Data finale
            <input
              type="date"
              value={draft.to}
              onChange={(e) => {
                setDraft({ ...draft, to: e.target.value })
                setPeriod(null)
              }}
            />
          </label>
        </div>
        <CalendarMonth
          value={draft.from}
          onChoose={(value) => {
            setDraft({ ...draft, from: value })
            setPeriod(null)
          }}
          onPrevious={() => changeMonth('from', -1)}
          onNext={() => changeMonth('from', 1)}
        />
        <CalendarMonth
          value={draft.to}
          onChoose={(value) => {
            setDraft({ ...draft, to: value })
            setPeriod(null)
          }}
          onPrevious={() => changeMonth('to', -1)}
          onNext={() => changeMonth('to', 1)}
        />
        {error && (
          <p className="mf-ins-error" role="alert">
            {error}
          </p>
        )}
      </InsurancePage>
    )
  if (view === 'category')
    return (
      <InsurancePage
        title="Seleziona la categoria"
        onClose={() => setView('filters')}
        footer={<InsuranceButton onClick={() => setView('filters')}>Conferma</InsuranceButton>}
      >
        {INSURANCE_DOCUMENT_CATEGORIES.map((group) => (
          <section className="mf-ins-category-group" key={group.heading}>
            <h3>{group.heading}</h3>
            {group.values.map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={draft.category === value}
                onClick={() => setDraft({ ...draft, category: value })}
              >
                {value}
                {draft.category === value && <span aria-hidden="true">✓</span>}
              </button>
            ))}
          </section>
        ))}
      </InsurancePage>
    )
  if (view === 'filters')
    return (
      <InsurancePage
        title="Filtri di ricerca"
        onClose={() => setView('list')}
        onHelp={showHelp}
        footer={
          <>
            <InsuranceButton
              secondary
              onClick={() => {
                setFilters({ from: '', to: '', category: '' })
                saveInsuranceDocumentFilter(policy.id, { from: '', to: '', category: '' })
                setDraft({ from: '', to: '', category: '' })
                setSelected([])
                setView('list')
              }}
            >
              Rimuovi Filtri
            </InsuranceButton>
            <InsuranceButton
              onClick={() => {
                const problem = validateInsuranceDocumentFilter(draft)
                setError(problem)
                if (!problem) {
                  setFilters(draft)
                  saveInsuranceDocumentFilter(policy.id, draft)
                  setSelected([])
                  setView('list')
                }
              }}
            >
              Applica
            </InsuranceButton>
          </>
        }
      >
        <section className="mf-ins-filter-section">
          <h3>Data</h3>
          <div className="mf-ins-periods">
            {[3, 6, 12].map((months) => (
              <button
                key={months}
                type="button"
                aria-pressed={period === months}
                onClick={() => {
                  setPeriod(months)
                  setDraft({ ...draft, ...insurancePeriod(months, INSURANCE_REFERENCE_DATE) })
                }}
              >
                {period === months && <img src={a.tick} alt="" aria-hidden="true" />}
                {months}M
              </button>
            ))}
          </div>
          <p>Personalizza periodo</p>
          <button
            type="button"
            className="mf-ins-select-button"
            aria-label="Personalizza periodo"
            onClick={() => {
              setError(null)
              setView('dates')
            }}
          >
            <span>
              {draft.from ? insuranceDate(draft.from) : 'gg/mm/aaaa'} -{' '}
              {draft.to ? insuranceDate(draft.to) : 'gg/mm/aaaa'}
            </span>
            <img src={a.calendar} alt="" />
          </button>
        </section>
        <section className="mf-ins-filter-section">
          <h3>Documento</h3>
          <p>Seleziona documento</p>
          <button type="button" className="mf-ins-select-button" onClick={() => setView('category')}>
            <span>{draft.category || 'Scegli il documento'}</span>
            <span className="mf-ins-dropdown-icon">
              <img src={a.dropdown} alt="" />
            </span>
          </button>
        </section>
        {error && (
          <p className="mf-ins-error" role="alert">
            {error}
          </p>
        )}
      </InsurancePage>
    )
  if (view === 'share')
    return (
      <InsurancePage
        title="Condividi documenti"
        onClose={() => setView('list')}
        footer={
          <>
            <InsuranceButton
              disabled={!selectedDocuments.length || amountsHidden}
              onClick={() => download(selectedDocuments, 'xlsx')}
            >
              Condividi Excel
            </InsuranceButton>
            <InsuranceButton
              disabled={!selectedDocuments.length || amountsHidden}
              onClick={() => download(selectedDocuments, 'pdf')}
            >
              Condividi PDF
            </InsuranceButton>
          </>
        }
      >
        <label className="mf-ins-check">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => setSelected(allSelected ? [] : results.map((d) => d.id))}
          />
          Seleziona tutti i documenti
        </label>
        {results.map((item) => (
          <label
            className="mf-ins-check mf-ins-document-selection"
            key={item.id}
            aria-label={`Seleziona ${item.title} ${insuranceDate(item.date)}`}
          >
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() =>
                setSelected(
                  selected.includes(item.id) ? selected.filter((id) => id !== item.id) : [...selected, item.id],
                )
              }
            />
            <span>
              <strong>{item.title}</strong>
              <span>{insuranceDate(item.date)}</span>
              <span>Riferimento: {item.reference}</span>
            </span>
          </label>
        ))}
        {notice && <p role="status">{notice}</p>}
        {error && <p role="alert">{error}</p>}
      </InsurancePage>
    )
  return (
    <InsurancePage
      title="Documenti"
      onClose={onClose}
      headerAction={
        <button
          type="button"
          className="mf-ins-document-filter"
          aria-label="Filtri di ricerca"
          onClick={() => {
            setDraft(filters)
            setError(null)
            setView('filters')
          }}
        >
          <img src={a.filter} alt="" />
        </button>
      }
    >
      <div className="mf-ins-applied">
        <p>Filtri applicati:</p>
        {(filters.from || filters.to) && (
          <p>
            Periodo:{' '}
            <strong>
              {filters.from ? insuranceDate(filters.from) : 'Qualsiasi data'} -{' '}
              {filters.to ? insuranceDate(filters.to) : 'Qualsiasi data'}
            </strong>
          </p>
        )}
        {filters.category && (
          <p>
            Documento: <strong>{filters.category}</strong>
          </p>
        )}
      </div>
      <div className="mf-ins-document-requests">
        <button type="button" aria-label="Attestazione ISEE Richiedi" onClick={() => openRequest('Attestazione ISEE')}>
          <strong>
            Attestazione
            <br />
            ISEE
          </strong>
          <span>
            Richiedi <img src={a.forthWhite} alt="" />
          </span>
        </button>
        <button type="button" aria-label="Titolarità conto Richiedi" onClick={() => openRequest('Titolarità conto')}>
          <strong>
            Titolarità
            <br />
            conto
          </strong>
          <span>
            Richiedi <img src={a.forthWhite} alt="" />
          </span>
        </button>
      </div>
      <div className="mf-ins-document-share">
        <InsuranceLink
          icon={a.share}
          disabled={!results.length || amountsHidden}
          onClick={() => {
            setNotice('')
            setSelected([])
            setView('share')
          }}
        >
          Condividi
        </InsuranceLink>
      </div>
      <div className="mf-ins-document-list">
        {results.map((item) => {
          const date = new Date(`${item.date}T12:00:00Z`)
          const month = new Intl.DateTimeFormat('it-IT', { month: 'short', timeZone: 'UTC' })
            .format(date)
            .replace('.', '')
            .toLocaleUpperCase('it')
          return (
            <button
              type="button"
              className={`mf-ins-document-row${item.read || snapshot.readDocuments.includes(item.id) ? ' mf-ins-document-read' : ''}`}
              aria-label={`Apri documento ${item.title} ${insuranceDate(item.date)}`}
              key={item.id}
              onClick={() => openDocument(item)}
            >
              <span className="mf-ins-document-date">
                <strong>{item.date.slice(8)}</strong>
                <span>
                  {month} {item.date.slice(2, 4)}
                </span>
              </span>
              <span>
                <small>{item.category}</small>
                <strong>{item.title}</strong>
                <span>Riferimento: {item.reference}</span>
              </span>
            </button>
          )
        })}
        {!results.length && (
          <div className="mf-ins-empty">
            <h3>Nessun documento trovato</h3>
            <p>Modifica i filtri di ricerca per visualizzare altri documenti.</p>
          </div>
        )}
      </div>
    </InsurancePage>
  )
}
