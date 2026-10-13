import { useState } from 'react'
import {
  cancelSecurityOrder,
  canCancelSecurityOrder,
  securityOrderPeriodRange,
  securityOrderDisplayStatus,
  getSecurity,
  validateSecuritiesAssemblyRequest,
  validateSecuritiesAssemblyMobileCode,
  recordSecuritiesAssemblyTicket,
  type SecuritiesState,
} from '@/features/investments/mobileFirstSecurities'
import {
  InvestmentAmount,
  InvestmentButton,
  InvestmentPage,
  InvestmentRows,
  InvestmentTabs,
} from './MobileFirstInvestmentPrimitives'
import { SecuritiesError, SecuritiesField, SecuritiesLink } from './MobileFirstInvestmentSecuritiesElements'
import { securitiesAssemblies, securitiesDeposits } from './investmentsSecuritiesContent'

export function SecuritiesOrders({
  state,
  onState,
  onSecurity,
  onBack,
  onClose,
}: {
  state: SecuritiesState
  onState: (state: SecuritiesState) => void
  onSecurity: (id: string) => void
  onBack: () => void
  onClose: () => void
}) {
  const [tab, setTab] = useState('Ordini')
  const [selected, setSelected] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [status, setStatus] = useState('Tutti')
  const [cause, setCause] = useState('Tutti')
  const [period, setPeriod] = useState('12M')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [deposit, setDeposit] = useState('main')
  const [cancel, setCancel] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const range = period === 'Personalizza periodo' ? { from, to } : securityOrderPeriodRange(period)
  const order = state.orders.find((o) => o.id === selected)
  const orders = state.orders.filter(
    (o) =>
      (status === 'Tutti' || securityOrderDisplayStatus(o) === status) &&
      (cause === 'Tutti' || o.action === cause) &&
      (!range.from || o.date >= range.from) &&
      (!range.to || o.date <= range.to) &&
      (tab !== 'Movimenti' || o.status === 'Eseguito' || o.status === 'Annullato'),
  )
  const back = () => {
    if (filtersOpen) setFiltersOpen(false)
    else if (order) {
      setSelected(null)
      setCancel(false)
    } else onBack()
  }
  const reset = () => {
    setStatus('Tutti')
    setCause('Tutti')
    setPeriod('12M')
    setFrom('')
    setTo('')
    setError(null)
  }
  const cancelOrder = () => {
    if (!order || !canCancelSecurityOrder(order)) return
    onState(cancelSecurityOrder(state, order.id))
    setCancel(false)
    setMessage('Ordine annullato')
    setSelected(null)
  }
  return (
    <InvestmentPage
      title={
        filtersOpen
          ? 'Filtri di ricerca'
          : order
            ? tab === 'Ordini'
              ? 'Dettaglio ordine'
              : 'Dettaglio movimento'
            : 'Ordini e movimenti'
      }
      onBack={back}
      onClose={onClose}
      footer={
        filtersOpen ? (
          <InvestmentButton
            onClick={() => {
              if (from && to && from > to) {
                setError('La data iniziale deve precedere la data finale.')
                return
              }
              setFiltersOpen(false)
              setError(null)
            }}
          >
            Applica
          </InvestmentButton>
        ) : order && canCancelSecurityOrder(order) ? (
          <InvestmentButton onClick={() => setCancel(true)}>Annulla ordine</InvestmentButton>
        ) : undefined
      }
    >
      <div className="mfis-content">
        {message && (
          <p role="status" className="mfis-notice">
            {message}
          </p>
        )}
        <SecuritiesError>{error}</SecuritiesError>
        {filtersOpen ? (
          <>
            <SecuritiesField label="Deposito" value={deposit} onChange={setDeposit}>
              {securitiesDeposits.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} - {d.owner}
                </option>
              ))}
            </SecuritiesField>
            <SecuritiesField label="Sottodeposito" value="00" onChange={() => undefined}>
              <option value="00">00 - Andrea Rossini Bianchi</option>
            </SecuritiesField>
            <h3>Data</h3>
            <InvestmentTabs
              labels={['1M', '3M', '6M', '12M', 'Personalizza periodo']}
              value={period}
              onChange={(value) => {
                setPeriod(value)
                if (value !== 'Personalizza periodo') {
                  const range = securityOrderPeriodRange(value)
                  setFrom(range.from)
                  setTo(range.to)
                }
              }}
            />
            {period === 'Personalizza periodo' && (
              <>
                <SecuritiesField label="Data iniziale" type="date" value={from} onChange={setFrom} />
                <SecuritiesField label="Data finale" type="date" value={to} onChange={setTo} />
              </>
            )}
            <SecuritiesField label="Causale" value={cause} onChange={setCause}>
              {['Tutti', 'Acquisto', 'Vendita', 'Sottoscrizione', 'Aumento di capitale'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </SecuritiesField>
            <SecuritiesField label="Stato" value={status} onChange={setStatus}>
              {['Tutti', 'Ineseguito', 'Inviato', 'Eseguito', 'Annullato', 'Scaduto'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </SecuritiesField>
            <SecuritiesLink onClick={reset}>Rimuovi filtri</SecuritiesLink>
          </>
        ) : order ? (
          <>
            <h3>{getSecurity(order.securityId).name}</h3>
            <span className="mfis-status">{securityOrderDisplayStatus(order)}</span>
            <SecuritiesLink onClick={() => onSecurity(order.securityId)}>Scheda titolo</SecuritiesLink>
            <h3>Dettagli operazione</h3>
            <InvestmentRows
              rows={[
                { label: 'Intestazione', value: 'Andrea Rossini Bianchi' },
                { label: 'Rapporto', value: '00000040414019' },
                { label: 'Riferimento ordine', value: order.id },
                { label: 'Data ordine', value: order.date },
                { label: 'Ora inserimento', value: order.id.startsWith('MF') ? 'N.D.' : '17:06:00' },
                { label: 'Validità ordine dal', value: order.date },
                { label: 'Validità ordine al', value: order.validUntil },
                { label: 'Causale', value: order.action },
                { label: 'Stato ordine', value: securityOrderDisplayStatus(order) },
                { label: 'Mercato', value: order.market },
                { label: 'ISIN', value: getSecurity(order.securityId).isin },
                { label: 'Divisa', value: 'EUR' },
                { label: 'Fase', value: 'Continua' },
                { label: 'Prezzo inserito', value: <InvestmentAmount value={order.price} /> },
                { label: 'Quantità', value: order.quantity },
                {
                  label: 'Quantità residua',
                  value: securityOrderDisplayStatus(order) === 'Eseguito' ? 0 : order.quantity,
                },
                { label: 'Parametro prezzo', value: order.priceType },
                { label: 'Condizione quantità', value: order.quantityCondition },
                { label: 'Controvalore presunto', value: <InvestmentAmount value={order.price * order.quantity} /> },
              ]}
            />
            <p className="mfis-disclaimer">
              Il controvalore è calcolato sulla quantità e sul prezzo indicati nell’ordine. Al momento dell’esecuzione
              quantità, prezzo, cambio e commissioni potrebbero essere differenti.
            </p>
          </>
        ) : (
          <>
            <InvestmentTabs labels={['Ordini', 'Movimenti']} value={tab} onChange={setTab} />
            <div className="mfis-section-title">
              <strong>Filtri applicati:</strong>
              <SecuritiesLink onClick={() => setFiltersOpen(true)}>Filtri di ricerca</SecuritiesLink>
            </div>
            <InvestmentRows
              rows={[
                { label: 'Rapporto', value: 'Conto principale - Andrea Rossini' },
                { label: 'Sottodeposito', value: 'Conto principale - Andrea Rossini' },
                { label: 'Periodo', value: `${range.from || '—'} - ${range.to || '—'}` },
                { label: 'Causale', value: cause },
                { label: 'Stato', value: status },
              ]}
            />
            {!orders.length && <p>Non sono presenti {tab.toLowerCase()} per i filtri selezionati.</p>}
            {orders.map((o) => (
              <button type="button" className="mfis-quote" key={o.id} onClick={() => setSelected(o.id)}>
                <div className="mfis-card-heading">
                  <strong>{getSecurity(o.securityId).name}</strong>
                  <span className="mfis-status">{securityOrderDisplayStatus(o)}</span>
                </div>
                <p>{o.action}</p>
                <InvestmentRows
                  rows={[
                    { label: 'Data', value: o.date },
                    { label: 'Mercato', value: o.market },
                    { label: 'Qtà.', value: o.quantity },
                    { label: 'Importo', value: <InvestmentAmount value={o.price * o.quantity} /> },
                  ]}
                />
              </button>
            ))}
            <p className="mfis-disclaimer">
              Per piazza di “Best Execution” si intende la piazza che può garantire il miglior risultato possibile sulle
              sedi di esecuzione disponibili.
            </p>
          </>
        )}
        {cancel && order && (
          <div role="alertdialog" aria-label="Annullare ordine" className="mfis-confirm">
            <h3>Vuoi annullare il tuo ordine?</h3>
            <p>
              Stai per annullare l’ordine per il titolo “{getSecurity(order.securityId).name}” con causale “
              {order.action}”. Confermi di voler procedere?
            </p>
            <InvestmentButton onClick={cancelOrder}>Sì, annulla ordine</InvestmentButton>
            <SecuritiesLink onClick={() => setCancel(false)}>No, chiudi</SecuritiesLink>
          </div>
        )}
      </div>
    </InvestmentPage>
  )
}

export function SecuritiesAssembly({
  state,
  onState,
  onBack,
  onClose,
}: {
  state: SecuritiesState
  onState: (state: SecuritiesState) => void
  onBack: () => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [quantity, setQuantity] = useState('')
  const [convocation, setConvocation] = useState('Prima Convocazione')
  const [step, setStep] = useState(0)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const assembly = securitiesAssemblies.find((a) => a.company === selected)
  const back = () => {
    if (step) setStep(step - 1)
    else if (selected) setSelected(null)
    else onBack()
    setError(null)
  }
  const next = () => {
    if (!assembly) return
    if (step === 0) {
      const validation = validateSecuritiesAssemblyRequest(quantity, assembly.quantity)
      if (validation) {
        setError(validation)
        return
      }
      setStep(1)
    } else if (step === 1) setStep(2)
    else if (step === 2) {
      const validation = validateSecuritiesAssemblyMobileCode(code)
      if (validation) {
        setError(validation)
        return
      }
      onState(recordSecuritiesAssemblyTicket(state, assembly.company))
      setStep(3)
    }
    setError(null)
  }
  return (
    <InvestmentPage
      title={
        assembly
          ? step === 2
            ? 'Mobile Code'
            : step === 3
              ? 'Richiesta inviata'
              : 'Richiesta biglietti assembleari'
          : 'Biglietti assembleari'
      }
      onBack={back}
      onClose={onClose}
      footer={
        assembly ? (
          <InvestmentButton
            onClick={
              step === 3
                ? () => {
                    setSelected(null)
                    setStep(0)
                    setQuantity('')
                  }
                : next
            }
          >
            {step === 3 ? 'Vai ai biglietti assembleari' : step === 2 ? 'Conferma' : 'Prosegui'}
          </InvestmentButton>
        ) : undefined
      }
    >
      <div className="mfis-content">
        <SecuritiesError>{error}</SecuritiesError>
        {!assembly ? (
          <>
            <p>
              In questa sezione è possibile richiedere l’emissione dei biglietti per la partecipazione alle assemblee in
              relazione ai titoli quotati di emittenti italiani in evidenza sul tuo portafoglio.
            </p>
            {securitiesAssemblies.map((a) => (
              <article className="mfis-quote" key={a.company}>
                <InvestmentRows
                  rows={[
                    { label: 'Nome società', value: a.company },
                    { label: 'Tipo assemblea', value: a.type },
                    { label: 'Data/ora assemblea', value: a.date },
                    { label: 'Indirizzo assemblea', value: a.address },
                    { label: 'Data/ora limite richiesta', value: a.deadline },
                    { label: 'Numero biglietti richiesti', value: state.assemblyTickets[a.company] ?? 0 },
                  ]}
                />
                <SecuritiesLink
                  onClick={() => {
                    setSelected(a.company)
                    setQuantity('')
                    setError(null)
                  }}
                >
                  Richiedi biglietto {a.company}
                </SecuritiesLink>
              </article>
            ))}
          </>
        ) : step === 0 ? (
          <>
            <h3>{assembly.company}</h3>
            <p>
              Quantità di azioni disponibili: <strong>{assembly.quantity}</strong>
            </p>
            <SecuritiesField
              label="Quantità di azioni richieste"
              type="number"
              min={1}
              max={assembly.quantity}
              value={quantity}
              onChange={(value) => {
                setQuantity(value)
                setError(null)
              }}
            />
            <SecuritiesField label="Convocazione" value={convocation} onChange={setConvocation}>
              <option>Prima Convocazione</option>
              <option>Seconda Convocazione</option>
            </SecuritiesField>
            <InvestmentRows
              rows={[
                {
                  label: 'Data/ora',
                  value: convocation === 'Prima Convocazione' ? assembly.date : '30/04/2025 - 10:00',
                },
                { label: 'Data/ora limite richiesta', value: assembly.deadline },
                { label: 'Luogo', value: assembly.address },
              ]}
            />
          </>
        ) : step === 1 ? (
          <>
            <h3>Conferma richiesta</h3>
            <p>
              La richiesta riserva le azioni indicate per la partecipazione all’assemblea. Confermi di voler procedere?
            </p>
            <InvestmentRows
              rows={[
                { label: 'Società', value: assembly.company },
                { label: 'Quantità', value: quantity },
                { label: 'Convocazione', value: convocation },
                { label: 'Data/ora', value: assembly.date },
                { label: 'Luogo', value: assembly.address },
              ]}
            />
          </>
        ) : step === 2 ? (
          <>
            <p>Inserisci il Mobile Code per confermare la richiesta.</p>
            <SecuritiesField
              label="Mobile Code"
              type="password"
              value={code}
              onChange={setCode}
              hint="Per questa simulazione usa 123456."
            />
          </>
        ) : (
          <div role="status" className="mfis-success">
            <span aria-hidden="true">✓</span>
            <h3>La tua richiesta è stata inviata</h3>
            <p>
              Biglietto assembleare per {assembly.company}. Potrai consultare il numero di biglietti richiesti nella
              sezione Biglietti assembleari.
            </p>
          </div>
        )}
      </div>
    </InvestmentPage>
  )
}
