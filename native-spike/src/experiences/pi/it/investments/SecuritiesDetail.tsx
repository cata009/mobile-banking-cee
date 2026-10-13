import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import type { Security } from '@/features/investments/mobileFirstSecurities';
import { AssetGlyph, Money, Rows, Tabs, s } from './Primitives';
import graph from '@/assets/mobile-first/it/investments/securities/valuationGraph.svg';
import target from '@/assets/mobile-first/it/investments/securities/valuationTarget.svg';
import dotted from '@/assets/mobile-first/it/investments/securities/valuationDotted.svg';
import arrow from '@/assets/mobile-first/it/investments/securities/valuationArrow.svg';
import best from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionBest1.svg';
export function SecuritiesValuations({
  security,
  hidden,
}: {
  security: Security;
  hidden: boolean;
}) {
  const [year, setYear] = useState('2024');
  return (
    <>
      <Text style={[s.heading, styles.sectionHeading]}>
        Valutazioni degli analisti
      </Text>
      <View style={styles.opinions}>
        <Text style={s.strong}>Giudizi</Text>
        {[
          '51,06% Overweight',
          '36,17% Buy',
          '8,51% Sell',
          '2,13% Hold',
          '2,13% Underweight',
        ].map((label, i) => (
          <View style={styles.opinion} key={label}>
            <Text style={styles.opinionLabel}>{label}</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.meter,
                  { width: `${[51.06, 36.17, 8.51, 2.13, 2.13][i]}%` },
                ]}
              />
            </View>
          </View>
        ))}
        <Text style={s.small}>Sulla base di 47 valutazioni degli analisti</Text>
      </View>
      <Text style={[s.heading, styles.sectionHeading]}>
        Stima target price 1 anno
      </Text>
      <Text style={s.small}>Stimato al: 10/01/2025</Text>
      <View style={styles.targetChart}>
        <View style={styles.graph}>
          <AssetGlyph asset={graph} width={281.498} height={49.5001} />
        </View>
        <View style={styles.target}>
          <AssetGlyph asset={target} width={14} height={14} />
        </View>
        <View style={styles.dotted}>
          <AssetGlyph asset={dotted} width={276} height={44} />
        </View>
        <View style={styles.targetLabel}>
          <Text style={s.small}>Target</Text>
          <View style={styles.targetValue}>
            <AssetGlyph asset={arrow} />
            <Text style={s.small}>N.D.</Text>
          </View>
        </View>
        <View style={styles.current}>
          <Text style={s.small}>Attuale</Text>
          <Money
            cents={security.price * 100}
            hidden={hidden}
            decimals={security.price < 1 ? 4 : 2}
          />
        </View>
      </View>
      <Tabs
        variant="securities"
        items={['2024', '2025', '2026']}
        value={year}
        onChange={setYear}
      />
      <Text style={[s.heading, styles.sectionHeading]}>
        Indicatori di prezzo
      </Text>
      <Rows
        rows={[
          { label: 'Price/Earnings Ratio', value: 'N.D.' },
          { label: 'Price/Cash Flow Ratio', value: 'N.D.' },
        ]}
      />
      <Text style={[s.heading, styles.sectionHeading]}>Indicatori azioni</Text>
      <Rows
        rows={[
          { label: 'Earnings per Share Growth', value: '5,85%' },
          { label: 'Earning per Share', value: 'N.D.' },
          { label: 'Earnings before Interest, Taxes', value: 'N.D.' },
          { label: 'Earnings before Interest and Taxes', value: 'N.D.' },
          { label: 'Cash Flow per Share', value: '6,88' },
        ]}
      />
      <Text style={[s.heading, styles.sectionHeading]}>
        Indicatori di bilancio
      </Text>
      <Rows
        rows={[
          { label: 'Net Sales (in Millions)', value: '3 M' },
          { label: 'Net Debt (in Millions)', value: '1 M' },
          { label: 'Net Assets per Share', value: '10,90' },
        ]}
      />
      <Text style={[s.heading, styles.sectionHeading]}>Dividendi</Text>
      <Rows
        rows={[
          {
            label: 'Dividend Yield',
            value: `${((security.dividend / security.price) * 100).toFixed(
              2,
            )}%`,
          },
          {
            label: 'Dividendo',
            value: <Money cents={security.dividend * 100} hidden={hidden} />,
          },
        ]}
      />
    </>
  );
}
export function SecuritiesDetails({
  security,
  hidden,
  statistics = false,
}: {
  security: Security;
  hidden: boolean;
  statistics?: boolean;
}) {
  const money = (value: number, decimals = 2) => (
    <Money cents={value * 100} hidden={hidden} decimals={decimals} />
  );
  if (statistics)
    return (
      <>
        <Text style={[s.heading, styles.sectionHeading]}>
          Quotazione di riferimento
        </Text>
        <Rows
          rows={[
            {
              label: 'Prezzo chiusura',
              value: money(security.price / (1 + security.change / 100)),
            },
            {
              label: 'Prezzo tel-quel',
              value: money(security.price, security.price < 1 ? 4 : 2),
            },
            {
              label: 'Prezzo teorico',
              value: money(security.price, security.price < 1 ? 4 : 2),
            },
          ]}
        />
        <Text style={[s.heading, styles.sectionHeading]}>Rendimenti</Text>
        <Rows
          rows={[
            { label: 'Tasso di rend. eff. a scadenza (lordo)', value: 'N.D.' },
            { label: 'Tasso di rend. eff. a scadenza (netto)', value: 'N.D.' },
            {
              label: 'Tasso di rend. immediato (lordo)',
              value: security.coupon
                ? `${((security.coupon / security.price) * 100).toFixed(2)}%`
                : 'N.D.',
            },
            { label: 'Tasso di rend. immediato (netto)', value: 'N.D.' },
          ]}
        />
        <Text style={[s.heading, styles.sectionHeading]}>Cedola</Text>
        <Rows
          rows={[
            { label: 'Rateo lordo', value: 'N.D.' },
            { label: 'Rateo netto', value: 'N.D.' },
            {
              label: 'Cedola certa',
              value:
                security.coupon === undefined ? 'N.D.' : `${security.coupon}%`,
            },
            {
              label: 'Cedola tendenziale',
              value:
                security.coupon === undefined ? 'N.D.' : `${security.coupon}%`,
            },
          ]}
        />
        <Text style={[s.heading, styles.sectionHeading]}>Duration</Text>
        <Rows
          rows={[
            { label: 'Duration MAC', value: '105,63' },
            { label: 'Dur. Mod.', value: '98,12%' },
            { label: 'Vita residua', value: '34,81' },
          ]}
        />
      </>
    );
  return (
    <>
      <Text style={[s.heading, styles.sectionHeading]}>Descrizione</Text>
      <Text style={s.body}>{security.name}</Text>
      <Text style={[s.heading, styles.sectionHeading]}>Dettagli</Text>
      <Rows
        rows={[
          { label: 'Mercato', value: security.market },
          { label: 'ISIN', value: security.isin },
          { label: 'Tipologia', value: security.kind },
        ]}
      />
      {security.kind === 'Obbligazioni' ? (
        <>
          <Text style={[s.heading, styles.sectionHeading]}>
            Caratteristiche
          </Text>
          <Rows
            rows={[
              { label: 'Prezzo di emissione', value: 'N.D.' },
              { label: 'Prezzo rimborso', value: 'N.D.' },
              { label: 'Ritenuta fiscale', value: 'N.D.' },
              {
                label: 'Tasso',
                value:
                  security.coupon === undefined
                    ? 'N.D.'
                    : `${security.coupon}%`,
              },
              {
                label: 'Coupon',
                value:
                  security.coupon === undefined
                    ? 'N.D.'
                    : `${security.coupon}%`,
              },
              { label: 'Data scadenza', value: security.maturity },
            ]}
          />
        </>
      ) : ['ETC - ETN', 'Certificati e CW'].includes(security.kind) ? (
        <>
          <Text style={[s.heading, styles.sectionHeading]}>
            Tipo certificato
          </Text>
          <Text style={s.body}>Fondo di Venture Capital</Text>
          <Text style={[s.heading, styles.sectionHeading]}>
            Caratteristiche
          </Text>
          <Rows
            rows={[
              { label: 'Strike price', value: money(245.9) },
              { label: 'Lotto minimo', value: '3' },
              {
                label: 'Data scadenza',
                value: security.maturity ?? '25/04/2026',
              },
              { label: 'Rapporto', value: '2,16' },
            ]}
          />
        </>
      ) : null}
    </>
  );
}
export function SecuritiesCompany({ security }: { security: Security }) {
  return (
    <>
      <Text style={[s.heading, styles.sectionHeading]}>Profilo societario</Text>
      <Text style={[s.heading, styles.sectionHeading]}>Descrizione</Text>
      <Text style={s.body}>
        {security.id === 'apple'
          ? 'Apple Inc. è un’azienda multinazionale statunitense che produce sistemi operativi, smartphone, computer e dispositivi multimediali, con sede a Cupertino, in California. È considerata una delle società tecnologiche Big Tech, assieme ad Amazon, Google, Microsoft.'
          : `${security.name}: strumento quotato sul mercato ${security.market}.`}
      </Text>
      <Text style={[s.heading, styles.sectionHeading]}>Dettagli</Text>
      <Rows
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
          <Text style={[s.heading, styles.sectionHeading]}>
            Cariche sociali
          </Text>
          <Rows
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
            ].map(name => ({
              label: 'Membro del Executive Committee',
              value: name,
            }))}
          />
        </>
      )}
    </>
  );
}
export function SecuritiesOverview({
  security,
  hidden,
}: {
  security: Security;
  hidden: boolean;
}) {
  return (
    <>
      <Text style={[s.heading, styles.sectionHeading]}>Quotazione</Text>
      <Rows
        rows={[
          { label: 'Prezzo apertura', value: 'N.D.' },
          {
            label: 'Prezzo chiusura',
            value: (
              <Money
                cents={(security.price / (1 + security.change / 100)) * 100}
                hidden={hidden}
              />
            ),
          },
          {
            label: 'Prezzo denaro',
            value: (
              <Money
                cents={
                  Math.max(security.price / 2, security.price - 0.05) * 100
                }
                hidden={hidden}
              />
            ),
          },
          {
            label: 'Prezzo lettera',
            value: (
              <Money
                cents={security.price * 100}
                decimals={security.price < 1 ? 4 : 2}
                hidden={hidden}
              />
            ),
          },
          { label: 'Divisa', value: 'EUR' },
          { label: 'Fase di mercato', value: 'CONT' },
          { label: 'Volumi', value: '57.627,541' },
          { label: 'Controvalore di mercato', value: 'N.D.' },
          { label: 'ISIN', value: security.isin },
        ]}
      />
      <Text style={[s.heading, styles.sectionHeading]}>Dati titolo</Text>
      <Rows
        rows={[
          { label: 'Simbolo', value: security.symbol },
          { label: 'Tipologia titolo', value: security.kind },
          {
            label: security.kind === 'Obbligazioni' ? 'Scadenza' : 'Settore',
            value: security.maturity ?? 'Tecnologia',
          },
          { label: 'Capitalizzazione di mercato', value: 'N.D.' },
        ]}
      />
      {security.esg && (
        <View style={s.notice}>
          <Text style={s.strong}>Rilevanza ESG</Text>
          <Text style={s.body}>
            Strumenti attenti a tematiche ambientali e sociali.
          </Text>
        </View>
      )}
      <Text style={[s.heading, styles.sectionHeading]}>
        {security.kind === 'Obbligazioni' ? 'Cedole' : 'Dividendi'}
      </Text>
      <Rows
        rows={[
          {
            label: 'Ultimo dividendo',
            value: <Money cents={security.dividend * 100} hidden={hidden} />,
          },
          { label: 'Data pagamento', value: '12/12/2024' },
          {
            label: 'Dividend Yield',
            value: `${((security.dividend / security.price) * 100).toFixed(
              2,
            )}%`,
          },
        ]}
      />
      <Text style={[s.heading, styles.sectionHeading]}>
        Performance storiche
      </Text>
      <View style={styles.history}>
        {['1 Settimana', '1 Mese', '3 Mesi', '6 Mesi', '1 Anno', '3 Anni'].map(
          period => (
            <View key={period} style={styles.historyItem}>
              <Text style={s.strong}>{period}</Text>
              <Text style={security.performance < 0 ? s.negative : s.positive}>
                {period === '1 Anno'
                  ? `${security.performance > 0 ? '+' : ''}${
                      security.performance
                    }%`
                  : 'N.D.'}
              </Text>
              <Text style={s.small}>Min. / Max.</Text>
              <Text style={s.body}>N.D.</Text>
            </View>
          ),
        )}
      </View>
    </>
  );
}
export function SecuritiesBook({
  security,
  hidden,
}: {
  security: Security;
  hidden: boolean;
}) {
  const [market, setMarket] = useState('');
  return (
    <>
      <Text style={[s.heading, styles.sectionHeading]}>Book 5 livelli</Text>
      <View style={styles.book}>
        <View style={styles.bookRow}>
          {[
            'Qtà. denaro',
            'Prezzo denaro',
            'Prezzo lettera',
            'Qtà. lettera',
          ].map(label => (
            <Text key={label} style={styles.bookHeading}>
              {label}
            </Text>
          ))}
        </View>
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={styles.bookRow}>
            <Text style={styles.bookCell}>{100 + i * 25}</Text>
            <View style={styles.bookCell}>
              <Money
                cents={
                  Math.max(
                    security.price / 2,
                    security.price - (i + 1) * 0.05,
                  ) * 100
                }
                hidden={hidden}
              />
            </View>
            <View style={styles.bookCell}>
              <Money
                cents={(security.price + i * 0.05) * 100}
                hidden={hidden}
              />
            </View>
            <Text style={styles.bookCell}>{120 + i * 50}</Text>
          </View>
        ))}
      </View>
      <Text style={[s.heading, styles.sectionHeading]}>Altre borse</Text>
      {['NASDAQ', 'Euronext Milano', 'XETRA'].map(value => (
        <Pressable
          key={value}
          style={styles.bookRow}
          accessibilityRole="button"
          accessibilityLabel={value}
          accessibilityState={{ selected: market === value }}
          onPress={() => setMarket(value)}
        >
          <Text style={s.body}>{value}</Text>
          <Money
            cents={security.price * 100}
            decimals={security.price < 1 ? 4 : 2}
            hidden={hidden}
          />
          <View accessibilityLabel="Mercato di probabile esecuzione">
            <AssetGlyph asset={best} />
          </View>
        </Pressable>
      ))}
    </>
  );
}
const styles = StyleSheet.create({
  sectionHeading: { fontSize: 28, lineHeight: 32, marginTop: 16 },
  history: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  historyItem: {
    width: '47%',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  opinions: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  opinion: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  opinionLabel: {
    width: 140,
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    overflow: 'hidden',
  },
  meter: { height: 8, borderRadius: 4, backgroundColor: '#007a91' },
  targetChart: {
    position: 'relative',
    height: 113,
    width: 361,
    maxWidth: '100%',
    overflow: 'hidden',
  },
  graph: { position: 'absolute', left: 18, top: 10 },
  target: { position: 'absolute', left: 2, top: 52 },
  dotted: { position: 'absolute', left: 19, top: 15 },
  targetLabel: { position: 'absolute', left: 306, top: 0, gap: 4 },
  targetValue: { flexDirection: 'row', gap: 2, alignItems: 'center' },
  current: { position: 'absolute', left: 0, bottom: 0 },
  book: { gap: 8 },
  bookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bookHeading: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 20,
  },
  bookCell: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 20,
  },
});
