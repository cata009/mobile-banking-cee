import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation'
import {
  getItalyFinancialSnapshot,
  subscribeItalyFinancialChanges,
  selectAccountBalance,
} from '@/features/finance/italyFinancials'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  applyVirtualTrade,
  securityAvailableQuantity,
  securityOrderMoney,
  securityMaximumCommissionCents,
  submitSecurityOrder,
  parseItalianNumber,
  validateSecurityTrade,
  validateSecurityDeposit,
  registeredSecurityBlockMessage,
  securitiesDepositEligibility,
  type SecuritiesState,
  type Security,
  type TradeDraft,
  type SecurityOrder,
} from '@/features/investments/mobileFirstSecurities'
import { InvestmentAmount, InvestmentButton, InvestmentPage, InvestmentRows } from './MobileFirstInvestmentPrimitives'
import {
  SecuritiesCheck,
  SecuritiesError,
  SecuritiesField,
  SecuritiesLink,
} from './MobileFirstInvestmentSecuritiesElements'
import { securitiesDeposits } from './investmentsSecuritiesContent'
import blockedIcon from '@/assets/mobile-first/it/investments/securities/registered-security-block.svg'

export default function MobileFirstInvestmentSecuritiesTransaction({
  security,
  action,
  state,
  onState,
  onBack,
  onClose,
  onDone,
  portfolioId: initialPortfolioId,
  depositId: initialDepositId = 'main',
}: {
  security: Security
  action: TradeDraft['action']
  state: SecuritiesState
  onState: (state: SecuritiesState) => void
  onBack: () => void
  onClose: () => void
  onDone: () => void
  portfolioId?: string
  depositId?: string
}) {
  const virtual = action.startsWith('virtual')
  const selling = action.endsWith('sell')
  const auction = action === 'auction'
  const aucap = action === 'aucap'
  const label = aucap
    ? 'Aumento di capitale a pagamento'
    : auction
      ? 'Titoli di Stato in asta'
      : virtual
        ? selling
          ? 'Vendita virtuale'
          : 'Acquisto virtuale'
        : selling
          ? 'Vendita'
          : 'Acquisto'
  const [step, setStep] = useState(aucap ? -1 : 0)
  const [draft, setDraft] = useState<TradeDraft>({
    action,
    depositId: initialDepositId,
    subdepositId: '00',
    quantity: '',
    price: String(security.price),
    priceType: virtual ? 'Prezzo attuale' : 'Al limite',
    market: 'Best Execution',
    quantityCondition: 'Senza condizione',
    validUntil: new Date(Date.parse(getItalyFinancialSnapshot().asOf + 'T12:00:00Z') + 30 * 86400000)
      .toISOString()
      .slice(0, 10),
    conditional: false,
    triggerPrice: '',
  })
  const [portfolioId, setPortfolioId] = useState(initialPortfolioId ?? state.virtualPortfolios[0]?.id ?? '')
  const [checks, setChecks] = useState<boolean[]>([false, false, false, false])
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [book, setBook] = useState(false)
  const [exit, setExit] = useState(false)
  const [details, setDetails] = useState(false)
  const [document, setDocument] = useState<string | null>(null)
  const [depositBlocked, setDepositBlocked] = useState(false)
  const blockedDialog = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const dialog = blockedDialog.current
    if (!depositBlocked || !dialog) return
    dialog.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setDepositBlocked(false)
      }
      if (event.key === 'Tab') {
        event.preventDefault()
        event.stopPropagation()
        dialog.querySelector('button')?.focus()
      }
    }
    dialog.addEventListener('keydown', handleKeyDown)
    return () => dialog.removeEventListener('keydown', handleKeyDown)
  }, [depositBlocked])
  const orderId = useRef(`MF${crypto.randomUUID()}`)
  const financial = useSyncExternalStore(subscribeItalyFinancialChanges, getItalyFinancialSnapshot)
  const liquidity = selectAccountBalance(financial, '000012345').availableCents / 100
  const quantity = parseItalianNumber(draft.quantity) || 0
  const price =
    draft.priceType === 'Al meglio' || draft.priceType === 'Prezzo attuale'
      ? security.price
      : parseItalianNumber(draft.price) || 0
  const portfolio = state.virtualPortfolios.find((p) => p.id === portfolioId)
  const available = virtual
    ? (portfolio?.positions.find((p) => p.securityId === security.id)?.quantity ?? 0)
    : securityAvailableQuantity(state, security.id)
  const total = auction ? quantity : quantity * price
  const depositError = action === 'buy' ? validateSecurityDeposit(security, draft.depositId, draft.subdepositId) : null
  const clearAcknowledgements = () => {
    setChecks([false, false, false, false])
    setCode('')
    setDocument(null)
    setDepositBlocked(false)
  }
  const update = (key: keyof TradeDraft, value: string | boolean) => {
    setDraft({ ...draft, [key]: value })
    if (draft[key] !== value) clearAcknowledgements()
    setError(null)
  }
  const changeDeposit = (value: string) => {
    setDraft({ ...draft, depositId: value, subdepositId: '00' })
    clearAcknowledgements()
    setError(null)
  }
  const setCheck = (index: number, checked: boolean) =>
    setChecks(checks.map((value, i) => (i === index ? checked : value)))
  const submit = () => {
    if (depositError) {
      setDepositBlocked(true)
      return
    }
    if (virtual && !portfolio) {
      setError('Crea un portafoglio virtuale prima di inserire l’operazione.')
      return
    }
    const validation = validateSecurityTrade(draft, security, available, liquidity)
    if (validation) {
      setError(validation)
      return
    }
    if (virtual && portfolio) {
      onState({
        ...state,
        virtualPortfolios: state.virtualPortfolios.map((p) =>
          p.id === portfolioId
            ? applyVirtualTrade(p, security.id, quantity, price, selling ? 'Vendita' : 'Acquisto')
            : p,
        ),
      })
      setStep(4)
      return
    }
    setStep(1)
  }
  const confirm = () => {
    const validation = validateSecurityTrade(draft, security, available, liquidity)
    if (validation) {
      setError(validation)
      setStep(0)
      if (depositError) setDepositBlocked(true)
      return
    }
    if (!checks.every(Boolean)) {
      setError('Prendi nuovamente visione della documentazione per questa operazione.')
      setStep(1)
      return
    }
    if (code !== '123456') {
      setError('Mobile Code non corretto. Riprova.')
      return
    }
    const order: SecurityOrder = {
      id: orderId.current,
      securityId: security.id,
      action: aucap ? 'Aumento di capitale' : auction ? 'Sottoscrizione' : selling ? 'Vendita' : 'Acquisto',
      quantity,
      price: auction ? 1 : price,
      market: auction ? 'Mercato primario' : draft.market,
      status: 'Inviato',
      date: financial.asOf,
      validUntil: draft.validUntil,
      priceType: draft.priceType,
      quantityCondition: draft.quantityCondition,
      depositId: draft.depositId,
      subdepositId: draft.subdepositId,
    }
    const result = submitSecurityOrder(state, order)
    if (result.error) {
      setError(result.error)
      return
    }
    onState(result.state)
    setError(null)
    setStep(4)
  }
  const rows = [
    { label: 'Rapporto', value: securitiesDeposits.find((d) => d.id === draft.depositId)?.label },
    { label: 'Intestazione', value: securitiesDeposits.find((d) => d.id === draft.depositId)?.owner },
    { label: 'Sottodeposito', value: draft.subdepositId },
    { label: 'Titolo', value: security.name },
    { label: 'ISIN', value: security.isin },
    { label: 'Mercato', value: draft.market },
    { label: 'Tipo prezzo', value: draft.priceType },
    {
      label: auction ? 'Quantità - Valore nominale' : aucap ? 'Numero di diritti di opzione' : 'Quantità',
      value: quantity,
    },
    { label: 'Prezzo', value: <InvestmentAmount value={price} decimals={price < 1 ? 4 : 2} /> },
    { label: 'Controvalore presunto operazione', value: <InvestmentAmount value={total} /> },
    { label: 'Inizio validità ordine', value: formatInvestmentReferenceDate(financial.asOf) },
    { label: 'Fine validità ordine', value: draft.validUntil },
    { label: 'Commissione %', value: '0,15%' },
    { label: 'Commissione massima', value: <InvestmentAmount value={securityMaximumCommissionCents / 100} /> },
    {
      label: 'Commissione',
      value: <InvestmentAmount value={securityOrderMoney({ quantity, price: auction ? 1 : price }).feeCents / 100} />,
    },
    {
      label: 'Totale regolamento',
      value: (
        <InvestmentAmount
          value={
            (selling
              ? securityOrderMoney({ quantity, price }).principalCents -
                securityOrderMoney({ quantity, price }).feeCents
              : securityOrderMoney({ quantity, price: auction ? 1 : price }).totalCents) / 100
          }
        />
      ),
    },
    { label: 'Data valuta', value: 'N.D.' },
  ]
  const close = () => (step === 4 ? onDone() : setExit(true))
  const back = () => {
    if (document) {
      setDocument(null)
      return
    }
    if (step <= 0) {
      onBack()
      return
    }
    setStep(step - 1)
    setError(null)
  }
  const footer =
    step === -1 ? (
      <InvestmentButton
        disabled={!checks[0]}
        onClick={() => {
          setStep(0)
          setChecks([false, false, false, false])
        }}
      >
        Conferma
      </InvestmentButton>
    ) : step === 0 ? (
      <InvestmentButton onClick={submit}>
        {virtual
          ? selling
            ? 'Vendi virtuale'
            : 'Acquista virtuale'
          : aucap
            ? 'Prosegui'
            : auction
              ? 'Conferma'
              : selling
                ? 'Vendi'
                : 'Acquista'}
      </InvestmentButton>
    ) : step === 1 ? (
      <InvestmentButton disabled={!checks.every(Boolean)} onClick={() => setStep(2)}>
        Conferma
      </InvestmentButton>
    ) : step === 2 ? (
      <InvestmentButton onClick={() => setStep(3)}>Conferma</InvestmentButton>
    ) : step === 3 ? (
      <InvestmentButton onClick={confirm}>Conferma</InvestmentButton>
    ) : (
      <InvestmentButton onClick={onDone}>
        {virtual ? 'Vai al portafoglio virtuale' : 'Vai a ordini e movimenti'}
      </InvestmentButton>
    )
  return (
    <InvestmentPage
      title={
        document ??
        (step === 4
          ? 'Operazione completata'
          : step === 1
            ? aucap
              ? label
              : `Conferma ${selling ? 'vendita' : 'acquisto'}`
            : step === 2
              ? `Riepilogo ${selling ? 'vendita' : auction ? 'sottoscrizione' : aucap ? 'operazione' : 'acquisto'}`
              : step === 3
                ? 'Mobile Code'
                : label)
      }
      onBack={back}
      onClose={close}
      footer={
        document ? <InvestmentButton onClick={() => setDocument(null)}>Ho preso visione</InvestmentButton> : footer
      }
    >
      <div className="mfis-content">
        {document ? (
          <>
            <h3>{document}</h3>
            <p>
              Strumento finanziario: {security.name} — {security.isin}
            </p>
            <InvestmentRows rows={rows} />
            <p>
              Le commissioni dell’operazione sono dello 0,15%. Il controvalore è presunto; prezzo, cambio e commissioni
              effettivi dipendono dall’esecuzione sul mercato. Le quotazioni mostrate sono in ritardo di almeno 15
              minuti.
            </p>
          </>
        ) : (
          <>
            {step < 4 && (
              <p className="mfis-step">
                {Math.max(step + 1, 1)}/{aucap ? '5' : auction ? '2' : '3'}{' '}
                {step === 0
                  ? 'Inserisci i dati richiesti'
                  : step === 1
                    ? 'Prendi visione e firma la documentazione'
                    : step === 2
                      ? 'Prendi visione del riepilogo'
                      : step === 3
                        ? 'Conferma l’operazione'
                        : 'Autocertificazione per accedere all’offerta'}
              </p>
            )}
            <SecuritiesError>{error}</SecuritiesError>
            {step === -1 && (
              <>
                <h3>{security.name}</h3>
                <p>ISIN {security.isin}</p>
                <h3>Autocertificazione per accedere all’offerta</h3>
                <p>
                  L’accesso alla presente sezione è riservato a coloro che siano anagraficamente residenti in Italia e
                  che non si trovino in Canada, Australia, Giappone e Stati Uniti d’America.
                </p>
                <SecuritiesCheck
                  label="Confermo di aver letto e compreso quanto sopra indicato e di non trovarmi in alcuno dei predetti Paesi."
                  checked={checks[0] ?? false}
                  onChange={(value) => setCheck(0, value)}
                />
              </>
            )}
            {step === 0 && (
              <>
                <h3>{security.name}</h3>
                <small>ISIN: {security.isin}</small>
                {virtual ? (
                  <SecuritiesField label="Portafoglio virtuale" value={portfolioId} onChange={setPortfolioId}>
                    {state.virtualPortfolios.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </SecuritiesField>
                ) : (
                  <>
                    <SecuritiesField label="Deposito titoli" value={draft.depositId} onChange={changeDeposit}>
                      {securitiesDeposits.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label} - {d.owner}
                        </option>
                      ))}
                    </SecuritiesField>
                    <SecuritiesField
                      label="Sottodeposito"
                      value={draft.subdepositId}
                      onChange={(value) => update('subdepositId', value)}
                    >
                      {securitiesDepositEligibility
                        .find((d) => d.id === draft.depositId)
                        ?.subdeposits.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.id} -{' '}
                            {sub.individual ? 'Andrea Rossini Bianchi' : 'Andrea Rossini Bianchi e Laura Bianchi'}
                          </option>
                        ))}
                    </SecuritiesField>
                    {security.registered && action === 'buy' && (
                      <p className="mfis-notice">
                        {depositError
                          ? 'Verifica se stai negoziando un titolo nominativo'
                          : 'Stai negoziando un titolo nominativo.'}
                      </p>
                    )}
                  </>
                )}
                {!auction && !aucap && (
                  <>
                    <SecuritiesField label="Mercato" value={draft.market} onChange={(value) => update('market', value)}>
                      {['Best Execution', security.market, 'After Hour'].map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </SecuritiesField>
                    <InvestmentRows
                      rows={[
                        {
                          label: 'Ultimo prezzo',
                          value: <InvestmentAmount value={security.price} decimals={security.price < 1 ? 4 : 2} />,
                        },
                        { label: 'Variazione', value: `${security.change}%` },
                      ]}
                    />
                    <SecuritiesLink
                      onClick={() => setError(`Quotazioni demo riferite al ${formatInvestmentReferenceDate()}`)}
                    >
                      Aggiorna
                    </SecuritiesLink>
                    <p className="mfis-disclaimer">Le quotazioni mostrate sono in ritardo di almeno 15 minuti.</p>
                    <div className="mfis-section-title">
                      <h3>Book</h3>
                      <SecuritiesLink onClick={() => setBook(!book)}>
                        {book ? 'Chiudi book' : 'Book 5 livelli'}
                      </SecuritiesLink>
                    </div>
                    <table className="mfis-book">
                      <thead>
                        <tr>
                          <th>Qt. denaro</th>
                          <th>Prezzo denaro</th>
                          <th>Prezzo lettera</th>
                          <th>Qt. lettera</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: book ? 5 : 1 }, (_, i) => (
                          <tr key={i}>
                            <td>{100 + i * 25}</td>
                            <td>
                              <InvestmentAmount value={Math.max(security.price / 2, security.price - 0.05 * (i + 1))} />
                            </td>
                            <td>
                              <InvestmentAmount value={security.price + 0.05 * i} />
                            </td>
                            <td>{120 + i * 50}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
                <h3>{aucap ? 'Numero di diritti residui esercitabili' : 'Parametri'}</h3>
                {aucap && <strong>{available}</strong>}
                <SecuritiesField
                  label={
                    auction
                      ? 'Quantità - Valore nominale'
                      : aucap
                        ? 'Numero di diritti di opzione di cui si richiede l’esercizio'
                        : 'Quantità'
                  }
                  value={draft.quantity}
                  type="number"
                  min={1}
                  onChange={(value) => update('quantity', value)}
                  hint={
                    auction
                      ? 'Importo minimo 1.000,00 €; multipli di 1.000'
                      : aucap
                        ? `Multipli di 12; massimo ${available} diritti`
                        : 'Quantità minima: 1'
                  }
                />
                {aucap ? (
                  <InvestmentRows
                    rows={[
                      {
                        label: 'Diritti di opzione residui dopo l’esecuzione',
                        value: Math.max(available - quantity, 0),
                      },
                      { label: 'Quantità di azioni spettanti', value: Math.floor(quantity / 12) * 5 },
                      { label: 'Valuta di regolamento/registrazione', value: '14/12/2024' },
                    ]}
                  />
                ) : (
                  !auction && (
                    <>
                      <SecuritiesField
                        label={virtual ? 'Tipologia prezzo' : 'Condizione prezzo'}
                        value={draft.priceType}
                        onChange={(value) => update('priceType', value)}
                      >
                        {(virtual ? ['Prezzo attuale', 'Prezzo manuale'] : ['Al limite', 'Al meglio']).map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </SecuritiesField>
                      {draft.priceType !== 'Al meglio' && draft.priceType !== 'Prezzo attuale' && (
                        <SecuritiesField
                          label="Prezzo"
                          value={draft.price}
                          onChange={(value) => update('price', value)}
                          type="number"
                          min={0.01}
                        />
                      )}
                      {!virtual && (
                        <>
                          <SecuritiesField
                            label="Condizione quantità"
                            value={draft.quantityCondition}
                            onChange={(value) => update('quantityCondition', value)}
                          >
                            {['Senza condizione', 'Tutto o niente', 'Esegui o cancella'].map((p) => (
                              <option key={p}>{p}</option>
                            ))}
                          </SecuritiesField>
                          <SecuritiesField
                            label="Fine validità ordine"
                            value={draft.validUntil}
                            onChange={(value) => update('validUntil', value)}
                            type="date"
                          />
                          <SecuritiesCheck
                            label="Ordine condizionato"
                            checked={draft.conditional}
                            onChange={(value) => update('conditional', value)}
                          />
                          {draft.conditional && (
                            <SecuritiesField
                              label="Prezzo di attivazione"
                              value={draft.triggerPrice}
                              type="number"
                              onChange={(value) => update('triggerPrice', value)}
                            />
                          )}
                        </>
                      )}
                    </>
                  )
                )}
                <InvestmentRows
                  rows={[
                    { label: virtual ? 'Qtà. portafoglio virt.' : 'Quantità portafoglio', value: available },
                    { label: 'Liquidità disponibile', value: <InvestmentAmount value={liquidity} /> },
                    { label: 'Controvalore presunto', value: <InvestmentAmount value={total} /> },
                  ]}
                />
              </>
            )}
            {step === 1 && (
              <>
                <h3>Avvertenze</h3>
                <p>
                  Prima di apporre i flag richiesti e procedere cliccando sul tasto “CONFERMA”, ti raccomandiamo di
                  prendere attenta visione delle segnalazioni e informative.
                </p>
                {[
                  'La Banca segnala che il prodotto presenta complessità elevata. Confermo di aver preso visione delle avvertenze.',
                  'Informativa sui costi ed oneri',
                  'Documento contenente le informazioni chiave (KID)',
                  'Informazioni relative allo strumento finanziario',
                ].map((text, i) => (
                  <div key={text}>
                    <SecuritiesCheck
                      label={text}
                      checked={checks[i] ?? false}
                      onChange={(value) => setCheck(i, value)}
                    />
                    {i > 0 && <SecuritiesLink onClick={() => setDocument(text)}>Leggi documento</SecuritiesLink>}
                  </div>
                ))}
                <p>Cliccando “CONFERMA” confermi la presa visione e la tua volontà di dar seguito all’operazione.</p>
              </>
            )}
            {step === 2 && (
              <>
                <p>
                  Scegliendo Best Execution, il mercato di esecuzione viene individuato in base alla Strategia di
                  esecuzione e trasmissione degli ordini.
                </p>
                <h3>Riepilogo</h3>
                <InvestmentRows rows={rows} />
                <SecuritiesLink onClick={() => setDetails(!details)}>
                  {details ? 'Nascondi dettagli operazione' : 'Dettagli operazione'}
                </SecuritiesLink>
                {details && (
                  <InvestmentRows
                    rows={[
                      { label: 'Condizione quantità', value: draft.quantityCondition },
                      { label: 'Ordine condizionato', value: draft.conditional ? 'Sì' : 'No' },
                      { label: 'Prezzo di attivazione', value: draft.triggerPrice || '-' },
                      { label: 'Spese', value: <InvestmentAmount value={total * 0.0015} /> },
                    ]}
                  />
                )}
                <h3>Documenti consegnati</h3>
                <p>
                  Informativa su costi ed oneri; Informazioni relative allo strumento finanziario; Riepilogo avvertenze
                  della banca.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <p>Inserisci il Mobile Code per autorizzare l’operazione.</p>
                <SecuritiesField
                  label="Mobile Code"
                  value={code}
                  onChange={(value) => {
                    setCode(value)
                    setError(null)
                  }}
                  type="password"
                  hint="Per questa simulazione usa 123456."
                />
              </>
            )}
            {step === 4 && (
              <div className="mfis-success" role="status">
                <span aria-hidden="true">✓</span>
                <h3>
                  {virtual
                    ? 'Operazione virtuale completata'
                    : aucap
                      ? 'Richiesta di aumento di capitale inviata'
                      : auction
                        ? 'Sottoscrizione richiesta'
                        : `Ordine di ${selling ? 'vendita' : 'acquisto'} inviato`}
                </h3>
                <p>{security.name}</p>
                <InvestmentRows
                  rows={[
                    { label: 'Quantità', value: quantity },
                    { label: 'Controvalore', value: <InvestmentAmount value={total} /> },
                  ]}
                />
                <p>
                  {virtual
                    ? 'Il portafoglio virtuale e le transazioni sono stati aggiornati.'
                    : 'Puoi consultare lo stato dell’operazione in Ordini e movimenti.'}
                </p>
              </div>
            )}
          </>
        )}
        {exit && (
          <div role="alertdialog" aria-label="Uscire dall’operazione?" className="mfis-confirm">
            <h3>Vuoi uscire dall’operazione?</h3>
            <p>I dati inseriti non saranno salvati.</p>
            <InvestmentButton onClick={onClose}>Sì, esci</InvestmentButton>
            <SecuritiesLink onClick={() => setExit(false)}>No, continua</SecuritiesLink>
          </div>
        )}
        {depositBlocked && (
          <div className="mfis-block-overlay">
            <div
              ref={blockedDialog}
              tabIndex={-1}
              role="alertdialog"
              aria-modal="true"
              aria-label="Attenzione"
              className="mfis-block-dialog"
            >
              <img src={blockedIcon} alt="" />
              <h3>Attenzione</h3>
              <p>{depositError ?? registeredSecurityBlockMessage}</p>
              <InvestmentButton onClick={() => setDepositBlocked(false)}>Chiudi</InvestmentButton>
            </div>
          </div>
        )}
      </div>
    </InvestmentPage>
  )
}
