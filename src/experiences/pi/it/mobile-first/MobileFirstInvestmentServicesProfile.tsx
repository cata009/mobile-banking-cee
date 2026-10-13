import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation'
import { securityMaximumCommissionCents } from '@/features/investments/mobileFirstSecurities'
import { getItalyInvestmentWealth } from '@/features/investments/mobileFirstValuation'
import { useState } from 'react'
import {
  isNonProfessionalMarketSubscriber,
  validateAlertPrice,
  readInvestmentServicePreferences,
  saveInvestmentServicePreferences,
} from '@/features/investments/mobileFirstInvestmentServices'
import type { InvestmentAreaProps } from './investmentsNavigation'
import { InvestmentAmount, InvestmentButton, InvestmentRows } from './MobileFirstInvestmentPrimitives'
import { marketSubscriberQuestions, servicePackages, servicesAssets } from './investmentsServicesContent'
import {
  ServiceCheck,
  ServiceDocument,
  ServiceFrame,
  ServiceLink,
  ServiceMobileCode,
  ServiceSuccess,
  serviceAmount,
  ServiceCurrencyAmount,
} from './MobileFirstInvestmentServicesForms'

type ProfileStage =
  | 'profile'
  | 'package'
  | 'deposit'
  | 'notifications'
  | 'alerts'
  | 'archive'
  | 'alert'
  | 'delete'
  | 'alert-success'
  | 'company'
  | 'market'
  | 'document'
  | 'accept'
  | 'sign'
  | 'code'
  | 'success'
  | 'revoke'
type PriceAlert = { name: string; price: number; condition: string; market: string; status: string }

export function InvestmentProfile(props: InvestmentAreaProps) {
  const [stage, setStage] = useState<ProfileStage>(props.view === 'packages' ? 'package' : 'profile')
  const [packageName, setPackageName] = useState(props.instrument ?? 'Money Trading')
  const [active, setActive] = useState<string[]>(() => readInvestmentServicePreferences().activePackages)
  const [deposit, setDeposit] = useState('13216 - 0000022832432')
  const [preferred, setPreferred] = useState(() => readInvestmentServicePreferences().preferredDeposit)
  const [notification, setNotification] = useState(false)
  const [orders, setOrders] = useState(false)
  const [communications, setCommunications] = useState(false)
  const [saved, setSaved] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [company, setCompany] = useState({ name: '', address: '', position: '', role: '' })
  const [marketAnswers, setMarketAnswers] = useState<string[]>([])
  const [marketWarning, setMarketWarning] = useState(false)
  const [alerts, setAlerts] = useState<PriceAlert[]>(
    props.action === 'empty-alerts'
      ? []
      : [
          { name: 'Apple', price: 198, condition: 'Maggiore o uguale a', market: 'NASDAQ', status: 'In attesa' },
          { name: 'Bpost', price: 193, condition: 'Maggiore o uguale a', market: 'NASDAQ', status: 'In attesa' },
          { name: 'Microsoft', price: 76, condition: 'Minore o uguale a', market: 'NASDAQ', status: 'In attesa' },
          { name: 'Tesla', price: 206, condition: 'Maggiore o uguale a', market: 'NASDAQ', status: 'Verificato' },
        ],
  )
  const [archived, setArchived] = useState<PriceAlert[]>([
    {
      name: 'Amundi MSCI All Country World ETF USDAcc',
      price: 100000,
      condition: 'Maggiore o uguale a',
      market: 'Euro Next Amsterdam',
      status: 'Scaduto',
    },
    { name: 'Amazon', price: 30, condition: 'Minore o uguale a', market: 'NASDAQ', status: 'Cancellato' },
  ])
  const [alertName, setAlertName] = useState('Apple')
  const [price, setPrice] = useState('207')
  const [condition, setCondition] = useState('Maggiore o uguale a')
  const [sort, setSort] = useState('Dalla A alla Z')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const selectedPackage = servicePackages.find((item) => item.name === packageName) ?? servicePackages[0]
  const realtime = packageName.startsWith('Trading Real Time')
  const title =
    stage === 'profile'
      ? 'Profilo investimenti'
      : stage === 'package'
        ? packageName
        : stage === 'deposit'
          ? 'Personalizza deposito'
          : stage === 'notifications'
            ? 'Investimenti e risparmio'
            : ['alerts', 'alert', 'delete', 'alert-success'].includes(stage)
              ? stage === 'alert'
                ? 'Attiva alert'
                : 'Monitoring Trading Alert'
              : stage === 'archive'
                ? 'Archivio Alert'
                : revoking
                  ? 'Revoca funzionalità'
                  : 'Attivazione funzionalità'
  const back = () => {
    setSaved(false)
    setError('')
    if (stage === 'profile') props.onClose()
    else if (['deposit', 'notifications', 'alerts', 'package'].includes(stage)) setStage('profile')
    else if (['archive', 'alert', 'delete'].includes(stage)) setStage('alerts')
    else if (stage === 'company' || stage === 'revoke') setStage('package')
    else if (stage === 'market') setStage('company')
    else if (stage === 'document') setStage(realtime ? 'market' : 'package')
    else if (stage === 'accept') setStage('document')
    else if (stage === 'sign') setStage('accept')
    else if (stage === 'code') setStage(revoking ? 'revoke' : 'sign')
    else setStage('profile')
  }
  const openPackage = (name: string) => {
    setPackageName(name)
    setReviewed(false)
    setAccepted(false)
    setRevoking(false)
    setMarketAnswers([])
    setStage('package')
  }
  const sorted = (stage === 'archive' ? archived : alerts)
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .sort((left, right) =>
      sort === 'Dalla Z alla A'
        ? right.name.localeCompare(left.name)
        : sort === 'Dalla A alla Z'
          ? left.name.localeCompare(right.name)
          : 0,
    )
  return (
    <ServiceFrame title={title} onBack={back} onClose={props.onClose}>
      {stage === 'profile' && (
        <div data-node-id="24262:777429">
          <div className="mfiv-quick-actions">
            <button type="button" onClick={() => setStage('deposit')}>
              <span>
                <img src={servicesAssets.NavigationAndActionEdit} alt="" />
              </span>
              Personaliz. deposito
            </button>
            <button type="button" onClick={() => setStage('alerts')}>
              <span>
                <img src={servicesAssets.DeviceAndTechnologyPushNotification} alt="" />
              </span>
              Alert
            </button>
          </div>
          <article className="mfiv-card mfiv-mifid-card">
            <strong>Intervista Mifid</strong>
            <span
              className={`mfiv-status ${props.action === 'complete' || readInvestmentServicePreferences().completedInterviews.length === 2 ? '' : 'mfiv-status-danger'}`}
            >
              {props.action === 'complete' || readInvestmentServicePreferences().completedInterviews.length === 2
                ? 'Completa'
                : props.action === 'incomplete' || readInvestmentServicePreferences().completedInterviews.length > 0
                  ? 'Incompleta'
                  : 'Da aggiornare'}
            </span>
            <ServiceLink onClick={() => props.onNavigate({ area: 'services', view: 'mifid' })}>
              VISUALIZZA MIFID
            </ServiceLink>
          </article>
          <h3>Pacchetti aggiuntivi</h3>
          {['Money Trading', 'Trading Real Time'].map((group) => (
            <section className="mfiv-section" key={group}>
              <h4>{group}</h4>
              <div className="mfiv-package-grid">
                {servicePackages
                  .filter((item) => item.name.startsWith(group))
                  .map((item) => (
                    <article key={item.name} className="mfiv-card">
                      <span className={`mfiv-status ${active.includes(item.name) ? '' : 'mfiv-status-warning'}`}>
                        {active.includes(item.name) ? 'Attivo' : 'Non attivo'}
                      </span>
                      <h4>{item.name}</h4>
                      <p>
                        Canone mensile <InvestmentAmount value={item.fee} />
                      </p>
                      <ServiceLink onClick={() => openPackage(item.name)}>apri pacchetto {item.name}</ServiceLink>
                    </article>
                  ))}
              </div>
            </section>
          ))}
          <ServiceLink onClick={() => openPackage('Push Book 5 livelli')}>Push Book 5 livelli</ServiceLink>
          <ServiceLink onClick={() => setStage('notifications')}>Comunicazioni e attività</ServiceLink>
        </div>
      )}
      {stage === 'deposit' && (
        <div data-node-id="24262:777832">
          <p>
            In questa sezione puoi selezionare il tuo deposito preferito, nonché quello di default all’interno
            dell’overview nella sezione investimenti.
          </p>
          {[
            {
              id: '0000000017838164',
              name: 'Andrea Rossini Bianchi',
              amount: getItalyInvestmentWealth().find((p) => p.category === 'securities')!.valueCents / 100,
            },
            { id: '0000000017838165', name: 'Andrea Rossini Bianchi, Flavia Bianchini', amount: 0 },
            {
              id: '13216 - 0000022832432',
              name: 'Andrea Rossini Bianchi',
              amount: getItalyInvestmentWealth().find((p) => p.category === 'funds')!.valueCents / 100,
            },
          ].map((item) => (
            <label key={item.id} className="mfiv-product-select">
              <input type="radio" name="deposit" checked={deposit === item.id} onChange={() => setDeposit(item.id)} />
              <span>
                <strong>{item.name}</strong>
                <small>{item.id}</small>
                <InvestmentAmount value={item.amount} />
              </span>
            </label>
          ))}
          <InvestmentButton
            onClick={() => {
              setPreferred(deposit)
              saveInvestmentServicePreferences({ preferredDeposit: deposit })
              setSaved(true)
            }}
          >
            Conferma
          </InvestmentButton>
          {saved && <p role="status">Deposito preferito aggiornato: {preferred}</p>}
        </div>
      )}
      {stage === 'notifications' && (
        <div data-node-id="24262:778039">
          <ServiceCheck
            label="Abilita tutte le notifiche"
            checked={notification}
            onChange={(value) => {
              setNotification(value)
              setOrders(value)
              setCommunications(value)
            }}
          />
          <ServiceCheck label="Ordini" checked={orders} onChange={setOrders} />
          <p>{orders ? 'Notifiche push e archivio' : 'Solo archivio'}</p>
          <ServiceCheck label="Altre comunicazioni" checked={communications} onChange={setCommunications} />
          <p>{communications ? 'Notifiche push e archivio' : 'Solo archivio'}</p>
          <InvestmentButton onClick={() => setSaved(true)}>Salva modifiche</InvestmentButton>
          {saved && <p role="status">Modifiche salvate</p>}
        </div>
      )}
      {stage === 'package' && (
        <div data-node-id={selectedPackage.source}>
          <span className={`mfiv-status ${active.includes(packageName) ? '' : 'mfiv-status-warning'}`}>
            {active.includes(packageName) ? 'Attivo' : 'Non attivo'}
          </span>
          {active.includes(packageName) && (
            <InvestmentRows rows={[{ label: 'Data attivazione', value: '23/02/2025' }]} />
          )}
          {realtime ? (
            <>
              <h3>In tempo reale</h3>
              <p>
                Le quotazioni dei titoli del mercato {packageName.replace('Trading Real Time ', '')} vengono fornite in
                tempo reale (Livello 1)
              </p>
              <h3>Aggiornamento prezzi</h3>
              <p>I prezzi non si aggiornano automaticamente, ma è necessario aggiornare la pagina</p>
            </>
          ) : (
            <>
              <p>Quotazioni titoli Italia (MTA, Sedex, MOT ed EuroMOT) fornite con le seguenti modalità:</p>
              <h3>Tecnologia push</h3>
              <p>
                Le quotazioni dei titoli, già fornite in tempo reale, si aggiornano automaticamente senza la necessità
                di cliccare alcun tasto.
              </p>
              <h3>Book a 5 livelli</h3>
              <p>
                Vengono visualizzate in tempo reale le 5 migliori proposte in acquisto e vendita, con le relative
                quantità presenti sul mercato di negoziazione.
              </p>
              <h3>Ordini condizionati “Stop order”</h3>
              <p>Proposte di negoziazione</p>
              {packageName === 'Money Trading Advanced' && (
                <>
                  <h3>Commissione massima</h3>
                  <p>
                    Commissione massima di negoziazione di{' '}
                    <InvestmentAmount value={securityMaximumCommissionCents / 100} /> per ordine disposto sui mercati
                    MTA, ETFPlus, Sedex e azionario EuroTLX tramite il canale Internet.
                  </p>
                </>
              )}
            </>
          )}
          <InvestmentRows rows={[{ label: 'Canone mensile', value: serviceAmount(selectedPackage.fee) }]} />
          <InvestmentButton
            onClick={() => {
              setRevoking(active.includes(packageName))
              setStage(active.includes(packageName) ? 'revoke' : realtime ? 'company' : 'document')
            }}
          >
            {active.includes(packageName) ? 'Recesso' : 'Attiva funzionalità'}
          </InvestmentButton>
        </div>
      )}
      {stage === 'company' && (
        <div data-node-id="24262:777584">
          <h3>Inserisci le tue informazioni per aderire alla funzionalità</h3>
          <InvestmentRows
            rows={[
              { label: 'Nome e Cognome', value: 'Andrea Rossini Bianchi' },
              { label: 'Professione', value: 'Dipendente Az. Industriale' },
            ]}
          />
          {(
            [
              { key: 'name', label: 'Nome di azienda' },
              { key: 'address', label: 'Indirizzo di azienda' },
              { key: 'position', label: 'Titolo e Posizione ricoperta' },
              { key: 'role', label: 'Funzione' },
            ] as const
          ).map((field) => (
            <label key={field.key} className="mfiv-field">
              {field.label}
              <input
                value={company[field.key]}
                onChange={(event) => setCompany((previous) => ({ ...previous, [field.key]: event.target.value }))}
              />
            </label>
          ))}
          <InvestmentButton
            disabled={Object.values(company).some((value) => !value.trim())}
            onClick={() => setStage('market')}
          >
            Conferma
          </InvestmentButton>
        </div>
      )}
      {stage === 'market' && (
        <div data-node-id="24262:777645">
          <h3>Prendi visione e accetta le condizioni contrattuali</h3>
          <p>
            Prima di confermare è necessario prendere visione delle condizioni contrattuali indicate nel seguente
            documento.
          </p>
          {marketSubscriberQuestions.map((question, index) => (
            <fieldset className="mfiv-options" key={question}>
              <legend>{question}</legend>
              {['Sì', 'No'].map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name={`market-${index}`}
                    checked={marketAnswers[index] === value}
                    onChange={() => {
                      setReviewed(false)
                      setAccepted(false)
                      setMarketAnswers((previous) => {
                        const next = [...previous]
                        next[index] = value
                        return next
                      })
                      setMarketWarning(false)
                    }}
                  />
                  <span>{value}</span>
                </label>
              ))}
            </fieldset>
          ))}
          {marketWarning && (
            <div className="mfiv-warning" role="alert">
              <h3>Attenzione</h3>
              <p>Le risposte indicate non consentono l’adesione al servizio per uso personale non professionale.</p>
              <ServiceLink onClick={() => setMarketWarning(false)}>Modifica le risposte</ServiceLink>
            </div>
          )}
          <InvestmentButton
            disabled={marketSubscriberQuestions.some((_, index) => !marketAnswers[index])}
            onClick={() => {
              if (isNonProfessionalMarketSubscriber(marketAnswers)) setStage('document')
              else setMarketWarning(true)
            }}
          >
            Conferma
          </InvestmentButton>
        </div>
      )}
      {stage === 'document' && (
        <>
          <h3>Prendi visione e firma la documentazione per aderire al servizio</h3>
          <p>
            Per attivare la funzionalità è necessario prendere visione del Contratto per il servizio {packageName}, del
            quale ti raccomandiamo il salvataggio su supporto duraturo.
          </p>
          <ServiceDocument
            title={`Contratto ${packageName}`}
            reviewed={reviewed}
            onReview={() => setReviewed(true)}
            rows={[
              { label: 'Intestatario', value: 'Andrea Rossini Bianchi' },
              { label: 'Deposito', value: preferred },
              { label: 'Servizio', value: packageName },
              { label: 'Canone mensile', value: serviceAmount(selectedPackage.fee) },
              {
                label: 'Quotazioni',
                value: realtime ? 'In tempo reale (Livello 1)' : 'Book a 5 livelli e tecnologia push',
              },
            ]}
          />
          <InvestmentButton disabled={!reviewed} onClick={() => setStage('accept')}>
            Conferma
          </InvestmentButton>
        </>
      )}
      {stage === 'accept' && (
        <>
          <p>
            Dichiaro di aver preso visione del Contratto per il servizio {packageName} resomi a disposizione e di
            confermare la volontà da me espressa in merito ai consensi al trattamento dei dati personali.
          </p>
          <ServiceCheck label="Accetto i punti firma" checked={accepted} onChange={setAccepted} />
          <InvestmentButton disabled={!accepted || !reviewed} onClick={() => setStage('sign')}>
            Accetta e prosegui
          </InvestmentButton>
        </>
      )}
      {stage === 'sign' && (
        <>
          <h3>Completa l’attivazione</h3>
          <p>
            Premendo sul tasto conferma ed inserendo poi il sistema di autenticazione richiesto, si completa la
            sottoscrizione elettronica in corrispondenza dei punti firma finora accettati.
          </p>
          <InvestmentButton disabled={!reviewed || !accepted} onClick={() => setStage('code')}>
            Prosegui
          </InvestmentButton>
        </>
      )}
      {stage === 'revoke' && (
        <div data-node-id="24262:777994">
          <h3>Conferma la revoca</h3>
          <p>Vuole revocare l’adesione alla funzionalità “{packageName}”?</p>
          <p>La revoca avrà efficacia dal primo giorno del mese successivo.</p>
          <InvestmentButton onClick={() => setStage('code')}>Conferma</InvestmentButton>
        </div>
      )}
      {stage === 'code' && (
        <ServiceMobileCode
          onConfirm={() => {
            if (revoking) {
              setActive((previous) => {
                const next = previous.filter((name) => name !== packageName)
                saveInvestmentServicePreferences({ activePackages: next })
                return next
              })
              setStage('success')
            } else if (reviewed && accepted) {
              setActive((previous) => {
                const next = [...new Set([...previous, packageName])]
                saveInvestmentServicePreferences({ activePackages: next })
                return next
              })
              setStage('success')
            }
          }}
        />
      )}
      {stage === 'success' && (
        <ServiceSuccess
          title={revoking ? 'Revoca confermata' : 'Funzionalità aggiuntiva attivata'}
          description={
            revoking
              ? 'Ti informiamo di aver ricevuto la tua richiesta di revoca dell’adesione che avrà efficacia dal primo giorno del mese successivo.'
              : undefined
          }
          onClose={() => setStage('profile')}
        />
      )}
      {(stage === 'alerts' || stage === 'archive') && (
        <>
          <p>
            {stage === 'archive'
              ? 'In questa sezione puoi vedere gli alert impostati che hanno raggiunto l’obiettivo di prezzo, cancellati o scaduti negli ultimi 15 giorni. Superati i 15 giorni gli alert verranno eliminati automaticamente.'
              : 'In questa sezione puoi vedere gli alert sui prezzi che hai attivato, modificarli e attivarne di nuovi'}
          </p>
          {stage === 'alerts' && (
            <>
              <ServiceLink onClick={() => setStage('alert')}>Attiva alert</ServiceLink>
              <ServiceLink onClick={() => setStage('archive')}>Archivio</ServiceLink>
            </>
          )}
          <label className="mfiv-field">
            Cerca alert
            <input value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label className="mfiv-field">
            Ordina per
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {['Dalla A alla Z', 'Dalla Z alla A', 'Dalla più recente', 'Dalla meno recente'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          {sorted.length === 0 && (
            <div className="mfiv-empty">
              <h3>Nessun alert presente</h3>
              {stage === 'alerts' && (
                <>
                  <p>Per iniziare a fissare gli obiettivi di prezzo cerca gli strumenti che ti interessano.</p>
                  <ServiceLink onClick={() => setStage('alert')}>Vai alla ricerca</ServiceLink>
                </>
              )}
            </div>
          )}
          {sorted.map((item, index) => (
            <article className="mfiv-card" key={`${item.name}-${index}`}>
              <h3>{item.name}</h3>
              <span className="mfiv-status">{item.status}</span>
              <InvestmentRows
                rows={[
                  { label: 'Mercato', value: item.market },
                  { label: 'Data immissione', value: '01/07/2026' },
                  { label: stage === 'archive' ? 'Scaduto il' : 'Scadenza', value: '31/07/2026' },
                  {
                    label: 'Condizione prezzo',
                    value: (
                      <>
                        {item.condition} <InvestmentAmount value={item.price} />
                      </>
                    ),
                  },
                ]}
              />
              {stage === 'alerts' && (
                <>
                  <ServiceLink
                    onClick={() => {
                      setAlertName(item.name)
                      setPrice(String(item.price))
                      setCondition(item.condition)
                      setStage('alert')
                    }}
                  >
                    Modifica {item.name}
                  </ServiceLink>
                  <ServiceLink
                    onClick={() => {
                      setAlertName(item.name)
                      setCondition(item.condition)
                      setStage('delete')
                    }}
                  >
                    Elimina {item.name}
                  </ServiceLink>
                </>
              )}
            </article>
          ))}
        </>
      )}
      {stage === 'alert' && (
        <div data-node-id="24262:778532">
          <label className="mfiv-field">
            Strumento
            <select value={alertName} onChange={(event) => setAlertName(event.target.value)}>
              {['Apple', 'Bpost', 'Microsoft', 'Tesla', 'Amazon'].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <InvestmentRows
            rows={[
              { label: 'Mercato', value: 'NASDAQ' },
              {
                label: 'Ultimo prezzo',
                value: alertName === 'Apple' ? <ServiceCurrencyAmount value={204.75} currency="USD" /> : 'N.D.',
              },
            ]}
          />
          <p>Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)</p>
          <p>Le quotazioni mostrate sono in ritardo di almeno 15 minuti.</p>
          <h3>Imposta l’obiettivo di prezzo</h3>
          <p>L’obiettivo di prezzo deve essere diverso da quello attuale</p>
          <label className="mfiv-field">
            Condizione
            <select value={condition} onChange={(event) => setCondition(event.target.value)}>
              <option>Minore o uguale a</option>
              <option>Maggiore o uguale a</option>
            </select>
          </label>
          <label className="mfiv-field">
            Obiettivo di prezzo
            <input
              inputMode="decimal"
              value={price}
              onChange={(event) => {
                setPrice(event.target.value)
                setError('')
              }}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <InvestmentButton
            onClick={() => {
              if (!validateAlertPrice(price, alertName === 'Apple' ? 204.75 : Number.NaN)) {
                setError('L’obiettivo di prezzo deve essere positivo e diverso da quello attuale')
                return
              }
              if (props.action === 'alert-error' || props.action === 'alert-unavailable') {
                setError(
                  props.action === 'alert-error'
                    ? 'Alert non aggiunto correttamente'
                    : 'Impossibile aggiungere l’alert',
                )
                return
              }
              setAlerts((previous) => [
                ...previous.filter((item) => item.name !== alertName || item.condition !== condition),
                {
                  name: alertName,
                  price: Number(price.replace(',', '.')),
                  condition,
                  market: 'NASDAQ',
                  status: 'In attesa',
                },
              ])
              setStage('alert-success')
            }}
          >
            Attiva alert
          </InvestmentButton>
        </div>
      )}
      {stage === 'delete' && (
        <div data-node-id="24262:778782">
          <h3>Vuoi eliminare l’alert?</h3>
          <p>Desideri eliminare l’alert di prezzo per il titolo “{alertName}”?</p>
          <InvestmentButton
            onClick={() => {
              setArchived((previous) => [
                ...previous,
                ...alerts
                  .filter((item) => item.name === alertName && item.condition === condition)
                  .map((item) => ({ ...item, status: 'Cancellato' })),
              ])
              setAlerts((previous) =>
                previous.filter((item) => item.name !== alertName || item.condition !== condition),
              )
              setStage('alerts')
            }}
          >
            Conferma
          </InvestmentButton>
          <ServiceLink onClick={() => setStage('alerts')}>Annulla</ServiceLink>
        </div>
      )}
      {stage === 'alert-success' && (
        <ServiceSuccess
          title="Alert attivato correttamente"
          description="L’alert di prezzo sul titolo è stato attivato nel modo corretto."
          onClose={() => setStage('alerts')}
        />
      )}
    </ServiceFrame>
  )
}
