import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation'
import { allocateValues, getSecurityPositions } from '@/features/investments/mobileFirstValuation'
import { useEffect, useState, type ReactNode } from 'react'
import {
  getSecurity,
  initialSecuritiesState,
  isSecuritiesState,
  securities,
  securitiesStorageKey,
  saveSecuritiesFinancialState,
  type SecuritiesState,
  type TradeDraft,
} from '@/features/investments/mobileFirstSecurities'
import { useDemo } from '@/app/state/demoStore'
import { hasMobileFirstInvestmentHoldings } from '@/features/investments/mobileFirstInvestments'
import {
  InvestmentAmount,
  InvestmentButton,
  InvestmentPage,
  InvestmentRows,
  InvestmentTabs,
} from './MobileFirstInvestmentPrimitives'
import {
  SecuritiesBrand,
  SecuritiesChart,
  SecuritiesField,
  SecuritiesInfo,
  SecuritiesLink,
  SecuritiesQuote,
} from './MobileFirstInvestmentSecuritiesElements'
import MobileFirstInvestmentSecuritiesTransaction from './MobileFirstInvestmentSecuritiesTransaction'
import MobileFirstInvestmentSecuritiesLists from './MobileFirstInvestmentSecuritiesLists'
import MobileFirstInvestmentSecuritiesSearch from './MobileFirstInvestmentSecuritiesSearch'
import { SecuritiesCompany, SecuritiesDetails, SecuritiesValuations } from './MobileFirstInvestmentSecuritiesDetail'
import { SecuritiesAssembly, SecuritiesOrders } from './MobileFirstInvestmentSecuritiesOperations'
import { securitiesDeposits, securitiesIndices, securitiesNews } from './investmentsSecuritiesContent'
import ordersIcon from '@/assets/mobile-first/it/investments/securities/imgInvestmentsOrdersAndTransactionsK10.svg'
import searchIcon from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionSearchK10.svg'
import marketsIcon from '@/assets/mobile-first/it/investments/securities/imgInvestmentsIndexK10.svg'
import assemblyIcon from '@/assets/mobile-first/it/investments/securities/imgMiscellaneousNewsK10.svg'
import portfolioIcon from '@/assets/mobile-first/it/investments/securities/imgIconsInvestimentiGraficoPortafoglio.svg'
import bookmarkIcon from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionBookmarkK10.svg'
import addIcon from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionAddK10.svg'
import rotationIcon from '@/assets/mobile-first/it/investments/securities/imgDeviceAndTechnologyScreenRotationK10.svg'
import buyIcon from '@/assets/mobile-first/it/investments/securities/imgInvestmentsBuyK10.svg'
import marketGraph from '@/assets/mobile-first/it/investments/securities/marketGraph.svg'
import marketBaseline from '@/assets/mobile-first/it/investments/securities/marketComposition.svg'
import divider from '@/assets/mobile-first/it/investments/securities/imgVector130.svg'
import auctionPath from '@/assets/mobile-first/it/investments/securities/auctionPath.svg'
import expandIcon from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionUpT2.svg'
import bestIcon from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionBest1.svg'
import './mobile-first-investments-securities.css'

type Destination = { area: 'securities' | 'funds' | 'services'; view: string; instrument?: string; action?: string }
export type MobileFirstInvestmentSecuritiesProps = {
  view: string
  instrument?: string
  action?: string
  embedded?: boolean
  onNavigate: (destination: Destination) => void
  onClose: () => void
}
type Route = { view: string; instrument?: string; action?: string; portfolioId?: string }
function readState(hasHoldings: boolean, action?: string): SecuritiesState {
  const initial = initialSecuritiesState()
  if (!hasHoldings) return { ...initial, orders: [], watchlists: [], virtualPortfolios: [], assemblyTickets: {} }
  if (action === 'empty') return { ...initial, orders: [], watchlists: [], virtualPortfolios: [], assemblyTickets: {} }
  if (action === 'limit-lists' || action === 'limit-instruments')
    return {
      ...initial,
      watchlists: Array.from({ length: action === 'limit-lists' ? 10 : 1 }, (_, i) => ({
        id: `limit-${i}`,
        name: `Lista ${i + 1}`,
        instruments: action === 'limit-instruments' ? securities.map((s) => s.id) : [],
      })),
    }
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(securitiesStorageKey) ?? 'null')
    if (isSecuritiesState(parsed)) return parsed
  } catch {
    /* An unavailable or stale browser store starts a fresh demo. */
  }
  return initial
}
export default function MobileFirstInvestmentSecurities({
  view,
  instrument,
  action,
  embedded = false,
  onNavigate,
  onClose,
}: MobileFirstInvestmentSecuritiesProps) {
  const { productCounts } = useDemo()
  const hasHoldings = hasMobileFirstInvestmentHoldings(productCounts.investments)
  const [route, setRoute] = useState<Route>({ view, instrument, action })
  const [history, setHistory] = useState<Route[]>([])
  const [state, setState] = useState<SecuritiesState>(() => readState(hasHoldings, action))
  const [expanded, setExpanded] = useState(false)
  const [positionView, setPositionView] = useState('Vista base')
  const [depositId, setDepositId] = useState('main')
  const [depositOpen, setDepositOpen] = useState(false)
  const [tab, setTab] = useState('Overview')
  const [period, setPeriod] = useState('1G')
  const [advancedChart, setAdvancedChart] = useState(false)
  const [index, setIndex] = useState(0)
  const [marketTab, setMarketTab] = useState('Italia')
  const [marketNews, setMarketNews] = useState('News')
  const [insight, setInsight] = useState('Materie prime')
  const [info, setInfo] = useState<string | null>(null)
  useEffect(() => {
    saveSecuritiesFinancialState(state)
  }, [state])
  const navigate = (next: Route) => {
    setHistory([...history, route])
    setRoute(next)
    setTab('Overview')
    setInfo(null)
  }
  const back = () => {
    if (info) {
      setInfo(null)
      return
    }
    const previous = history.at(-1)
    if (previous) {
      setRoute(previous)
      setHistory(history.slice(0, -1))
      setTab('Overview')
    } else onClose()
  }
  const positions = getSecurityPositions(state)
  const security = positions.find((p) => p.id === getSecurity(route.instrument).id)!
  const marketCents = positions.reduce((sum, p) => sum + p.valueCents, 0)
  const costKnown = positions.filter((p) => p.quantity > 0).every((p) => p.costCents !== undefined)
  const costCents = costKnown ? positions.reduce((sum, p) => sum + (p.costCents ?? 0), 0) : undefined
  const profitCents = costCents === undefined ? undefined : marketCents - costCents
  const securitiesAllocation = allocateValues(
    Array.from(new Set(positions.map((p) => p.kind)), (name) => ({
      name,
      valueCents: positions.filter((p) => p.kind === name).reduce((sum, p) => sum + p.valueCents, 0),
    })),
  ).map((p) => ({ ...p, value: p.valueCents / 100 }))
  const deposit = securitiesDeposits.find((d) => d.id === depositId)!
  const openSecurity = (id: string, nextAction?: string, portfolioId?: string) =>
    navigate({
      view: nextAction?.startsWith('virtual') ? 'transaction' : 'security',
      instrument: id,
      action: nextAction,
      portfolioId,
    })
  const quickActions = [
    { label: 'Ordini e movimenti', icon: ordersIcon, view: 'orders' },
    { label: 'Ricerca titoli', icon: searchIcon, view: 'search' },
    { label: 'Vetrina mercati', icon: marketsIcon, view: 'markets' },
    { label: 'Biglietti assembleari', icon: assemblyIcon, view: 'assembly' },
  ]
  if (route.view === 'auctions' && route.action === 'empty')
    return (
      <InvestmentPage title="Aste" onBack={back} onClose={onClose}>
        <div className="mfis-content">
          <p>Al momento non sono disponibili titoli di Stato in asta.</p>
          <p>Consulta il calendario delle aste per conoscere le prossime emissioni.</p>
          <SecuritiesLink onClick={() => setRoute({ ...route, action: undefined })}>Aggiorna aste</SecuritiesLink>
        </div>
      </InvestmentPage>
    )
  if (route.view === 'security' && ['loading', 'partial', 'error'].includes(route.action ?? ''))
    return (
      <InvestmentPage title="Scheda di dettaglio" onBack={back} onClose={onClose}>
        <div className="mfis-content">
          <h3>{security.name}</h3>
          {route.action === 'loading' ? (
            <p role="status">Caricamento delle quotazioni in corso…</p>
          ) : (
            <p role="alert">
              {route.action === 'partial'
                ? 'Alcuni dati del titolo non sono al momento disponibili.'
                : 'Non è stato possibile caricare i dati del titolo.'}
            </p>
          )}
          <InvestmentButton onClick={() => setRoute({ ...route, action: undefined })}>Riprova</InvestmentButton>
        </div>
      </InvestmentPage>
    )
  if (
    !hasHoldings &&
    (route.view === 'deposit' ||
      route.view === 'assembly' ||
      route.view === 'position' ||
      (route.view === 'transaction' && !route.action?.startsWith('virtual')) ||
      ['buy', 'sell', 'aucap', 'auction'].includes(route.action ?? ''))
  )
    return (
      <InvestmentPage
        title={route.view === 'assembly' ? 'Biglietti assembleari' : 'Deposito titoli'}
        onBack={back}
        onClose={onClose}
      >
        <div className="mfis-content">
          <p>
            {route.view === 'assembly'
              ? 'Non sono presenti titoli per cui richiedere biglietti assembleari.'
              : 'Non sono presenti depositi titoli. Per operare sui titoli è necessario un deposito.'}
          </p>
          <InvestmentButton onClick={() => onNavigate({ area: 'services', view: 'advisory' })}>
            Scopri il deposito titoli
          </InvestmentButton>
        </div>
      </InvestmentPage>
    )
  if (
    route.view === 'transaction' ||
    ['buy', 'sell', 'aucap', 'auction', 'virtual-buy', 'virtual-sell'].includes(route.action ?? '')
  )
    return (
      <MobileFirstInvestmentSecuritiesTransaction
        security={security}
        action={(route.action ?? 'buy') as TradeDraft['action']}
        state={state}
        onState={setState}
        onBack={back}
        onClose={onClose}
        portfolioId={route.portfolioId}
        depositId={depositId}
        onDone={() => {
          setHistory([])
          setRoute({ view: route.action?.startsWith('virtual') ? 'virtual' : 'orders' })
        }}
      />
    )
  if (route.view === 'watchlist' || route.view === 'virtual')
    return (
      <MobileFirstInvestmentSecuritiesLists
        key={`${route.view}-${route.action ?? ''}`}
        virtual={route.view === 'virtual'}
        instrument={route.instrument}
        action={route.action}
        state={state}
        onState={setState}
        onSecurity={openSecurity}
        onBack={back}
        onClose={onClose}
      />
    )
  if (route.view === 'search')
    return (
      <MobileFirstInvestmentSecuritiesSearch
        state={state}
        onState={setState}
        onSecurity={openSecurity}
        onFunds={() => onNavigate({ area: 'funds', view: 'search' })}
        onBack={back}
        onClose={onClose}
        initialKind={route.action}
      />
    )
  if (route.view === 'orders')
    return (
      <SecuritiesOrders state={state} onState={setState} onSecurity={openSecurity} onBack={back} onClose={onClose} />
    )
  if (route.view === 'assembly')
    return <SecuritiesAssembly state={state} onState={setState} onBack={back} onClose={onClose} />
  const summary = (
    <section className="mfis-deposit">
      <div className="mfis-card-heading">
        <div>
          <button type="button" onClick={() => setDepositOpen(true)}>
            Deposito⌄
          </button>
          <strong>{deposit.owner}</strong>
          <small className="mfis-deposit-number">{deposit.label}</small>
        </div>
        <div>
          <button type="button" onClick={() => setDepositOpen(true)}>
            Sottodeposito⌄
          </button>
          <strong>{deposit.owner}</strong>
        </div>
      </div>
      <dl className="mfis-deposit-metrics">
        <div>
          <dt>Controvalore di mercato</dt>
          <dd>
            <InvestmentAmount value={marketCents / 100} />
          </dd>
          <dd className="mfis-deposit-accrual">Ratei lordi N.D.</dd>
        </div>
        <div>
          <dt>P&amp;L €/%</dt>
          <dd className="mfis-deposit-profit">
            {profitCents === undefined ? 'N.D.' : <InvestmentAmount value={profitCents / 100} />}
            <span className="mfis-positive">
              {costCents && profitCents !== undefined
                ? ((profitCents / costCents) * 100).toFixed(2).replace('.', ',') + '%'
                : 'N.D.'}
            </span>
          </dd>
        </div>
      </dl>
      <div className="mfis-quick">
        {quickActions.map((item) => (
          <button type="button" key={item.view} onClick={() => navigate({ view: item.view })}>
            <span>
              <img alt="" src={item.icon} />
            </span>
            <span className="mfis-deposit-action-label">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
  const newsCards = (limit = securitiesNews.length) =>
    securitiesNews.slice(0, limit).map((news, i) => (
      <article key={news.title} className="mfis-news">
        <strong>{news.title}</strong>
        <p>{news.intro}</p>
        <div className="mfis-section-title">
          <small>{news.date}</small>
          <SecuritiesLink onClick={() => navigate({ view: 'news-detail', instrument: String(i) })}>
            Leggi tutto
          </SecuritiesLink>
        </div>
      </article>
    ))
  const calendar = (
    <>
      <h3>Calendario dividendi</h3>
      <SecuritiesField
        label="Mese"
        value={route.action ?? 'Marzo 2025'}
        onChange={(value) => setRoute({ ...route, action: value })}
      >
        {['Marzo 2025', 'Aprile 2025', 'Maggio 2025'].map((m) => (
          <option key={m}>{m}</option>
        ))}
      </SecuritiesField>
      {securities
        .filter((s) => s.dividend > 0 && s.kind === 'Azioni')
        .map((s, i) => (
          <button type="button" className="mfis-quote" key={s.id} onClick={() => openSecurity(s.id)}>
            <strong>{s.name}</strong>
            <InvestmentRows
              rows={[
                {
                  label: 'Data stacco',
                  value: `${String(10 + i * 2).padStart(2, '0')}/${route.action === 'Aprile 2025' ? '04' : route.action === 'Maggio 2025' ? '05' : '03'}/2025`,
                },
                { label: 'Dividendo', value: <InvestmentAmount value={s.dividend} /> },
              ]}
            />
          </button>
        ))}
    </>
  )
  let title = 'Titoli'
  let content: ReactNode
  let footer: ReactNode
  if (route.view === 'portfolio' && !hasHoldings)
    content = (
      <>
        <h3>I tuoi titoli</h3>
        <p>Non sono presenti titoli nel tuo portafoglio.</p>
        <p>Non sono presenti depositi titoli.</p>
        <InvestmentButton onClick={() => onNavigate({ area: 'services', view: 'advisory' })}>
          Scopri il deposito titoli
        </InvestmentButton>
        <SecuritiesLink onClick={() => navigate({ view: 'markets' })}>Esplora i mercati</SecuritiesLink>
      </>
    )
  else if (route.view === 'portfolio')
    content = (
      <>
        <p className="mfis-disclaimer">Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)</p>
        {summary}
        <div className="mfis-section-title">
          <h3>I tuoi titoli</h3>
          <SecuritiesInfo
            label="Informazioni sui tuoi titoli"
            onClick={() =>
              setInfo(
                'Il controvalore di mercato è calcolato sulle quotazioni disponibili. L’elenco raggruppa gli strumenti per tipologia.',
              )
            }
          />
        </div>
        <div>
          {securitiesAllocation.map((group) => (
            <button
              className="mfis-allocation"
              type="button"
              key={group.name}
              onClick={() => {
                setExpanded(true)
                setRoute({ ...route, action: group.name })
              }}
            >
              <span>
                <img src={portfolioIcon} alt="" />
                {group.name}
              </span>
              <span>{group.percent}%</span>
              <InvestmentAmount value={group.value} />
            </button>
          ))}
        </div>
        <SecuritiesLink
          onClick={() => {
            setExpanded(!expanded)
            setRoute({ ...route, action: undefined })
          }}
        >
          {expanded ? 'Comprimi elenco titoli' : 'Espandi elenco titoli'}
          <img src={expandIcon} alt="" />
        </SecuritiesLink>
        {expanded && (
          <>
            <InvestmentTabs labels={['Vista base', 'Vista avanzata']} value={positionView} onChange={setPositionView} />
            {securitiesAllocation
              .filter((group) => !route.action || group.name === route.action)
              .map((group) => (
                <section className="mfis-group" key={group.name}>
                  <h3>{group.name}</h3>
                  {positions
                    .filter((s) => s.kind === group.name && s.quantity > 0)
                    .map((s) => (
                      <SecuritiesQuote
                        key={s.id}
                        security={s}
                        position
                        advanced={positionView === 'Vista avanzata'}
                        onClick={() => navigate({ view: 'position', instrument: s.id })}
                      />
                    ))}
                </section>
              ))}
            <p className="mfis-disclaimer">
              Il valore degli strumenti può variare. Le performance passate non sono indicative dei risultati futuri.
            </p>
          </>
        )}
      </>
    )
  else if (route.view === 'deposit') {
    title = 'Deposito titoli'
    content = (
      <>
        <p>Seleziona il deposito e il sottodeposito per visualizzare la tua posizione e operare sui titoli.</p>
        {summary}
        <InvestmentButton onClick={() => setDepositOpen(true)}>Seleziona deposito</InvestmentButton>
        <SecuritiesLink onClick={() => onNavigate({ area: 'services', view: 'advisory' })}>
          Richiedi informazioni sull’apertura di un deposito titoli
        </SecuritiesLink>
      </>
    )
  } else if (route.view === 'position') {
    title = 'Posizione titolo'
    content = (
      <>
        <h3>{security.name}</h3>
        <SecuritiesQuote security={security} position advanced />
        <InvestmentRows
          rows={[
            { label: 'ISIN', value: security.isin },
            { label: 'Tipologia titolo', value: security.kind },
            { label: 'Deposito', value: deposit.label },
            { label: 'Sottodeposito', value: deposit.sub },
            { label: 'Quantità disponibile', value: security.quantity },
            {
              label: 'Prezzo medio di carico',
              value: security.averageCost === undefined ? 'N.D.' : <InvestmentAmount value={security.averageCost} />,
            },
          ]}
        />
        <SecuritiesLink onClick={() => openSecurity(security.id)}>Scheda titolo</SecuritiesLink>
        <SecuritiesLink onClick={() => navigate({ view: 'orders', instrument: security.id })}>
          Ordini e movimenti
        </SecuritiesLink>
        {security.kind === 'Diritti' && (
          <InvestmentButton onClick={() => navigate({ view: 'transaction', instrument: security.id, action: 'aucap' })}>
            Aumento di capitale a pagamento
          </InvestmentButton>
        )}
      </>
    )
    footer = (
      <div className="mfis-footer-actions">
        <InvestmentButton onClick={() => navigate({ view: 'transaction', instrument: security.id, action: 'sell' })}>
          Vendi
        </InvestmentButton>
        <InvestmentButton onClick={() => navigate({ view: 'transaction', instrument: security.id, action: 'buy' })}>
          Acquista
        </InvestmentButton>
      </div>
    )
  } else if (route.view === 'security') {
    title = 'Scheda di dettaglio'
    content = (
      <>
        <SecuritiesBrand security={security} />
        <h3>{security.name}</h3>
        <SecuritiesField
          label="Mercato"
          value={route.action ?? security.market}
          onChange={(value) => setRoute({ ...route, action: value })}
        >
          {Array.from(new Set([security.market, 'Best Execution', 'Euronext Milano'])).map((m) => (
            <option key={m}>{m}</option>
          ))}
        </SecuritiesField>
        <InvestmentRows
          rows={[
            {
              label: 'Ultimo prezzo',
              value: <InvestmentAmount value={security.price} decimals={security.price < 1 ? 4 : 2} />,
            },
            {
              label: 'Variazione',
              value: (
                <span className={security.change < 0 ? 'mfis-negative' : 'mfis-positive'}>
                  {security.change > 0 ? '+' : ''}
                  {security.change}%
                </span>
              ),
            },
          ]}
        />
        <p className="mfis-disclaimer">
          Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)
          <br />
          Le quotazioni mostrate sono in ritardo di almeno 15 minuti.
        </p>
        <div className="mfis-quick">
          <button type="button" onClick={() => navigate({ view: 'watchlist', instrument: security.id, action: 'add' })}>
            <span>
              <img alt="" src={bookmarkIcon} />
            </span>
            Aggiungi a watchlist
          </button>
          <button type="button" onClick={() => navigate({ view: 'virtual', instrument: security.id })}>
            <span>
              <img alt="" src={addIcon} />
            </span>
            Portafoglio virtuale
          </button>
          <button type="button" onClick={() => setAdvancedChart(!advancedChart)}>
            <span>
              <img alt="" src={rotationIcon} />
            </span>
            {advancedChart ? 'Grafico semplice' : 'Grafico avanzato'}
          </button>
        </div>
        <SecuritiesChart security={security} period={period} onPeriod={setPeriod} advanced={advancedChart} />
        <InvestmentTabs
          labels={
            security.kind === 'Azioni'
              ? ['Overview', 'Valutazioni', 'News', 'Book e altre borse', 'Profilo societario']
              : security.kind === 'ETF'
                ? ['Overview', 'Dettagli', 'Book e altre borse']
                : ['Overview', 'Dettagli', 'Book e altre borse', 'Dati statistici', 'Profilo societario']
          }
          value={tab}
          onChange={setTab}
        />
        {tab === 'Overview' ? (
          <>
            <h3>Quotazione</h3>
            <InvestmentRows
              rows={[
                { label: 'Prezzo apertura', value: 'N.D.' },
                {
                  label: 'Prezzo chiusura',
                  value: <InvestmentAmount value={security.price / (1 + security.change / 100)} />,
                },
                {
                  label: 'Prezzo denaro',
                  value: <InvestmentAmount value={Math.max(security.price / 2, security.price - 0.05)} />,
                },
                {
                  label: 'Prezzo lettera',
                  value: <InvestmentAmount value={security.price} decimals={security.price < 1 ? 4 : 2} />,
                },
                { label: 'Divisa', value: 'EUR' },
                { label: 'Fase di mercato', value: 'CONT' },
                { label: 'Volumi', value: '57.627,541' },
                { label: 'Controvalore di mercato', value: 'N.D.' },
                { label: 'ISIN', value: security.isin },
              ]}
            />
            <img src={divider} alt="" />
            <h3>Dati titolo</h3>
            <InvestmentRows
              rows={[
                { label: 'Simbolo', value: security.symbol },
                { label: 'Tipologia titolo', value: security.kind },
                {
                  label: security.kind === 'Obbligazioni' ? 'Scadenza' : 'Settore',
                  value: security.maturity ?? 'Tecnologia',
                },
                { label: 'Capitalizzazione di mercato', value: 'N.D.' },
              ]}
            />
            {security.esg && (
              <div className="mfis-esg">
                <strong>Rilevanza ESG</strong>
                <p>Strumenti attenti a tematiche ambientali e sociali.</p>
              </div>
            )}
            <img src={divider} alt="" />
            <h3>{security.kind === 'Obbligazioni' ? 'Cedole' : 'Dividendi'}</h3>
            <InvestmentRows
              rows={[
                { label: 'Ultimo dividendo', value: <InvestmentAmount value={security.dividend} /> },
                { label: 'Data pagamento', value: '12/12/2024' },
                { label: 'Dividend Yield', value: `${((security.dividend / security.price) * 100).toFixed(2)}%` },
              ]}
            />
            <img src={divider} alt="" />
            <h3>Performance storiche</h3>
            <div className="mfis-history-performance">
              {['1 Settimana', '1 Mese', '3 Mesi', '6 Mesi', '1 Anno', '3 Anni'].map((p) => (
                <div key={p}>
                  <strong>{p}</strong>
                  <span className={security.performance < 0 ? 'mfis-negative' : 'mfis-positive'}>
                    {p === '1 Anno' ? `${security.performance > 0 ? '+' : ''}${security.performance}%` : 'N.D.'}
                  </span>
                  <small>Min. / Max.</small>
                  <span>N.D.</span>
                </div>
              ))}
            </div>
          </>
        ) : tab === 'Valutazioni' ? (
          <SecuritiesValuations security={security} />
        ) : tab === 'Dettagli' || tab === 'Dati statistici' ? (
          <SecuritiesDetails security={security} statistics={tab === 'Dati statistici'} />
        ) : tab === 'News' ? (
          <>{newsCards(4)}</>
        ) : tab === 'Book e altre borse' ? (
          <>
            <h3>Book 5 livelli</h3>
            <table className="mfis-book">
              <thead>
                <tr>
                  <th>Qtà. denaro</th>
                  <th>Prezzo denaro</th>
                  <th>Prezzo lettera</th>
                  <th>Qtà. lettera</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td>{100 + i * 25}</td>
                    <td>
                      <InvestmentAmount value={Math.max(security.price / 2, security.price - (i + 1) * 0.05)} />
                    </td>
                    <td>
                      <InvestmentAmount value={security.price + i * 0.05} />
                    </td>
                    <td>{120 + i * 50}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>Altre borse</h3>
            {['NASDAQ', 'Euronext Milano', 'XETRA'].map((m) => (
              <button
                key={m}
                type="button"
                className="mfis-search-result"
                onClick={() => setRoute({ ...route, action: m })}
              >
                <span>{m}</span>
                <InvestmentAmount value={security.price} decimals={security.price < 1 ? 4 : 2} />
                <img src={bestIcon} alt="Mercato di probabile esecuzione" />
              </button>
            ))}
          </>
        ) : (
          <SecuritiesCompany security={security} />
        )}
        <p className="mfis-disclaimer">
          La coccarda indica il mercato di probabile esecuzione. Il mercato selezionato potrebbe differire da quello
          individuato dal negoziatore in base alla Strategia di esecuzione e trasmissione degli ordini.
        </p>
      </>
    )
    footer = (
      <InvestmentButton onClick={() => navigate({ view: 'transaction', instrument: security.id, action: 'buy' })}>
        Acquista
      </InvestmentButton>
    )
  } else if (route.view === 'auctions') {
    title = 'Aste'
    content = (
      <>
        {[0, 1, 2, 3, 4].map((i) => (
          <article className="mfis-auction" key={i}>
            <div>
              <strong>BOT SEM 30/09/2025</strong>
              <small>564300</small>
              <small>Validità operazione</small>
              <strong>
                Dal 25/03/2025 - 15:00
                <br />
                Al 26/03/2025 - 18:00
              </strong>
            </div>
            <div>
              <small>Data valuta</small>
              <strong>31/03/2025</strong>
              <button
                type="button"
                onClick={() => navigate({ view: 'transaction', instrument: 'bot', action: 'auction' })}
              >
                <span>
                  <img src={buyIcon} alt="" />
                </span>
                Sottoscrivi
              </button>
            </div>
          </article>
        ))}
        <h3>Documenti</h3>
        <p>Scopri i documenti utili per la sezione.</p>
        {[
          'Tutorial',
          'Calendario aste marzo',
          'Risultati aste titoli di Stato aggiornati al 13/03/2025',
          'Avvisi aste titoli di Stato aggiornati all’11/03/2025',
        ].map((d) => (
          <SecuritiesLink
            key={d}
            onClick={() =>
              setInfo(
                `${d}: BOT SEM 30/09/2025. Data valuta 31/03/2025. Importo nominale minimo 1.000 euro. Le prenotazioni sono consultabili in Ordini e movimenti.`,
              )
            }
          >
            {d} ↓
          </SecuritiesLink>
        ))}
        <p className="mfis-disclaimer">
          La sottoscrizione di BOT semestrali e annuali sul mercato primario avviene nei periodi di apertura delle aste.
        </p>
      </>
    )
  } else if (route.view === 'news-detail') {
    const news = securitiesNews[Number(route.instrument)] ?? securitiesNews[0]!
    title = news.title
    content = (
      <>
        <small>{news.date}</small>
        <h3>{news.intro}</h3>
        <p>{news.body}</p>
        <SecuritiesLink onClick={() => openSecurity('apple')}>Scheda Apple</SecuritiesLink>
        <SecuritiesLink onClick={() => navigate({ view: 'news' })}>Tutte le news</SecuritiesLink>
      </>
    )
  } else if (route.view === 'news') {
    title = 'News e ultimi eventi'
    content = newsCards()
  } else if (route.view === 'calendar') {
    title = 'Calendario dividendi'
    content = calendar
  } else if (route.view === 'indices') {
    title = 'Tutti gli indici'
    content = (
      <>
        {securitiesIndices.map((item, i) => (
          <button
            type="button"
            className="mfis-quote"
            key={item.name}
            onClick={() => {
              setIndex(i)
              navigate({ view: 'index-detail' })
            }}
          >
            <strong>{item.name}</strong>
            <InvestmentAmount value={item.value} />
            <span className={item.change < 0 ? 'mfis-negative' : 'mfis-positive'}>{item.change}%</span>
          </button>
        ))}
      </>
    )
  } else if (route.view === 'index-detail' || route.view === 'composition') {
    title = route.view === 'composition' ? 'Composizione' : securitiesIndices[index]!.name
    content = (
      <>
        <div className="mfis-index">
          <h3>{securitiesIndices[index]!.name}</h3>
          <InvestmentAmount value={securitiesIndices[index]!.value} />
          <span className="mfis-positive">+{securitiesIndices[index]!.change}%</span>
          {route.action === 'chart-unavailable' ? (
            <div className="mfis-notice" role="status">
              <p>Il grafico non è al momento disponibile.</p>
              <SecuritiesLink onClick={() => setRoute({ ...route, action: undefined })}>Riprova</SecuritiesLink>
            </div>
          ) : (
            <div className="mfis-index-chart">
              <img src={marketBaseline} alt="" />
              <img src={marketGraph} alt="Andamento dell’indice" />
            </div>
          )}
        </div>
        <SecuritiesLink
          onClick={() => setRoute({ ...route, view: route.view === 'composition' ? 'index-detail' : 'composition' })}
        >
          {route.view === 'composition' ? 'Grafico indice' : 'Composizione titoli'}
        </SecuritiesLink>
        {securities
          .filter((s) => s.kind === 'Azioni')
          .map((s) => (
            <SecuritiesQuote key={s.id} security={s} onClick={() => openSecurity(s.id)} />
          ))}
      </>
    )
  } else {
    title = 'Mercati'
    content = (
      <>
        <div className="mfis-section-title">
          <InvestmentTabs
            labels={['Mercati', 'Fondi']}
            value="Mercati"
            onChange={(value) => value === 'Fondi' && onNavigate({ area: 'funds', view: 'catalog' })}
          />
          <button
            type="button"
            className="mfis-search-button"
            aria-label="Ricerca titoli"
            onClick={() => navigate({ view: 'search' })}
          >
            <img src={searchIcon} alt="" />
          </button>
        </div>
        <h3>Indici</h3>
        <InvestmentTabs
          labels={['Italia', 'Europa', 'America', 'Asia']}
          value={marketTab}
          onChange={(value) => {
            setMarketTab(value)
            setIndex(value === 'America' ? 3 : value === 'Europa' ? 5 : 0)
          }}
        />
        <div className="mfis-index">
          <div className="mfis-section-title">
            <button
              type="button"
              aria-label="Indice precedente"
              onClick={() => setIndex((index + securitiesIndices.length - 1) % securitiesIndices.length)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Indice successivo"
              onClick={() => setIndex((index + 1) % securitiesIndices.length)}
            >
              ›
            </button>
          </div>
          <h3>{securitiesIndices[index]!.name}</h3>
          <InvestmentAmount value={securitiesIndices[index]!.value} />
          <span className="mfis-positive">+{securitiesIndices[index]!.change}%</span>
          <SecuritiesLink onClick={() => navigate({ view: 'index-detail' })}>Dettaglio</SecuritiesLink>
          {route.action === 'chart-unavailable' ? (
            <div className="mfis-notice" role="status">
              <p>Il grafico non è al momento disponibile.</p>
              <SecuritiesLink onClick={() => setRoute({ ...route, action: undefined })}>Riprova</SecuritiesLink>
            </div>
          ) : (
            <div className="mfis-index-chart">
              <img src={marketBaseline} alt="" />
              <img src={marketGraph} alt="Andamento dell’indice" />
            </div>
          )}
          <p className="mfis-disclaimer">
            Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)
            <br />
            Le quotazioni mostrate sono in ritardo di almeno 15 minuti.
          </p>
          <SecuritiesLink onClick={() => navigate({ view: 'indices' })}>Tutti gli indici</SecuritiesLink>
        </div>
        <h3>Composizione</h3>
        <div className="mfis-composition">
          <span>29 Rialzi</span>
          <meter value={29} max={57} />
          <span>18 Invariati</span>
          <meter value={18} max={57} />
          <span>10 Ribassi</span>
          <meter value={10} max={57} />
        </div>
        <SecuritiesLink onClick={() => navigate({ view: 'composition' })}>Composizione titoli</SecuritiesLink>
        <h3>Temi di investimento</h3>
        <p>Qui troverai alcuni temi di investimento che seguono le tendenze del momento</p>
        <div className="mfis-themes">
          {[
            ['I top performance a 1 anno', 'Azioni'],
            ['Tutti i BTP', 'Obbligazioni'],
            ['Crypto', 'ETC - ETN'],
          ].map(([label, kind]) => (
            <button
              type="button"
              className="mfis-theme"
              key={label}
              onClick={() => navigate({ view: 'search', action: kind })}
            >
              <strong>{label}</strong>
              <span>Apri ›</span>
            </button>
          ))}
        </div>
        <h3>Watchlist</h3>
        <h4>{state.watchlists[0]?.name ?? 'La tua lista è vuota'}</h4>
        <div className="mfis-horizontal">
          {state.watchlists[0]?.instruments.map((id) => (
            <SecuritiesQuote key={id} security={getSecurity(id)} onClick={() => openSecurity(id)} />
          ))}
        </div>
        <SecuritiesLink onClick={() => navigate({ view: 'watchlist' })}>Vai alla watchlist</SecuritiesLink>
        <h3>Aste</h3>
        <p>Qui troverai i titoli di Stato in asta</p>
        <button type="button" className="mfis-theme" onClick={() => navigate({ view: 'auctions' })}>
          <img src={auctionPath} alt="" />
          <strong>Aste</strong>
          <span>Scopri i titoli di Stato in asta</span>
          <span>Apri ›</span>
        </button>
        <h3>News e ultimi eventi</h3>
        <InvestmentTabs labels={['News', 'Calendario dividendi']} value={marketNews} onChange={setMarketNews} />
        {marketNews === 'News' ? (
          <>
            {newsCards(3)}
            <SecuritiesLink onClick={() => navigate({ view: 'news' })}>Tutte le news</SecuritiesLink>
          </>
        ) : (
          calendar
        )}
        <h3>Approfondimenti</h3>
        <InvestmentTabs labels={['Materie prime', 'Tassi', 'Cambi']} value={insight} onChange={setInsight} />
        {(insight === 'Materie prime'
          ? [
              ['Gold Spot', 1182.45],
              ['Silver Spot', 966.8],
              ['Palladium', 763.46],
            ]
          : insight === 'Tassi'
            ? [
                ['EURIBOR 3M', 2.43],
                ['EURIBOR 6M', 2.39],
                ['EURIBOR 12M', 2.37],
              ]
            : [
                ['EUR/USD', 1.0842],
                ['EUR/GBP', 0.8373],
                ['EUR/JPY', 162.47],
              ]
        ).map(([name, value]) => (
          <button
            type="button"
            className="mfis-search-result"
            key={String(name)}
            onClick={() => setInfo(`${name}: dati demo riferiti al ${formatInvestmentReferenceDate()}.`)}
          >
            <strong>{name}</strong>
            <InvestmentAmount value={Number(value)} decimals={insight === 'Cambi' ? 4 : 2} />
          </button>
        ))}
        <SecuritiesLink onClick={() => navigate({ view: 'virtual' })}>Portafoglio virtuale</SecuritiesLink>
      </>
    )
  }
  const body = (
    <div className="mfis-content">
      {content}
      {info && (
        <div role="dialog" aria-label="Informazioni" className="mfis-confirm">
          <p>{info}</p>
          <InvestmentButton onClick={() => setInfo(null)}>Chiudi informazioni</InvestmentButton>
        </div>
      )}
      {depositOpen && (
        <div role="dialog" aria-label="Seleziona deposito" className="mfis-confirm">
          <h3>Seleziona deposito e sottodeposito</h3>
          {securitiesDeposits.map((d) => (
            <button
              type="button"
              key={d.id}
              className="mfis-quote"
              onClick={() => {
                setDepositId(d.id)
                setDepositOpen(false)
              }}
            >
              <strong>{d.owner}</strong>
              <small>{d.label}</small>
              <small>{d.sub}</small>
            </button>
          ))}
          <SecuritiesLink onClick={() => setDepositOpen(false)}>Chiudi selezione</SecuritiesLink>
        </div>
      )}
    </div>
  )
  return embedded && route.view === 'portfolio' ? (
    <div className="mfis-embedded">{body}</div>
  ) : (
    <InvestmentPage title={title} onBack={back} onClose={onClose} footer={footer}>
      {body}
    </InvestmentPage>
  )
}
