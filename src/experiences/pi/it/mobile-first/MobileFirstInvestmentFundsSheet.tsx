import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation'
import { fundFees } from '@/features/investments/mobileFirstFunds'
import { useState } from 'react'
import { useDemo } from '@/app/state/demoStore'
import { InvestmentAmount, InvestmentRows, InvestmentTabs } from './MobileFirstInvestmentPrimitives'
import type { InvestmentFund } from './investmentsFundsContent'
import graph from '@/assets/mobile-first/it/investments/funds/660985-imgGraphLine.svg'
import line from '@/assets/mobile-first/it/investments/funds/660985-imgLine.svg'
import download from '@/assets/mobile-first/it/investments/funds/660985-imgNavigationAndActionDownloadT2.svg'

/** Source family 24262:660985–661255. Live selection retains its fund identity. */
export default function MobileFirstInvestmentFundsSheet({
  fund,
  onDocument,
}: {
  fund: InvestmentFund
  onDocument: (title: string) => void
}) {
  const [tab, setTab] = useState('Scheda')
  const [period, setPeriod] = useState('1M')
  const [expanded, setExpanded] = useState(false)
  const { amountsHidden } = useDemo()
  const previousNav = fund.nav / (1 + (fund.changePercent ?? 0) / 100)
  const minNav = Math.min(fund.nav, previousNav)
  const maxNav = Math.max(fund.nav, previousNav)
  return (
    <div className="mfif mfif-sheet">
      <h3>{fund.name}</h3>
      <div className="mfif-grid">
        <span>
          Ultimo NAV
          <InvestmentAmount value={fund.nav} decimals={4} />
        </span>
        <span>
          Variazione
          <strong>
            {fund.changePercent === undefined ? 'N.D.' : fund.changePercent.toLocaleString('it-IT') + '%'}
          </strong>
        </span>
      </div>
      <p className="mfif-muted">Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)</p>
      <div className="mfif-grid">
        <span>
          Classe<strong>E</strong>
        </span>
        <span>
          ISIN<strong>{fund.isin}</strong>
        </span>
      </div>
      <div className="mfif-risk">
        <span>Livello di Rischio</span>
        <div>
          {Array.from({ length: 7 }, (_, index) => (
            <i key={index} className={index === 0 ? 'mfif-current' : ''} />
          ))}
          <strong>1 di 7</strong>
          <button className="mfif-text" type="button" onClick={() => onDocument('Prospetto KID')}>
            prospetto kid
            <img src={download} alt="" />
          </button>
        </div>
      </div>
      <InvestmentTabs
        labels={['Scheda', 'Performance', 'Composizione', 'Commissioni', 'Documenti']}
        value={tab}
        onChange={setTab}
      />
      {tab === 'Scheda' && (
        <>
          <InvestmentTabs labels={['1M', '3M', 'YTD', '1A', '3A', '5A']} value={period} onChange={setPeriod} />
          <div className="mfif-nav-chart" aria-label={`Andamento NAV ${period}`}>
            <div className="mfif-chart-lines">
              <img src={line} alt="" />
              <img className="mfif-chart-graph" src={graph} alt="" />
            </div>
            <div className="mfif-chart-scale">
              {[0, 1 / 3, 2 / 3, 1]
                .map(
                  (factor) =>
                    (maxNav - factor * (maxNav - minNav)).toLocaleString('it-IT', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    }) + ' €',
                )
                .map((value, index) => (
                  <span key={index}>{amountsHidden ? '••••' : value}</span>
                ))}
            </div>
          </div>
          <div className="mfif-chart-times">
            {['9:00', '12:00', '15:00', '18:00', '21:00'].map((time) => (
              <span key={time}>{time}</span>
            ))}
          </div>
          <div className="mfif-grid">
            <span>
              Min.
              <strong>
                {amountsHidden ? '••••' : minNav.toLocaleString('it-IT', { minimumFractionDigits: 2 }) + ' €'}
              </strong>
            </span>
            <span>
              Max.
              <strong>
                {amountsHidden ? '••••' : maxNav.toLocaleString('it-IT', { minimumFractionDigits: 2 }) + ' €'}
              </strong>
            </span>
          </div>
          <h3>Scheda fondo</h3>
          <div className="mfif-data-grid">
            <InvestmentRows
              rows={[
                { label: 'Categoria assogestioni', value: fund.category },
                { label: 'Società prodotto', value: fund.manager },
                { label: 'Benchmark', value: '100% MSCI AC WORLD' },
                { label: 'Divisa', value: 'EUR' },
                { label: 'Importo min. sottoscriz. iniziale', value: <InvestmentAmount value={100} /> },
              ]}
            />
          </div>
          <div className="mfif-esg">
            <strong>Rilevanza ESG</strong>
            <p>Strumento rilevante ai fini delle preferenze di sostenibilità</p>
          </div>
          <h3>Obiettivo &amp; politica di investimento</h3>
          <strong>Obiettivo</strong>
          <p>L’obiettivo di questo Comparto è la rivalutazione del capitale nel medio-lungo termine.</p>
          <strong>Obiettivo temporale</strong>
          <p>Medio-lungo termine</p>
          <strong>Filosofia di investimento</strong>
          <p>
            Investendo in un portafoglio diversificato di strumenti finanziari consentiti. Il Comparto investirà
            prevalentemente, direttamente o indirettamente, attraverso DIC e OCVM di tipo aperto, in titoli azionari.
          </p>
          <strong>Filosofia ad accumulazione distribuzione</strong>
          <p>Accumulo</p>
        </>
      )}
      {tab === 'Performance' && (
        <>
          <h3>Grafico performance</h3>
          <div className="mfif-performance" aria-label="Performance per periodo">
            {[...['1M', '3M', 'YTD', '1A', '3A', '5A'].map((label) => ({ label, value: 0 }))].map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <div className="mfif-performance-column">
                  <i
                    className={item.value < 0 ? 'mfif-negative-bar' : 'mfif-positive-bar'}
                    style={{ height: `${Math.max(4, Math.abs(item.value) * 9)}px` }}
                  />
                  <strong>
                    {item.label === '1A' && fund.annualPerformance !== undefined
                      ? `${fund.annualPerformance.toLocaleString('it-IT')} %`
                      : 'N.D.'}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {tab === 'Composizione' && (
        <>
          <h3>Principali titoli in portafoglio</h3>
          <p className="mfif-muted">Dati riferiti al: 25/05/2022</p>
          {[
            ['JPM AMERICA EQUITY X ACC USD', 2.4],
            ['DEU AMERICA EQUITY X ACC USD', 3.7],
            ['ITA AMERICA EQUITY X ACC USD', 1.85],
            ['FR AMERICA EQUITY X ACC USD', 2.15],
            ['UFG AMERICA EQUITY X ACC USD', 0.95],
            ['PFG AMERICA EQUITY X ACC USD', 3.4],
            ['Altri strumenti', 100 - (2.4 + 3.7 + 1.85 + 2.15 + 0.95 + 3.4)],
          ].map(([name, percentage]) => (
            <div className="mfif-composition" key={name}>
              <strong>{Number(percentage).toLocaleString('it-IT')} %</strong>
              <span>{name}</span>
              <progress value={Number(percentage)} max={100} />
            </div>
          ))}
          <button className="mfif-text" type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
            Scopri ripartizione
          </button>
          {expanded && (
            <InvestmentRows
              rows={[
                { label: 'Azioni', value: '60%' },
                { label: 'Obbligazioni', value: '30%' },
                { label: 'Liquidità', value: '10%' },
              ]}
            />
          )}
        </>
      )}
      {tab === 'Commissioni' && (
        <>
          <h3>Commissioni</h3>
          <InvestmentRows
            rows={[
              { label: 'Spese correnti', value: `${(fundFees.ongoingAnnualRate * 100).toLocaleString('it-IT')} %` },
              { label: 'Sottoscrizione', value: `${(fundFees.subscriptionRate * 100).toLocaleString('it-IT')} %` },
              { label: 'Uscita', value: 'Non previsto' },
            ]}
          />
          <p className="mfif-muted">
            Avvertenze: la fonte dei dati sopra riportati è il Prospetto. Per approfondimenti sulle commissioni,
            consulta i documenti obbligatori in fase di sottoscrizione.
          </p>
        </>
      )}
      {tab === 'Documenti' && (
        <>
          <h3>Documentazione fondo</h3>
          {['Comunicazioni da consegnare', 'Documentazione di offerta', 'Prospetto KID'].map((name) => (
            <button className="mfif-link-row" key={name} type="button" onClick={() => onDocument(name)}>
              {name}
              <img src={download} alt="" />
            </button>
          ))}
        </>
      )}
      <p className="mfif-muted">
        Fonte: FIDA (finanza Dati Analisi)
        <br />
        Avvertenze: i dati sopra riportati sono indirizzati ad un pubblico indistinto.
      </p>
    </div>
  )
}
