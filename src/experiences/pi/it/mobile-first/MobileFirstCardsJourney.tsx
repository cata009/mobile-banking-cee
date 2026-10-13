import { useCallback, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import FaceIdAnimation from '@/app/components/FaceIdAnimation'
import { downloadCardMovements } from '@/features/cards/mobileFirstCardsExport'
import {
  changeCreditLimit,
  fromCents,
  rechargePrepaidCard,
  registerCardInstallmentPlan,
  repayCreditCard,
  selectAccountBalance,
  selectCardBalance,
  toCents,
  type ItalyFinancialSnapshot,
  type FinanceResult,
  ITALY_CARD_INSTALLMENT_FEE_CENTS,
} from '@/features/finance/italyFinancials'
import { BottomSheet } from '@/app/components/BottomSheet'
import {
  cardCapabilities,
  createInstallmentSchedule,
  installmentSelection,
  validateCardLimit,
} from '@/features/cards/mobileFirstCards'
import type { CardsView } from './MobileFirstCards'
import { CARD_PROBLEMS, CARD_STATUS_LABELS, type ItalyCard, type ItalyCardMovement } from './cardsContent'
import { cardsAssets as a } from './cardsAssets'
import { CardAmount, CardArt, CardButton, CardField, CardRow, CardsPage } from './MobileFirstCardsPrimitives'

interface Props {
  view: CardsView
  externalOverlayOpen?: boolean
  card: ItalyCard
  cards: ItalyCard[]
  hidden: boolean
  onClose: () => void
  onGo: (view: CardsView) => void
  onChange: (patch: Partial<ItalyCard>) => void
  onSetCards: Dispatch<SetStateAction<ItalyCard[]>>
  onStatus: (action: 'suspend' | 'resume' | 'block' | 'activate') => void
  onDone: () => void
  onNotice: (title: string, message: string) => void
  repayment: string
  onRepayment: (value: string) => void
  plans: { total: number; months: number; ids?: string[] }[]
  financial: ItalyFinancialSnapshot
  movements: readonly ItalyCardMovement[]
  onStatement: (month: string) => void
}
export default function MobileFirstCardsJourney(p: Props) {
  const { view, card, hidden, onClose } = p
  const [step, setStep] = useState(0)
  const [value, setValue] = useState(view === 'rename' ? (card.nickname ?? card.holder) : '')
  const [limit, setLimit] = useState(card.limit)
  const [problem, setProblem] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [months, setMonths] = useState(3)
  const [draft, setDraft] = useState(() => p.cards.map((c) => ({ ...c })))
  const [success, setSuccess] = useState('')
  const [auth, setAuth] = useState<null | (() => void)>(null)
  const [code, setCode] = useState('')
  const [faceId, setFaceId] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [seconds, setSeconds] = useState(15)
  const [urgent, setUrgent] = useState(false)
  const [address, setAddress] = useState('Via dei Pini 18, 37139 Verona')
  const [choice, setChoice] = useState(p.repayment)
  const [checks, setChecks] = useState<string[]>(() => card.settings?.[view] ?? [])
  const [fundingAccount, setFundingAccount] = useState(
    () => p.financial.cards.find((row) => row.id === card.id)?.accountNumber ?? p.financial.accounts[0]?.number ?? '',
  )
  const [operationKey] = useState(() => `card:${view}:${crypto.randomUUID()}`)
  const [nameId, setNameId] = useState<string | null>(null)
  const capabilities = cardCapabilities(card.kind, card.status)
  const financialCard = selectCardBalance(p.financial, card.id)
  const fundingBalance = selectAccountBalance(p.financial, fundingAccount)
  const validPayment = /^\d+(?:\.\d{1,2})?$/.test(value) && Number(value) > 0 && Number(value) <= fundingBalance.balance
  const fundingSelector = (
    <select
      aria-label="Conto di addebito"
      value={fundingAccount}
      onChange={(event) => setFundingAccount(event.target.value)}
    >
      {p.financial.accounts
        .filter((account) => !account.imported)
        .map((account) => (
          <option key={account.number} value={account.number}>
            {account.name} · {account.number}
          </option>
        ))}
    </select>
  )
  const financialDone = (result: FinanceResult, message: string) => {
    if (result.ok) complete(message)
    else p.onNotice('Operazione non completata', result.error ?? 'Operazione non disponibile')
  }
  const authorize = (callback: () => void) => {
    setCode('')
    setAuth(() => callback)
  }
  const back = useCallback(() => {
    if (nameId) {
      setNameId(null)
      return
    }
    if (step > 0 && !success) {
      setStep((s) => s - 1)
      return
    }
    onClose()
  }, [nameId, step, success, onClose])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !p.externalOverlayOpen && !document.querySelector('[role="dialog"]') && !faceId) {
        event.preventDefault()
        back()
      }
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [back, p.externalOverlayOpen, faceId])
  const completeFaceId = useCallback(() => {
    auth?.()
    setAuth(null)
    setFaceId(false)
    setCode('')
  }, [auth])
  useEffect(() => {
    if (!revealed) return
    const timer = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    const timeout = window.setTimeout(() => {
      setRevealed(false)
      setSeconds(15)
    }, 15000)
    const hide = () => {
      if (document.visibilityState === 'hidden') {
        setRevealed(false)
        setSeconds(15)
      }
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(timeout)
      document.removeEventListener('visibilitychange', hide)
    }
  }, [revealed])
  const authSheet = auth && (
    <BottomSheet
      title="Inserisci il tuo Mobile Code"
      onClose={() => setAuth(null)}
      closeLabel="Annulla"
      className="mfc-sheet"
    >
      <CardField
        label="Mobile Code"
        type="password"
        value={code}
        onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 5))}
        maxLength={5}
      />
      <CardButton
        disabled={!/^\d{5}$/.test(code)}
        onClick={() => {
          auth()
          setAuth(null)
          setCode('')
        }}
      >
        Conferma
      </CardButton>
      <CardButton secondary onClick={() => setFaceId(true)}>
        Face ID
      </CardButton>
    </BottomSheet>
  )
  const page = (title: string, body: ReactNode, footer?: ReactNode) => (
    <>
      <CardsPage title={title} onBack={back} onClose={onClose} footer={footer} blocked={Boolean(auth)}>
        {body}
      </CardsPage>
      {authSheet}
      {faceId && <FaceIdAnimation onComplete={completeFaceId} />}
    </>
  )
  const complete = (message: string) => setSuccess(message)
  const finish = <CardButton onClick={p.onDone}>Torna alla carta</CardButton>
  if (success)
    return page(
      success,
      <div className="mfc-result">
        <span aria-hidden="true">✓</span>
        <p>{card.name}</p>
        <p>{hidden ? '•••• ••••' : `**** ${card.lastFour}`}</p>
        {success === 'Carta sospesa' && <p>Puoi riattivare la carta quando vuoi.</p>}
        {success === 'Carta bloccata' && (
          <p>La carta non può più essere utilizzata. Puoi richiedere una nuova carta.</p>
        )}
      </div>,
      finish,
    )
  if (view === 'pin' || view === 'number') {
    if (!capabilities.reveal)
      return page(
        'Dati carta',
        <div className="mfc-info">
          <p>
            La visualizzazione dei dati non è disponibile per una carta {CARD_STATUS_LABELS[card.status].toLowerCase()}.
          </p>
        </div>,
        finish,
      )
    if (view === 'number' && !step)
      return page(
        'Richiesta visualizzazione numero carta e CVV',
        <>
          <p className="mfc-body">
            Cliccando su <b>“Prosegui”</b>, dopo aver autorizzato con Biometrico o Mobile Code potrai visualizzare il
            numero carta e CVV della tua carta <b>{card.name}</b>. Una volta chiusa questa finestra, per visualizzarlo
            nuovamente, dovrai inserire una nuova password.
          </p>
          <CardArt card={card} mini />
        </>,
        <CardButton
          onClick={() =>
            authorize(() => {
              setStep(1)
              setRevealed(true)
            })
          }
        >
          Prosegui
        </CardButton>,
      )
    const show = () =>
      authorize(() => {
        setRevealed(true)
        setSeconds(15)
      })
    return page(
      view === 'pin' ? 'Visualizza PIN' : 'Numero carta e CVV',
      <>
        <h3>
          {card.name}
          <br />
          {hidden ? '•••• ••••' : `**** ${card.lastFour}`}
        </h3>
        <div className="mfc-info mfc-sensitive">
          <span>{view === 'pin' ? 'PIN carta' : 'Numero carta'}</span>
          <b>{revealed ? (view === 'pin' ? '12345' : `1234 5678 9012 ${card.lastFour}`) : '*****'}</b>
          {view === 'number' && (
            <>
              <span>Scadenza</span>
              <b>{revealed ? card.expiry : '••/••'}</b>
              <span>CVV</span>
              <b>{revealed ? '123' : '•••'}</b>
            </>
          )}
          {revealed && <small aria-live="polite">Visibile per {seconds} secondi</small>}
        </div>
        <p className="mfc-body">
          {revealed
            ? 'Per ragioni di sicurezza la visualizzazione dei dati della carta è temporizzata e viene inibita dopo qualche secondo.'
            : view === 'pin'
              ? 'Per visualizzare il PIN, premi il bottone “Mostra PIN”.'
              : 'Autorizza nuovamente per visualizzare il numero carta e CVV.'}
        </p>
        {view === 'pin' && !revealed && (
          <p className="mfc-body">
            Se desideri modificare il tuo PIN, lo puoi fare comodamente anche dai nostri sportelli ATM.
          </p>
        )}
      </>,
      view === 'number' ? (
        <CardButton
          onClick={() => {
            setRevealed(false)
            onClose()
          }}
        >
          Chiudi dati carta
        </CardButton>
      ) : (
        <CardButton
          onClick={
            revealed
              ? () => {
                  setRevealed(false)
                  onClose()
                }
              : show
          }
        >
          {revealed ? 'Ok' : 'Mostra PIN'}
        </CardButton>
      ),
    )
  }
  if (view === 'info')
    return page(
      'Info carta',
      <>
        <CardArt card={card} mini />
        <div className="mfc-info">
          <CardRow label="Numero carta" value={hidden ? '•••• ••••' : `1234 **** **** ${card.lastFour}`} />
          <div className="mfc-data-grid">
            <span>
              {card.kind === 'credit' ? 'Plafond carta' : 'Circuito'}
              <b>{card.kind === 'credit' ? <CardAmount value={card.limit} hidden={hidden} /> : 'Mastercard'}</b>
            </span>
            <span>
              Circuito<b>Mastercard</b>
            </span>
          </div>
        </div>
        <div className="mfc-data-grid mfc-card-info">
          {[
            ['Nome carta', card.nickname ?? card.holder],
            ['Intestato a', card.holder],
            ['Conto', hidden ? '••••' : (p.financial.cards.find((row) => row.id === card.id)?.accountNumber ?? '')],
            ['Scadenza carta', card.expiry],
            ['Tipo carta', card.name],
            ['Modalità rimborso', p.repayment],
            ['Supporto', 'Plastica standard'],
          ].map(([label, text]) => (
            <span key={label}>
              {label}
              <b>{text}</b>
            </span>
          ))}
        </div>
      </>,
    )
  if (view === 'rename')
    return page(
      'Modifica nome carta',
      <>
        <CardField label="Nome carta" value={value} onChange={setValue} maxLength={20} placeholder="Inserisci nome" />
        <small>Massimo 20 caratteri alfanumerici</small>
      </>,
      <>
        <CardButton
          disabled={
            !value.trim() ||
            value.trim() === (card.nickname ?? card.holder) ||
            !/^[\p{L}\p{N} ]{1,20}$/u.test(value.trim())
          }
          onClick={() => {
            p.onChange({ nickname: value.trim() })
            onClose()
          }}
        >
          Salva
        </CardButton>
        <CardButton secondary onClick={onClose}>
          Annulla
        </CardButton>
      </>,
    )
  if (view === 'personalize') {
    const favorites = draft.filter((c) => c.favorite)
    const reorder = (id: string, delta: number) => {
      const index = favorites.findIndex((c) => c.id === id),
        next = index + delta
      if (next < 0 || next >= favorites.length) return
      const reordered = [...favorites]
      ;[reordered[index], reordered[next]] = [reordered[next]!, reordered[index]!]
      setDraft([...reordered, ...draft.filter((c) => !c.favorite)])
    }
    const editing = draft.find((c) => c.id === nameId)
    if (editing)
      return page(
        'Modifica nome carta',
        <>
          <CardField label="Nome carta" value={value} onChange={setValue} maxLength={20} />
          <small>Massimo 20 caratteri alfanumerici</small>
        </>,
        <CardButton
          disabled={!value.trim()}
          onClick={() => {
            setDraft((cs) => cs.map((c) => (c.id === nameId ? { ...c, nickname: value.trim() } : c)))
            setNameId(null)
          }}
        >
          Salva
        </CardButton>,
      )
    const item = (c: ItalyCard, index?: number) => (
      <article key={c.id} className="mfc-custom-card">
        <div className="mfc-custom-top">
          <CardArt card={c} mini />
          <span>
            <b>{c.nickname ?? c.holder}</b>
            <small>{hidden ? '•••• ••••' : `**** ${c.lastFour}`}</small>
          </span>
          <button
            type="button"
            aria-label={`Modifica nome ${c.name}`}
            onClick={() => {
              setNameId(c.id)
              setValue(c.nickname ?? c.holder)
            }}
          >
            <img src={a.edit} alt="" />
          </button>
          <button
            type="button"
            className="mfc-favorite"
            aria-label={`${c.favorite ? 'Rimuovi' : 'Aggiungi'} ${c.name} ${c.lastFour} ${c.favorite ? 'dai' : 'ai'} preferiti`}
            aria-pressed={c.favorite}
            onClick={() => setDraft((cs) => cs.map((x) => (x.id === c.id ? { ...x, favorite: !x.favorite } : x)))}
          >
            ★
          </button>
        </div>
        <b>{c.name}</b>
        {index !== undefined && (
          <div className="mfc-reorder">
            <button
              type="button"
              aria-label={`Sposta ${c.name} in alto`}
              disabled={index === 0}
              onClick={() => reorder(c.id, -1)}
            >
              ⌃
            </button>
            <button
              type="button"
              aria-label={`Sposta ${c.name} in basso`}
              disabled={index === favorites.length - 1}
              onClick={() => reorder(c.id, 1)}
            >
              ⌄
            </button>
          </div>
        )}
      </article>
    )
    return page(
      'Carte',
      <>
        <h2>Preferite</h2>
        <p>Puoi spostare le tue carte preferite per posizionarle secondo l’ordine desiderato.</p>
        {favorites.map((c, i) => item(c, i))}
        <h2 className="mfc-space">Tutte le carte</h2>
        {draft.filter((c) => !c.favorite).map((c) => item(c))}
      </>,
      <CardButton
        onClick={() => {
          p.onSetCards(draft)
          onClose()
        }}
      >
        Salva modifica
      </CardButton>,
    )
  }
  if (view === 'problems') {
    if (step)
      return page(
        problem === 'suspend' ? 'Sospendi carta' : problem === 'broken' ? 'Richiedi duplicato carta' : 'Blocca carta',
        <>
          <CardArt card={card} mini />
          <p className="mfc-body">
            {problem === 'suspend'
              ? 'La carta sarà temporaneamente non utilizzabile. Potrai riattivarla quando vuoi.'
              : problem === 'broken'
                ? 'Puoi richiedere una nuova carta con le stesse caratteristiche.'
                : 'La carta verrà bloccata definitivamente. Questa operazione è irreversibile.'}
          </p>
          {problem !== 'suspend' && problem !== 'broken' && (
            <label className="mfc-check">
              <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
              Richiedi una nuova carta
            </label>
          )}
        </>,
        <CardButton
          onClick={() => {
            if (problem === 'broken') {
              p.onGo('duplicate')
              return
            }
            p.onStatus(problem === 'suspend' ? 'suspend' : 'block')
            complete(problem === 'suspend' ? 'Carta sospesa' : 'Carta bloccata')
          }}
        >
          {problem === 'suspend'
            ? 'Sospendi carta'
            : problem === 'broken'
              ? 'Richiedi duplicato'
              : 'Blocca definitivamente'}
        </CardButton>,
      )
    return page(
      'Indicaci come possiamo aiutarti',
      <>
        {CARD_PROBLEMS.filter(([id]) => id !== 'suspend' || capabilities.suspend).map(([id, label, body]) => (
          <label className="mfc-problem" key={id}>
            <input
              aria-label={label}
              type="radio"
              name="card-problem"
              value={id}
              checked={problem === id}
              onChange={() => setProblem(id)}
            />
            <span>
              <b>{label}</b>
              <small>{body}</small>
            </span>
          </label>
        ))}
        <p className="mfc-disclaimer">
          Puoi richiedere contestualmente l’attivazione di una nuova carta e riceverla anche entro 48 ore in Italia.
        </p>
      </>,
      <>
        <CardButton disabled={!problem} onClick={() => setStep(1)}>
          Conferma
        </CardButton>
        <CardButton secondary onClick={() => p.onGo('support')}>
          Chiama
        </CardButton>
      </>,
    )
  }
  if (view === 'limit') {
    const committed = fromCents(financialCard.committedCents)
    const maximum = fromCents(financialCard.maxLimitCents)
    const valid = validateCardLimit(limit, committed, maximum) && limit !== card.limit
    if (step)
      return page(
        'Variazione limite utilizzo',
        <>
          <p>Nuovo fido/Plafond carta</p>
          <CardAmount value={limit} hidden={hidden} />
          <div className="mfc-contract">
            <button
              type="button"
              className="mf-text-link"
              onClick={() =>
                downloadCardMovements(
                  [{ name: card.name, category: 'Nuovo fido/Plafond carta', date: p.financial.asOf, amount: limit }],
                  'pdf',
                  hidden,
                  'Proposta variazione limite utilizzo - Demo',
                )
              }
            >
              VISUALIZZA IL DOCUMENTO IN PDF <img src={a.imgNavigationAndActionForthT2} alt="" />
            </button>
            <p>
              Ho esaminato la proposta contrattuale e sottoscrivo digitalmente ai fini dell’accettazione della stessa.
            </p>
          </div>
        </>,
        <CardButton
          disabled={!valid}
          onClick={() =>
            authorize(() => {
              financialDone(changeCreditLimit(card.id, toCents(limit)), 'Limite utilizzo modificato')
            })
          }
        >
          Firma
        </CardButton>,
      )
    return page(
      step ? 'Conferma variazione limite' : 'Variazione limite utilizzo',
      <>
        <CardArt card={card} mini />
        <p>Limite massimo di utilizzo</p>
        <CardAmount value={maximum} hidden={hidden} />
        <h2 className="mfc-space">Limite utilizzo</h2>
        <h3>Scegli il tuo limite di utilizzo mensile</h3>
        <label className="mfc-range">
          <output>
            {hidden ? '••••' : new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(limit)}
          </output>
          <input
            aria-label="Limite utilizzo mensile"
            type="range"
            min="1000"
            max={maximum}
            step="100"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={step > 0}
          />
          <span>
            1.000 €{' '}
            <span>
              <CardAmount value={maximum} hidden={hidden} />
            </span>
          </span>
        </label>
        <CardRow label="Limite già impegnato sulla carta" value={<CardAmount value={committed} hidden={hidden} />} />
        {limit < committed && <p role="alert">Il limite non può essere inferiore all’importo già impegnato.</p>}
      </>,
      <CardButton
        disabled={!valid}
        onClick={() =>
          step
            ? authorize(() => {
                financialDone(changeCreditLimit(card.id, toCents(limit)), 'Limite utilizzo modificato')
              })
            : setStep(1)
        }
      >
        {step ? 'Conferma' : 'Prosegui'}
      </CardButton>,
    )
  }
  if (view === 'installments') {
    const reserved = p.plans.flatMap((plan) => plan.ids ?? [])
    const purchases = p.movements.filter(
      (row) =>
        row.kind === 'purchase' &&
        row.status === 'settled' &&
        row.amount < 0 &&
        row.unpaidCents === toCents(-row.amount),
    )
    const eligibleMovements = purchases.filter((m) => !reserved.includes(m.id))
    const selection = installmentSelection(purchases, selected, {
      reservedIds: reserved,
      used: p.plans.reduce((sum, plan) => sum + plan.total, 0),
      limit: card.limit,
    })
    const schedule =
      selection.total > 0
        ? createInstallmentSchedule(toCents(selection.total), months, ITALY_CARD_INSTALLMENT_FEE_CENTS)
        : null
    const nextMonth = new Date(`${p.financial.asOf.slice(0, 7)}-01T12:00:00Z`)
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1)
    if (!capabilities.installments)
      return page('Paga a rate', <p>La rateizzazione non è disponibile per questa carta.</p>, finish)
    if (!step)
      return page(
        'Paga a rate',
        <>
          <p className="mfc-body">Scegli i movimenti da rateizzare e crea il tuo piano.</p>
          <p>
            Importo minimo <b>250 €</b>. Non puoi superare il limite massimo di <b>5.000 €</b>.
          </p>
        </>,
        <CardButton onClick={() => setStep(1)}>Continua</CardButton>,
      )
    if (step === 1)
      return page(
        'Scegli i movimenti da rateizzare',
        <>
          <p>
            Importo minimo <b>250 €</b>. Non puoi superare il limite massimo di <b>5.000 €</b>.
          </p>
          {eligibleMovements.map((m) => (
            <label className="mfc-selection-row" key={m.id}>
              <input
                type="checkbox"
                aria-label={m.name}
                checked={selected.includes(m.id)}
                onChange={(e) =>
                  setSelected((ids) => (e.target.checked ? [...ids, m.id] : ids.filter((id) => id !== m.id)))
                }
              />
              <span>
                <b>{m.name}</b>
                <small>{m.category}</small>
              </span>
              <CardAmount value={m.amount} hidden={hidden} />
            </label>
          ))}
          <CardRow label="Da rateizzare" value={<CardAmount value={selection.total} hidden={hidden} />} />
        </>,
        <CardButton disabled={!selection.valid} onClick={() => setStep(2)}>
          Continua
        </CardButton>,
      )
    return page(
      'Il tuo piano rateale',
      <>
        <h3>Movimenti</h3>
        <CardRow label="Movimenti da rateizzare" value={selection.ids.length} />
        <CardRow label="Totale" value={<CardAmount value={selection.total} hidden={hidden} />} />
        <h3 className="mfc-space">Rate</h3>
        <label className="mfc-field">
          <span>Numero rate</span>
          <select aria-label="Numero rate" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            {[3, 6, 9, 12].map((n) => (
              <option key={n} value={n}>
                {n} rate
              </option>
            ))}
          </select>
        </label>
        <h3 className="mfc-space">Dettagli</h3>
        <CardRow
          label="Prima rata"
          value={nextMonth.toLocaleDateString('it-IT', { month: '2-digit', year: 'numeric', timeZone: 'UTC' })}
        />
        <CardRow
          label="Importo rata mensile"
          value={<CardAmount value={fromCents(schedule?.paymentCents[0] ?? 0)} hidden={hidden} />}
        />
        <CardRow
          label="Importo ultima rata"
          value={<CardAmount value={fromCents(schedule?.paymentCents.at(-1) ?? 0)} hidden={hidden} />}
        />
        <CardRow
          label="Costi medi mensili"
          value={<CardAmount value={fromCents(ITALY_CARD_INSTALLMENT_FEE_CENTS)} hidden={hidden} />}
        />
        <CardRow
          label="Costi totali"
          value={<CardAmount value={fromCents(schedule?.totalFeeCents ?? 0)} hidden={hidden} />}
        />
        <CardRow
          label="TAEG"
          value={`${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(schedule?.taeg ?? 0)} %`}
        />
        <CardRow label="TAN" value="0,00 %" />
      </>,
      <CardButton
        disabled={!selection.valid || (schedule?.totalFeeCents ?? 0) > financialCard.availableCents}
        onClick={() =>
          authorize(() => {
            financialDone(registerCardInstallmentPlan(card.id, selection.ids, months), 'Piano rateale attivato')
          })
        }
      >
        Continua
      </CardButton>,
    )
  }
  if (view === 'activate')
    return page(
      'Attiva carta',
      <>
        <p className="mfc-body">Per attivare la carta inserisci il codice CVV che si trova sul retro della carta.</p>
        <p>In caso di rinnovo inserisci il codice CVV della nuova carta ricevuta per posta.</p>
        <CardField
          label="Codice CVV"
          type="password"
          value={value}
          onChange={(v) => setValue(v.replace(/\D/g, '').slice(0, 3))}
          maxLength={3}
          placeholder="Inserisci il codice"
        />
        <div className="mfc-info">
          <b>Attenzione</b>
          <p>Puoi procedere ad attivare la carta solo dopo averla ricevuta per posta.</p>
        </div>
      </>,
      <CardButton
        disabled={!capabilities.activate || !/^\d{3}$/.test(value)}
        onClick={() =>
          authorize(() => {
            p.onStatus('activate')
            complete('Carta attivata')
          })
        }
      >
        Avanti
      </CardButton>,
    )
  if (view === 'wallet')
    return page(
      `Autorizza ${choice === 'Apple Pay' ? 'Apple Pay' : 'Google Pay'}`,
      <>
        <p className="mfc-body">
          Autorizzando l’operazione procederai ad aggiungere la carta di pagamento al Wallet{' '}
          {choice === 'Apple Pay' ? 'Apple' : 'Google'}.
        </p>
        <div className="mfc-wallet-logo">
          {choice === 'Apple Pay' ? (
            <span className="mfc-apple-pay" role="img" aria-label="Apple Pay">
              <img className="mfc-apple-border" src={a.appleBorder} alt="" />
              <img className="mfc-apple-base" src={a.appleBase} alt="" />
              <img className="mfc-apple-mark" src={a.appleMark} alt="" />
              <img className="mfc-apple-text" src={a.applePay} alt="" />
            </span>
          ) : (
            <span className="mfc-google-pay" role="img" aria-label="Google Pay">
              <img className="mfc-google-base" src={a.walletBase} alt="" />
              <img className="mfc-google-outline" src={a.walletOutline} alt="" />
              <img className="mfc-google-mark" src={a.walletGoogleMark} alt="" />
              <img className="mfc-google-text" src={a.walletGooglePay} alt="" />
            </span>
          )}
        </div>
        <label className="mfc-field">
          Wallet
          <select
            aria-label="Wallet"
            value={choice === 'Apple Pay' ? 'Apple Pay' : 'Google Pay'}
            onChange={(e) => setChoice(e.target.value)}
          >
            <option>Google Pay</option>
            <option>Apple Pay</option>
          </select>
        </label>
        <div className="mfc-data-grid">
          <span>
            Data e ora<b>{p.financial.asOf.split('-').reverse().join('/')}</b>
          </span>
          <span>
            Carta<b>{hidden ? '•••• ••••' : `**** ${card.lastFour}`}</b>
          </span>
        </div>
      </>,
      <>
        <CardButton
          disabled={!capabilities.reveal}
          onClick={() =>
            authorize(() => {
              p.onChange({ wallet: choice === 'Apple Pay' ? 'Apple Pay' : 'Google Pay' })
              complete('Carta aggiunta al wallet')
            })
          }
        >
          Autorizza
        </CardButton>
        <CardButton secondary onClick={onClose}>
          Non autorizzare
        </CardButton>
      </>,
    )
  if (view === 'duplicate' || view === 'physical')
    return page(
      view === 'duplicate' ? 'Richiedi duplicato carta' : 'Richiedi carta fisica',
      <>
        <p className="mfc-body">
          Il duplicato della carta può essere richiesto se la carta originale risulta smagnetizzata o deteriorata.
        </p>
        <p>
          Costo della riemissione: <b>10,00 €</b>.
        </p>
        <CardField label="Indirizzo" value={address} onChange={setAddress} />
        <label className="mfc-check">
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
          Desidero che la carta sia inviata con procedura urgente (entro 48 ore al costo di 25 €).
        </label>
      </>,
      <>
        <CardButton disabled={!address.trim()} onClick={() => authorize(() => complete('Richiesta carta inviata'))}>
          Conferma
        </CardButton>
        <CardButton secondary onClick={onClose}>
          Annulla
        </CardButton>
      </>,
    )
  if (view === 'repayment')
    return page(
      'Cambio modalità di rimborso',
      <>
        <p className="mfc-body">Scegli la modalità di rimborso della tua carta.</p>
        {['A saldo', 'A revolving', 'Rimborso in unica soluzione'].map((c) => (
          <label className="mfc-problem" key={c}>
            <input aria-label={c} type="radio" name="repayment" checked={choice === c} onChange={() => setChoice(c)} />
            <span>
              <b>{c}</b>
            </span>
          </label>
        ))}
        {choice === 'A revolving' && (
          <label className="mfc-field">
            <span>Importo rata</span>
            <select aria-label="Importo rata" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
              {[50, 100, 150, 200, 250, 300, 400, 500].map((n) => (
                <option key={n} value={n}>
                  {n},00 €
                </option>
              ))}
            </select>
          </label>
        )}
        <CardRow label="Debito residuo totale" value={<CardAmount value={card.debt ?? 0} hidden={hidden} />} />
      </>,
      <CardButton
        disabled={choice === p.repayment}
        onClick={() =>
          authorize(() => {
            p.onRepayment(choice)
            complete('Modalità di rimborso modificata')
          })
        }
      >
        Conferma
      </CardButton>,
    )
  if (view === 'reimburse')
    return page(
      'Rimborso debito residuo',
      <>
        <CardRow label="Debito residuo totale" value={<CardAmount value={card.debt ?? 0} hidden={hidden} />} />
        <label className="mfc-field">
          Conto di addebito
          {fundingSelector}
        </label>
        <CardField label="Importo rimborso" type="number" value={value} onChange={setValue} />
        <p>Puoi rimborsare fino al totale del debito residuo.</p>
      </>,
      <CardButton
        disabled={!validPayment || Number(value) > (card.debt ?? 0)}
        onClick={() =>
          authorize(() => {
            financialDone(
              repayCreditCard(card.id, fundingAccount, toCents(Number(value)), operationKey),
              'Rimborso effettuato',
            )
          })
        }
      >
        Conferma
      </CardButton>,
    )
  if (view === 'premium')
    return page(
      'Linea Premium',
      <>
        <p>{hidden ? '•••• ••••' : `**** ${card.lastFour}`}</p>
        <div className="mfc-premium-progress" />
        <CardRow
          label="Totale utilizzato"
          value={<CardAmount value={p.plans.reduce((n, x) => n + x.total, 0)} hidden={hidden} />}
        />
        <CardRow
          label="Disponibilità residua"
          value={
            <CardAmount value={Math.max(0, card.limit - p.plans.reduce((n, x) => n + x.total, 0))} hidden={hidden} />
          }
        />
        {p.plans.length ? (
          p.plans.map((plan, i) => (
            <div className="mfc-info" key={i}>
              <h3>Piano di rateizzazione</h3>
              <CardAmount value={plan.total} hidden={hidden} />
              <p>{plan.months} rate</p>
              <button
                type="button"
                className="mf-text-link"
                onClick={() =>
                  p.onNotice(
                    'Dettaglio piano',
                    `${plan.months} rate mensili. Totale ${hidden ? '••••' : new Intl.NumberFormat('it-IT').format(plan.total)} €.`,
                  )
                }
              >
                DETTAGLIO
              </button>
            </div>
          ))
        ) : (
          <div className="mfc-info">
            <p>Nessun piano rateale attivo</p>
          </div>
        )}
      </>,
      <CardButton onClick={() => p.onGo('installments')}>Paga a rate</CardButton>,
    )
  if (view === 'usage')
    return page(
      'Dettaglio utilizzo',
      <>
        <CardArt card={card} mini />
        <CardRow label="Plafond carta" value={<CardAmount value={card.limit} hidden={hidden} />} />
        <CardRow label="Spese del mese" value={<CardAmount value={card.spending} hidden={hidden} />} />
        <CardRow label="Disponibilità residua" value={<CardAmount value={card.available} hidden={hidden} />} />
      </>,
    )
  const settings: Partial<Record<CardsView, { title: string; items: string[] }>> = {
    'spending-limit': {
      title: 'Limiti di spesa',
      items: ['Pagamenti giornalieri', 'Prelievi giornalieri', 'Pagamenti online'],
    },
    geography: { title: 'Aree geografiche', items: ['Italia', 'Europa', 'Resto del mondo'] },
    shops: { title: 'Negozi abilitati', items: ['Negozi fisici', 'Negozi online', 'Prelievi ATM'] },
    parental: { title: 'Parental control', items: ['Pagamenti online', 'Prelievi ATM', 'Pagamenti all’estero'] },
    'debit-date': { title: 'Data di addebito', items: ['Giorno dopo', 'Giorno 5', 'Giorno 15'] },
    'installment-amount': {
      title: 'Seleziona importo rata',
      items: [
        '50,00 €',
        '100,00 €',
        '150,00 €',
        '200,00 €',
        '250,00 €',
        '300,00 €',
        '350,00 €',
        '400,00 €',
        '450,00 €',
        '500,00 €',
      ],
    },
    image: {
      title: 'Cambia immagine carta',
      items: card.kind === 'credit' ? ['UniCredit Flexia Classic', 'UniCredit Flexia Etica'] : [card.name],
    },
    renewal: { title: 'Gestione rinnovo', items: ['Rinnovo automatico', 'Non rinnovare la carta'] },
    bancomat: { title: 'BANCOMAT® Pay', items: ['Attiva su questo conto', 'Disattiva'] },
  }
  const config = settings[view]
  if (config)
    return page(
      config.title,
      <>
        {config.items.map((item) => (
          <label className="mfc-check" key={item}>
            <input
              type={
                ['debit-date', 'installment-amount', 'image', 'renewal', 'bancomat'].includes(view)
                  ? 'radio'
                  : 'checkbox'
              }
              name="card-setting"
              checked={checks.includes(item)}
              onChange={(e) =>
                setChecks((cs) =>
                  e.target.type === 'radio' ? [item] : e.target.checked ? [...cs, item] : cs.filter((x) => x !== item),
                )
              }
            />
            {item}
          </label>
        ))}
      </>,
      <CardButton
        disabled={!checks.length && ['debit-date', 'installment-amount', 'image', 'renewal', 'bancomat'].includes(view)}
        onClick={() => {
          p.onChange({ settings: { ...card.settings, [view]: checks } })
          complete('Modifica salvata')
        }}
      >
        Conferma
      </CardButton>,
    )
  if (view === 'recharge')
    return page(
      'Ricarica Carta',
      <>
        <CardArt card={card} mini />
        <CardField label="Importo ricarica" type="number" value={value} onChange={setValue} />
        <label className="mfc-field">
          Conto di addebito
          {fundingSelector}
        </label>
      </>,
      <CardButton
        disabled={!capabilities.recharge || !validPayment || Number(value) > 5000}
        onClick={() =>
          authorize(() => {
            financialDone(
              rechargePrepaidCard(card.id, fundingAccount, toCents(Number(value)), operationKey),
              'Carta ricaricata',
            )
          })
        }
      >
        Conferma
      </CardButton>,
    )
  if (view === 'tracking')
    return page(
      'Tracking carta',
      <ol className="mfc-tracking">
        <li>Carta prodotta</li>
        <li>Carta spedita</li>
        <li>{card.status === 'delivered' ? 'Carta consegnata' : 'Consegna in corso'}</li>
      </ol>,
      capabilities.activate ? <CardButton onClick={() => p.onGo('activate')}>Attiva carta</CardButton> : undefined,
    )
  if (view === 'support')
    return page(
      'Assistenza carta',
      <>
        <p className="mfc-body">Come possiamo aiutarti?</p>
        <CardRow label="Problemi carta" onClick={() => p.onGo('problems')} />
        <CardRow label="Contestazioni movimenti" onClick={() => p.onGo('disputes')} />
        <CardRow label="Richiedi duplicato carta" onClick={() => p.onGo('duplicate')} />
      </>,
    )
  if (view === 'statement')
    return page(
      'Estratto conto',
      <>
        {Array.from({ length: 3 }, (_, index) => {
          const date = new Date(`${p.financial.asOf.slice(0, 7)}-01T12:00:00Z`)
          date.setUTCMonth(date.getUTCMonth() - index)
          const month = date.toISOString().slice(0, 7)
          return (
            <CardRow
              key={month}
              label={date
                .toLocaleDateString('it-IT', { month: 'long', year: 'numeric', timeZone: 'UTC' })
                .replace(/^./, (letter) => letter.toUpperCase())}
              action="VISUALIZZA"
              onClick={() => p.onStatement(month)}
            />
          )
        })}
      </>,
    )
  if (view === 'disputes')
    return page(
      'Contestazioni movimenti',
      <>
        <p>Nessuna contestazione in corso</p>
        <CardButton onClick={() => p.onGo('support')}>Richiedi assistenza</CardButton>
      </>,
    )
  if (view === 'isee')
    return page(
      'Attestazione ISEE',
      <>
        <p className="mfc-body">Richiedi la certificazione ai fini ISEE per il rapporto selezionato.</p>
        <label className="mfc-field">
          Anno
          <select>
            <option>2025</option>
            <option>2024</option>
          </select>
        </label>
      </>,
      <CardButton onClick={() => complete('Richiesta attestazione inviata')}>Richiedi</CardButton>,
    )
  return page(
    'Missioni',
    <>
      <p>Gestisci gli obiettivi di risparmio della carta.</p>
      <CardField label="Nome missione" value={value} onChange={setValue} />
    </>,
    <CardButton disabled={!value.trim()} onClick={() => complete('Missione creata')}>
      Salva
    </CardButton>,
  )
}
