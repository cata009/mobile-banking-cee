import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation'
import {
  getItalyFinancialSnapshot,
  subscribeItalyFinancialChanges,
  selectAccountBalance,
} from '@/features/finance/italyFinancials'
import {
  getItalyInvestmentWealth,
  insuranceLines,
  valuePosition,
  investmentServicePositions,
  readSavingsSubscriptions,
} from '@/features/investments/mobileFirstValuation'
import { useRef, useState, useSyncExternalStore } from 'react'
import { useDemo } from '@/app/state/demoStore'
import {
  getFiscalSummary,
  fiscalRecordProfitCents,
  validateSavingsAmount,
  subscribeSavingsProduct,
} from '@/features/investments/mobileFirstInvestmentServices'
import type { InvestmentAreaProps } from './investmentsNavigation'
import { insuranceLineIcon } from './investmentsServicesContent'
import { InvestmentAmount, InvestmentButton, InvestmentRows, InvestmentTabs } from './MobileFirstInvestmentPrimitives'
import {
  ServiceCheck,
  ServiceDocument,
  ServiceFrame,
  ServiceLink,
  ServiceMobileCode,
  ServiceSuccess,
  serviceAmount,
} from './MobileFirstInvestmentServicesForms'

const disclaimer =
  'Questo prospetto non sostituisce né integra il rendiconto periodico a cui deve essere fatto riferimento per la valutazione del patrimonio gestito e per i risultati di gestione. Per completezza di informazione e per una corretta interpretazione dei dati, ricordiamo che il valore del patrimonio è stato elaborato in base agli ultimi dati di mercato disponibili.'

export function InvestmentFiscal(props: InvestmentAreaProps) {
  const { amountsHidden } = useDemo()
  const [year, setYear] = useState(props.instrument ?? '')
  const [month, setMonth] = useState('Ottobre')
  const [tab, setTab] = useState('Minus/Plusvalenze')
  const noPosition = props.action === 'empty' || props.action === 'no-position'
  const noChart = props.action === 'no-chart'
  const months =
    props.action === 'sparse-months'
      ? ['Maggio', 'Luglio', 'Ottobre']
      : ['Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
  const data = ['2026', '2025', '2024'].map((year) => ({
    year,
    minus: getFiscalSummary(year).minusCents / 100,
    plus: getFiscalSummary(year).plusCents / 100,
  }))
  const selectedFiscal = getFiscalSummary(
    year,
    [
      'Gennaio',
      'Febbraio',
      'Marzo',
      'Aprile',
      'Maggio',
      'Giugno',
      'Luglio',
      'Agosto',
      'Settembre',
      'Ottobre',
      'Novembre',
      'Dicembre',
    ].indexOf(month) + 1,
  )
  const summary = (minus: number, plus: number) => (
    <div className="mfiv-grid-data">
      <InvestmentRows
        rows={[
          { label: 'Minus', value: serviceAmount(minus) },
          { label: 'Plus', value: serviceAmount(plus) },
          { label: 'Imponibile', value: serviceAmount(0) },
          { label: 'Ritenuta fiscale', value: serviceAmount(0) },
        ]}
      />
    </div>
  )
  return (
    <ServiceFrame
      title={year || 'Posizione fiscale'}
      embedded={props.embedded && !year}
      onClose={props.onClose}
      onBack={() => (year ? setYear('') : props.onClose())}
    >
      {noPosition ? (
        <div className="mfiv-empty" data-node-id="24262:660933">
          <h3>Posizione fiscale non rilevata</h3>
          <p>
            Non è stato possibile rilevare la posizione fiscale poiché non hai effettuato operazioni negli ultimi 5
            anni.
          </p>
        </div>
      ) : !year ? (
        <>
          <article className="mfiv-card" data-node-id="24262:660437">
            <strong>Andrea Rossini Bianchi</strong>
            <InvestmentRows
              rows={[
                { label: 'Minus accantonata', value: serviceAmount(getFiscalSummary().accumulatedCents / 100) },
                {
                  label: 'Ultima elaborazione',
                  value: getFiscalSummary().latestDate
                    ? formatInvestmentReferenceDate(getFiscalSummary().latestDate)
                    : 'N.D.',
                },
              ]}
            />
          </article>
          {!noChart && (
            <div className="mfiv-fiscal-chart" aria-label="Minus accantonate per anno">
              {['2022', '2023', '2024', '2025', '2026']
                .map((year) => ({
                  year,
                  amount: getFiscalSummary(year).minusCents / 100,
                  height: Math.max(
                    1,
                    (getFiscalSummary(year).minusCents / Math.max(1, ...data.map((p) => Math.round(p.minus * 100)))) *
                      98,
                  ),
                }))
                .map((item) => (
                  <div key={item.year}>
                    <span>
                      {amountsHidden
                        ? '••••'
                        : new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2 }).format(item.amount) + '€'}
                    </span>
                    <i style={{ height: item.height }} />
                    <small>{item.year}</small>
                  </div>
                ))}
            </div>
          )}
          {data.map((item) => (
            <section className="mfiv-section" key={item.year}>
              <h3>{item.year}</h3>
              {summary(item.minus, item.plus)}
              <ServiceLink onClick={() => setYear(item.year)}>dettaglio {item.year}</ServiceLink>
            </section>
          ))}
        </>
      ) : (
        <>
          <InvestmentTabs labels={months} value={month} onChange={setMonth} />
          {summary(selectedFiscal.minusCents / 100, selectedFiscal.plusCents / 100)}
          <InvestmentTabs labels={['Minus/Plusvalenze', 'Prezzi']} value={tab} onChange={setTab} />
          {!selectedFiscal.records.length ? (
            <p className="mfiv-empty">Nessuna operazione nel periodo selezionato</p>
          ) : (
            selectedFiscal.records.map((record) => (
              <article
                className="mfiv-card"
                key={record.id}
                data-node-id={tab === 'Prezzi' ? '24262:660556' : '24262:660527'}
              >
                <h3>{record.name}</h3>
                <InvestmentRows
                  rows={
                    tab === 'Prezzi'
                      ? [
                          { label: 'Data valuta', value: record.date.split('-').reverse().join('/') },
                          { label: 'Qtà./Val. nominale', value: record.quantity },
                          { label: 'Prezzo medio', value: serviceAmount(record.costPrice) },
                          { label: 'Prezzo operazione', value: serviceAmount(record.executionPrice) },
                        ]
                      : [
                          { label: 'Data', value: record.date.split('-').reverse().join('/') },
                          { label: '% Cointestata', value: `${record.ownershipPercent}%` },
                          { label: 'Minus utilizzata', value: serviceAmount(record.usedLossCents / 100) },
                          { label: 'Minus/plus proquota', value: serviceAmount(fiscalRecordProfitCents(record) / 100) },
                          { label: 'Imponibile', value: serviceAmount(record.taxableCents / 100) },
                          { label: 'Ritenuta', value: serviceAmount(record.withholdingCents / 100) },
                        ]
                  }
                />
              </article>
            ))
          )}
          <p className="mfiv-disclaimer">{disclaimer}</p>
        </>
      )}
    </ServiceFrame>
  )
}

export function InvestmentProducts(props: InvestmentAreaProps) {
  const subscriptionId = useRef(`MF${crypto.randomUUID()}`)
  const financial = useSyncExternalStore(subscribeItalyFinancialChanges, getItalyFinancialSnapshot)
  const availableBalance = selectAccountBalance(financial, '000012345').availableCents / 100
  const [selectedSavingsId, setSelectedSavingsId] = useState('certificate-1')
  const savingsPositions = [
    ...investmentServicePositions.filter((p) => p.category === 'savings'),
    ...readSavingsSubscriptions(),
  ]
  const [tab, setTab] = useState('Certificati deposito')
  const [step, setStep] = useState(props.action === 'subscribe' ? 1 : 0)
  const [detail, setDetail] = useState(Boolean(props.instrument))
  const [line, setLine] = useState('')
  const [account, setAccount] = useState('Conto Principale - Andrea Rossini')
  const [selected, setSelected] = useState('')
  const [reviewed, setReviewed] = useState(false)
  const [precontract, setPrecontract] = useState(false)
  const [amount, setAmount] = useState('5000')
  const [amountChoice, setAmountChoice] = useState('5000')
  const [contract, setContract] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const savings = props.view === 'savings'
  const flexy = tab === 'Money Plus Flexy'
  const title = step
    ? 'MoneyBoxCd'
    : line
      ? 'Dettaglio linea'
      : detail
        ? 'Dettaglio prodotto'
        : savings
          ? 'Prodotti di risparmio'
          : props.view === 'insurance'
            ? 'Investimenti assicurativi'
            : props.view === 'managed'
              ? 'Gestione di portafogli'
              : 'Fondi pensione'
  const back = () => {
    setError('')
    if (step) setStep(Math.max(0, step - 1))
    else if (line) setLine('')
    else if (detail) setDetail(false)
    else props.onClose()
  }
  if (props.view === 'managed' || props.view === 'pension')
    return (
      <ServiceFrame title={title} embedded={props.embedded} onBack={props.onClose} onClose={props.onClose}>
        <p>Andrea Rossini Bianchi</p>
        <p>Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)</p>
        <InvestmentRows
          rows={[
            {
              label: 'Controvalore',
              value: serviceAmount(
                (getItalyInvestmentWealth().find((p) => p.category === props.view)?.valueCents ?? 0) / 100,
              ),
            },
            {
              label: 'Percentuale del portafoglio',
              value: `${((getItalyInvestmentWealth().find((p) => p.category === props.view)!.valueCents / getItalyInvestmentWealth().reduce((sum, p) => sum + p.valueCents, 0)) * 100).toFixed(2)}%`,
            },
          ]}
        />
        <ServiceLink onClick={() => props.onNavigate({ area: 'services', view: 'advisory' })}>
          Contatta il tuo consulente
        </ServiceLink>
      </ServiceFrame>
    )
  return (
    <ServiceFrame title={title} embedded={props.embedded && !detail && !step} onBack={back} onClose={props.onClose}>
      {step === 8 ? (
        <ServiceSuccess
          title="Certificato di deposito sottoscritto"
          description="Troverai una copia nella sezione Documenti entro due ore."
          onClose={props.onClose}
        />
      ) : step === 7 ? (
        <>
          <ServiceMobileCode
            onConfirm={() => {
              const result = subscribeSavingsProduct(Number(amount.replace(',', '.')), subscriptionId.current)
              if (result.error) setError(result.error)
              else {
                setError('')
                setStep(8)
              }
            }}
          />
          {error && <p role="alert">{error}</p>}
        </>
      ) : step > 0 ? (
        <>
          <div className="mfiv-progress">
            <span>{Math.min(step, 6)}/6</span>
            <progress value={Math.min(step, 6)} max={6} />
          </div>
          {step === 1 && (
            <>
              <h3>Seleziona il conto di addebito</h3>
              <label className="mfiv-field">
                Conto di addebito
                <select value={account} onChange={(event) => setAccount(event.target.value)}>
                  <option>Conto Principale - Andrea Rossini</option>
                </select>
              </label>
              <p>
                Saldo disponibile <InvestmentAmount value={availableBalance} />
              </p>
              <InvestmentButton onClick={() => setStep(2)}>Prosegui</InvestmentButton>
            </>
          )}
          {step === 2 && (
            <>
              <h3>Scegli il rendimento tra quelli indicati</h3>
              {(props.action === 'multiple-products' ? [0, 1, 2, 3] : [0]).map((index) => (
                <label key={index} className="mfiv-product-select">
                  <input
                    type="radio"
                    name="certificate"
                    checked={selected === String(index)}
                    onChange={() => setSelected(String(index))}
                  />
                  <span>
                    <strong>MoneyBoxCd</strong>
                    <InvestmentRows
                      rows={[
                        { label: 'Tasso annuo nominale', value: '0,10%' },
                        { label: 'Validità mesi', value: '24' },
                        {
                          label: 'Minimo | Massimo',
                          value: (
                            <>
                              <InvestmentAmount value={5000} /> | <InvestmentAmount value={100000} />
                            </>
                          ),
                        },
                      ]}
                    />
                  </span>
                </label>
              ))}
              <ServiceDocument
                title="Informativa precontrattuale"
                reviewed={reviewed}
                onReview={() => setReviewed(true)}
                rows={[
                  { label: 'Prodotto', value: 'MoneyBoxCd' },
                  { label: 'Durata', value: '24 mesi' },
                  { label: 'Tasso annuo nominale', value: '0,10%' },
                  { label: 'Importo minimo', value: serviceAmount(5000) },
                  { label: 'Importo massimo', value: serviceAmount(100000) },
                ]}
              />
              <ServiceCheck
                label="Ho preso visione dell’Informativa precontrattuale"
                checked={precontract}
                onChange={setPrecontract}
              />
              <InvestmentButton disabled={!selected || !reviewed || !precontract} onClick={() => setStep(3)}>
                Prosegui
              </InvestmentButton>
            </>
          )}
          {step === 3 && (
            <>
              <h3>Scegli l’importo da investire</h3>
              <p>Scegli l’importo tra quelli indicati</p>
              <label className="mfiv-field">
                Seleziona l’importo del certificato di deposito
                <select
                  value={amountChoice}
                  onChange={(event) => {
                    setContract(false)
                    setAccepted(false)
                    setAmountChoice(event.target.value)
                    if (event.target.value !== 'other') setAmount(event.target.value)
                  }}
                >
                  <option value="5000">5.000</option>
                  <option value="10000">10.000</option>
                  <option value="50000">50.000</option>
                  <option value="other">Altro</option>
                </select>
              </label>
              {amountChoice === 'other' && (
                <label className="mfiv-field">
                  Importo
                  <input
                    inputMode="decimal"
                    aria-label="Importo"
                    value={amount}
                    onChange={(event) => {
                      setContract(false)
                      setAccepted(false)
                      setAmount(event.target.value)
                      setError('')
                    }}
                  />
                  <small>Inserire un multiplo di 1.000</small>
                </label>
              )}
              {error && <p role="alert">{error}</p>}
              <InvestmentButton
                onClick={() => {
                  const message = validateSavingsAmount(amount)
                  if (message) setError(message)
                  else setStep(4)
                }}
              >
                Prosegui
              </InvestmentButton>
            </>
          )}
          {step === 4 && (
            <>
              <h3>Scegli il rendimento tra quelli indicati</h3>
              <InvestmentRows
                rows={[
                  { label: 'Prodotto', value: 'MoneyBoxCd' },
                  { label: 'Importo', value: serviceAmount(Number(amount.replace(',', '.'))) },
                  { label: 'Tasso annuo nominale (TAN)%', value: '0,10' },
                  { label: 'Data maturazione', value: '21/01/2027' },
                ]}
              />
              <InvestmentButton onClick={() => setStep(5)}>Prosegui</InvestmentButton>
            </>
          )}
          {step === 5 && (
            <>
              <h3>Riepilogo operazione</h3>
              <InvestmentRows
                rows={[
                  { label: 'Conto di addebito', value: account },
                  { label: 'Prodotto', value: 'MoneyBoxCd' },
                  { label: 'Importo', value: serviceAmount(Number(amount.replace(',', '.'))) },
                  { label: 'Tasso annuo nominale (TAN)%', value: '0,10' },
                  { label: 'Data maturazione', value: '21/01/2027' },
                ]}
              />
              <InvestmentButton onClick={() => setStep(6)}>Prosegui</InvestmentButton>
            </>
          )}
          {step === 6 && (
            <>
              <h3>Prendi visione della documentazione</h3>
              <ServiceDocument
                title="Contratto certificato di deposito"
                reviewed={contract}
                onReview={() => setContract(true)}
                rows={[
                  { label: 'Intestatario', value: 'Andrea Rossini Bianchi' },
                  { label: 'Conto', value: account },
                  { label: 'Prodotto', value: 'MoneyBoxCd' },
                  { label: 'Importo sottoscritto', value: serviceAmount(Number(amount.replace(',', '.'))) },
                  { label: 'TAN', value: '0,10%' },
                  { label: 'Data maturazione', value: '21/01/2027' },
                ]}
              />
              <ServiceCheck
                label="Confermo la presa visione della documentazione"
                checked={accepted}
                onChange={setAccepted}
              />
              <InvestmentButton disabled={!contract || !accepted} onClick={() => setStep(7)}>
                Conferma
              </InvestmentButton>
            </>
          )}
        </>
      ) : savings ? (
        <>
          {!detail && (
            <>
              <p>Andrea Rossini Bianchi</p>
              <p className="mfiv-disclaimer">Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)</p>
              <InvestmentTabs labels={['Certificati deposito', 'Money Plus Flexy']} value={tab} onChange={setTab} />
              <h3>I tuoi prodotti</h3>
            </>
          )}
          {(detail
            ? savingsPositions.filter((p) => p.id === selectedSavingsId)
            : savingsPositions.filter((p) => p.label === (flexy ? 'MoneyPlus' : 'MoneyBoxCd'))
          ).map((position, index) => (
            <article key={position.id} className="mfiv-card" data-node-id={flexy ? '24262:777023' : '24262:776998'}>
              <h3>{flexy ? 'MoneyPlus' : 'MoneyBoxCd'}</h3>
              {detail && <span className="mfiv-status">Attivo</span>}
              <InvestmentRows
                rows={[
                  { label: 'Data di scadenza', value: flexy ? '20/03/2026' : index ? '26/09/2024' : '10/10/2024' },
                  { label: 'Tasso annuo nominale', value: flexy ? '1,50%' : '0,10%' },
                  { label: flexy ? 'Importo' : 'Controvalore', value: serviceAmount(position.valueCents / 100) },
                  ...(detail
                    ? [
                        { label: 'Intestatario', value: 'Andrea Rossini Bianchi' },
                        {
                          label: flexy ? 'N° Operazione' : 'N° certificato di deposito',
                          value: flexy ? '00174190' : '00176 02744011',
                        },
                        { label: 'N° rapporto', value: '00176 02744011' },
                        { label: 'Conto Corrente collegato', value: '07537 0000040996861234' },
                        { label: 'Data sottoscrizione', value: flexy ? '18/03/2025' : '31/01/2025' },
                        { label: 'Tipo tasso', value: 'Fisso' },
                        { label: 'Liquidazione interessi', value: 'A scadenza' },
                        { label: 'Divisa', value: 'EUR' },
                        { label: 'Stato', value: 'Attivo' },
                      ]
                    : []),
                ]}
              />
              {!detail && (
                <ServiceLink
                  onClick={() => {
                    setSelectedSavingsId(position.id)
                    setDetail(true)
                  }}
                >
                  Dettaglio {flexy ? 'MoneyPlus' : 'MoneyBoxCd'}
                </ServiceLink>
              )}
            </article>
          ))}
          {!flexy && (
            <InvestmentButton
              onClick={() => {
                subscriptionId.current = `MF${crypto.randomUUID()}`
                setStep(1)
              }}
            >
              Sottoscrivi
            </InvestmentButton>
          )}
          {detail && <p className="mfiv-disclaimer">{disclaimer}</p>}
        </>
      ) : line ? (
        <>
          <h3>{line}</h3>
          <InvestmentRows
            rows={[
              {
                label: 'Valore conferito',
                value: serviceAmount(insuranceLines.find((item) => item.name === line)!.contributedCents / 100),
              },
              { label: 'Rilevanza ESG', value: 'N.D.' },
              { label: 'Valore disinvestito', value: serviceAmount(0) },
              { label: 'Netto switch', value: serviceAmount(0) },
              { label: 'Quote', value: insuranceLines.find((item) => item.name === line)!.shares },
              { label: 'Valore quota', value: serviceAmount(insuranceLines.find((item) => item.name === line)!.quote) },
              {
                label: 'Ultimo valore disponibile',
                value: serviceAmount(
                  valuePosition(
                    insuranceLines.find((item) => item.name === line)!.shares,
                    insuranceLines.find((item) => item.name === line)!.quote,
                  ) / 100,
                ),
              },
              {
                label: 'Guadagno/perdita',
                value: serviceAmount(
                  (valuePosition(
                    insuranceLines.find((item) => item.name === line)!.shares,
                    insuranceLines.find((item) => item.name === line)!.quote,
                  ) -
                    insuranceLines.find((item) => item.name === line)!.contributedCents) /
                    100,
                ),
              },
            ]}
          />
          <p className="mfiv-disclaimer">{disclaimer}</p>
        </>
      ) : (
        <>
          <p>Andrea Rossini Bianchi</p>
          <h3>Uniopportunità Stars</h3>
          <p>Polizza n. 3941499</p>
          <InvestmentRows
            rows={[
              {
                label: 'Ultimo valore disponibile',
                value: serviceAmount(
                  insuranceLines.reduce((sum, item) => sum + valuePosition(item.shares, item.quote), 0) / 100,
                ),
              },
              {
                label: 'Totale versato',
                value: serviceAmount(insuranceLines.reduce((sum, item) => sum + item.contributedCents, 0) / 100),
              },
              { label: 'Totale disinvestimento', value: serviceAmount(0) },
              {
                label: 'Guadagno/perdita',
                value: serviceAmount(
                  insuranceLines.reduce(
                    (sum, item) => sum + valuePosition(item.shares, item.quote) - item.contributedCents,
                    0,
                  ) / 100,
                ),
              },
              { label: 'Nome compagnia', value: 'UniCredit Allianz Vita S.P.A.' },
              { label: 'Tipo polizza', value: 'Unit Linked' },
              { label: 'Tipo premio', value: 'Premio unico' },
              { label: 'Data apertura', value: '22.10.2018' },
              { label: 'Data scadenza', value: 'Non prevista' },
              { label: 'Stato', value: 'Attiva' },
            ]}
          />
          <h3>Le tue linee</h3>
          {insuranceLines.map((item) => (
            <article key={item.id} className="mfiv-card">
              <h3 className="mfiv-line-title">
                <img src={insuranceLineIcon} alt="" />
                {item.name}
              </h3>
              <InvestmentAmount value={valuePosition(item.shares, item.quote) / 100} />
              <ServiceLink onClick={() => setLine(item.name)}>Dettaglio {item.name}</ServiceLink>
            </article>
          ))}
        </>
      )}
    </ServiceFrame>
  )
}
