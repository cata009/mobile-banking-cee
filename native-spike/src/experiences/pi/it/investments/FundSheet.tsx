import { PageTitle } from './PageLayout';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  fundFees,
  type InvestmentFund,
} from '@/features/investments/mobileFirstFunds';
import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation';
import type { ItalyNativeScreenProps } from '../contracts';
import FundDocument from './FundDocument';
import { InvestmentFooter } from './PageLayout';
import graph from '@/assets/mobile-first/it/investments/funds/660985-imgGraphLine.svg';
import line from '@/assets/mobile-first/it/investments/funds/660985-imgLine.svg';
import { AssetGlyph, Button, Link, Money, Rows, Tabs, s } from './Primitives';
export default function FundSheet({
  fund,
  hidden,
  onSubscribe,
  screenProps,
}: {
  fund: InvestmentFund;
  hidden: boolean;
  onSubscribe: () => void;
  screenProps: ItalyNativeScreenProps;
}) {
  const [tab, setTab] = useState('Scheda');
  const [period, setPeriod] = useState('1M');
  const [expanded, setExpanded] = useState(false);
  const [document, setDocument] = useState('');
  const previous = fund.nav / (1 + (fund.changePercent ?? 0) / 100);
  const download = setDocument;
  return (
    <>
      <PageTitle>Scheda di dettaglio</PageTitle>
      <Text style={s.heading}>{fund.name}</Text>
      <Rows
        rows={[
          {
            label: 'Ultimo NAV',
            value: (
              <Money cents={fund.nav * 100} decimals={4} hidden={hidden} />
            ),
          },
          {
            label: 'Variazione',
            value:
              fund.changePercent === undefined
                ? 'N.D.'
                : `${fund.changePercent.toLocaleString('it-IT')}%`,
          },
          { label: 'Classe', value: 'E' },
          { label: 'ISIN', value: fund.isin },
          { label: 'Livello di Rischio', value: '1 di 7' },
        ]}
      />
      <Text style={s.small}>
        Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)
      </Text>
      <Link label="prospetto kid" onPress={() => download('Prospetto KID')} />
      <Tabs
        items={[
          'Scheda',
          'Performance',
          'Composizione',
          'Commissioni',
          'Documenti',
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'Scheda' && (
        <>
          <Tabs
            items={['1M', '3M', 'YTD', '1A', '3A', '5A']}
            value={period}
            onChange={setPeriod}
          />
          <View style={s.indexChart}>
            <View style={s.indexBaseline}>
              <AssetGlyph asset={line} width={300} height={80} />
            </View>
            <AssetGlyph asset={graph} width={300} height={160} />
          </View>
          <Rows
            rows={[
              {
                label: 'Min.',
                value: (
                  <Money
                    cents={Math.min(previous, fund.nav) * 100}
                    decimals={4}
                    hidden={hidden}
                  />
                ),
              },
              {
                label: 'Max.',
                value: (
                  <Money
                    cents={Math.max(previous, fund.nav) * 100}
                    decimals={4}
                    hidden={hidden}
                  />
                ),
              },
            ]}
          />
          <Text style={s.heading}>Scheda fondo</Text>
          <Rows
            rows={[
              { label: 'Categoria assogestioni', value: fund.category },
              { label: 'Società prodotto', value: fund.manager },
              { label: 'Benchmark', value: '100% MSCI AC WORLD' },
              { label: 'Divisa', value: 'EUR' },
              {
                label: 'Importo min. sottoscriz. iniziale',
                value: <Money cents={10000} hidden={hidden} />,
              },
            ]}
          />
          <Text style={s.strong}>Rilevanza ESG</Text>
          <Text style={s.body}>
            Strumento rilevante ai fini delle preferenze di sostenibilità
          </Text>
          <Text style={s.heading}>Obiettivo & politica di investimento</Text>
          <Text style={s.strong}>Obiettivo</Text>
          <Text style={s.body}>
            L’obiettivo di questo Comparto è la rivalutazione del capitale nel
            medio-lungo termine.
          </Text>
          <Text style={s.strong}>Obiettivo temporale</Text>
          <Text style={s.body}>Medio-lungo termine</Text>
          <Text style={s.strong}>Filosofia di investimento</Text>
          <Text style={s.body}>
            Investendo in un portafoglio diversificato di strumenti finanziari
            consentiti. Il Comparto investirà prevalentemente, direttamente o
            indirettamente, attraverso DIC e OCVM di tipo aperto, in titoli
            azionari.
          </Text>
          <Text style={s.strong}>Filosofia ad accumulazione distribuzione</Text>
          <Text style={s.body}>Accumulo</Text>
        </>
      )}
      {tab === 'Performance' && (
        <>
          <Text style={s.heading}>Grafico performance</Text>
          <Rows
            rows={['1M', '3M', 'YTD', '1A', '3A', '5A'].map(label => ({
              label,
              value:
                label === '1A' && fund.annualPerformance !== undefined
                  ? `${fund.annualPerformance.toLocaleString('it-IT')} %`
                  : 'N.D.',
            }))}
          />
        </>
      )}
      {tab === 'Composizione' && (
        <>
          <Text style={s.heading}>Principali titoli in portafoglio</Text>
          <Text style={s.small}>Dati riferiti al: 25/05/2022</Text>
          <Rows
            rows={[
              ['JPM AMERICA EQUITY X ACC USD', 2.4],
              ['DEU AMERICA EQUITY X ACC USD', 3.7],
              ['ITA AMERICA EQUITY X ACC USD', 1.85],
              ['FR AMERICA EQUITY X ACC USD', 2.15],
              ['UFG AMERICA EQUITY X ACC USD', 0.95],
              ['PFG AMERICA EQUITY X ACC USD', 3.4],
              ['Altri strumenti', 85.55],
            ].map(([name, percentage]) => ({
              label: String(name),
              value: `${Number(percentage).toLocaleString('it-IT')} %`,
            }))}
          />
          <Link
            label="Scopri ripartizione"
            onPress={() => setExpanded(!expanded)}
          />
          {expanded && (
            <Rows
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
          <Text style={s.heading}>Commissioni</Text>
          <Rows
            rows={[
              {
                label: 'Spese correnti',
                value: `${(fundFees.ongoingAnnualRate * 100).toLocaleString(
                  'it-IT',
                )} %`,
              },
              {
                label: 'Sottoscrizione',
                value: `${(fundFees.subscriptionRate * 100).toLocaleString(
                  'it-IT',
                )} %`,
              },
              { label: 'Uscita', value: 'Non previsto' },
            ]}
          />
          <Text style={s.small}>
            Avvertenze: la fonte dei dati sopra riportati è il Prospetto. Per
            approfondimenti sulle commissioni, consulta i documenti obbligatori
            in fase di sottoscrizione.
          </Text>
        </>
      )}
      {tab === 'Documenti' && (
        <>
          <Text style={s.heading}>Documentazione fondo</Text>
          {[
            'Comunicazioni da consegnare',
            'Documentazione di offerta',
            'Prospetto KID',
          ].map(title => (
            <Link key={title} label={title} onPress={() => download(title)} />
          ))}
        </>
      )}
      <Text style={s.small}>
        Fonte: FIDA (finanza Dati Analisi){'\n'}Avvertenze: i dati sopra
        riportati sono indirizzati ad un pubblico indistinto.
      </Text>
      <InvestmentFooter>
        <Button label="Sottoscrivi" onPress={onSubscribe} />
      </InvestmentFooter>
      <FundDocument
        title={document}
        fund={fund}
        props={screenProps}
        onClose={() => setDocument('')}
      />
    </>
  );
}
