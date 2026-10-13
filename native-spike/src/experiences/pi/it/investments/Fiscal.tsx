import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  getFiscalSummary,
  fiscalRecordProfitCents,
} from '@/features/investments/mobileFirstInvestmentServices';
import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import { ServiceLink as Link, Money, Rows, Tabs, s } from './Primitives';

const months = [
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
];
const disclaimer =
  'Questo prospetto non sostituisce né integra il rendiconto periodico a cui deve essere fatto riferimento per la valutazione del patrimonio gestito e per i risultati di gestione. Per completezza di informazione e per una corretta interpretazione dei dati, ricordiamo che il valore del patrimonio è stato elaborato in base agli ultimi dati di mercato disponibili.';

export default function Fiscal({
  destination,
  hidden,
  registerBack,
  embedded,
  onDetailChange,
}: {
  destination: InvestmentDestination;
  hidden: boolean;
  registerBack: (handler: null | (() => boolean)) => void;
  embedded?: boolean;
  onDetailChange?: (detail: boolean) => void;
}) {
  const [year, setYear] = useState(destination.instrument ?? '');
  useEffect(() => {
    onDetailChange?.(!!year);
    return () => onDetailChange?.(false);
  }, [year, onDetailChange]);
  const [month, setMonth] = useState('Ottobre');
  const [tab, setTab] = useState('Minus/Plusvalenze');
  useEffect(() => {
    registerBack(() => {
      if (!year) return false;
      setYear('');
      return true;
    });
    return () => registerBack(null);
  }, [year, registerBack]);
  const availableMonths =
    destination.action === 'sparse-months'
      ? ['Maggio', 'Luglio', 'Ottobre']
      : months.slice(4);
  const data = ['2026', '2025', '2024'].map(value => ({
    year: value,
    ...getFiscalSummary(value),
  }));
  const all = getFiscalSummary();
  const selected = getFiscalSummary(year, months.indexOf(month) + 1);
  const summary = (minus: number, plus: number) => (
    <View style={styles.summary}>
      {[
        { label: 'Minus', value: minus },
        { label: 'Plus', value: plus },
        { label: 'Imponibile', value: 0 },
        { label: 'Ritenuta fiscale', value: 0 },
      ].map(item => (
        <View key={item.label} style={styles.summaryItem}>
          <Text style={s.dataLabel}>{item.label}</Text>
          <Money cents={item.value} hidden={hidden} />
        </View>
      ))}
    </View>
  );
  return (
    <>
      <PageTitle style={embedded && !year ? s.heading : s.pageTitle}>
        {year || 'Posizione fiscale'}
      </PageTitle>
      {['empty', 'no-position'].includes(destination.action ?? '') ? (
        <View style={styles.empty}>
          <Text style={s.heading}>Posizione fiscale non rilevata</Text>
          <Text style={s.body}>
            Non è stato possibile rilevare la posizione fiscale poiché non hai
            effettuato operazioni negli ultimi 5 anni.
          </Text>
        </View>
      ) : !year ? (
        <>
          <View style={s.card}>
            <Text style={s.strong}>Andrea Rossini Bianchi</Text>
            <Rows
              rows={[
                {
                  label: 'Minus accantonata',
                  value: <Money cents={all.accumulatedCents} hidden={hidden} />,
                },
                {
                  label: 'Ultima elaborazione',
                  value: all.latestDate
                    ? formatInvestmentReferenceDate(all.latestDate)
                    : 'N.D.',
                },
              ]}
            />
          </View>
          {destination.action !== 'no-chart' && (
            <View
              accessibilityLabel="Minus accantonate per anno"
              style={styles.chart}
            >
              {['2022', '2023', '2024', '2025', '2026'].map(value => {
                const amount = getFiscalSummary(value).minusCents;
                const height = Math.max(
                  1,
                  (amount / Math.max(1, ...data.map(item => item.minusCents))) *
                    98,
                );
                return (
                  <View key={value} style={styles.column}>
                    <Text style={styles.barAmount}>
                      {hidden
                        ? '••••'
                        : new Intl.NumberFormat('it-IT', {
                            minimumFractionDigits: 2,
                          }).format(amount / 100) + '€'}
                    </Text>
                    <View style={[styles.bar, { height }]} />
                    <Text style={styles.year}>{value}</Text>
                  </View>
                );
              })}
            </View>
          )}
          {data.map(item => (
            <View key={item.year} style={s.section}>
              <Text style={s.heading}>{item.year}</Text>
              {summary(item.minusCents, item.plusCents)}
              <Link
                label={`dettaglio ${item.year}`}
                onPress={() => setYear(item.year)}
              />
            </View>
          ))}
        </>
      ) : (
        <>
          <Tabs items={availableMonths} value={month} onChange={setMonth} />
          {summary(selected.minusCents, selected.plusCents)}
          <Tabs
            items={['Minus/Plusvalenze', 'Prezzi']}
            value={tab}
            onChange={setTab}
          />
          {!selected.records.length ? (
            <Text style={[s.body, styles.empty]}>
              Nessuna operazione nel periodo selezionato
            </Text>
          ) : (
            selected.records.map(record => (
              <View key={record.id} style={s.card}>
                <Text style={s.heading}>{record.name}</Text>
                <Rows
                  rows={
                    tab === 'Prezzi'
                      ? [
                          {
                            label: 'Data valuta',
                            value: record.date.split('-').reverse().join('/'),
                          },
                          {
                            label: 'Qtà./Val. nominale',
                            value: String(record.quantity),
                          },
                          {
                            label: 'Prezzo medio',
                            value: (
                              <Money
                                cents={record.costPrice * 100}
                                hidden={hidden}
                              />
                            ),
                          },
                          {
                            label: 'Prezzo operazione',
                            value: (
                              <Money
                                cents={record.executionPrice * 100}
                                hidden={hidden}
                              />
                            ),
                          },
                        ]
                      : [
                          {
                            label: 'Data',
                            value: record.date.split('-').reverse().join('/'),
                          },
                          {
                            label: '% Cointestata',
                            value: `${record.ownershipPercent}%`,
                          },
                          {
                            label: 'Minus utilizzata',
                            value: (
                              <Money
                                cents={record.usedLossCents}
                                hidden={hidden}
                              />
                            ),
                          },
                          {
                            label: 'Minus/plus proquota',
                            value: (
                              <Money
                                cents={fiscalRecordProfitCents(record)}
                                hidden={hidden}
                              />
                            ),
                          },
                          {
                            label: 'Imponibile',
                            value: (
                              <Money
                                cents={record.taxableCents}
                                hidden={hidden}
                              />
                            ),
                          },
                          {
                            label: 'Ritenuta',
                            value: (
                              <Money
                                cents={record.withholdingCents}
                                hidden={hidden}
                              />
                            ),
                          },
                        ]
                  }
                />
              </View>
            ))
          )}
          <Text style={s.small}>{disclaimer}</Text>
        </>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  empty: { paddingVertical: 32, gap: 16 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    height: 245,
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 24,
    marginVertical: 24,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  column: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    flex: 1,
    minWidth: 0,
    height: '100%',
  },
  bar: { width: 16, backgroundColor: '#007f96' },
  barAmount: {
    fontFamily: 'UniCredit-regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#262626',
  },
  year: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 12,
    width: '100%',
    textAlign: 'center',
  },
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, rowGap: 24 },
  summaryItem: { width: '47%', gap: 8 },
});
