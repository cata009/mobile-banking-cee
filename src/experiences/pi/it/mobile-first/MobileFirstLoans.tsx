import { useEffect, useRef, useState } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { useDemo } from '@/app/state/demoStore'
import {
  buildLoanPortfolio,
  createCreditDemoPdf,
  defaultLoanPreferences,
  loanInstallments,
  moveLoanFavorite,
  validateLoanName,
  isMortgageSimulation,
  type ItalianLoan,
  type LoanPreferences,
  type MortgageSimulation,
} from '@/features/credit/mobileFirstLoans'
import { mobileFirstAssets as shared } from './assets'
import { loansAssets as a } from './loansAssets'
import {
  CREDIT_PREFERENCES_STORAGE_KEY,
  CREDIT_SIMULATIONS_STORAGE_KEY,
  INITIAL_MORTGAGE_SIMULATIONS,
  LOAN_DEBT_DISCLAIMER,
  LOAN_VARIABLE_DISCLAIMER,
} from './loansContent'
import { MOBILE_FIRST_TAB_CONTENT } from './productTabContent'
import { formatSimulationDate, LoanAmount, LoanField, LoanQuickAction, LoansHeader } from './MobileFirstLoansPrimitives'
import MortgageSimulator, { MortgageSimulationDetail } from './MobileFirstLoansSimulation'
import './mobile-first.css'
import './mobile-first-products.css'
import './mobile-first-loans.css'

export type LoansInitialView = 'detail' | 'list' | 'simulations'
export interface MobileFirstLoansProps {
  initialLoanId?: string
  initialView?: LoansInitialView
  onClose: () => void
  onProfile?: () => void
  externalOverlayOpen?: boolean
}
type View =
  LoansInitialView | 'info' | 'installment' | 'rename' | 'document' | 'help' | 'calculator' | 'simulation-detail'

function readPreferences(portfolio: readonly ItalianLoan[]): LoanPreferences {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(CREDIT_PREFERENCES_STORAGE_KEY) ?? 'null')
    if (!raw || typeof raw !== 'object' || !('names' in raw) || !('favorites' in raw) || !Array.isArray(raw.favorites))
      return defaultLoanPreferences(portfolio)
    const names: Record<string, string> = {}
    if (raw.names && typeof raw.names === 'object')
      for (const [id, name] of Object.entries(raw.names))
        if (typeof name === 'string' && !validateLoanName(name)) names[id] = name
    const allowed = new Set(portfolio.map((loan) => loan.id))
    return {
      names,
      favorites: [...new Set(raw.favorites.filter((id): id is string => typeof id === 'string' && allowed.has(id)))],
    }
  } catch {
    return defaultLoanPreferences(portfolio)
  }
}
function readSimulations(): MortgageSimulation[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(CREDIT_SIMULATIONS_STORAGE_KEY) ?? 'null')
    if (!Array.isArray(raw)) return [...INITIAL_MORTGAGE_SIMULATIONS]
    return raw.filter(isMortgageSimulation).slice(0, 70)
  } catch {
    return [...INITIAL_MORTGAGE_SIMULATIONS]
  }
}
function renamedLoan(loan: ItalianLoan, preferences: LoanPreferences): ItalianLoan {
  return { ...loan, name: preferences.names[loan.id] ?? loan.name }
}
function downloadDocument(title: string, lines: string[]) {
  const blob = new Blob([createCreditDemoPdf(title, lines)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.replace(/[^\p{L}\p{N} -]/gu, '').trim() || 'Documento'}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function MobileFirstLoansPanel({
  onOpen,
}: {
  onOpen: (loanId?: string, initialView?: LoansInitialView) => void
}) {
  const { productCounts, amountsHidden } = useDemo()
  const portfolio = buildLoanPortfolio(productCounts)
  const preferences = readPreferences(portfolio)
  const favorites = preferences.favorites
    .map((id) => portfolio.find((loan) => loan.id === id))
    .filter((loan): loan is ItalianLoan => !!loan)
  const visible = (favorites.length ? favorites : portfolio).slice(0, 2).map((loan) => renamedLoan(loan, preferences))
  const [offer, setOffer] = useState<(typeof MOBILE_FIRST_TAB_CONTENT)['Mutui e Prestiti']['products'][number] | null>(
    null,
  )
  const [allOffers, setAllOffers] = useState(false)
  return (
    <div className="mf-product-panel mf-loans-panel">
      <div className="mf-product-owned">
        <div className="mf-product-owned-list">
          {visible.map((loan) => (
            <button
              className="mf-product-credit-card"
              type="button"
              key={loan.id}
              aria-label={`Apri ${loan.name}`}
              onClick={() => onOpen(loan.id, 'detail')}
            >
              <span className="mf-product-summary-heading">
                <span>
                  <strong>{loan.name}</strong>
                  <b>Andrea Rossini - Unicredit</b>
                </span>
                <img src={shared.forwardSmall} alt="" />
              </span>
              <span className="mf-product-credit-balance">
                <LoanAmount value={loan.outstanding} hidden={amountsHidden} />
                <span>Capitale residuo al 31/01/2026</span>
              </span>
            </button>
          ))}
        </div>
        {portfolio.length > 2 && (
          <button className="mf-loan-link mf-product-all" type="button" onClick={() => onOpen(undefined, 'list')}>
            TUTTI I MUTUI E PRESTITI
            <img src={shared.forwardTeal} alt="" />
          </button>
        )}
        <LoanQuickAction
          label="Simulazione mutuo"
          icon={a.imgHomeBankingAndPaymentsInstalmentPlansK10}
          onClick={() => onOpen(undefined, 'simulations')}
        />
      </div>
      <section className="mf-product-commercial" aria-label="I nostri mutui e prestiti">
        <h2>I nostri mutui e prestiti</h2>
        <ScrollableRegion className="mf-product-commercial-rail" aria-label="I nostri mutui e prestiti">
          {MOBILE_FIRST_TAB_CONTENT['Mutui e Prestiti'].products.map((product) => (
            <button
              className="mf-product-commercial-card"
              type="button"
              key={product.title}
              onClick={() => setOffer(product)}
            >
              <span className="mf-product-commercial-photo">
                <img src={product.image} alt="" style={product.crop} />
              </span>
              <span className="mf-product-commercial-copy">
                <strong>{product.title}</strong>
                <span>{product.description}</span>
              </span>
            </button>
          ))}
        </ScrollableRegion>
        <button className="mf-loan-link mf-product-all" type="button" onClick={() => setAllOffers(true)}>
          SCOPRI TUTTI I NOSTRI PRODOTTI
          <img src={shared.forwardTeal} alt="" />
        </button>
      </section>
      {allOffers && (
        <BottomSheet
          title="I nostri mutui e prestiti"
          closeLabel="Chiudi"
          className="mf-loan-sheet"
          onClose={() => setAllOffers(false)}
        >
          <div className="mf-product-sheet-list">
            {MOBILE_FIRST_TAB_CONTENT['Mutui e Prestiti'].products.map((product) => (
              <button
                type="button"
                key={product.title}
                onClick={() => {
                  setAllOffers(false)
                  setOffer(product)
                }}
              >
                {product.title}
                <img src={shared.forwardTeal} alt="" />
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
      {offer && (
        <BottomSheet title={offer.title} closeLabel="Chiudi" className="mf-loan-sheet" onClose={() => setOffer(null)}>
          <p>{offer.description}</p>
          <button
            className="mf-loan-primary"
            type="button"
            onClick={() => {
              setOffer(null)
              onOpen(undefined, 'simulations')
            }}
          >
            Simulazione mutuo
          </button>
        </BottomSheet>
      )}
    </div>
  )
}

export default function MobileFirstLoans({
  initialLoanId = 'mortgage-milano',
  initialView = 'detail',
  onClose,
  onProfile,
  externalOverlayOpen = false,
}: MobileFirstLoansProps) {
  const { productCounts, amountsHidden, toggleAmountsHidden } = useDemo()
  const portfolio = buildLoanPortfolio(productCounts)
  const [preferences, setPreferences] = useState(() => readPreferences(portfolio))
  const [editingPreferences, setEditingPreferences] = useState<LoanPreferences | null>(null)
  const [selectedId, setSelectedId] = useState(initialLoanId)
  const [view, setView] = useState<View>(initialView)
  const [history, setHistory] = useState<View[]>([])
  const [year, setYear] = useState(2025)
  const [installment, setInstallment] = useState(
    loanInstallments(
      2025,
      portfolio.find((item) => item.id === initialLoanId),
    )[0]!,
  )
  const [renameId, setRenameId] = useState(initialLoanId)
  const [name, setName] = useState('')
  const [simulations, setSimulations] = useState(readSimulations)
  const [selectedSimulation, setSelectedSimulation] = useState<MortgageSimulation | null>(null)
  const [sheet, setSheet] = useState<'profile' | 'chat' | 'contact' | 'document-error' | null>(null)
  const [documentTitle, setDocumentTitle] = useState('Attestazione interessi')
  const [documentLines, setDocumentLines] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)
  const effectivePreferences = editingPreferences ?? preferences
  const loans = portfolio.map((loan) => renamedLoan(loan, effectivePreferences))
  const loan = loans.find((loan) => loan.id === selectedId) ?? loans[0]
  const renameTarget = loans.find((loan) => loan.id === renameId)
  const navigate = (next: View) => {
    setHistory((previous) => [...previous, view])
    setView(next)
    setError(null)
  }
  const back = () => {
    setError(null)
    if (editingPreferences && view === 'list') {
      setEditingPreferences(null)
      return
    }
    const previous = history[history.length - 1]
    if (previous) {
      setHistory(history.slice(0, -1))
      setView(previous)
    } else onClose()
  }
  useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: 0 })
    if (view === 'rename') renameRef.current?.focus({ preventScroll: true })
    const activeTab = tabsRef.current?.querySelector<HTMLElement>('[aria-current="page"]')
    if (activeTab && tabsRef.current)
      tabsRef.current.scrollTo?.({
        left: Math.max(0, activeTab.offsetLeft + activeTab.offsetWidth - tabsRef.current.clientWidth + 16),
      })
  }, [view, selectedId])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || sheet || view === 'calculator' || externalOverlayOpen) return
      if (editingPreferences && view === 'list') setEditingPreferences(null)
      else if (history.length) {
        setView(history[history.length - 1]!)
        setHistory(history.slice(0, -1))
      } else onClose()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [view, history, editingPreferences, sheet, onClose, externalOverlayOpen])
  const persistPreferences = (next: LoanPreferences) => {
    try {
      localStorage.setItem(CREDIT_PREFERENCES_STORAGE_KEY, JSON.stringify(next))
      setPreferences(next)
      return true
    } catch {
      setError('Non è stato possibile salvare le modifiche. Riprova.')
      return false
    }
  }
  const openLoan = (id: string) => {
    setSelectedId(id)
    setYear(2025)
    navigate('detail')
  }
  const openRename = (id: string) => {
    setRenameId(id)
    setName(effectivePreferences.names[id] ?? '')
    navigate('rename')
  }
  const openDocument = (title: string, lines: string[]) => {
    setDocumentTitle(title)
    setDocumentLines(lines)
    navigate('document')
  }
  const saveSimulation = (simulation: MortgageSimulation) => {
    const next = [simulation, ...simulations].slice(0, 70)
    try {
      localStorage.setItem(CREDIT_SIMULATIONS_STORAGE_KEY, JSON.stringify(next))
      setSimulations(next)
      return true
    } catch {
      return false
    }
  }
  const header =
    view === 'list' ? (
      <LoansHeader onBack={back} />
    ) : (
      <LoansHeader
        onBack={back}
        onPrivacy={toggleAmountsHidden}
        hidden={amountsHidden}
        onProfile={onProfile ?? (() => setSheet('profile'))}
      />
    )
  const directTabs = loans.length <= 2
  const tabs = (
    <nav ref={tabsRef} className="mf-loan-tabs" aria-label="Mutui e prestiti">
      {directTabs ? (
        loans.map((item, index) => (
          <button
            type="button"
            key={item.id}
            aria-current={view === 'detail' && loan?.id === item.id ? 'page' : undefined}
            onClick={() => {
              setSelectedId(item.id)
              if (view !== 'detail') navigate('detail')
            }}
          >
            {index === 1 && loans[0]?.kind === item.kind ? `Altro ${item.kind.toLowerCase()}` : item.kind}
            {view === 'detail' && loan?.id === item.id && <img src={a.imgEllipse28} alt="" />}
          </button>
        ))
      ) : (
        <>
          <button
            type="button"
            aria-current={view === 'detail' ? 'page' : undefined}
            onClick={() => {
              if (view !== 'detail') navigate('detail')
            }}
          >
            {loan?.kind ?? 'Mutuo'}
            {view === 'detail' && <img src={a.imgEllipse28} alt="" />}
          </button>
          <button
            type="button"
            aria-current={view === 'list' ? 'page' : undefined}
            onClick={() => {
              if (view !== 'list') navigate('list')
            }}
          >
            Tutti i mutui e prestiti
            <img src={a.imgNavigationAndActionForthK10} alt="" />
          </button>
        </>
      )}
      <button
        type="button"
        aria-current={view === 'simulations' ? 'page' : undefined}
        onClick={() => {
          if (view !== 'simulations') navigate('simulations')
        }}
      >
        Simulazioni mutuo{view === 'simulations' && <img src={a.imgEllipse28} alt="" />}
      </button>
    </nav>
  )
  const favoriteLoans = effectivePreferences.favorites
    .map((id) => loans.find((loan) => loan.id === id))
    .filter((loan): loan is ItalianLoan => !!loan)
  const otherLoans = loans
    .filter((loan) => !effectivePreferences.favorites.includes(loan.id))
    .sort((left, right) => left.name.localeCompare(right.name, 'it'))
  const toggleFavorite = (id: string) =>
    setEditingPreferences((previous) =>
      previous
        ? {
            ...previous,
            favorites: previous.favorites.includes(id)
              ? previous.favorites.filter((favorite) => favorite !== id)
              : [...previous.favorites, id],
          }
        : previous,
    )
  const loanTile = (item: ItalianLoan, favorite: boolean, index: number) => (
    <article className="mf-loan-tile" key={item.id}>
      {editingPreferences ? (
        <>
          <div className="mf-loan-tile-top">
            <button
              type="button"
              className="mf-loan-edit-name"
              onClick={() => openRename(item.id)}
              aria-label={`Modifica nome ${item.name}`}
            >
              <strong>{item.name}</strong>
              <img src={a.imgNavigationAndActionEditK10} alt="" />
            </button>
            <button
              type="button"
              aria-label={`${favorite ? 'Rimuovi dai' : 'Aggiungi ai'} preferiti ${item.name}`}
              aria-pressed={favorite}
              onClick={() => toggleFavorite(item.id)}
            >
              <img src={favorite ? a.imgIconButtonFavourite : a.imgIconButtonFavourite1} alt="" />
            </button>
          </div>
          <span>
            {item.kind} - {amountsHidden ? '••••' : item.number}
          </span>
          <div className="mf-loan-tile-bottom">
            <div>
              <LoanAmount value={item.outstanding} hidden={amountsHidden} />
              <span>Capitale residuo</span>
            </div>
            {favorite && (
              <div className="mf-loan-reorder">
                <button
                  type="button"
                  aria-label={`Sposta su ${item.name}`}
                  disabled={index === 0}
                  onClick={() =>
                    setEditingPreferences(
                      (previous) =>
                        previous && { ...previous, favorites: moveLoanFavorite(previous.favorites, item.id, -1) },
                    )
                  }
                >
                  <img src={index === 0 ? a.imgNavigationAndActionUpK11 : a.imgNavigationAndActionUpK10} alt="" />
                </button>
                <button
                  type="button"
                  aria-label={`Sposta giù ${item.name}`}
                  disabled={index === favoriteLoans.length - 1}
                  onClick={() =>
                    setEditingPreferences(
                      (previous) =>
                        previous && { ...previous, favorites: moveLoanFavorite(previous.favorites, item.id, 1) },
                    )
                  }
                >
                  <img
                    src={
                      index === favoriteLoans.length - 1
                        ? a.imgNavigationAndActionDownK11
                        : a.imgNavigationAndActionDownK10
                    }
                    alt=""
                  />
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <button type="button" onClick={() => openLoan(item.id)} aria-label={`Apri ${item.name}`}>
          <strong>{item.name}</strong>
          <span>
            {item.kind} - {amountsHidden ? '••••' : item.number}
          </span>
          <div>
            <LoanAmount value={item.outstanding} hidden={amountsHidden} />
            <span>Capitale residuo</span>
          </div>
        </button>
      )}
    </article>
  )

  return (
    <main className="mf-home mf-loans-page" aria-label="Mutui e Prestiti" lang="it" data-mobile-first-loans={view}>
      {view === 'calculator' ? (
        <MortgageSimulator
          onClose={() => {
            setView('simulations')
            setHistory(history.filter((item) => item !== 'calculator'))
          }}
          onSave={saveSimulation}
        />
      ) : view === 'simulation-detail' && selectedSimulation ? (
        <MortgageSimulationDetail
          simulation={selectedSimulation}
          onBack={back}
          onNew={() => navigate('calculator')}
          onDocument={openDocument}
        />
      ) : (
        <>
          {['info', 'installment', 'rename', 'document', 'help'].includes(view) ? (
            <LoansHeader
              onBack={view === 'rename' || view === 'document' ? back : undefined}
              onClose={back}
              onHelp={view === 'help' || view === 'rename' ? undefined : () => navigate('help')}
            />
          ) : (
            header
          )}
          <ScrollableRegion
            ref={scrollRef}
            className={`mf-loans-scroll${view === 'list' ? ' mf-loans-list-scroll' : ''}`}
            aria-label={view === 'detail' ? 'Dettaglio finanziamento' : 'Contenuto mutui e prestiti'}
          >
            {view === 'detail' && loan && (
              <>
                {tabs}
                <section className="mf-loan-summary">
                  <h1>{loan.name}</h1>
                  <p className="mf-loan-identifier">
                    {loan.kind} - {amountsHidden ? '••••' : loan.number}
                  </p>
                  <div className="mf-loan-balances">
                    <div>
                      <span>Capitale residuo</span>
                      <LoanAmount value={loan.outstanding} hidden={amountsHidden} />
                      <small>Aggiornato al 23/05/2024</small>
                    </div>
                    <div>
                      <span>Capitale rimborsato</span>
                      <LoanAmount value={loan.repaid} hidden={amountsHidden} />
                    </div>
                  </div>
                  <div className="mf-loan-actions">
                    <LoanQuickAction
                      label={`Info ${loan.kind.toLowerCase()}`}
                      icon={a.imgNavigationAndActionInfoSmallK10}
                      onClick={() => navigate('info')}
                    />
                    {loan.kind === 'Mutuo' && (
                      <LoanQuickAction
                        label="Attestazione interessi"
                        icon={a.imgNavigationAndActionDocumentK10}
                        onClick={() =>
                          openDocument(
                            'Attestazione interessi',
                            amountsHidden
                              ? ['Importi e identificativi nascosti']
                              : [
                                  loan.name,
                                  `${loan.kind} ${loan.number}`,
                                  'Anno 2025',
                                  `Quota interessi ${(loanInstallments(2025, loan).reduce((sum, row) => sum + Math.round(row.interest * 100), 0) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2 })} EUR`,
                                ],
                          )
                        }
                      />
                    )}
                  </div>
                </section>
                <section className="mf-loan-block">
                  <h2>Prossima rata</h2>
                  <button
                    type="button"
                    className="mf-loan-next"
                    aria-label={`Prossima rata N°${loanInstallments(2025, loan)[0]!.number}`}
                    onClick={() => {
                      const nextInstallment = loanInstallments(2025, loan)[0]!
                      setInstallment(nextInstallment)
                      navigate('installment')
                    }}
                  >
                    <span>
                      <span>Rata N°{loanInstallments(2025, loan)[0]!.number}</span>
                      <small>Scadenza il 15/02/2025</small>
                    </span>
                    <LoanAmount value={loanInstallments(2025, loan)[0]!.amount} hidden={amountsHidden} />
                  </button>
                </section>
                <section className="mf-loan-block">
                  <h2>Rate annuali</h2>
                  <div className="mf-loan-years" aria-label="Anno rate">
                    <button
                      type="button"
                      aria-label="Anno precedente"
                      disabled={year <= 2024}
                      onClick={() => setYear(year - 1)}
                    >
                      <img src={a.imgNavigationAndActionArrowBack} alt="" />
                    </button>
                    {Array.from({ length: 5 }, (_, offset) => year + offset - 1).map((option) => (
                      <button
                        type="button"
                        aria-pressed={year === option}
                        key={option}
                        disabled={option < 2024 || option > 2040}
                        onClick={() => setYear(option)}
                      >
                        {option}
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-label="Anno successivo"
                      disabled={year >= 2040}
                      onClick={() => setYear(year + 1)}
                    >
                      <img src={a.imgNavigationAndActionArrowForth} alt="" />
                    </button>
                  </div>
                  <div>
                    {loanInstallments(year, loan).map((rata) => (
                      <button
                        type="button"
                        className="mf-loan-installment"
                        key={rata.number}
                        aria-label={`Rata N°${rata.number}`}
                        onClick={() => {
                          setInstallment(rata)
                          navigate('installment')
                        }}
                      >
                        <span>
                          <span>Rata N°{rata.number}</span>
                          <small>Scadenza il {rata.date}</small>
                        </span>
                        <LoanAmount value={rata.amount} hidden={amountsHidden} />
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}
            {view === 'detail' && !loan && (
              <>
                <h1>Mutui e prestiti</h1>
                <p>Non hai mutui o prestiti da visualizzare.</p>
                <LoanQuickAction
                  label="Simulazione mutuo"
                  icon={a.imgHomeBankingAndPaymentsInstalmentPlansK10}
                  onClick={() => navigate('simulations')}
                />
              </>
            )}
            {view === 'list' && (
              <>
                <h1>Tutti i mutui e prestiti</h1>
                {favoriteLoans.length > 0 && (
                  <section className="mf-loan-block" aria-label="Preferiti">
                    <h2>Preferiti</h2>
                    {editingPreferences && (
                      <p className="mf-loan-customize-hint">
                        Puoi spostare i tuoi preferiti per posizionarli secondo l’ordine desiderato.
                      </p>
                    )}
                    <div className="mf-loan-list">
                      {favoriteLoans.map((item, index) => loanTile(item, true, index))}
                    </div>
                  </section>
                )}
                {otherLoans.length > 0 && (
                  <section className="mf-loan-block" aria-label="Tutti">
                    <h2>Tutti</h2>
                    {otherLoans.map((item, index) => (
                      <div
                        key={item.id}
                        id={
                          index === 0 || otherLoans[index - 1]?.name[0] !== item.name[0]
                            ? `mf-loan-letter-${item.name[0]?.toLocaleUpperCase('it')}`
                            : undefined
                        }
                      >
                        <span className="mf-loan-letter">
                          {index === 0 || otherLoans[index - 1]?.name[0] !== item.name[0] ? item.name[0] : ''}
                        </span>
                        {loanTile(item, false, index)}
                      </div>
                    ))}
                  </section>
                )}
                {!loans.length && <p>Non hai mutui o prestiti da visualizzare.</p>}
                {otherLoans.length > 0 && (
                  <nav className="mf-loan-alphabet" aria-label="Indice alfabetico">
                    {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                      <button
                        type="button"
                        key={letter}
                        disabled={!otherLoans.some((item) => item.name[0]?.toLocaleUpperCase('it') === letter)}
                        onClick={() =>
                          document
                            .getElementById(`mf-loan-letter-${letter}`)
                            ?.scrollIntoView?.({ block: 'start', behavior: 'smooth' })
                        }
                      >
                        {letter}
                      </button>
                    ))}
                  </nav>
                )}
                <LoanQuickAction
                  label="Simulazione mutuo"
                  icon={a.imgHomeBankingAndPaymentsInstalmentPlansK10}
                  onClick={() => navigate('simulations')}
                />
              </>
            )}
            {view === 'info' && loan && (
              <>
                <h1>{loan.name}</h1>
                <p className="mf-loan-subtitle">{amountsHidden ? '••••' : loan.number}</p>
                <button className="mf-loan-link mf-loan-rename-link" type="button" onClick={() => openRename(loan.id)}>
                  MODIFICA NOME
                  <img src={a.imgNavigationAndActionEditT2} alt="" />
                </button>
                <section className="mf-loan-capital">
                  <div>
                    <strong>Capitale erogato</strong>
                    <LoanAmount value={loan.outstanding + loan.repaid} hidden={amountsHidden} />
                  </div>
                  <div
                    className="mf-loan-capital-progress"
                    role="img"
                    aria-label={
                      amountsHidden
                        ? 'Capitale nascosto'
                        : `Capitale estinto ${((loan.repaid / (loan.repaid + loan.outstanding)) * 100).toFixed(2)}%, residuo ${((loan.outstanding / (loan.repaid + loan.outstanding)) * 100).toFixed(2)}%`
                    }
                  >
                    <span style={{ width: `${(loan.repaid / (loan.repaid + loan.outstanding)) * 100}%` }} />
                  </div>
                  <div className="mf-loan-capital-legend">
                    <span>
                      Capitale estinto{' '}
                      <b>
                        {amountsHidden
                          ? '••••'
                          : `${loan.repaid.toLocaleString('it-IT', { minimumFractionDigits: 2 })}€`}
                      </b>
                      <strong>
                        ●{' '}
                        {amountsHidden
                          ? '••••'
                          : `${((loan.repaid / (loan.repaid + loan.outstanding)) * 100).toFixed(2)}%`}
                      </strong>
                    </span>
                    <span>
                      Capitale residuo{' '}
                      <b>
                        {amountsHidden
                          ? '••••'
                          : `${loan.outstanding.toLocaleString('it-IT', { minimumFractionDigits: 2 })}€`}
                      </b>
                      <strong>
                        ●{' '}
                        {amountsHidden
                          ? '••••'
                          : `${((loan.outstanding / (loan.repaid + loan.outstanding)) * 100).toFixed(2)}%`}
                      </strong>
                    </span>
                  </div>
                </section>
                <div className="mf-loan-fields">
                  <LoanField label="Valuta">Eur</LoanField>
                  <LoanField label="Capitale residuo">
                    <LoanAmount value={loan.outstanding} hidden={amountsHidden} small />
                  </LoanField>
                  <LoanField label="Capitale rimborsato">
                    <LoanAmount value={loan.repaid} hidden={amountsHidden} small />
                  </LoanField>
                  <LoanField label="Data di erogazione">06/11/2007</LoanField>
                  <LoanField label="Numero rate residue">
                    {Array.from({ length: 16 }, (_, i) => loanInstallments(2025 + i, loan)).flat().length}
                  </LoanField>
                  <LoanField label="Periodicità rate">Mensile</LoanField>
                </div>
                <p className="mf-loan-disclaimer">{LOAN_VARIABLE_DISCLAIMER}</p>
                <p className="mf-loan-disclaimer">{LOAN_DEBT_DISCLAIMER}</p>
              </>
            )}
            {view === 'installment' && loan && (
              <>
                <h1>Rata N° {installment.number}</h1>
                <p className="mf-loan-subtitle">{loan.name}</p>
                <div className="mf-loan-fields mf-loan-installment-fields">
                  <LoanField label="Scadenza">{installment.date}</LoanField>
                  <LoanField label="Quota capitale">
                    <LoanAmount value={installment.capital} hidden={amountsHidden} small />
                  </LoanField>
                  <LoanField label="Quota interessi">
                    <LoanAmount value={installment.interest} hidden={amountsHidden} small />
                  </LoanField>
                  <LoanField label="Altre voci">
                    <LoanAmount value={installment.other} hidden={amountsHidden} small />
                  </LoanField>
                  <LoanField label="Totale rata">
                    <LoanAmount value={installment.amount} hidden={amountsHidden} small />
                  </LoanField>
                  <LoanField label="Capitale residuo">
                    <LoanAmount value={installment.outstanding} hidden={amountsHidden} small />
                  </LoanField>
                </div>
              </>
            )}
            {view === 'rename' && renameTarget && (
              <>
                <h1>Modifica nome del {renameTarget.kind.toLowerCase()}</h1>
                <label className="mf-loan-input">
                  Nome {renameTarget.kind}
                  <input
                    ref={renameRef}
                    value={name}
                    maxLength={20}
                    placeholder="Inserisci nome"
                    aria-describedby="mf-loan-name-hint"
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <small id="mf-loan-name-hint">Massimo 20 caratteri alfanumerici</small>
                <button
                  className="mf-loan-link mf-loan-default-name"
                  type="button"
                  onClick={() => setName(portfolio.find((item) => item.id === renameId)?.name ?? '')}
                >
                  Ripristina nome di default
                </button>
              </>
            )}
            {view === 'simulations' && (
              <>
                {tabs}
                <h1>Simulazioni mutuo</h1>
                <p className="mf-loan-simulation-intro">
                  Da questa pagina è possibile visualizzare l’elenco delle tue simulazioni. Il limite massimo è di 70
                  visualizzazioni.
                </p>
                {simulations.map((simulation) => (
                  <article className="mf-loan-simulation-row" key={simulation.id}>
                    <div>
                      <span>{simulation.name}</span>
                      <strong>{formatSimulationDate(simulation.createdAt)}</strong>
                      <small>{simulation.draft.years} anni</small>
                      <LoanAmount value={simulation.draft.principal} hidden={amountsHidden} small />
                    </div>
                    <button
                      className="mf-loan-link"
                      type="button"
                      aria-label={`Dettaglio ${simulation.name}`}
                      onClick={() => {
                        setSelectedSimulation(simulation)
                        navigate('simulation-detail')
                      }}
                    >
                      DETTAGLIO
                      <img src={a.imgNavigationAndActionEditT2} alt="" />
                    </button>
                  </article>
                ))}
                {!simulations.length && <p>Non ci sono simulazioni da visualizzare.</p>}
              </>
            )}
            {view === 'document' && (
              <>
                <h1>{documentTitle}</h1>
                <article className="mf-loan-pdf-preview">
                  <h2>UniCredit</h2>
                  <strong>{documentTitle}</strong>
                  <p>Documento dimostrativo - PI Italy</p>
                  {(amountsHidden ? ['Importi e identificativi nascosti'] : documentLines).map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </article>
              </>
            )}
            {view === 'help' && (
              <>
                <h1>
                  {history[history.length - 1] === 'info'
                    ? `Info ${loan?.kind ?? 'Mutuo'}`
                    : `Dettaglio Rata ${loan?.kind ?? 'Mutuo'}`}
                </h1>
                <p>Puoi visualizzare, di ciascuna rata del tuo {loan?.kind.toLowerCase() ?? 'mutuo'}:</p>
                <ul className="mf-loan-help-list">
                  <li>Scadenza</li>
                  <li>Quota capitale</li>
                  <li>Quota interessi</li>
                  <li>Altre voci</li>
                  <li>Totale rata</li>
                  <li>Capitale residuo</li>
                </ul>
                <h2>Potrebbe interessarti</h2>
                {['Dettaglio Rata Prestito', 'Info Mutuo', 'Info Prestito'].map((title) => (
                  <button
                    className="mf-loan-help-link"
                    type="button"
                    key={title}
                    onClick={() => {
                      const kind = title.includes('Prestito') ? 'Prestito' : 'Mutuo'
                      const target = loan?.kind === kind ? loan : loans.find((item) => item.kind === kind)
                      if (!target) {
                        setSheet('contact')
                        return
                      }
                      if (target.id !== loan?.id) {
                        setSelectedId(target.id)
                        setYear(2025)
                        setInstallment(loanInstallments(2025, target)[0]!)
                      }
                      setHistory(
                        history.filter(
                          (previous) => previous !== 'help' && previous !== 'info' && previous !== 'installment',
                        ),
                      )
                      setView(title.startsWith('Info') ? 'info' : 'installment')
                    }}
                  >
                    {title}
                    <img src={shared.forwardTeal} alt="" />
                  </button>
                ))}
                <button className="mf-loan-link" type="button" onClick={() => setSheet('contact')}>
                  VEDI TUTTE LE FAQ
                  <img src={shared.forwardTeal} alt="" />
                </button>
                <div className="mf-loan-support">
                  <LoanQuickAction
                    label="Avvia Chat"
                    icon={a.imgNavigationAndActionChat}
                    onClick={() => setSheet('chat')}
                  />
                  <LoanQuickAction
                    label="Parla con noi"
                    icon={a.imgBankTouchpointAndCustomerCareAgency}
                    onClick={() => setSheet('contact')}
                  />
                </div>
              </>
            )}
            {error && (
              <p role="alert" className="mf-loan-error">
                {error}
              </p>
            )}
          </ScrollableRegion>
          {view === 'list' && (
            <footer className="mf-loan-footer">
              {editingPreferences ? (
                <button
                  className="mf-loan-primary"
                  type="button"
                  disabled={JSON.stringify(editingPreferences) === JSON.stringify(preferences)}
                  onClick={() => {
                    if (persistPreferences(editingPreferences)) setEditingPreferences(null)
                  }}
                >
                  Salva modifica
                </button>
              ) : (
                <button
                  className="mf-loan-link"
                  type="button"
                  onClick={() =>
                    setEditingPreferences({ names: { ...preferences.names }, favorites: [...preferences.favorites] })
                  }
                >
                  PERSONALIZZA VISTA
                  <img src={a.imgNavigationAndActionEditT2} alt="" />
                </button>
              )}
            </footer>
          )}
          {view === 'rename' && (
            <footer className="mf-loan-footer">
              <button
                className="mf-loan-primary"
                type="button"
                disabled={!!validateLoanName(name)}
                onClick={() => {
                  const next = {
                    ...effectivePreferences,
                    names: { ...effectivePreferences.names, [renameId]: name.trim() },
                  }
                  if (editingPreferences) {
                    setEditingPreferences(next)
                    back()
                  } else if (persistPreferences(next)) back()
                }}
              >
                Salva modifica
              </button>
              <button className="mf-loan-secondary" type="button" onClick={back}>
                Annulla
              </button>
            </footer>
          )}
          {view === 'simulations' && (
            <footer className="mf-loan-footer">
              <button className="mf-loan-primary" type="button" onClick={() => navigate('calculator')}>
                Nuova simulazione
              </button>
            </footer>
          )}
          {view === 'document' && (
            <footer className="mf-loan-footer">
              <button
                className="mf-loan-primary"
                type="button"
                onClick={async () => {
                  try {
                    const visibleLines = amountsHidden ? ['Importi e identificativi nascosti'] : documentLines
                    const file = new File([createCreditDemoPdf(documentTitle, visibleLines)], 'Attestazione.pdf', {
                      type: 'application/pdf',
                    })
                    if (navigator.canShare?.({ files: [file] }))
                      await navigator.share({ files: [file], title: documentTitle })
                    else downloadDocument(documentTitle, visibleLines)
                  } catch (cause) {
                    if (!(cause instanceof Error && cause.name === 'AbortError')) setSheet('document-error')
                  }
                }}
              >
                Condividi PDF
              </button>
            </footer>
          )}
        </>
      )}
      {sheet && (
        <BottomSheet
          title={
            {
              profile: 'Profilo',
              chat: 'Avvia Chat',
              contact: 'Parla con noi',
              'document-error': 'Impossibile scaricare documento',
            }[sheet]
          }
          closeLabel="Chiudi"
          className="mf-loan-sheet"
          onClose={() => setSheet(null)}
        >
          {sheet === 'profile' ? (
            <>
              <p>Andrea Rossini</p>
              <button className="mf-loan-secondary" type="button" onClick={toggleAmountsHidden}>
                {amountsHidden ? 'Mostra importi' : 'Nascondi importi'}
              </button>
            </>
          ) : sheet === 'document-error' ? (
            <>
              <p>Non è stato possibile scaricare il documento. Riprova.</p>
              <button
                className="mf-loan-primary"
                type="button"
                onClick={() => {
                  setSheet(null)
                  downloadDocument(documentTitle, amountsHidden ? ['Importi e identificativi nascosti'] : documentLines)
                }}
              >
                Riprova
              </button>
            </>
          ) : (
            <>
              <p>
                {sheet === 'chat'
                  ? 'Come possiamo aiutarti con il tuo mutuo o prestito?'
                  : 'Per informazioni sul tuo finanziamento contatta la tua filiale UniCredit.'}
              </p>
              <p>Andrea Rossini · UniCredit</p>
              <button className="mf-loan-secondary" type="button" onClick={() => setSheet(null)}>
                Torna al finanziamento
              </button>
            </>
          )}
        </BottomSheet>
      )}
    </main>
  )
}
