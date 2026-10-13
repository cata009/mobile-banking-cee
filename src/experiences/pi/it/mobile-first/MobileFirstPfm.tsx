import { Fragment, Suspense, lazy, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { useDemo, useProductData } from '@/app/state/demoStore'
import {
  relationshipSummary,
  searchPfmMovements,
  selectPfmSummary,
  selectPfmCategoryTransactions,
  getPfmWealthSummary,
  normalizePfmCategory,
  type MovementSearch,
} from '@/features/analytics/mobileFirstPfm'
import {
  getItalyFinancialSnapshot,
  subscribeItalyFinancialChanges,
  setEventAnnotations,
} from '@/features/finance/italyFinancials'
import {
  getPfmBudgetSnapshot,
  subscribePfmBudgetChanges,
  savePfmBudget,
} from '@/features/analytics/mobileFirstPfmState'
import { getItalyPfmFinancialInput, pfmCategory, pfmMovement } from './pfmFinancialContent'
import { pfmAssets as a } from './pfmAssets'
import {
  PFM_BUDGET_CATEGORIES,
  PFM_EXPENSE_CATEGORIES,
  type PfmCategory,
  type PfmMovement,
  type PfmTab,
} from './pfmContent'
import {
  PfmAmount,
  PfmChips,
  PfmDonut,
  PfmLink,
  PfmMark,
  PfmMovements,
  PfmQuickAction,
  PfmRow,
  PfmSegment,
  PfmSuggestion,
} from './MobileFirstPfmPrimitives'
import {
  PfmBudgetForm,
  PfmBudgetGauge,
  PfmCategoryBudgetForm,
  PfmSearchForm,
  PfmSettings,
  PfmWealthForm,
} from './MobileFirstPfmForms'
import './mobile-first.css'
import './mobile-first-pfm.css'

type View =
  | 'overview'
  | 'category'
  | 'movement'
  | 'search'
  | 'results'
  | 'settings'
  | 'report'
  | 'budget-edit'
  | 'budget-category'
  | 'budget-add'
  | 'budget-amount'
  | 'wealth-add'
  | 'wealth-detail'
const emptySearch: MovementSearch = { direction: 'Spese', query: '', minimum: '', maximum: '' }
const Profile = lazy(() => import('./MobileFirstProfile'))

export default function MobileFirstPfm({
  onClose,
  initialTab = 'Bilancio familiare',
  onPhoneChromeChange,
  onNavigate,
  onLogout,
  onProfile,
  externalOverlayOpen = false,
}: {
  onClose: () => void
  initialTab?: PfmTab
  onPhoneChromeChange?: (variant: 'light' | 'dark') => void
  onNavigate?: (target: string, id?: string) => void
  onLogout?: () => void
  onProfile?: () => void
  externalOverlayOpen?: boolean
}) {
  const financial = useSyncExternalStore(subscribeItalyFinancialChanges, getItalyFinancialSnapshot)
  const [tab, setTab] = useState<PfmTab>(initialTab)
  const [direction, setDirection] = useState('Spese')
  const [wealthDirection, setWealthDirection] = useState('Risorse finanziarie')
  const [period, setPeriod] = useState('1M')
  const [year, setYear] = useState(financial.asOf.slice(0, 4))
  const [reportPeriod, setReportPeriod] = useState('Settimana')
  const [view, setView] = useState<View>('overview')
  const [category, setCategory] = useState({ ...PFM_EXPENSE_CATEGORIES[2]!, amount: 0 })
  const [movement, setMovement] = useState<PfmMovement | null>(null)
  const [categorySource, setCategorySource] = useState<'balance' | 'report'>('balance')
  const [movementExcluded, setMovementExcluded] = useState(false)
  const [movementParent, setMovementParent] = useState<View>('category')
  const [movementCategory, setMovementCategory] = useState('Trasporti')
  const [movementSubcategory, setMovementSubcategory] = useState('Carburante')
  const plans = useSyncExternalStore(subscribePfmBudgetChanges, getPfmBudgetSnapshot)
  const { resolvedProductCounts } = useProductData()
  const financialInput = getItalyPfmFinancialInput(financial, resolvedProductCounts)
  const relationships = financialInput.relationships
  const selected = relationships.flatMap((item, index) =>
    plans.relationshipIds === null || plans.relationshipIds.includes(`${item.kind}:${item.id}`) ? [index] : [],
  )
  const selectedInput = {
    ...financialInput,
    accountNumbers: relationships
      .filter((item, index) => selected.includes(index) && item.kind === 'account')
      .map((item) => item.id),
    cardIds: relationships
      .filter((item, index) => selected.includes(index) && item.kind === 'card')
      .map((item) => item.id),
  }
  const [search, setSearch] = useState(emptySearch)
  const budget = plans.targetCents / 100
  const expectedIncome = plans.expectedIncomeCents / 100
  const [budgetIndex, setBudgetIndex] = useState(0)
  const [sheet, setSheet] = useState<'period' | 'trend' | 'help' | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [dateStart, setDateStart] = useState(`${financial.asOf.slice(0, 7)}-01`)
  const [budgetMonth, setBudgetMonth] = useState(financial.asOf.slice(0, 7))
  const [draftBudgetMonth, setDraftBudgetMonth] = useState(financial.asOf.slice(0, 7))
  const [dateEnd, setDateEnd] = useState(financial.asOf)
  const [customDates, setCustomDates] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const tabRailRef = useRef<HTMLDivElement>(null)
  const budgetRailRef = useRef<HTMLDivElement>(null)
  const summary = relationshipSummary(
    relationships.filter((_, index) => selected.includes(index)).map((item) => item.kind),
  )
  const selectionQuery = customDates ? { start: dateStart, end: dateEnd } : { period }
  const balanceSummary = selectPfmSummary(financial, selectedInput, selectionQuery)
  const budgetSummary = selectPfmSummary(financial, selectedInput, { month: budgetMonth })
  const reportSummary = selectPfmSummary(
    financial,
    selectedInput,
    customDates ? selectionQuery : { period: reportPeriod === 'Mese' ? '1M' : reportPeriod },
  )
  const liveSummary =
    view === 'report' || (categorySource === 'report' && ['category', 'movement'].includes(view))
      ? reportSummary
      : balanceSummary
  const movements = liveSummary.transactions.map(pfmMovement)
  const expenseCategories = liveSummary.categoryRows.map(pfmCategory)
  const incomeCategories = liveSummary.incomeRows.map(pfmCategory)
  const budgetRemaining = (plans.targetCents - budgetSummary.spendCents) / 100
  const categoryBudgets = [
    ...new Set([...budgetSummary.categoryRows.map((item) => item.name), ...Object.keys(plans.categoryTargets)]),
  ].map((name) => {
    const row = budgetSummary.categoryRows.find((item) => item.name === name)
    const amount = (row?.amountCents ?? 0) / 100
    return {
      category: pfmCategory({ name, amountCents: row?.amountCents ?? 0 }),
      average: amount,
      spent: amount,
      budget: plans.categoryTargets[name] === undefined ? null : plans.categoryTargets[name]! / 100,
    }
  })
  const wealth = getPfmWealthSummary(selectedInput, { year })
  const wealthCategories = (wealthDirection === 'Risorse finanziarie' ? wealth.assetRows : wealth.liabilityRows).map(
    (row) => ({ ...pfmCategory(row), share: row.share }),
  )
  const selectedBudget = categoryBudgets[budgetIndex]
  const results = searchPfmMovements(movements, search)
  const categoryMovements = selectPfmCategoryTransactions(
    liveSummary.transactions.filter((event) =>
      categorySource !== 'report' && direction === 'Entrate' ? event.amountCents > 0 : event.amountCents < 0,
    ),
    category.name,
  ).map(pfmMovement)
  const categoryTotal = categoryMovements.reduce((sum, item) => sum + Math.abs(item.amount), 0)

  const closeView = () => {
    if (view === 'overview') onClose()
    else if (view === 'movement') setView(movementParent)
    else setView('overview')
  }
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !sheet && !profileOpen && !externalOverlayOpen) closeView()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  })
  useEffect(() => {
    if (view !== 'overview') headingRef.current?.focus({ preventScroll: true })
  }, [view])
  useEffect(() => {
    tabRailRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [tab])

  const openCategory = (next: PfmCategory) => {
    setCategorySource(view === 'report' ? 'report' : 'balance')
    setCategory(next)
    setView('category')
  }
  const openMovement = (next: PfmMovement) => {
    setCategorySource(view === 'report' || (view === 'category' && categorySource === 'report') ? 'report' : 'balance')
    setMovement(next)
    setMovementExcluded(false)
    setMovementCategory(next.category)
    setMovementSubcategory(next.subcategory)
    setMovementParent(view)
    setView('movement')
  }
  const moveBudget = (index: number) => {
    setBudgetIndex(index)
    budgetRailRef.current?.scrollTo?.({ left: index * 248, behavior: 'smooth' })
  }
  const formatDate = (date: string) => date.split('-').reverse().join('/')
  if (profileOpen)
    return (
      <Suspense fallback={<main className="mf-home" aria-label="Caricamento profilo" />}>
        <Profile
          onClose={() => setProfileOpen(false)}
          onNavigate={onNavigate}
          onLogout={onLogout ?? onClose}
          onPhoneChromeChange={onPhoneChromeChange}
        />
      </Suspense>
    )
  const dateLabel = `${formatDate(liveSummary.range.start)} - ${formatDate(liveSummary.range.end)}`
  const title: Record<View, string> = {
    overview: 'PFM',
    category: category.name,
    movement: 'Gestisci movimento',
    search: 'Cerca',
    results: 'Risultati di ricerca',
    settings: 'Impostazioni generali',
    report: 'Report',
    'budget-edit': 'Modifica il budget',
    'budget-category': selectedBudget?.category.name ?? 'Budget',
    'budget-add': 'Aggiungi budget',
    'budget-amount': 'Aggiungi budget',
    'wealth-add': 'Aggiungi elemento',
    'wealth-detail': category.name,
  }

  return (
    <main
      className="mf-home mf-pfm-page"
      aria-label={view === 'overview' ? 'PFM' : title[view]}
      lang="it"
      data-mobile-first-pfm="true"
    >
      <header className="mf-pfm-header">
        {view === 'overview' ? (
          <>
            <button type="button" aria-label="Indietro" onClick={onClose}>
              <img src={a.s.imgBack} alt="" />
            </button>
            <button
              type="button"
              className="mf-avatar"
              aria-label="Profilo"
              onClick={onProfile ?? (() => setProfileOpen(true))}
            >
              <img src={a.s.imgAvatar} alt="" width={32} height={32} />
              <img src={a.s.imgEllipse31} alt="" className="mf-notification" />
            </button>
          </>
        ) : (
          <>
            <span />
            <div>
              <button type="button" aria-label="Aiuto" onClick={() => setSheet('help')}>
                <img src={a.d.imgHelp} alt="" />
              </button>
              <button type="button" aria-label="Chiudi" onClick={closeView}>
                <img src={a.d.imgClose} alt="" />
              </button>
            </div>
          </>
        )}
      </header>
      <ScrollableRegion
        key={`${view}-${tab}`}
        className="mf-pfm-scroll scrollbar-hide"
        aria-label={view === 'overview' ? tab : title[view]}
      >
        {view === 'overview' ? (
          <>
            <ScrollableRegion ref={tabRailRef} className="mf-pfm-tabs scrollbar-hide" aria-label="Sezioni PFM">
              <div role="tablist" aria-label="Navigazione PFM">
                {(['Bilancio familiare', 'Budget', 'Patrimonio'] as const).map((name) => (
                  <button type="button" role="tab" key={name} aria-selected={name === tab} onClick={() => setTab(name)}>
                    {name}
                    {name === tab && <img src={a.s.imgEllipse28} alt="" />}
                  </button>
                ))}
              </div>
            </ScrollableRegion>
            <div className="mf-pfm-content">
              {tab !== 'Patrimonio' && (
                <p className="mf-pfm-summary">
                  Rapporti: <strong>{summary}</strong>
                </p>
              )}
              {tab === 'Bilancio familiare' && (
                <>
                  <div className="mf-pfm-actions">
                    <PfmQuickAction
                      label="Report"
                      src={a.s.imgMiscellaneousActivities}
                      onClick={() => setView('report')}
                    />
                    <PfmQuickAction
                      label="Impostazioni"
                      src={a.s.imgNavigationAndActionSettings}
                      onClick={() => setView('settings')}
                    />
                    <PfmQuickAction
                      label="Cerca"
                      src={a.s.imgNavigationAndActionSearchK10}
                      onClick={() => setView('search')}
                    />
                  </div>
                  <PfmSegment
                    labels={['Spese', 'Entrate']}
                    value={direction}
                    onChange={setDirection}
                    label="Bilancio"
                  />
                  <div className="mf-pfm-period">
                    <PfmChips
                      labels={['1M', '3M', '6M', '12M']}
                      value={period}
                      onChange={(value) => {
                        setPeriod(value)
                        setCustomDates(false)
                      }}
                    />
                    <button
                      type="button"
                      className="mf-pfm-calendar"
                      aria-label="Seleziona periodo"
                      onClick={() => setSheet('period')}
                    >
                      <img src={a.s.imgNavigationAndActionCalendarHolidayK10} alt="" />
                    </button>
                  </div>
                  <strong className="mf-pfm-date">{dateLabel}</strong>
                  {direction === 'Spese' ? (
                    <>
                      <PfmDonut
                        value={liveSummary.spendCents / 100}
                        categories={expenseCategories}
                        onCategory={(index) => openCategory(expenseCategories[index]!)}
                      />
                      <PfmLink onClick={() => setSheet('trend')}>ANDAMENTO</PfmLink>
                      <div className="mf-pfm-categories">
                        {expenseCategories.map((item, index) => (
                          <Fragment key={item.name}>
                            <PfmRow
                              label={item.name}
                              value={-item.amount}
                              category={item}
                              onClick={() => openCategory(item)}
                            />
                            {index === 1 && <PfmSuggestion />}
                          </Fragment>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 className="mf-pfm-income-title">
                        <span className="mf-pfm-mark" style={{ background: '#3e7e45' }}>
                          <img src={a.i.imgPath} alt="" />
                        </span>
                        Entrate
                      </h1>
                      <div className="mf-pfm-total">
                        <span>Entrate totali</span>
                        <PfmAmount value={liveSummary.incomeCents / 100} large />
                      </div>
                      <PfmLink onClick={() => setSheet('trend')}>ANDAMENTO</PfmLink>
                      <section className="mf-pfm-detail-section">
                        <h2>Sottocategorie</h2>
                        {incomeCategories.map((item) => (
                          <PfmRow
                            key={item.name}
                            label={item.name}
                            value={item.amount}
                            onClick={() => {
                              setCategorySource('balance')
                              setCategory({ name: item.name, amount: item.amount, color: '#3e7e45', glyph: 'Income' })
                              setView('category')
                            }}
                          />
                        ))}
                      </section>
                      <section>
                        <h2>Movimenti di categoria</h2>
                        <PfmMovements movements={movements.filter((item) => item.amount > 0)} onOpen={openMovement} />
                      </section>
                    </>
                  )}
                </>
              )}
              {tab === 'Budget' && (
                <>
                  <div className="mf-pfm-actions">
                    <PfmQuickAction
                      label="Modifica il budget"
                      src={a.b.imgNavigationAndActionEditK10}
                      onClick={() => setView('budget-edit')}
                    />
                    <PfmQuickAction
                      label="Impostazioni"
                      src={a.b.imgNavigationAndActionSettingsK10}
                      onClick={() => setView('settings')}
                    />
                  </div>
                  <div className="mf-pfm-month">
                    <p>
                      Mese e anno{' '}
                      <strong>
                        {new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' })
                          .format(new Date(`${budgetMonth}-01T12:00:00`))
                          .replace(/^./, (letter) => letter.toUpperCase())}
                      </strong>
                    </p>
                    <button
                      type="button"
                      className="mf-pfm-calendar"
                      aria-label="Seleziona mese"
                      onClick={() => setSheet('period')}
                    >
                      <img src={a.b.imgNavigationAndActionCalendarHolidayK10} alt="" />
                    </button>
                  </div>
                  <PfmBudgetGauge remaining={budgetRemaining} target={budget} />
                  <div className="mf-pfm-totals">
                    <div>
                      <span>Spese del mese</span>
                      <PfmAmount value={budgetSummary.spendCents / 100} />
                    </div>
                    <div>
                      <span>Budget totale</span>
                      <PfmAmount value={budget} />
                    </div>
                  </div>
                  <PfmLink onClick={() => setSheet('trend')}>ANDAMENTO ANNUALE</PfmLink>
                  <div>
                    <PfmRow label="Entrate medie mensili previste" value={expectedIncome} />
                    <PfmRow label="Media mensile spese" value={-budgetSummary.spendCents / 100} />
                    <PfmRow label="Media del risparmio" value={expectedIncome - budgetSummary.spendCents / 100} />
                  </div>
                  <PfmSuggestion />
                  <h2>Imposta il budget per le singole categorie di spesa.</h2>
                  <button type="button" className="mf-pfm-link" onClick={() => setView('budget-add')}>
                    AGGIUNGI BUDGET CATEGORIA <img src={a.b.imgNavigationAndActionAddT2} alt="" />
                  </button>
                  <ScrollableRegion
                    ref={budgetRailRef}
                    className="mf-pfm-budget-rail scrollbar-hide"
                    aria-label="Budget per categoria"
                  >
                    {categoryBudgets.map((item, index) => (
                      <article className="mf-pfm-budget-card" key={item.category.name}>
                        <h3>
                          <PfmMark category={item.category} />
                          {item.category.name}
                        </h3>
                        <span>Spesa media mensile</span>
                        <PfmAmount value={item.average} />
                        <div className="mf-pfm-totals">
                          <div>
                            <span>Spesi a oggi</span>
                            <PfmAmount value={item.spent} />
                          </div>
                          <div>
                            <span>Budget</span>
                            {item.budget === null ? <strong>–</strong> : <PfmAmount value={item.budget} />}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="mf-pfm-link"
                          onClick={() => {
                            setBudgetIndex(index)
                            setCategory(item.category)
                            setView(item.budget === null ? 'budget-amount' : 'budget-category')
                          }}
                        >
                          {item.budget === null ? 'ATTIVA IL BUDGET' : 'VISUALIZZA IL BUDGET'}{' '}
                          <img src={a.b.imgNavigationAndActionForthT2} alt="" />
                        </button>
                      </article>
                    ))}
                  </ScrollableRegion>
                  <div className="mf-pfm-carousel">
                    <button
                      type="button"
                      aria-label="Budget precedente"
                      disabled={budgetIndex === 0}
                      onClick={() => moveBudget(budgetIndex - 1)}
                    >
                      <img src={a.b.imgNavigationAndActionBackK10} alt="" />
                    </button>
                    <button
                      type="button"
                      aria-label="Budget successivo"
                      disabled={budgetIndex === categoryBudgets.length - 1}
                      onClick={() => moveBudget(budgetIndex + 1)}
                    >
                      <img src={a.b.imgNavigationAndActionForthK10} alt="" />
                    </button>
                    <span>
                      {categoryBudgets.map((item, index) => (
                        <i key={item.category.name} className={index === budgetIndex ? 'is-selected' : ''} />
                      ))}
                    </span>
                  </div>
                </>
              )}
              {tab === 'Patrimonio' && (
                <>
                  <PfmSegment
                    label="Patrimonio"
                    labels={['Risorse finanziarie', 'Impegni finanziari']}
                    value={wealthDirection}
                    onChange={setWealthDirection}
                  />
                  <PfmChips
                    labels={[0, 1, 2].map((offset) => String(Number(financial.asOf.slice(0, 4)) - offset))}
                    value={year}
                    onChange={setYear}
                  />
                  <small className="mf-pfm-updated">Dati aggiornati al {formatDate(financial.asOf)}</small>
                  <PfmRow label="Patrimonio netto" value={wealth.netWorthCents / 100} />
                  <PfmDonut
                    kind={wealthDirection === 'Impegni finanziari' ? 'liabilities' : 'wealth'}
                    value={
                      (wealthDirection === 'Risorse finanziarie' ? wealth.assetsCents : wealth.liabilitiesCents) / 100
                    }
                    categories={wealthCategories}
                    onCategory={(index) => {
                      setCategory(wealthCategories[index]!)
                      setView('wealth-detail')
                    }}
                  />
                  <div className="mf-pfm-links">
                    <PfmLink onClick={() => setSheet('trend')}>ANDAMENTO</PfmLink>
                    <PfmLink
                      arrow
                      onClick={() => {
                        if (wealthCategories[0]) {
                          setCategory(wealthCategories[0])
                          setView('wealth-detail')
                        }
                      }}
                    >
                      MAGGIORI DETTAGLI
                    </PfmLink>
                  </div>
                  <PfmSuggestion />
                  {wealthCategories.length === 0 && <p>Nessun dato patrimoniale per l’anno selezionato.</p>}
                  <div>
                    {wealthCategories.map((item) => (
                      <PfmRow
                        key={item.name}
                        label={item.name}
                        value={item.amount}
                        category={item}
                        onClick={() => {
                          setCategory(item)
                          setView('wealth-detail')
                        }}
                      >
                        <span className="mf-pfm-share">{item.share ?? 0}%</span>
                      </PfmRow>
                    ))}
                  </div>
                  <button type="button" className="mf-pfm-primary" onClick={() => setView('wealth-add')}>
                    Aggiungi risorsa/impegno
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="mf-pfm-content mf-pfm-inner-content">
            <h1 tabIndex={-1} ref={headingRef}>
              {(view === 'category' || view === 'wealth-detail' || view === 'budget-category') && (
                <PfmMark category={category} />
              )}
              {title[view]}
            </h1>
            {view === 'category' && (
              <>
                <div className="mf-pfm-total">
                  <span>Importo totale</span>
                  <PfmAmount value={categoryTotal} large />
                </div>
                <section className="mf-pfm-detail-section">
                  <h2>Sottocategorie</h2>
                  <strong>Suddivisione spese per sottocategorie</strong>
                  {categoryMovements.map((item) => (
                    <PfmRow
                      key={item.id}
                      label={item.subcategory}
                      value={Math.abs(item.amount)}
                      onClick={() => openMovement(item)}
                    />
                  ))}
                </section>
                <section>
                  <h2>Movimenti di categoria</h2>
                  <PfmMovements
                    movements={
                      categoryMovements.length
                        ? categoryMovements
                        : movements.filter((item) => item.subcategory === category.name)
                    }
                    onOpen={openMovement}
                  />
                </section>
              </>
            )}
            {view === 'search' && (
              <PfmSearchForm
                initial={search}
                onApply={(next) => {
                  setSearch(next)
                  setView('results')
                }}
              />
            )}
            {view === 'results' && (
              <>
                <p>Filtri applicati:</p>
                <p>
                  Tipologia <strong>{search.direction}</strong>
                </p>
                {search.query && (
                  <p>
                    Testo <strong>{search.query}</strong>
                  </p>
                )}
                <p>
                  Periodo <strong>{dateLabel}</strong>
                </p>
                {(search.minimum || search.maximum) && (
                  <p>
                    Importo {search.minimum || '0'} € / {search.maximum || '–'} €
                  </p>
                )}
                <button type="button" className="mf-pfm-link" onClick={() => setView('search')}>
                  MODIFICA FILTRI
                </button>
                {results.length ? (
                  <PfmMovements movements={results} onOpen={openMovement} />
                ) : (
                  <p className="mf-pfm-empty">Non ci sono risultati per questa ricerca, prova con altre date.</p>
                )}
              </>
            )}
            {view === 'settings' && (
              <PfmSettings
                selected={selected}
                relationships={relationships}
                excluded={balanceSummary.excluded.map(pfmMovement)}
                onRestore={(id) => setEventAnnotations(id, { excluded: false })}
                onSave={(next) => {
                  savePfmBudget({
                    relationshipIds: next.map((index) => `${relationships[index]!.kind}:${relationships[index]!.id}`),
                  })
                  setView('overview')
                }}
              />
            )}
            {view === 'budget-edit' && (
              <PfmBudgetForm
                total={budget}
                income={expectedIncome}
                onSave={(total, income) => {
                  savePfmBudget({ targetCents: Math.round(total * 100), expectedIncomeCents: Math.round(income * 100) })
                  setView('overview')
                }}
              />
            )}
            {view === 'budget-add' && (
              <>
                <h3>Seleziona la categoria</h3>
                <div className="mf-pfm-category-grid">
                  {PFM_BUDGET_CATEGORIES.map((item) => (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => {
                        setCategory(item)
                        setView('budget-amount')
                      }}
                    >
                      <PfmMark category={item} />
                      {item.name}
                    </button>
                  ))}
                </div>
              </>
            )}
            {view === 'budget-amount' && (
              <>
                <h2>
                  <PfmMark category={category} />
                  {category.name}
                </h2>
                <PfmCategoryBudgetForm
                  average={
                    (budgetSummary.categoryRows.find((item) => item.name === category.name)?.amountCents ?? 0) / 100
                  }
                  initial={categoryBudgets.find((item) => item.category.name === category.name)?.budget ?? 0}
                  onSave={(amount) => {
                    savePfmBudget({
                      categoryTargets: { ...plans.categoryTargets, [category.name]: Math.round(amount * 100) },
                    })
                    setView('overview')
                  }}
                />
              </>
            )}
            {view === 'budget-category' && selectedBudget && (
              <>
                <div className="mf-pfm-totals">
                  <div>
                    <span>Spesi a oggi</span>
                    <PfmAmount value={selectedBudget.spent} large />
                  </div>
                  <div>
                    <span>Budget</span>
                    <PfmAmount value={selectedBudget.budget ?? 0} large />
                  </div>
                </div>
                <PfmLink arrow onClick={() => setView('budget-amount')}>
                  MODIFICA IL BUDGET
                </PfmLink>
                <PfmMovements
                  movements={selectPfmCategoryTransactions(
                    budgetSummary.transactions.filter((item) => item.amountCents < 0),
                    selectedBudget.category.name,
                  ).map(pfmMovement)}
                  onOpen={openMovement}
                />
                <button
                  type="button"
                  className="mf-pfm-primary"
                  onClick={() => {
                    const targets = { ...plans.categoryTargets }
                    delete targets[selectedBudget.category.name]
                    savePfmBudget({ categoryTargets: targets })
                    setView('overview')
                  }}
                >
                  Elimina budget di categoria
                </button>
              </>
            )}
            {view === 'wealth-add' && (
              <PfmWealthForm
                onSave={(name, value, liability, date, categoryName) => {
                  savePfmBudget({
                    manualWealth: [
                      ...plans.manualWealth,
                      {
                        id: `manual-${plans.manualWealth.length}`,
                        label: name,
                        category: categoryName,
                        valueCents: Math.round(value * 100),
                        date,
                        liability,
                      },
                    ],
                  })
                  setYear(date.slice(0, 4))
                  setWealthDirection(liability ? 'Impegni finanziari' : 'Risorse finanziarie')
                  setView('overview')
                }}
              />
            )}
            {view === 'wealth-detail' && (
              <>
                <h2>{category.name === 'Proprietà immobiliari' ? 'Garage' : category.name}</h2>
                <p>In questa schermata trovi il valore dell'elemento del tuo patrimonio</p>
                {wealth.items
                  .filter(
                    (item) =>
                      item.category === category.name && item.liability === (wealthDirection === 'Impegni finanziari'),
                  )
                  .map((item) => (
                    <PfmRow
                      key={item.id}
                      label={item.label}
                      detail={formatDate(item.date)}
                      value={item.valueCents / 100}
                    />
                  ))}
                <div className="mf-pfm-value-bar">
                  <span style={{ width: `${category.share ?? 0}%`, background: category.color }} />
                </div>
                <PfmRow label={`${category.share ?? 0}%`} value={category.amount} />
              </>
            )}
            {view === 'movement' && movement && (
              <>
                <h2>Categoria 1</h2>
                <form
                  className="mf-pfm-form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const original = financial.events.find((event) => event.id === movement.id)
                    const splits = original?.splits?.map((split) =>
                      normalizePfmCategory(split.category) === movement.category
                        ? { ...split, category: movementCategory }
                        : split,
                    )
                    setEventAnnotations(movement.id, {
                      category: splits?.length ? original?.category : movementCategory,
                      splits,
                      subcategory: movementSubcategory,
                      excluded: movementExcluded,
                    })
                    setView(movementParent)
                  }}
                >
                  <label>
                    Categoria
                    <select value={movementCategory} onChange={(event) => setMovementCategory(event.target.value)}>
                      {[
                        ...new Set([...PFM_BUDGET_CATEGORIES.map((item) => item.name), movementCategory, 'Entrate']),
                      ].map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Sottocategoria
                    <select
                      value={movementSubcategory}
                      onChange={(event) => setMovementSubcategory(event.target.value)}
                    >
                      <option>{movement.subcategory}</option>
                      <option>Altro</option>
                    </select>
                  </label>
                  <label className="mf-pfm-radio">
                    <input
                      type="checkbox"
                      checked={movementExcluded}
                      onChange={(event) => setMovementExcluded(event.target.checked)}
                    />
                    Escludi da bilancio, budget e report
                  </label>
                  <button
                    type="submit"
                    className="mf-pfm-primary"
                    disabled={
                      !movementExcluded &&
                      movementCategory === movement.category &&
                      movementSubcategory === movement.subcategory
                    }
                  >
                    Salva
                  </button>
                </form>
              </>
            )}
            {view === 'report' && (
              <>
                <p className="mf-pfm-summary">
                  Rapporti: <strong>{summary}</strong>
                </p>
                <div className="mf-pfm-period">
                  <PfmChips
                    labels={['Settimana', 'Mese', 'Anno']}
                    value={reportPeriod}
                    onChange={(value) => {
                      setReportPeriod(value)
                      setCustomDates(false)
                    }}
                  />
                  <button
                    type="button"
                    className="mf-pfm-calendar"
                    aria-label="Seleziona periodo"
                    onClick={() => setSheet('period')}
                  >
                    <img src={a.r.imgNavigationAndActionCalendarHolidayK10} alt="" />
                  </button>
                </div>
                <strong className="mf-pfm-date">{dateLabel}</strong>
                <div className="mf-pfm-total">
                  <span>
                    {reportPeriod === 'Settimana'
                      ? 'Questa settimana'
                      : reportPeriod === 'Mese'
                        ? 'Questo mese'
                        : 'Quest’anno'}{' '}
                    hai speso
                  </span>
                  <PfmAmount value={reportSummary.spendCents / 100} large />
                </div>
                <ReportBars rows={reportSummary.dayRows} />
                <h2>Categorizza le spese e migliora i tuoi report</h2>
                <PfmMovements movements={movements.slice(0, 2)} onOpen={openMovement} />
                <h2>Spese per categoria nel periodo selezionato</h2>
                <PfmDonut
                  kind="report"
                  categories={expenseCategories}
                  value={reportSummary.spendCents / 100}
                  onCategory={(index) => openCategory(expenseCategories[index]!)}
                />
                {expenseCategories.map((item) => (
                  <PfmRow
                    key={item.name}
                    label={item.name}
                    value={item.amount}
                    category={item}
                    onClick={() => openCategory(item)}
                  />
                ))}
                <h2>Ecco dove hai speso di più nel periodo</h2>
                {reportSummary.merchantRows
                  .map((row) => ({ name: row.name, value: row.amountCents / 100, color: '#535453' }))
                  .map((item) => (
                    <div className="mf-pfm-merchant" key={item.name}>
                      <span>{item.name}</span>
                      <div className="mf-pfm-value-bar">
                        <span
                          style={{
                            width: `${reportSummary.merchantRows[0]?.amountCents ? (item.value * 10000) / reportSummary.merchantRows[0].amountCents : 0}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                      <PfmAmount value={item.value} />
                    </div>
                  ))}
              </>
            )}
          </div>
        )}
      </ScrollableRegion>
      {sheet && (
        <BottomSheet
          title={sheet === 'period' ? 'Seleziona periodo' : sheet === 'trend' ? 'Andamento' : 'Aiuto'}
          closeLabel="Chiudi"
          onClose={() => setSheet(null)}
          className="mf-sheet mf-pfm-sheet"
        >
          {sheet === 'period' ? (
            <form
              className="mf-pfm-form"
              onSubmit={(event) => {
                event.preventDefault()
                if (tab === 'Budget' && draftBudgetMonth) {
                  setBudgetMonth(draftBudgetMonth)
                  setSheet(null)
                } else if (dateStart && dateEnd && dateStart <= dateEnd) {
                  setCustomDates(true)
                  setSheet(null)
                }
              }}
            >
              {tab === 'Budget' ? (
                <label>
                  Mese e anno
                  <input
                    type="month"
                    value={draftBudgetMonth}
                    onChange={(event) => setDraftBudgetMonth(event.target.value)}
                  />
                </label>
              ) : (
                <>
                  <label>
                    Da
                    <input type="date" value={dateStart} onChange={(event) => setDateStart(event.target.value)} />
                  </label>
                  <label>
                    A
                    <input
                      type="date"
                      min={dateStart}
                      value={dateEnd}
                      onChange={(event) => setDateEnd(event.target.value)}
                    />
                  </label>
                </>
              )}
              <button
                type="submit"
                className="mf-pfm-primary"
                disabled={tab === 'Budget' ? !draftBudgetMonth : !dateStart || !dateEnd || dateStart > dateEnd}
              >
                Applica
              </button>
            </form>
          ) : sheet === 'trend' ? (
            <ReportBars rows={reportSummary.dayRows} />
          ) : (
            <p>
              Consulta spese, entrate e patrimonio. Puoi scegliere i rapporti da includere e impostare i tuoi budget di
              spesa.
            </p>
          )}
        </BottomSheet>
      )}
    </main>
  )
}

function ReportBars({ rows }: { rows: readonly { name: string; amountCents: number }[] }) {
  const maximum = Math.max(1, ...rows.map((row) => row.amountCents))
  const { amountsHidden } = useDemo()
  return (
    <div
      className="mf-pfm-bar-chart"
      role="img"
      aria-label={amountsHidden ? 'Andamento: importi nascosti' : 'Spese per data nel periodo selezionato'}
    >
      <div className="mf-pfm-chart-scale">
        {[1, 0.8, 0.6, 0.4, 0.2, 0].map((value) => (
          <span key={value}>{amountsHidden ? '••' : `${((value * maximum) / 100).toFixed(2)} €`}</span>
        ))}
      </div>
      <div className="mf-pfm-chart-columns">
        {rows.map((row) => (
          <div key={row.name}>
            <span style={{ height: amountsHidden ? '15%' : `${(row.amountCents / maximum) * 100}%` }} />
            <small>{row.name.split('-').reverse().slice(0, 2).join('/')}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
