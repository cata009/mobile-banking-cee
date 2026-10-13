import { useState } from 'react'
import {
  searchSecurities,
  validateSecuritySearchBounds,
  securityClasses,
  securities,
  type SecuritiesState,
  type SecuritySearch,
} from '@/features/investments/mobileFirstSecurities'
import { InvestmentButton, InvestmentPage, InvestmentTabs } from './MobileFirstInvestmentPrimitives'
import {
  SecuritiesCheck,
  SecuritiesError,
  SecuritiesField,
  SecuritiesLink,
  SecuritiesQuote,
} from './MobileFirstInvestmentSecuritiesElements'

const initialFilters: SecuritySearch = {
  query: '',
  searchBy: 'Tutti',
  kind: 'Tutti',
  market: 'Tutti',
  esg: false,
  minPerformance: '',
  maxPerformance: '',
  minYield: '',
  maxYield: '',
  maturityFrom: '',
  maturityTo: '',
  sort: 'Dalla A alla Z',
  underlying: '',
  accumulation: 'Tutti',
  warrantType: 'Tutti',
  minStrike: '',
  maxStrike: '',
  consensus: 'Tutti',
}
export default function MobileFirstInvestmentSecuritiesSearch({
  state,
  onState,
  onSecurity,
  onFunds,
  onBack,
  onClose,
  initialKind = 'Tutti',
}: {
  state: SecuritiesState
  onState: (state: SecuritiesState) => void
  onSecurity: (id: string) => void
  onFunds: () => void
  onBack: () => void
  onClose: () => void
  initialKind?: string
}) {
  const [filters, setFilters] = useState<SecuritySearch>({ ...initialFilters, kind: initialKind })
  const [advanced, setAdvanced] = useState(false)
  const [submitted, setSubmitted] = useState(initialKind !== 'Tutti')
  const [view, setView] = useState('Vista base')
  const [error, setError] = useState<string | null>(null)
  const update = (key: keyof SecuritySearch, value: string | boolean) => {
    setFilters({ ...filters, [key]: value })
    setError(null)
  }
  const submit = () => {
    const validation = validateSecuritySearchBounds(filters)
    if (validation) {
      setError(validation)
      return
    }
    if (filters.query.trim())
      onState({
        ...state,
        searchHistory: [filters.query.trim(), ...state.searchHistory.filter((q) => q !== filters.query.trim())].slice(
          0,
          5,
        ),
      })
    setSubmitted(true)
    setAdvanced(false)
  }
  const results = searchSecurities(filters)
  return (
    <InvestmentPage
      title={advanced ? 'Ricerca avanzata' : 'Ricerca'}
      onBack={advanced ? () => setAdvanced(false) : onBack}
      onClose={onClose}
      footer={advanced ? <InvestmentButton onClick={submit}>Filtra risultati</InvestmentButton> : undefined}
    >
      <div className="mfis-content">
        <SecuritiesError>{error}</SecuritiesError>
        {advanced ? (
          <>
            <h3>Filtra strumenti:</h3>
            <SecuritiesField
              label="Tipologia strumento"
              value={filters.kind}
              onChange={(value) => update('kind', value)}
            >
              <option>Tutti</option>
              {securityClasses.map((kind) => (
                <option key={kind}>{kind}</option>
              ))}
            </SecuritiesField>
            <SecuritiesField label="Mercato" value={filters.market} onChange={(value) => update('market', value)}>
              <option>Tutti</option>
              {Array.from(new Set(securities.map((s) => s.market))).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </SecuritiesField>
            <SecuritiesCheck
              label="Sostenibilità ESG"
              checked={filters.esg}
              onChange={(value) => update('esg', value)}
            />
            {(filters.kind === 'Azioni' || filters.kind === 'Obbligazioni' || filters.kind === 'Tutti') && (
              <>
                <h3>
                  {filters.kind === 'Obbligazioni' ? 'Coupon range / Rendimento effettivo lordo' : 'Dividend Yield'}
                </h3>
                <div className="mfis-form-grid">
                  <SecuritiesField
                    label="Rendimento minimo"
                    type="number"
                    value={filters.minYield}
                    onChange={(value) => update('minYield', value)}
                  />
                  <SecuritiesField
                    label="Rendimento massimo"
                    type="number"
                    value={filters.maxYield}
                    onChange={(value) => update('maxYield', value)}
                  />
                </div>
              </>
            )}
            {['Obbligazioni', 'Certificati e CW'].includes(filters.kind) && (
              <>
                <h3>Scadenza</h3>
                <div className="mfis-form-grid">
                  <SecuritiesField
                    label="Scadenza da"
                    type="date"
                    value={filters.maturityFrom}
                    onChange={(value) => update('maturityFrom', value)}
                  />
                  <SecuritiesField
                    label="Scadenza a"
                    type="date"
                    value={filters.maturityTo}
                    onChange={(value) => update('maturityTo', value)}
                  />
                </div>
              </>
            )}
            {filters.kind === 'Azioni' && (
              <SecuritiesField
                label="Consenso"
                value={filters.consensus}
                onChange={(value) => update('consensus', value)}
              >
                {['Tutti', 'Buy', 'Sell'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </SecuritiesField>
            )}
            {['ETF', 'ETC - ETN', 'Certificati e CW'].includes(filters.kind) && (
              <SecuritiesField
                label="Sottostante"
                value={filters.underlying}
                onChange={(value) => update('underlying', value)}
                hint="Inserisci il sottostante di riferimento"
              />
            )}
            {filters.kind === 'ETF' && (
              <SecuritiesField
                label="Accumulazione/Distribuzione"
                value={filters.accumulation}
                onChange={(value) => update('accumulation', value)}
              >
                {['Tutti', 'Accumulazione', 'Distribuzione'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </SecuritiesField>
            )}
            {filters.kind === 'Certificati e CW' && (
              <>
                <SecuritiesField
                  label="Tipo"
                  value={filters.warrantType}
                  onChange={(value) => update('warrantType', value)}
                >
                  {['Tutti', 'Call', 'Put'].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </SecuritiesField>
                <h3>Strike</h3>
                <div className="mfis-form-grid">
                  <SecuritiesField
                    label="Strike minimo"
                    type="number"
                    value={filters.minStrike}
                    onChange={(value) => update('minStrike', value)}
                  />
                  <SecuritiesField
                    label="Strike massimo"
                    type="number"
                    value={filters.maxStrike}
                    onChange={(value) => update('maxStrike', value)}
                  />
                </div>
              </>
            )}
            <h3>Performance 1A</h3>
            <div className="mfis-form-grid">
              <SecuritiesField
                label="Performance minima"
                type="number"
                value={filters.minPerformance}
                onChange={(value) => update('minPerformance', value)}
              />
              <SecuritiesField
                label="Performance massima"
                type="number"
                value={filters.maxPerformance}
                onChange={(value) => update('maxPerformance', value)}
              />
            </div>
            <SecuritiesField
              label="Ordina risultati per"
              value={filters.sort}
              onChange={(value) => update('sort', value)}
            >
              {['Dalla A alla Z', 'Dalla Z alla A', 'Performance'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </SecuritiesField>
            <SecuritiesLink onClick={() => setFilters({ ...initialFilters })}>Rimuovi filtri</SecuritiesLink>
          </>
        ) : (
          <>
            <div className="mfis-section-title">
              <InvestmentTabs
                labels={['Mercati', 'Fondi']}
                value="Mercati"
                onChange={(value) => value === 'Fondi' && onFunds()}
              />
              <SecuritiesLink onClick={() => setAdvanced(true)}>Ricerca avanzata</SecuritiesLink>
            </div>
            <SecuritiesField label="Cerca per" value={filters.searchBy} onChange={(value) => update('searchBy', value)}>
              {['Tutti', 'Descrizione', 'Simbolo', 'ISIN'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </SecuritiesField>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                submit()
              }}
            >
              <SecuritiesField
                label="Cerca strumenti"
                value={filters.query}
                onChange={(value) => update('query', value)}
              />
              <InvestmentButton type="submit">Cerca</InvestmentButton>
            </form>
            <SecuritiesField
              label="Asset class"
              value={filters.kind}
              onChange={(value) => {
                update('kind', value)
                setSubmitted(true)
              }}
            >
              <option>Tutti</option>
              {securityClasses.map((kind) => (
                <option key={kind}>{kind}</option>
              ))}
            </SecuritiesField>
            {!!state.searchHistory.length && (
              <>
                <h3>Ricerche recenti</h3>
                {state.searchHistory.map((q) => (
                  <div className="mfis-search-result" key={q}>
                    <SecuritiesLink
                      onClick={() => {
                        setFilters({ ...filters, query: q })
                        setSubmitted(true)
                      }}
                    >
                      {q}
                    </SecuritiesLink>
                    <SecuritiesLink
                      onClick={() =>
                        onState({ ...state, searchHistory: state.searchHistory.filter((item) => item !== q) })
                      }
                    >
                      Elimina {q}
                    </SecuritiesLink>
                  </div>
                ))}
              </>
            )}
            {submitted || filters.query ? (
              <>
                <div className="mfis-section-title">
                  <h3>Risultati ({results.length})</h3>
                  <SecuritiesLink
                    onClick={() => {
                      setFilters({ ...initialFilters })
                      setSubmitted(false)
                    }}
                  >
                    Rimuovi ricerca
                  </SecuritiesLink>
                </div>
                <InvestmentTabs labels={['Vista base', 'Vista avanzata']} value={view} onChange={setView} />
                {!results.length && <p>Nessuno strumento trovato. Modifica la ricerca o rimuovi i filtri.</p>}
                {results.map((s) => (
                  <SecuritiesQuote
                    key={s.id}
                    security={s}
                    advanced={view === 'Vista avanzata'}
                    onClick={() => onSecurity(s.id)}
                  />
                ))}
              </>
            ) : (
              <>
                <h3>Temi di investimento</h3>
                {[
                  ['I top performance a 1 anno', 'Azioni'],
                  ['Tutti i BTP', 'Obbligazioni'],
                  ['Crypto', 'ETC - ETN'],
                  ['Sostenibilità', 'Tutti'],
                ].map(([title, kind]) => (
                  <button
                    type="button"
                    className="mfis-theme"
                    key={title}
                    onClick={() => {
                      setFilters({
                        ...filters,
                        kind: kind!,
                        esg: title === 'Sostenibilità',
                        sort: title === 'I top performance a 1 anno' ? 'Performance' : 'Dalla A alla Z',
                      })
                      setSubmitted(true)
                    }}
                  >
                    <strong>{title}</strong>
                    <span>Apri ›</span>
                  </button>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </InvestmentPage>
  )
}
