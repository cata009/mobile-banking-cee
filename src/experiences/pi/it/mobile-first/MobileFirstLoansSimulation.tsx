import { useEffect, useRef, useState } from 'react'
import { BottomSheet } from '@/app/components/BottomSheet'
import { ScrollableRegion } from '@/app/components/ui/ScrollableRegion'
import { useDemo } from '@/app/state/demoStore'
import {
  calculateMortgagePayment,
  EMPTY_MORTGAGE_DRAFT,
  MORTGAGE_RATE_OPTIONS,
  validateMortgageStep,
  type MortgageDraft,
  type MortgageSimulation,
} from '@/features/credit/mobileFirstLoans'
import { loansAssets as a } from './loansAssets'
import { MORTGAGE_FULL_DISCLAIMER, MORTGAGE_STEP_QUESTIONS } from './loansContent'
import { CreditDisclaimer, formatSimulationDate, LoanAmount, LoansHeader } from './MobileFirstLoansPrimitives'

const purposes = [
  { name: 'Acquisto', icon: a.imgBuildingsHome },
  { name: 'Ristrutturazione', icon: a.imgCommonDesign },
  { name: 'Liquidità', icon: a.imgHomeBankingAndPaymentsCash },
  { name: 'Surroga', icon: a.imgNavigationAndActionExport },
]

function SimulationParameters({ draft, hidden }: { draft: MortgageDraft; hidden: boolean }) {
  const money = (value: number) => (hidden ? '••••' : `${new Intl.NumberFormat('it-IT').format(value)} €`)
  const birth = hidden ? '••••' : draft.birthDate.split('-').reverse().join('/')
  return (
    <div className="mf-loan-parameters">
      {draft.purpose && (
        <p>
          Voglio <strong>{draft.purpose === 'Acquisto' ? 'Acquistare' : draft.purpose}</strong>
        </p>
      )}
      {draft.firstHome !== null && (
        <p>
          La mia <strong>{draft.firstHome ? 'Prima casa' : 'Seconda casa'}</strong>
        </p>
      )}
      {draft.propertyValue > 0 && (
        <p>
          Del valore di <strong>{money(draft.propertyValue)}</strong>
        </p>
      )}
      {draft.principal > 0 && (
        <p>
          Mi serve un mutuo di <strong>{money(draft.principal)}</strong>
        </p>
      )}
      {draft.birthDate && (
        <p>
          La mia data di nascita è <strong>{birth}</strong>
        </p>
      )}
      {draft.years > 0 && (
        <p>
          E voglio che il mio mutuo duri <strong>{draft.years} anni</strong>
        </p>
      )}
    </div>
  )
}

export function MortgageSimulationDetail({
  simulation,
  onBack,
  onNew,
  onDocument,
}: {
  simulation: MortgageSimulation
  onBack: () => void
  onNew: () => void
  onDocument: (title: string, lines: string[]) => void
}) {
  const { amountsHidden } = useDemo()
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <LoansHeader onBack={onBack} onClose={onBack} />
      <ScrollableRegion className="mf-loans-scroll" aria-label="Dettaglio simulazione">
        <h1>{simulation.name}</h1>
        <p className="mf-loan-subtitle">{formatSimulationDate(simulation.createdAt)}</p>
        <section className="mf-loan-block">
          <h2>Parametri simulazione:</h2>
          <SimulationParameters draft={simulation.draft} hidden={amountsHidden} />
        </section>
        {simulation.expired && (
          <section className="mf-loan-expired">
            <h2>Simulazione scaduta</h2>
            <p>
              Le condizioni di vendita sono cambiate da quando la simulazione è stata effettuata. Esegui nuovamente la
              simulazione per avere le rate aggiornate.
            </p>
            <button className="mf-loan-link" type="button" onClick={onNew}>
              NUOVA SIMULAZIONE
            </button>
          </section>
        )}
        {MORTGAGE_RATE_OPTIONS.filter((rate) => simulation.rates.includes(rate.name)).map((rate) => (
          <section className="mf-loan-rate-detail" key={rate.name}>
            <h2>{rate.name}</h2>
            <p>
              Tasso (TAN): {rate.tan.toFixed(2).replace('.', ',')}%; TAEG: {rate.taeg};
            </p>
            <p>{rate.index}</p>
            <LoanAmount
              value={calculateMortgagePayment(simulation.draft.principal, simulation.draft.years, rate.tan)}
              hidden={amountsHidden}
            />
            {['Scheda Prodotto', 'Informazioni generali sul credito immobiliare ai consumatori'].map((title) => (
              <div className="mf-loan-document-row" key={title}>
                <span>{title}</span>
                <button
                  className="mf-loan-link"
                  type="button"
                  aria-label={`Scarica PDF ${title} ${rate.name}`}
                  onClick={() =>
                    onDocument(
                      `${title} - ${rate.name}`,
                      amountsHidden
                        ? ['Importi nascosti']
                        : [
                            `TAN ${rate.tan}%`,
                            `TAEG ${rate.taeg}`,
                            `Importo ${simulation.draft.principal} EUR`,
                            `Durata ${simulation.draft.years} anni`,
                          ],
                    )
                  }
                >
                  SCARICA PDF
                </button>
              </div>
            ))}
          </section>
        ))}
        <p className="mf-loan-disclaimer">
          {expanded ? MORTGAGE_FULL_DISCLAIMER : 'Messaggio pubblicitario con finalità promozionale.'}
        </p>
        <button
          type="button"
          className="mf-loan-disclaimer-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Mostra meno' : 'Mostra altro'}
        </button>
      </ScrollableRegion>
    </>
  )
}

export default function MortgageSimulator({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (simulation: MortgageSimulation) => boolean
}) {
  const { amountsHidden } = useDemo()
  const [phase, setPhase] = useState<'intro' | 'form' | 'result' | 'success' | 'failure'>('intro')
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<MortgageDraft>({ ...EMPTY_MORTGAGE_DRAFT })
  const [rates, setRates] = useState<string[]>(MORTGAGE_RATE_OPTIONS.map((rate) => rate.name))
  const [saveOpen, setSaveOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  const [consultantOpen, setConsultantOpen] = useState(true)
  const [consultantDetails, setConsultantDetails] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const update = (changes: Partial<MortgageDraft>) => {
    setDraft((previous) => ({ ...previous, ...changes }))
    setError(null)
    setTouched(true)
  }
  const back = () => {
    if (phase === 'form' && step > 1) setStep(step - 1)
    else if (phase === 'form') setPhase('intro')
    else if (phase === 'result') {
      setPhase('form')
      setStep(6)
    } else onClose()
  }
  useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: 0 })
    setTouched(false)
  }, [phase, step])
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || saveOpen || consultantDetails) return
      if (phase === 'form' && step > 1) setStep(step - 1)
      else if (phase === 'form') setPhase('intro')
      else if (phase === 'result') {
        setPhase('form')
        setStep(6)
      } else onClose()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [phase, step, saveOpen, consultantDetails, onClose])
  const next = () => {
    const invalid = validateMortgageStep(step, draft)
    if (invalid) {
      setError(invalid)
      return
    }
    if (step === 6) setPhase('result')
    else setStep(step + 1)
  }
  const save = () => {
    const simulation: MortgageSimulation = {
      id: `simulation-${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      draft: { ...draft },
      rates: [...rates],
    }
    const success = onSave(simulation)
    setSaveOpen(false)
    setPhase(success ? 'success' : 'failure')
  }
  const formError = validateMortgageStep(step, draft)
  const validResult = [3, 4, 5, 6].every((check) => validateMortgageStep(check, draft) === null)

  if (phase === 'success' || phase === 'failure')
    return (
      <>
        <div className="mf-loan-outcome">
          <img
            src={phase === 'success' ? a.imgNavigationAndActionSuccessLargeK10 : a.imgNavigationAndActionFailLargeK10}
            alt=""
          />
          <h1>{phase === 'success' ? 'Simulazione salvata con successo' : 'Qualcosa è andato storto'}</h1>
          <p>
            {phase === 'success'
              ? 'La tua simulazione è stata salvata nella tua area personale.'
              : 'Non è stato possibile salvare la tua simulazione nella tua area personale, ti invitiamo a riprovare.'}
          </p>
        </div>
        <footer className="mf-loan-footer">
          <button
            className="mf-loan-primary"
            type="button"
            onClick={phase === 'success' ? onClose : () => setPhase('result')}
          >
            {phase === 'success' ? 'Chiudi' : 'Riprova'}
          </button>
        </footer>
      </>
    )

  return (
    <>
      <LoansHeader onBack={phase === 'intro' ? undefined : back} onClose={onClose} />
      <ScrollableRegion
        ref={scrollRef}
        className={`mf-loans-scroll mf-loan-simulator${phase === 'intro' ? ' mf-loan-simulator-intro' : ''}`}
        aria-label="Simulatore mutuo"
      >
        {phase === 'intro' ? (
          <>
            <h1>Calcola Mutuo online</h1>
            <p className="mf-loan-subtitle">Simulatore mutuo UniCredit</p>
            <img src={a.imgHeroBannerMobile} alt="" className="mf-loan-simulator-hero" />
            <p className="mf-loan-disclaimer">
              Condizioni economiche variabili in base a finalità, durata e Loan To Value (rapporto tra l’importo del
              mutuo richiesto ed il minore tra il prezzo di acquisto dell’immobile e il valore dell’immobile riportato
              nella perizia disposta dalla Banca). Importo massimo finanziabile variabile in base alla finalità.
            </p>
            <button type="button" className="mf-loan-primary" onClick={() => setPhase('form')}>
              Calcola la rata
            </button>
          </>
        ) : (
          <>
            <h1>Calcola mutuo online</h1>
            <h2 className="mf-loan-welcome">
              {step === 1 && phase === 'form' && (
                <>
                  Benvenuto!
                  <br />
                </>
              )}
              Scriviamo insieme la tua storia
            </h2>
            {step > 1 || phase === 'result' ? <SimulationParameters draft={draft} hidden={amountsHidden} /> : null}
            {phase === 'form' ? (
              <>
                <div className="mf-loan-step" aria-label={`Passo ${step} di 6`}>
                  <span>
                    <strong>{step}</strong>/6
                  </span>
                  <p>{MORTGAGE_STEP_QUESTIONS[step - 1]}</p>
                </div>
                {step === 1 && (
                  <>
                    <div className="mf-loan-purpose">
                      {purposes.map((purpose) => (
                        <button
                          type="button"
                          key={purpose.name}
                          aria-pressed={draft.purpose === purpose.name}
                          onClick={() => update({ purpose: purpose.name })}
                        >
                          <span>
                            <img src={purpose.icon} alt="" />
                          </span>
                          {purpose.name}
                        </button>
                      ))}
                    </div>
                    <div className="mf-loan-tip">
                      <span>
                        <img src={a.imgGroup} alt="" />
                      </span>
                      <p>
                        Puoi calcolare la rata del mutuo per: <b>acquistare</b> un immobile, <b>ristrutturarne</b> uno
                        già di tua proprietà, ottenere <b>liquidità</b> offrendo in garanzia un tuo immobile o
                        trasferire un finanziamento da un’altra banca (<b>surroga</b>).
                      </p>
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className="mf-loan-home-choice">
                      {[true, false].map((first) => (
                        <button
                          key={String(first)}
                          type="button"
                          aria-pressed={draft.firstHome === first}
                          onClick={() => update({ firstHome: first })}
                        >
                          <span aria-hidden="true">{first ? '✓' : '×'}</span>
                          {first ? 'Sì' : 'No'}
                        </button>
                      ))}
                    </div>
                    <div className="mf-loan-tip">
                      <span>
                        <img src={a.imgGroup} alt="" />
                      </span>
                      <p>
                        La prima casa è l’abitazione principale in cui trasferirai la residenza entro 12 mesi
                        dall’acquisto. Per la prima casa hai <b>un’imposta sostitutiva agevolata pari allo 0,25%</b>{' '}
                        dell’importo totale del mutuo e per la seconda casa l’imposta è del 2%.
                      </p>
                    </div>
                  </>
                )}
                {step === 3 && (
                  <label className="mf-loan-input">
                    Importo dell’immobile
                    <input
                      type={amountsHidden ? 'password' : 'number'}
                      inputMode="decimal"
                      aria-invalid={touched && !!formError}
                      aria-describedby={touched && formError ? 'mf-loan-step-error' : undefined}
                      min="1"
                      placeholder="Inserisci importo"
                      value={draft.propertyValue || ''}
                      onChange={(event) => update({ propertyValue: Number(event.target.value) })}
                    />
                  </label>
                )}
                {step === 4 && (
                  <label className="mf-loan-input">
                    Importo richiesto
                    <input
                      type={amountsHidden ? 'password' : 'number'}
                      inputMode="decimal"
                      aria-invalid={touched && !!formError}
                      aria-describedby={touched && formError ? 'mf-loan-step-error' : undefined}
                      min="1"
                      max={draft.propertyValue}
                      placeholder="Inserisci importo"
                      value={draft.principal || ''}
                      onChange={(event) => update({ principal: Number(event.target.value) })}
                    />
                  </label>
                )}
                {step === 5 && (
                  <>
                    <label className="mf-loan-input">
                      Data di nascita
                      <input
                        type={amountsHidden ? 'password' : 'date'}
                        aria-invalid={touched && !!formError}
                        aria-describedby={touched && formError ? 'mf-loan-step-error' : undefined}
                        value={draft.birthDate}
                        onChange={(event) => update({ birthDate: event.target.value })}
                      />
                    </label>
                    <p className="mf-loan-disclaimer">
                      Per richiedere un mutuo devi avere almeno 18 anni e ne dovrai avere massimo 80 alla scadenza.
                    </p>
                  </>
                )}
                {step === 6 && (
                  <label className="mf-loan-input">
                    Durata in anni
                    <input
                      type="number"
                      min="1"
                      max="30"
                      placeholder="00"
                      aria-invalid={touched && !!formError}
                      aria-describedby={touched && formError ? 'mf-loan-step-error' : undefined}
                      value={draft.years || ''}
                      onChange={(event) => update({ years: Number(event.target.value) })}
                    />
                  </label>
                )}
                {(error || (touched && formError)) && (
                  <p id="mf-loan-step-error" role="alert" className="mf-loan-error">
                    {error || formError}
                  </p>
                )}
                <div className="mf-loan-step-actions">
                  <button className="mf-loan-square-secondary" type="button" onClick={back}>
                    Indietro
                  </button>
                  <button className="mf-loan-square-primary" type="button" disabled={!!formError} onClick={next}>
                    Avanti
                  </button>
                </div>
                <CreditDisclaimer />
              </>
            ) : (
              <>
                <p className="mf-loan-result-label">Seleziona quali simulazioni vuoi ricevere o salvare</p>
                <div className="mf-loan-rate-options">
                  {MORTGAGE_RATE_OPTIONS.map((rate) => (
                    <label className="mf-loan-rate-option" key={rate.name} data-selected={rates.includes(rate.name)}>
                      <input
                        type="checkbox"
                        aria-label={`Seleziona ${rate.name}`}
                        checked={rates.includes(rate.name)}
                        onChange={() =>
                          setRates((previous) =>
                            previous.includes(rate.name)
                              ? previous.filter((name) => name !== rate.name)
                              : [...previous, rate.name],
                          )
                        }
                      />
                      <span className="mf-loan-rate-check" aria-hidden="true">
                        {rates.includes(rate.name) && <img src={a.img170} alt="" />}
                      </span>
                      <strong>{rate.name}</strong>
                      <span>
                        Tasso (TAN): {rate.tan.toFixed(2).replace('.', ',')}%; TAEG: {rate.taeg};
                      </span>
                      <span>{rate.index}</span>
                      <span aria-label={`Rata ${rate.name}`}>
                        <LoanAmount
                          value={validResult ? calculateMortgagePayment(draft.principal, draft.years, rate.tan) : 0}
                          hidden={amountsHidden}
                          small
                        />
                      </span>
                    </label>
                  ))}
                </div>
                <section className="mf-loan-recalculate">
                  <p>Questi sono gli importi per la tua simulazione, puoi variarli modificando importo e durata:</p>
                  <label className="mf-loan-input">
                    Importo richiesto
                    <input
                      type={amountsHidden ? 'password' : 'number'}
                      inputMode="decimal"
                      min="1"
                      value={draft.principal || ''}
                      onChange={(event) => update({ principal: Number(event.target.value) })}
                    />
                  </label>
                  <label className="mf-loan-input">
                    Durata in anni
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={draft.years || ''}
                      onChange={(event) => update({ years: Number(event.target.value) })}
                    />
                  </label>
                  <button
                    type="button"
                    className="mf-loan-square-primary"
                    disabled={!validResult}
                    onClick={() => setError(null)}
                  >
                    Procedi
                  </button>
                  {!validResult && (
                    <p role="alert" className="mf-loan-error">
                      {validateMortgageStep(4, draft) ?? validateMortgageStep(6, draft)}
                    </p>
                  )}
                </section>
                <details className="mf-loan-insurance">
                  <summary>Vuoi proteggere il tuo mutuo con una polizza creditor protection insurance?</summary>
                  <p>Scopri le soluzioni di protezione del mutuo con un consulente UniCredit.</p>
                </details>
                {consultantOpen && (
                  <section className="mf-loan-consultant">
                    <button
                      type="button"
                      aria-label="Chiudi proposta consulente"
                      onClick={() => setConsultantOpen(false)}
                    >
                      ×
                    </button>
                    <strong>Vuoi parlare con un consulente?</strong>
                    <button type="button" onClick={() => setConsultantDetails(true)}>
                      SCOPRI COME RICHIEDERE IL PRODOTTO ›
                    </button>
                  </section>
                )}
                <button
                  type="button"
                  className="mf-loan-square-primary mf-loan-save"
                  disabled={!rates.length || !validResult}
                  onClick={() => setSaveOpen(true)}
                >
                  Salva
                </button>
                <p className="mf-loan-disclaimer">
                  {disclaimerOpen ? MORTGAGE_FULL_DISCLAIMER : 'Messaggio pubblicitario con finalità promozionale.'}
                </p>
                <button
                  type="button"
                  className="mf-loan-disclaimer-toggle"
                  aria-expanded={disclaimerOpen}
                  onClick={() => setDisclaimerOpen(!disclaimerOpen)}
                >
                  {disclaimerOpen ? 'Mostra meno' : 'Mostra altro'}
                </button>
              </>
            )}
          </>
        )}
      </ScrollableRegion>
      {saveOpen && (
        <BottomSheet
          title="Salva nell’area privata"
          closeLabel="Chiudi"
          className="mf-loan-sheet"
          onClose={() => setSaveOpen(false)}
        >
          <p>Dai un nome alla tua simulazione e salvala nella tua area personale.</p>
          <label className="mf-loan-input">
            Nome simulazione
            <input
              maxLength={60}
              placeholder="Inserisci nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <button type="button" className="mf-loan-primary" disabled={!name.trim()} onClick={save}>
            Salva
          </button>
        </BottomSheet>
      )}
      {consultantDetails && (
        <BottomSheet
          title="Parla con noi"
          closeLabel="Chiudi"
          className="mf-loan-sheet"
          onClose={() => setConsultantDetails(false)}
        >
          <p>Per richiedere il mutuo, contatta la tua filiale UniCredit.</p>
          <p>La simulazione è disponibile nella tua area personale dopo il salvataggio.</p>
        </BottomSheet>
      )}
    </>
  )
}
