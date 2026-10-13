import { useState } from 'react'
import type { InvestmentAreaProps } from './investmentsNavigation'
import { InvestmentAmount, InvestmentButton, InvestmentRows, InvestmentTabs } from './MobileFirstInvestmentPrimitives'
import { serviceDocuments, servicesAssets } from './investmentsServicesContent'
import {
  ServiceCheck,
  ServiceDocument,
  ServiceFrame,
  ServiceLink,
  ServiceMobileCode,
  ServiceSuccess,
} from './MobileFirstInvestmentServicesForms'

type AdvisoryStage =
  | 'overview'
  | 'idea'
  | 'proposal'
  | 'generated'
  | 'contacts'
  | 'archive'
  | 'operations'
  | 'sign'
  | 'code'
  | 'success'
  | 'error'

export function InvestmentAdvisory(props: InvestmentAreaProps) {
  const [stage, setStage] = useState<AdvisoryStage>(
    props.action === 'sign'
      ? 'sign'
      : props.action === 'idea'
        ? 'idea'
        : props.action === 'operations' || props.action === 'authorize'
          ? 'operations'
          : 'overview',
  )
  const [tab, setTab] = useState('Consulenze')
  const [consultancy, setConsultancy] = useState('2001000349374')
  const [step, setStep] = useState(1)
  const [reviewed, setReviewed] = useState<Record<number, boolean>>({})
  const [accepted, setAccepted] = useState<Record<number, boolean>>({})
  const [generated, setGenerated] = useState(false)
  const [consent, setConsent] = useState(false)
  const [channel, setChannel] = useState('Telefono')
  const [contactConfirmed, setContactConfirmed] = useState(false)
  const clearSignature = () => {
    setReviewed({})
    setAccepted({})
    setConsent(false)
    setStep(1)
  }
  const openProposal = () => {
    clearSignature()
    setStage('proposal')
  }
  const empty = props.action === 'empty' || props.action === 'empty-ideas' || props.action === 'no-proposals'
  const title =
    stage === 'idea'
      ? 'Scopri l’idea di investimento'
      : stage === 'proposal'
        ? 'Idea di investimento'
        : stage === 'contacts'
          ? 'Informazioni'
          : stage === 'archive'
            ? 'Archivio consulenze'
            : stage === 'sign'
              ? `Verbale esito consulenza 2401027334783 - Doc. ${step < 3 ? '1' : '2'}`
              : stage === 'code'
                ? 'Completa la sottoscrizione'
                : 'Consulenza'
  const back = () => {
    if (stage === 'overview') props.onClose()
    else if (stage === 'proposal') setStage('idea')
    else if (stage === 'sign' && step > 1) setStep(step - 1)
    else if (stage === 'code') {
      setStage('sign')
      setStep(6)
    } else setStage('overview')
  }
  const operations = [
    {
      id: '2001049726590',
      description: 'Sottoscrizione Amundi Elite Multi Asset Flexible-Dis.Cl.A EUR/EUR (IT0005418741)',
      expiry: '29/04/2025 - 10:00',
      status: props.action === 'operations' ? 'Da inserire' : 'Da firmare',
    },
    {
      id: '2001049726591',
      description: 'Acquisto Enel AZ Ord Raggruppate (IT0003153852)',
      expiry: '30/04/2025 - 15:00',
      status: 'Da inserire',
    },
  ]
  const renderOperations = () =>
    operations.map((item) => (
      <article key={item.id} className="mfiv-card">
        <h3>Operazione {item.id}</h3>
        <InvestmentRows
          rows={[
            { label: 'Scadenza', value: item.expiry },
            { label: 'Sottoscrizione', value: item.description },
            { label: 'Stato', value: item.status },
          ]}
        />
        {stage === 'operations' && item.status === 'Da inserire' && (
          <ServiceLink
            onClick={() =>
              props.onNavigate(
                item.id === '2001049726590'
                  ? { area: 'funds', view: 'operation', action: 'subscribe', instrument: 'IT0005418741' }
                  : { area: 'securities', view: 'transaction', action: 'buy', instrument: 'IT0003153852' },
              )
            }
          >
            Inserisci operazione {item.id}
          </ServiceLink>
        )}
      </article>
    ))
  return (
    <ServiceFrame title={title} onBack={back} onClose={props.onClose}>
      {stage === 'overview' && (
        <>
          <InvestmentTabs labels={['Consulenze', 'Idee di investimento']} value={tab} onChange={setTab} />
          {tab === 'Consulenze' ? (
            <>
              {empty ? (
                <p>
                  La consulenza in materia di investimenti prestata dalla Banca consiste nel fornire al Cliente
                  raccomandazioni personalizzate, con riferimento ad una o più operazioni relative a strumenti
                  finanziari, a prodotti finanziari emessi da banche ed a prodotti di investimento assicurativi.
                </p>
              ) : (
                <>
                  <label className="mfiv-field">
                    Seleziona la consulenza
                    <select
                      value={consultancy}
                      onChange={(event) => {
                        if (event.target.value !== consultancy) clearSignature()
                        setConsultancy(event.target.value)
                      }}
                    >
                      <option>2001000349374</option>
                      <option>2601086209285</option>
                    </select>
                  </label>
                  <article className="mfiv-card">
                    <h3>Consulenza {consultancy}</h3>
                    <span className="mfiv-status mfiv-status-warning">Da firmare</span>
                    <InvestmentRows
                      rows={[
                        { label: 'Cliente', value: 'Trentini Crescenzo' },
                        { label: 'Scadenza', value: '18/11/2020 - 23:59' },
                      ]}
                    />
                    <h3>Operazioni</h3>
                    {renderOperations()}
                    <InvestmentButton
                      onClick={() => {
                        setStep(1)
                        setStage('sign')
                      }}
                    >
                      Visualizza e firma
                    </InvestmentButton>
                    <ServiceLink onClick={() => setStage('operations')}>Visualizza operazioni da inserire</ServiceLink>
                    <ServiceLink onClick={() => setStage('operations')}>Riprendi consulenza online</ServiceLink>
                  </article>
                </>
              )}
              <article className="mfiv-card">
                <h3>Informazioni</h3>
                <strong>Eugenio Lodovico</strong>
                <ServiceLink onClick={() => setStage('contacts')}>Vai ai contatti</ServiceLink>
                <ServiceLink onClick={() => setStage('archive')}>Archivio consulenze</ServiceLink>
              </article>
            </>
          ) : (
            <div data-node-id="24262:779257">
              <p>
                In questa sezione sono disponibili alcune idee di investimento formulate alla luce dell’attuale contesto
                macroeconomico e finanziario
              </p>
              <InvestmentRows rows={[{ label: 'Idee di investimento per:', value: 'Andrea Rossini Bianchi' }]} />
              {empty || generated ? (
                <div className="mfiv-empty">
                  <h3>Non hai nuove idee di investimento</h3>
                  <p>
                    Troverai nuove idee di investimento non appena saranno disponibili. Ti ricordiamo che potrai sempre
                    contattare il tuo consulente al nostro numero verde 800.57.57.57.
                  </p>
                  <ServiceLink onClick={() => setTab('Consulenze')}>Scopri se hai consulenze online</ServiceLink>
                </div>
              ) : (
                <article className="mfiv-idea">
                  <img src={servicesAssets.imgMobileTemporaryCardNew} alt="" />
                  <h3>BTP Futura</h3>
                  <p>Scopri la nostra idea di consulenza sul BTP Futura</p>
                  <ServiceLink
                    onClick={() => {
                      clearSignature()
                      setStage('idea')
                    }}
                  >
                    apri BTP Futura
                  </ServiceLink>
                </article>
              )}
            </div>
          )}
        </>
      )}
      {stage === 'idea' && (
        <div data-node-id="24262:779416">
          <img className="mfiv-hero" src={servicesAssets.imgHeroBannerMobile} alt="" />
          <h3>BTP Futura</h3>
          <p>Scopri la nostra idea di consulenza sul BTP Futura</p>
          <ServiceLink onClick={openProposal}>Soluzioni di investimento</ServiceLink>
          <InvestmentButton onClick={openProposal}>Conferma</InvestmentButton>
        </div>
      )}
      {stage === 'proposal' && (
        <div data-node-id={props.action === 'pac' ? '24262:779318' : '24262:779293'}>
          <h3>Dettagli idea di investimento</h3>
          {[
            { name: 'BGF GLOBAL CONSERVATIVE INCOME-ACC.CLE EUR/EUR', isin: 'LU1845137493', amount: 2536 },
            { name: 'ONEMARKETS AMUNDI FLEXIBLE INCOME ACC.CLC EUR/EUR', isin: 'LU2503839321', amount: 10139 },
          ]
            .slice(0, props.action === 'pac' ? 1 : 2)
            .map((item, index) => (
              <article className="mfiv-card" key={item.isin}>
                <h3>{item.name}</h3>
                <InvestmentRows
                  rows={[
                    { label: 'ISIN', value: item.isin },
                    ...(props.action === 'pac'
                      ? [
                          { label: 'Tipologia', value: 'PAC' },
                          { label: 'N. totale rate', value: 74 },
                          { label: 'Periodicità rata', value: 'Mensile' },
                          { label: 'Importo rata', value: <InvestmentAmount value={100} /> },
                          { label: 'Versamento iniziale', value: <InvestmentAmount value={1200} /> },
                          { label: 'Importo totale del piano', value: <InvestmentAmount value={1200 + 74 * 100} /> },
                        ]
                      : [{ label: 'Controvalore', value: <InvestmentAmount value={item.amount} /> }]),
                  ]}
                />
                <ServiceDocument
                  title="Key information document (KID)"
                  reviewed={reviewed[-index - 1] ?? false}
                  onReview={() => setReviewed((previous) => ({ ...previous, [-index - 1]: true }))}
                  rows={[
                    { label: 'Strumento/prodotto', value: item.name },
                    { label: 'ISIN', value: item.isin },
                  ]}
                />
              </article>
            ))}
          <p>
            Ti segnaliamo che generando il verbale di consulenza non potrai più accedere alle altre idee di investimento
            visualizzate nelle schermate precedenti.
          </p>
          <p>
            Ti ricordiamo che nel caso in cui il tuo deposito titoli sia collegato alla Banca via Internet
            esclusivamente in modalità informativa, per poter dar seguito alla proposta di investimento è necessario
            passare alla modalità dispositiva.
          </p>
          <ServiceLink onClick={() => setStage('contacts')}>Approfondisci con un consulente</ServiceLink>
          <ServiceCheck label="Confermo l’idea di investimento" checked={consent} onChange={setConsent} />
          <InvestmentButton
            disabled={!consent || !reviewed[-1] || (props.action !== 'pac' && !reviewed[-2])}
            onClick={() => {
              if (props.action === 'error') {
                setStage('error')
                return
              }
              setGenerated(true)
              setStage('generated')
            }}
          >
            Genera verbale consulenza
          </InvestmentButton>
        </div>
      )}
      {stage === 'generated' && (
        <ServiceSuccess
          title="Il verbale di esito consulenza è stato generato"
          onClose={() => {
            setTab('Consulenze')
            setStage('overview')
          }}
        />
      )}
      {stage === 'operations' && (
        <>
          <h3>Operazioni da inserire</h3>
          {renderOperations()}
          <InvestmentButton
            onClick={() => {
              setStep(1)
              setStage('sign')
            }}
          >
            Visualizza e firma
          </InvestmentButton>
        </>
      )}
      {stage === 'contacts' && (
        <>
          <h3>Eugenio Lodovico</h3>
          <p>Il tuo consulente UniCredit</p>
          <a className="mfiv-link" href="tel:800575757">
            800.57.57.57
          </a>
          <label className="mfiv-field">
            Canale di contatto
            <select value={channel} onChange={(event) => setChannel(event.target.value)}>
              <option>Telefono</option>
              <option>Appuntamento in filiale</option>
            </select>
          </label>
          <InvestmentButton onClick={() => setContactConfirmed(true)}>Seleziona contatto</InvestmentButton>
          {contactConfirmed && (
            <p role="status">
              Canale selezionato: {channel}. Contatta il servizio clienti per parlare con il tuo consulente.
            </p>
          )}
        </>
      )}
      {stage === 'archive' && (
        <>
          <p>Puoi consultare la documentazione nell’archivio Consulenze.</p>
          <article className="mfiv-card">
            <h3>Consulenza {consultancy}</h3>
            <InvestmentRows rows={[{ label: 'Stato', value: generated ? 'Completata' : 'Da firmare' }]} />
            <ServiceDocument
              title="Verbale esito consulenza"
              image={serviceDocuments.advisoryDocument1}
              reviewed={reviewed[1] ?? false}
              onReview={() => setReviewed((previous) => ({ ...previous, 1: true }))}
            />
          </article>
        </>
      )}
      {stage === 'sign' && (
        <div
          data-node-id={
            step === 1
              ? '24262:779164'
              : step === 2
                ? '24262:779189'
                : step === 3
                  ? '24262:779177'
                  : step === 4
                    ? '24262:779200'
                    : step === 5
                      ? '24262:779211'
                      : '24262:779222'
          }
        >
          <div className="mfiv-progress">
            <span>{step}/6</span>
            <progress max={6} value={step} />
          </div>
          {step === 1 || step === 3 ? (
            <>
              <p>
                Ti raccomandiamo di prendere visione della documentazione qui esposta e delle eventuali avvertenze in
                essa contenute. Con il click sul tasto “Continua” confermi la presa visione della stessa e avvii il
                processo di relativa sottoscrizione.
              </p>
              <ServiceDocument
                title={`Verbale esito consulenza - Doc. ${step === 1 ? '1' : '2'}`}
                image={step === 1 ? serviceDocuments.advisoryDocument1 : serviceDocuments.advisoryDocument2}
                reviewed={reviewed[step] ?? false}
                onReview={() => setReviewed((previous) => ({ ...previous, [step]: true }))}
              />
              <InvestmentButton disabled={!reviewed[step]} onClick={() => setStep(step + 1)}>
                Continua
              </InvestmentButton>
            </>
          ) : step < 6 ? (
            <>
              <p>
                Per conferma dei contenuti della sezione “Dichiarazioni del cliente” di cui al verbale di esito
                consulenza
              </p>
              <img
                className="mfiv-document-preview"
                src={step === 2 ? serviceDocuments.advisoryDocument1 : serviceDocuments.advisoryDocument2}
                alt="Dichiarazioni del cliente"
              />
              <p>Punto firma {step === 5 ? '2/2' : step === 4 ? '1/2' : '1/1'}</p>
              <ServiceCheck
                label="Accetto il punto firma"
                checked={accepted[step] ?? false}
                onChange={(value) => setAccepted((previous) => ({ ...previous, [step]: value }))}
              />
              <InvestmentButton disabled={!accepted[step]} onClick={() => setStep(step + 1)}>
                Continua
              </InvestmentButton>
            </>
          ) : (
            <>
              <h3>Completa la sottoscrizione</h3>
              <p>
                Premendo il tasto “Continua” ed inserito poi il sistema di autenticazione richiesto, si completa la
                sottoscrizione elettronica in corrispondenza dei punti firma finora accettati.
              </p>
              <InvestmentButton
                disabled={![1, 3].every((value) => reviewed[value]) || ![2, 4, 5].every((value) => accepted[value])}
                onClick={() => setStage('code')}
              >
                Continua
              </InvestmentButton>
            </>
          )}
        </div>
      )}
      {stage === 'code' && (
        <ServiceMobileCode
          onConfirm={() => {
            if ([1, 3].every((value) => reviewed[value]) && [2, 4, 5].every((value) => accepted[value]))
              setStage(props.action === 'signature-error' ? 'error' : 'success')
          }}
        />
      )}
      {stage === 'success' && (
        <>
          <ServiceSuccess
            title="La sottoscrizione si è conclusa correttamente"
            description="Puoi consultare la documentazione nell’archivio Consulenze."
            onClose={props.onClose}
          />
          <ServiceLink
            onClick={() => {
              setGenerated(true)
              setStage('archive')
            }}
          >
            Vai all’archivio
          </ServiceLink>
        </>
      )}
      {stage === 'error' && (
        <>
          <h3>
            {props.action === 'signature-error'
              ? 'La sottoscrizione non si è conclusa correttamente'
              : 'Non siamo riusciti a processare la tua richiesta per un problema tecnico'}
          </h3>
          <p>Si è verificato un errore imprevisto, riprova più tardi.</p>
          <InvestmentButton onClick={() => setStage('overview')}>Chiudi</InvestmentButton>
        </>
      )}
    </ServiceFrame>
  )
}
