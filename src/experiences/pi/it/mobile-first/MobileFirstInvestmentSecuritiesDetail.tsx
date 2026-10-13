import { useState } from 'react'
import type { Security } from '@/features/investments/mobileFirstSecurities'
import { InvestmentAmount, InvestmentRows, InvestmentTabs } from './MobileFirstInvestmentPrimitives'
import graph from '@/assets/mobile-first/it/investments/securities/valuationGraph.svg'
import target from '@/assets/mobile-first/it/investments/securities/valuationTarget.svg'
import dotted from '@/assets/mobile-first/it/investments/securities/valuationDotted.svg'
import arrow from '@/assets/mobile-first/it/investments/securities/valuationArrow.svg'

export function SecuritiesValuations({ security }: { security: Security }) {
  const [year, setYear] = useState('2024')
  return (
    <>
      <h3>Valutazioni degli analisti</h3>
      <div className="mfis-opinions">
        <strong>Giudizi</strong>
        {[
          ['51,06% Overweight', 51.06],
          ['36,17% Buy', 36.17],
          ['8,51% Sell', 8.51],
          ['2,13% Hold', 2.13],
          ['2,13% Underweight', 2.13],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <meter value={Number(value)} max={100} />
          </div>
        ))}
        <small>Sulla base di 47 valutazioni degli analisti</small>
      </div>
      <h3>Stima target price 1 anno</h3>
      <small>Stimato al: 10/01/2025</small>
      <div className="mfis-target-chart">
        <img src={graph} alt="Stima di andamento verso il prezzo obiettivo" />
        <img src={target} alt="" />
        <img src={dotted} alt="" />
        <div>
          <span>Target</span>
          <span>
            <img src={arrow} alt="" />
            N.D.
          </span>
        </div>
        <span>
          Attuale <InvestmentAmount value={security.price} decimals={security.price < 1 ? 4 : 2} />
        </span>
      </div>
      <InvestmentTabs labels={['2024', '2025', '2026']} value={year} onChange={setYear} />
      <h3>Indicatori di prezzo</h3>
      <InvestmentRows
        rows={[
          { label: 'Price/Earnings Ratio', value: 'N.D.' },
          { label: 'Price/Cash Flow Ratio', value: 'N.D.' },
        ]}
      />
      <h3>Indicatori azioni</h3>
      <InvestmentRows
        rows={[
          { label: 'Earnings per Share Growth', value: '5,85%' },
          { label: 'Earning per Share', value: 'N.D.' },
          { label: 'Earnings before Interest, Taxes', value: 'N.D.' },
          { label: 'Earnings before Interest and Taxes', value: 'N.D.' },
          { label: 'Cash Flow per Share', value: '6,88' },
        ]}
      />
      <h3>Indicatori di bilancio</h3>
      <InvestmentRows
        rows={[
          { label: 'Net Sales (in Millions)', value: '3 M' },
          { label: 'Net Debt (in Millions)', value: '1 M' },
          { label: 'Net Assets per Share', value: '10,90' },
        ]}
      />
      <h3>Dividendi</h3>
      <InvestmentRows
        rows={[
          { label: 'Dividend Yield', value: `${((security.dividend / security.price) * 100).toFixed(2)}%` },
          { label: 'Dividendo', value: <InvestmentAmount value={security.dividend} /> },
        ]}
      />
    </>
  )
}
export function SecuritiesDetails({ security, statistics = false }: { security: Security; statistics?: boolean }) {
  if (statistics)
    return (
      <>
        <h3>Quotazione di riferimento</h3>
        <InvestmentRows
          rows={[
            {
              label: 'Prezzo chiusura',
              value: <InvestmentAmount value={security.price / (1 + security.change / 100)} />,
            },
            {
              label: 'Prezzo tel-quel',
              value: <InvestmentAmount value={security.price} decimals={security.price < 1 ? 4 : 2} />,
            },
            {
              label: 'Prezzo teorico',
              value: <InvestmentAmount value={security.price} decimals={security.price < 1 ? 4 : 2} />,
            },
          ]}
        />
        <h3>Rendimenti</h3>
        <InvestmentRows
          rows={[
            { label: 'Tasso di rend. eff. a scadenza (lordo)', value: 'N.D.' },
            { label: 'Tasso di rend. eff. a scadenza (netto)', value: 'N.D.' },
            {
              label: 'Tasso di rend. immediato (lordo)',
              value: security.coupon ? `${((security.coupon / security.price) * 100).toFixed(2)}%` : 'N.D.',
            },
            { label: 'Tasso di rend. immediato (netto)', value: 'N.D.' },
          ]}
        />
        <h3>Cedola</h3>
        <InvestmentRows
          rows={[
            { label: 'Rateo lordo', value: 'N.D.' },
            { label: 'Rateo netto', value: 'N.D.' },
            { label: 'Cedola certa', value: security.coupon === undefined ? 'N.D.' : `${security.coupon}%` },
            { label: 'Cedola tendenziale', value: security.coupon === undefined ? 'N.D.' : `${security.coupon}%` },
          ]}
        />
        <h3>Duration</h3>
        <InvestmentRows
          rows={[
            { label: 'Duration MAC', value: '105,63' },
            { label: 'Dur. Mod.', value: '98,12%' },
            { label: 'Vita residua', value: '34,81' },
          ]}
        />
      </>
    )
  return (
    <>
      <h3>Descrizione</h3>
      <p>{security.name}</p>
      <h3>Dettagli</h3>
      <InvestmentRows
        rows={[
          { label: 'Mercato', value: security.market },
          { label: 'ISIN', value: security.isin },
          { label: 'Tipologia', value: security.kind },
        ]}
      />
      {security.kind === 'Obbligazioni' ? (
        <>
          <h3>Caratteristiche</h3>
          <InvestmentRows
            rows={[
              { label: 'Prezzo di emissione', value: 'N.D.' },
              { label: 'Prezzo rimborso', value: 'N.D.' },
              { label: 'Ritenuta fiscale', value: 'N.D.' },
              { label: 'Tasso', value: security.coupon === undefined ? 'N.D.' : `${security.coupon}%` },
              { label: 'Coupon', value: security.coupon === undefined ? 'N.D.' : `${security.coupon}%` },
              { label: 'Data scadenza', value: security.maturity },
            ]}
          />
        </>
      ) : security.kind === 'ETC - ETN' || security.kind === 'Certificati e CW' ? (
        <>
          <h3>Tipo certificato</h3>
          <p>Fondo di Venture Capital</p>
          <h3>Caratteristiche</h3>
          <InvestmentRows
            rows={[
              { label: 'Strike price', value: <InvestmentAmount value={245.9} /> },
              { label: 'Lotto minimo', value: '3' },
              { label: 'Data scadenza', value: security.maturity ?? '25/04/2026' },
              { label: 'Rapporto', value: '2,16' },
            ]}
          />
        </>
      ) : null}
    </>
  )
}
export function SecuritiesCompany({ security }: { security: Security }) {
  return (
    <>
      <h3>Profilo societario</h3>
      <h3>Descrizione</h3>
      <p>
        {security.id === 'apple'
          ? 'Apple Inc. è un’azienda multinazionale statunitense che produce sistemi operativi, smartphone, computer e dispositivi multimediali, con sede a Cupertino, in California. È considerata una delle società tecnologiche Big Tech, assieme ad Amazon, Google, Microsoft.'
          : `${security.name}: strumento quotato sul mercato ${security.market}.`}
      </p>
      <h3>Dettagli</h3>
      <InvestmentRows
        rows={[
          { label: 'Ragione sociale', value: security.name },
          { label: 'ISIN', value: security.isin },
          ...(security.id === 'apple'
            ? [
                { label: 'E-mail', value: 'mario.rossi@gmail.com' },
                { label: 'Indirizzo', value: 'Via Roma n.2 - 41053 Brianza' },
                { label: 'Sito', value: 'https://www.apple.com' },
                { label: 'Fax', value: '+39 0536 483992' },
              ]
            : [{ label: 'Mercato', value: security.market }]),
        ]}
      />
      {security.id === 'apple' && (
        <>
          <h3>Cariche sociali</h3>
          <InvestmentRows
            rows={[
              'S. de Rose',
              'Roberto Mazzilli',
              'Paolo Chinotti',
              'Massimo Mancini',
              'M. E. Danese',
              'Giovanni Moglia',
              'A. Michelini',
              'Stefano Siragusa',
              'Alberta Figuri',
              'Adrian Calaza',
            ].map((name) => ({ label: 'Membro del Executive Committee', value: name }))}
          />
        </>
      )}
    </>
  )
}
