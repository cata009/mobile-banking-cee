import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  getItalyFinancialSnapshot,
  subscribeItalyFinancialChanges,
  setEventAnnotations,
  setFinancialCardStatus,
  selectCardBalance,
  toCents,
} from '@/features/finance/italyFinancials'
import { useDemo } from '@/app/state/demoStore'
import { BottomSheet } from '@/app/components/BottomSheet'
import { downloadCardMovements } from '@/features/cards/mobileFirstCardsExport'
import {
  cardCapabilities,
  changeCardStatus,
  filterCardMovements,
  getCardLedgerRecord,
  getCardLedgerMovements,
  type CardMovementFilter,
} from '@/features/cards/mobileFirstCards'
import {
  ITALY_CARDS,
  CARD_STATUS_LABELS,
  type ItalyCard,
  type ItalyCardMovement,
  type ItalyCardsSnapshot,
} from './cardsContent'
import { cardsAssets as a } from './cardsAssets'
import { CardAmount, CardArt, CardButton, CardQuickAction, CardRow, CardsPage } from './MobileFirstCardsPrimitives'
import MobileFirstCardsJourney from './MobileFirstCardsJourney'
import MobileFirstCardsMovement from './MobileFirstCardsMovement'
import './mobile-first.css'
import './mobile-first-cards.css'

export type CardsView =
  | 'hub'
  | 'detail'
  | 'pin'
  | 'manage'
  | 'info'
  | 'rename'
  | 'personalize'
  | 'number'
  | 'problems'
  | 'limit'
  | 'installments'
  | 'activate'
  | 'wallet'
  | 'duplicate'
  | 'repayment'
  | 'reimburse'
  | 'premium'
  | 'usage'
  | 'statement'
  | 'spending-limit'
  | 'geography'
  | 'shops'
  | 'support'
  | 'recharge'
  | 'tracking'
  | 'renewal'
  | 'physical'
  | 'image'
  | 'parental'
  | 'missions'
  | 'bancomat'
  | 'isee'
  | 'disputes'
  | 'debit-date'
  | 'installment-amount'
export interface MobileFirstCardsProps {
  onClose: () => void
  onProfile?: () => void
  initialCardId?: string
  initialMovementId?: string
  initialView?: 'hub' | 'detail' | 'pin'
  onOperations?: () => void
  externalOverlayOpen?: boolean
  initialSnapshot?: ItalyCardsSnapshot
  onSnapshot?: (snapshot: ItalyCardsSnapshot) => void
}
export default function MobileFirstCards({
  onClose,
  onProfile,
  initialCardId = 'flexia',
  initialMovementId,
  initialView = 'hub',
  onOperations,
  externalOverlayOpen = false,
  initialSnapshot,
  onSnapshot,
}: MobileFirstCardsProps) {
  const { amountsHidden, toggleAmountsHidden } = useDemo()
  const financial = useSyncExternalStore(
    subscribeItalyFinancialChanges,
    getItalyFinancialSnapshot,
    getItalyFinancialSnapshot,
  )
  const [cardSettings, setCards] = useState<ItalyCard[]>(
    () => initialSnapshot?.cards ?? ITALY_CARDS.map((c) => ({ ...c })),
  )
  const cards = useMemo(
    () => cardSettings.map((card) => getCardLedgerRecord(card, financial)),
    [cardSettings, financial],
  )
  const [cardId, setCardId] = useState(initialCardId)
  const [view, setView] = useState<CardsView>(initialMovementId !== undefined ? 'detail' : initialView)
  const [history, setHistory] = useState<CardsView[]>(
    initialMovementId === undefined && initialView === 'pin' ? ['detail'] : [],
  )
  const [owner, setOwner] = useState('Tutte')
  const [includeInactive, setIncludeInactive] = useState(true)
  const movementMap = useMemo<Record<string, ItalyCardMovement[]>>(
    () => Object.fromEntries(cardSettings.map((card) => [card.id, getCardLedgerMovements(card.id, financial)])),
    [cardSettings, financial],
  )
  const movements = movementMap[cardId] ?? []
  const [selectedMovement, setSelectedMovement] = useState<string | null>(
    () => movements.find((m) => m.id === initialMovementId)?.id ?? null,
  )
  const [filter, setFilter] = useState<CardMovementFilter>({})
  const [searchOpen, setSearchOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null)
  const [operations, setOperations] = useState(false)
  const [resumeOpen, setResumeOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const detailScrollPositions = useRef(new Map<string, number>())
  const card = cards.find((c) => c.id === cardId) ?? cards[1]!
  const repayment = card.repayment ?? 'A saldo'
  const plans = card.plans ?? []
  const capabilities = cardCapabilities(card.kind, card.status)
  const go = (next: CardsView) => {
    setHistory((h) => [...h, view])
    setView(next)
    setNotice(null)
  }
  const back = useCallback(() => {
    if (selectedMovement) {
      setSelectedMovement(null)
      return
    }
    if (filtersOpen) {
      setFiltersOpen(false)
      return
    }
    if (history.length) {
      setView(history[history.length - 1]!)
      setHistory((h) => h.slice(0, -1))
    } else onClose()
  }, [selectedMovement, filtersOpen, history, onClose])
  const openCard = (id: string, fromHub = true) => {
    setCardId(id)
    setView('detail')
    setHistory(fromHub ? ['hub'] : [])
    setSearchOpen(false)
    setFilter({})
  }
  const update = (patch: Partial<ItalyCard>) =>
    setCards((cs) => cs.map((c) => (c.id === cardId ? { ...c, ...patch } : c)))
  const status = (action: 'suspend' | 'resume' | 'block' | 'activate') => {
    const next = changeCardStatus(card.status, action)
    setFinancialCardStatus(card.id, next)
    update({ status: next })
  }
  const inform = (title: string, message: string) => setNotice({ title, message })
  const shown = filterCardMovements(movements, filter)
  useEffect(() => {
    onSnapshot?.({ cards, movements: movementMap })
  }, [cards, movementMap, onSnapshot])
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])
  useEffect(() => {
    if (!['hub', 'detail', 'manage'].includes(view) && !selectedMovement && !filtersOpen) return
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !operations &&
        !notice &&
        !resumeOpen &&
        !externalOverlayOpen &&
        !document.querySelector('[role="dialog"]') &&
        !event.defaultPrevented
      )
        back()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [back, notice, operations, resumeOpen, externalOverlayOpen, view, selectedMovement, filtersOpen])
  const overlay = (
    <>
      {notice && (
        <BottomSheet title={notice.title} onClose={() => setNotice(null)} closeLabel="Chiudi" className="mfc-sheet">
          <p>{notice.message}</p>
          <CardButton onClick={() => setNotice(null)}>Ok</CardButton>
        </BottomSheet>
      )}
      {resumeOpen && (
        <BottomSheet
          title="Riattiva carta"
          closeLabel="Chiudi"
          onClose={() => setResumeOpen(false)}
          className="mfc-sheet"
        >
          <p>Conferma per rendere nuovamente utilizzabile la carta.</p>
          <CardButton
            onClick={() => {
              status('resume')
              setResumeOpen(false)
            }}
          >
            Conferma riattivazione
          </CardButton>
        </BottomSheet>
      )}
      {operations && (
        <BottomSheet title="Operazioni" closeLabel="Chiudi" onClose={() => setOperations(false)} className="mfc-sheet">
          <div className="mfc-menu">
            <CardButton
              onClick={() => {
                setOperations(false)
                go('manage')
              }}
            >
              Gestione Carta
            </CardButton>
            <CardButton
              onClick={() => {
                setOperations(false)
                go('problems')
              }}
            >
              Problemi Carta
            </CardButton>
            {onOperations && (
              <CardButton
                secondary
                onClick={() => {
                  setOperations(false)
                  onOperations()
                }}
              >
                Tutte le operazioni
              </CardButton>
            )}
          </div>
        </BottomSheet>
      )}
    </>
  )
  if (selectedMovement || filtersOpen)
    return (
      <>
        <MobileFirstCardsMovement
          movements={movements}
          asOf={financial.asOf}
          movement={movements.find((m) => m.id === selectedMovement)}
          shareRows={selectedMovement === 'share' ? shown : undefined}
          filter={filter}
          onApplyFilter={(f) => {
            setFilter(f)
            setFiltersOpen(false)
          }}
          onChange={(patch) => {
            const movement = movements.find((row) => row.id === selectedMovement)
            if (!movement?.eventId) return
            const result = setEventAnnotations(movement.eventId, {
              ...(patch.category !== undefined ? { category: patch.category } : {}),
              ...(patch.subcategory !== undefined ? { subcategory: patch.subcategory } : {}),
              ...(patch.note !== undefined ? { note: patch.note } : {}),
              ...(patch.excluded !== undefined ? { excluded: patch.excluded } : {}),
              ...(patch.splitCategories
                ? {
                    splits: patch.splitCategories.map((part) => ({
                      category: part.category,
                      amountCents: toCents(Math.abs(part.amount)),
                    })),
                  }
                : {}),
            })
            if (!result.ok) inform('Movimento', result.error ?? 'Modifica non disponibile')
          }}
          onClose={back}
          hidden={amountsHidden}
          onInstallments={
            capabilities.installments
              ? () => {
                  setSelectedMovement(null)
                  go('installments')
                }
              : undefined
          }
          onNotice={inform}
        />
        {overlay}
      </>
    )
  if (view !== 'hub' && view !== 'detail' && view !== 'manage')
    return (
      <>
        <MobileFirstCardsJourney
          key={`${cardId}-${view}`}
          view={view}
          externalOverlayOpen={externalOverlayOpen}
          card={card}
          hidden={amountsHidden}
          cards={cards}
          onClose={back}
          onGo={go}
          onChange={update}
          onSetCards={setCards}
          onStatus={status}
          onDone={() => {
            setView('detail')
            setHistory(initialView === 'hub' ? ['hub'] : [])
          }}
          onNotice={inform}
          repayment={repayment}
          onRepayment={(repayment) => update({ repayment })}
          plans={plans}
          movements={movements}
          financial={financial}
          onStatement={(month) =>
            downloadCardMovements(
              movements.filter((m) => m.date.startsWith(month)),
              'pdf',
              amountsHidden,
              `Estratto conto ${month} - ${card.name}`,
            )
          }
        />
        {overlay}
      </>
    )
  if (view === 'hub') {
    const visible = cards.filter(
      (c) =>
        owner === 'Tutte' ||
        (owner === 'Le mie' ? c.owner === 'mine' : owner === 'Minori' ? c.owner === 'minor' : c.owner === 'other'),
    )
    const sections = [
      ['Operative', visible.filter((c) => ['active', 'renewing'].includes(c.status))],
      ['Bloccate', visible.filter((c) => ['blocked', 'suspended'].includes(c.status))],
      ['In spedizione', visible.filter((c) => ['delivered', 'shipping'].includes(c.status))],
    ] as const
    const wallet = (items: readonly ItalyCard[]) => (
      <div className="mfc-wallet">
        {items.map((c) => (
          <CardArt key={c.id} card={c} hidden={amountsHidden} onOpen={() => openCard(c.id)} />
        ))}
      </div>
    )
    return (
      <CardsPage
        title="Carte"
        onBack={back}
        profile
        onProfile={onProfile}
        hidden={amountsHidden}
        onPrivacy={toggleAmountsHidden}
        footer={<CardButton onClick={() => go('personalize')}>Personalizza</CardButton>}
      >
        <section className="mfc-hub-section" aria-label="Preferite">
          <h2>Preferite</h2>
          {wallet(cards.filter((c) => c.favorite))}
        </section>
        <div className="mfc-tabs" role="tablist" aria-label="Intestatari carte">
          {['Tutte', 'Le mie', 'Minori', 'Altri intestatari'].map((label) => (
            <button
              type="button"
              role="tab"
              aria-selected={owner === label}
              key={label}
              onClick={() => setOwner(label)}
            >
              {label}
            </button>
          ))}
        </div>
        {sections.map(([label, list]) =>
          label === 'Operative' || includeInactive ? (
            <section key={label} className="mfc-hub-section" aria-label={label}>
              <h2>{label}</h2>
              {list.length ? wallet(list) : <p>Nessuna carta</p>}
            </section>
          ) : null,
        )}
        <button type="button" className="mf-text-link mfc-center" onClick={() => setIncludeInactive(!includeInactive)}>
          {includeInactive ? 'NASCONDI CARTE NON ATTIVE' : 'MOSTRA CARTE NON ATTIVE'}
        </button>
      </CardsPage>
    )
  }
  if (view === 'manage') {
    const row = (label: string, next: CardsView, value?: ReactNode, action = 'VISUALIZZA', ariaLabel?: string) => (
      <CardRow key={label} label={label} value={value} action={action} onClick={() => go(next)} ariaLabel={ariaLabel} />
    )
    const group = (title: string, children: ReactNode) => (
      <section className="mfc-management-section">
        <h3>{title}</h3>
        <div className="mfc-row-group">{children}</div>
      </section>
    )
    return (
      <>
        <CardsPage
          title="Gestione Carta"
          onBack={back}
          onClose={() => {
            setView('detail')
            setHistory(initialView === 'hub' ? ['hub'] : [])
          }}
        >
          <p className="mfc-subtitle">
            {card.holder} {amountsHidden ? '•••• ••••' : `**** ${card.lastFour}`}
          </p>
          <span className={`mfc-status mfc-status-${card.status}`}>{CARD_STATUS_LABELS[card.status]}</span>
          <div className="mfc-quick-actions mfc-management-quick">
            <CardQuickAction label="Gestisci" src={a.imgNavigationAndActionSettings} onClick={() => go('problems')} />
          </div>
          <div className="mfc-info">
            <strong>Tracking</strong>
            <p>Monitora il tracking della tua carta</p>
            <button type="button" className="mf-text-link" onClick={() => go('tracking')}>
              VEDI DETTAGLIO <img src={a.imgNavigationAndActionForthT2} alt="" />
            </button>
          </div>
          {card.owner === 'minor' &&
            group(
              'Minori',
              <>
                {row('Parental control', 'parental', undefined, 'GESTISCI')}
                {row('Missioni', 'missions', undefined, 'GESTISCI')}
              </>,
            )}
          {group(
            'Dati carta e supporto',
            <>
              {row('Gestisci tra i preferiti', 'personalize', undefined, 'MODIFICA')}
              {row('Info carta', 'info')}
              {row('Nome carta', 'rename', card.nickname ?? card.holder, 'MODIFICA', 'Modifica nome carta')}
              {capabilities.reveal && (
                <>
                  {row('Numero carta e cvv', 'number', undefined, 'VISUALIZZA', 'Visualizza numero carta e CVV')}
                  {row('Visualizza PIN', 'pin', undefined, 'VISUALIZZA', 'Visualizza PIN')}
                </>
              )}
              {row('Supporto', 'physical', 'Plastica standard', 'RICHIEDI CARTA FISICA')}
              {row('Immagine carta', 'image', undefined, 'CAMBIA IMMAGINE')}
              {row('Rinnovo carta', 'renewal', undefined, 'GESTIONE RINNOVO')}
            </>,
          )}
          {group(
            'Wallet',
            <CardRow
              label="Google Pay"
              action={card.wallet ? 'AGGIUNTA' : 'AGGIUNGI'}
              onClick={() => go('wallet')}
              ariaLabel="Aggiungi a Google Pay"
            />,
          )}
          {card.kind === 'credit' &&
            group(
              'Credit card',
              <>
                {row('Dettaglio utilizzo', 'usage')}
                {row('Modalità di rimborso', 'repayment', repayment, 'CAMBIA')}
                {row('Data di addebito', 'debit-date', card.settings?.['debit-date']?.[0] ?? 'Giorno dopo', 'MODIFICA')}
                {row(
                  'Debito residuo',
                  'reimburse',
                  <CardAmount value={card.debt ?? 0} hidden={amountsHidden} />,
                  'RIMBORSA',
                )}
                {row(
                  'Importo rata',
                  'installment-amount',
                  <CardAmount
                    value={Number(card.settings?.['installment-amount']?.[0]?.replace(',00 €', '') ?? 50)}
                    hidden={amountsHidden}
                  />,
                  'MODIFICA',
                )}
                {row('Piani rateali', 'premium', undefined, 'MODIFICA')}
                {row('Plafond', 'limit', undefined, 'MODIFICA')}
                {row('Estratto conto', 'statement')}
              </>,
            )}
          {group(
            'Limiti carta',
            <>
              {row('Limiti di spesa', 'spending-limit', undefined, 'MODIFICA')}
              {row('Aree geografiche', 'geography', undefined, 'MODIFICA')}
              {row('Negozi abilitati', 'shops')}
            </>,
          )}
          {card.kind === 'prepaid' &&
            group(
              'Funzionalità conto',
              <>
                {row('Limiti operativi', 'spending-limit', undefined, 'MODIFICA')}
                {row('BANCOMAT® Pay', 'bancomat', 'Attivo su un altro conto', 'GESTISCI')}
                {row('Attestazione ISEE', 'isee', 'Certificazione ai fini ISEE', 'RICHIEDI')}
                {row('Contestazioni movimenti', 'disputes')}
              </>,
            )}
          {group(
            'Supporto',
            <>
              {row('Richiedi duplicato', 'duplicate')}
              {row('Problemi carta', 'problems')}
              {row('Assistenza carta', 'support')}
            </>,
          )}
        </CardsPage>
        {overlay}
      </>
    )
  }
  let lastDay = '',
    lastMonth = ''
  const filtered = Object.values(filter).some((x) => x !== undefined && x !== '')
  return (
    <>
      <CardsPage
        onBack={back}
        scrollPosition={detailScrollPositions.current.get(cardId) ?? 0}
        onScrollPositionChange={(position) => detailScrollPositions.current.set(cardId, position)}
        profile
        onProfile={onProfile}
        hidden={amountsHidden}
        onPrivacy={toggleAmountsHidden}
        footer={
          <button type="button" className="mfc-floating" onClick={onOperations ?? (() => setOperations(true))}>
            Operazioni
          </button>
        }
      >
        <section className="mfc-detail-heading">
          <h2>{card.nickname ?? card.holder}</h2>
          <b>{amountsHidden ? '•••• ••••' : `**** ${card.lastFour}`}</b>
        </section>
        <div className="mfc-detail-wallet mfc-wallet">
          {cards
            .filter((c) => c.favorite && c.id !== card.id)
            .slice(0, 1)
            .map((c) => (
              <CardArt key={c.id} card={c} hidden={amountsHidden} onOpen={() => openCard(c.id, false)} />
            ))}
          <CardArt card={card} hidden={amountsHidden} onPin={() => go('pin')} />
        </div>
        {card.status !== 'active' && card.status !== 'renewing' && (
          <div className="mfc-info">
            <strong>
              {card.status === 'suspended'
                ? 'Carta sospesa'
                : card.status === 'blocked'
                  ? 'Carta bloccata'
                  : CARD_STATUS_LABELS[card.status]}
            </strong>
            <p>
              {card.status === 'suspended'
                ? 'Puoi riattivare la carta quando vuoi.'
                : card.status === 'delivered'
                  ? 'Hai ricevuto la carta? Attivala per iniziare a utilizzarla.'
                  : 'Gestisci la tua carta per maggiori informazioni.'}
            </p>
            {capabilities.resume && <CardButton onClick={() => setResumeOpen(true)}>Riattiva carta</CardButton>}
            {capabilities.activate && <CardButton onClick={() => go('activate')}>Attiva carta</CardButton>}
          </div>
        )}
        {card.premium && (
          <div className="mfc-row-group mfc-premium">
            <CardRow label="Linea Premium" onClick={() => go('premium')} action="DETTAGLIO" />
            <div className="mfc-data-grid">
              <span>
                Totale utilizzato
                <b>
                  <CardAmount value={plans.reduce((sum, plan) => sum + plan.total, 0)} hidden={amountsHidden} />
                </b>
              </span>
              <span>
                Disponibilità residua
                <b>
                  <CardAmount
                    value={Math.max(0, card.limit - plans.reduce((sum, plan) => sum + plan.total, 0))}
                    hidden={amountsHidden}
                  />
                </b>
              </span>
            </div>
          </div>
        )}
        <button type="button" className="mf-text-link mfc-all" onClick={() => go('hub')}>
          TUTTE LE CARTE <img src={a.imgNavigationAndActionForthT2} alt="" />
        </button>
        <div className="mfc-quick-actions">
          {capabilities.installments && (
            <CardQuickAction
              label="Paga a rate"
              src={a.imgHomeBankingAndPaymentsInstalment}
              onClick={() => go('installments')}
            />
          )}{' '}
          {capabilities.recharge && (
            <CardQuickAction
              label="Ricarica Carta"
              src={a.imgHomeBankingAndPaymentsRechargePrepaidCard}
              onClick={() => go('recharge')}
            />
          )}
          <CardQuickAction
            label="Problemi Carta"
            src={a.imgNavigationAndActionProblem}
            onClick={() => go('problems')}
          />
          <CardQuickAction label="Gestione Carta" src={a.imgNavigationAndActionSettings} onClick={() => go('manage')} />
          {capabilities.limit && (
            <CardQuickAction
              label="Modifica Plafond"
              src={a.imgHomeBankingAndPaymentsRechargePrepaidCard}
              onClick={() => go('limit')}
            />
          )}
        </div>
        <section className="mfc-movements">
          <div className="mfc-section-heading">
            <h2>{filtered ? 'Risultati di ricerca' : 'Movimenti'}</h2>
            <button
              type="button"
              className="mfc-search-button"
              aria-label="Cerca movimenti"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <img src={a.imgNavigationAndActionSearchK10} alt="" />
            </button>
          </div>
          {searchOpen && (
            <div className="mfc-search">
              <input
                ref={searchRef}
                aria-label="Cerca movimenti"
                placeholder="Cerca movimenti"
                value={filter.query ?? ''}
                onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
              />
              <button type="button" className="mf-text-link" onClick={() => setFiltersOpen(true)}>
                Filtri di ricerca
              </button>
            </div>
          )}
          {filtered && (
            <>
              <button type="button" className="mf-text-link" onClick={() => setFilter({})}>
                Rimuovi filtri
              </button>
              <button type="button" className="mf-text-link" onClick={() => setSelectedMovement('share')}>
                Condividi movimenti
              </button>
            </>
          )}
          {!shown.length && <p className="mfc-empty">Nessun movimento trovato</p>}
          {shown.map((m, i) => {
            const day = m.day !== lastDay ? m.day : ''
            lastDay = m.day
            const monthly = m.status === 'settled' && m.date.slice(0, 7) !== lastMonth
            if (monthly) lastMonth = m.date.slice(0, 7)
            return (
              <div key={m.id}>
                {monthly && !filtered && (
                  <div className="mfc-month">
                    <span>
                      {new Date(`${m.date}T12:00:00Z`).toLocaleDateString('it-IT', {
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })}
                      <small>Spesa totale</small>
                    </span>
                    <CardAmount
                      value={selectCardBalance(financial, card.id, m.date.slice(0, 7)).spending}
                      hidden={amountsHidden}
                    />
                  </div>
                )}
                {day && <h3 className="mfc-day">{day}</h3>}
                <button
                  type="button"
                  className="mfc-movement"
                  aria-label={`Movimento ${m.name} ${m.day || new Date(`${m.date}T12:00:00Z`).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', timeZone: 'UTC' })}`}
                  onClick={() => setSelectedMovement(m.id)}
                >
                  <span className={`mfc-category mfc-category-${m.icon}`}>
                    <img src={a[m.icon]} alt="" />
                  </span>
                  <span className="mfc-movement-copy">
                    <strong>{m.name}</strong>
                    <small>{m.category}</small>
                    {m.status !== 'settled' && <small>{m.date.split('-').reverse().join('/')}</small>}
                    {m.excluded && <small>Escluso dal bilancio</small>}
                  </span>
                  <span className={`mfc-movement-amount${m.amount > 0 ? ' mfc-income' : ''}`}>
                    <CardAmount value={m.amount} hidden={amountsHidden} signed={m.amount > 0} />
                    {m.status !== 'settled' && (
                      <small className="mfc-pending">
                        {m.status === 'pending' ? 'Da contabilizzare' : 'Pre Autorizzazione'}
                      </small>
                    )}
                  </span>
                </button>
                {i === 4 && !filtered && (
                  <div className="mfc-partner">
                    <b>Dividiamo per 12 quello che spenderesti!</b>
                    <button
                      type="button"
                      onClick={() => inform('Passa al nostro partner', 'Scopri le offerte dedicate alle tue utenze.')}
                    >
                      PASSA AL NOSTRO PARTNER <img src={a.imgNavigationAndActionForthT2} alt="" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </section>
      </CardsPage>
      {overlay}
    </>
  )
}
