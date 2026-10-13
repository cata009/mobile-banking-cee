import { PageTitle } from './PageLayout';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  fundAvailableShares,
  type FundsStoredState,
} from '@/features/investments/mobileFirstFundsState';
import {
  planStatusLabels,
  type InvestmentFund,
  fundActionFromRoute,
  fundActionLabels,
} from '@/features/investments/mobileFirstFunds';
import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation';
import { AssetGlyph, Button, Link, Money, Tabs, s, tokens } from './Primitives';
import forth from '@/assets/mobile-first/it/investments/funds/658839-imgNavigationAndActionForthT2.svg';
import { InvestmentFooter } from './PageLayout';
import FundDocument from './FundDocument';
import type { ItalyNativeScreenProps } from '../contracts';
export default function FundDetail({
  fund,
  state,
  hidden,
  view,
  onOpen,
  screenProps,
}: {
  fund: InvestmentFund;
  state: FundsStoredState;
  hidden: boolean;
  view: string;
  onOpen: (view: string, instrument?: string, action?: string) => void;
  screenProps: ItalyNativeScreenProps;
}) {
  const [tab, setTab] = useState('La tua posizione');
  const [operations, setOperations] = useState(false);
  const [document, setDocument] = useState('');
  const contract = state.contracts?.[fund.id] ?? state;
  const tabs = [
    'La tua posizione',
    'Dettaglio fondo',
    ...(fund.type === 'PAC'
      ? ['Piano di accumulo']
      : fund.type === 'Risparmia e investi'
      ? ['Risparmia e investi']
      : fund.type === 'Conto gestito'
      ? ['Conto gestito']
      : []),
    'Altri dettagli',
    'Lista ultimi ordini',
  ];
  const monetary = (value: number, decimals = 2) => (
    <Money
      cents={value * 100}
      hidden={hidden}
      decimals={decimals}
      compact
      currencySize={13.5}
      currencyStrong
    />
  );
  const rows =
    tab === 'La tua posizione'
      ? [
          { label: 'Tipo di contratto', value: fund.type },
          { label: 'PMC', value: monetary(fund.pmc, 4) },
          { label: 'Data quota', value: formatInvestmentReferenceDate() },
          { label: 'Ultimo NAV', value: monetary(fund.nav, 4) },
          {
            label: 'Quote',
            value: hidden
              ? '••••'
              : fund.shares.toLocaleString('it-IT', {
                  maximumFractionDigits: 6,
                }),
          },
          {
            label: 'Quote disponibili',
            value: hidden
              ? '••••'
              : fundAvailableShares(state, fund.id).toLocaleString('it-IT', {
                  maximumFractionDigits: 6,
                }),
          },
          { label: 'Categoria assogestioni', value: fund.category },
          { label: 'Controvalore', value: monetary(fund.value) },
          { label: 'P&L €', value: monetary(fund.profit) },
          { label: 'P&L %', value: fund.percent },
          {
            label: 'Codice titolarità',
            value: hidden ? '••••' : 'US037833100563524563145YER9241AS731',
          },
        ]
      : tab === 'Dettaglio fondo'
      ? [
          { label: 'Società prodotto', value: fund.manager },
          { label: 'Categoria', value: 'Fondo' },
          { label: 'Fondo', value: fund.type },
          { label: 'ISIN', value: fund.isin },
          { label: 'Classe', value: 'C' },
          { label: 'Posizione numero', value: hidden ? '••••' : '24' },
          {
            label: 'Conto di regolamento',
            value: hidden ? '••••' : 'AU532U97',
          },
        ]
      : tab === 'Piano di accumulo'
      ? [
          {
            label: 'Stato PAC',
            value: planStatusLabels[contract.pacStatus],
          },
          { label: 'Importo rata', value: monetary(contract.pac.amount) },
          { label: 'Periodicità', value: 'Mensile' },
          {
            label: 'Totale numero rate',
            value: String(contract.pac.installments),
          },
          {
            label: 'Giorno addebito rata',
            value: String(contract.pac.day),
          },
        ]
      : tab === 'Risparmia e investi'
      ? [
          {
            label: 'Giacenza media',
            value: monetary(contract.savings.average),
          },
          { label: 'Ultimo investimento', value: '-' },
          { label: 'Conto', value: hidden ? '••••' : '5326 - 600036167' },
          { label: 'Costi amministrativi annui', value: monetary(9) },
          {
            label: 'Soglia di investimento',
            value: monetary(contract.savings.upper),
          },
          {
            label: 'Soglia di disinvestimento',
            value: monetary(contract.savings.lower),
          },
          {
            label: 'Ultimo disinvestimento',
            value: '-',
          },
          {
            label: 'Stato del servizio',
            value: planStatusLabels[contract.savingsStatus],
          },
        ]
      : tab === 'Conto gestito'
      ? [
          {
            label: 'Conto',
            value: hidden ? '••••' : '5326 - 600036167',
          },
          { label: 'Giacenza media', value: monetary(4000) },
          { label: 'Modalità regolamento', value: '-' },
          { label: 'Giacenza massima', value: monetary(10000) },
          { label: 'Giacenza minima', value: monetary(5000) },
          { label: 'Ultimo disinvestimento', value: '11/03/2022' },
          { label: 'Canone annuale', value: monetary(700) },
        ]
      : tab === 'Altri dettagli'
      ? [
          { label: 'Divisa', value: 'EUR' },
          {
            label: 'Data quota',
            value: formatInvestmentReferenceDate(),
          },
          {
            label: 'Stato posizione',
            value:
              planStatusLabels[
                fund.type === 'Risparmia e investi'
                  ? contract.savingsStatus
                  : contract.pacStatus
              ],
          },
          { label: 'Data inserimento', value: '11/04/2024' },
          { label: 'Data ultima variazione', value: '13/12/2024' },
          { label: 'Tipo certificato', value: 'Cumulativo' },
          { label: 'Modalità di adesione', value: 'Online' },
          { label: 'Rendimento su base annua', value: 'N.D.' },
        ]
      : [];
  return (
    <>
      <PageTitle>
        {view === 'sheet'
          ? 'Scheda di dettaglio'
          : view === 'savings-plan'
          ? 'Risparmia e investi'
          : 'Posizione del tuo fondo'}
      </PageTitle>
      <View>
        <Text style={s.heading}>{fund.name}</Text>
        <View style={styles.titleLinks}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="scheda fondo"
            onPress={() => onOpen('sheet', fund.id)}
            style={styles.titleLink}
          >
            <Text style={styles.titleLinkText}>scheda fondo</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="kid"
            onPress={() => setDocument('Key information document (KID)')}
            style={styles.titleLink}
          >
            <Text style={styles.titleLinkText}>kid</Text>
          </Pressable>
        </View>
      </View>
      <Tabs variant="funds" items={tabs} value={tab} onChange={setTab} />
      <Text style={styles.sectionHeading}>{tab}</Text>
      {tab === 'La tua posizione' && (
        <Text style={s.small}>
          Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)
        </Text>
      )}
      <View style={styles.dataGrid}>
        {Array.from({ length: Math.ceil(rows.length / 2) }, (_, index) => (
          <View key={index} style={styles.dataPair}>
            {rows.slice(index * 2, index * 2 + 2).map(row => (
              <View
                key={row.label}
                testID={`fund-data-${row.label}`}
                style={styles.dataCell}
              >
                <Text style={styles.dataLabel}>{row.label}</Text>
                {typeof row.value === 'string' ||
                typeof row.value === 'number' ? (
                  <Text style={styles.dataValue}>{row.value}</Text>
                ) : (
                  row.value
                )}
              </View>
            ))}
            {index * 2 + 1 >= rows.length && <View style={styles.emptyCell} />}
          </View>
        ))}
      </View>
      {tab === 'Lista ultimi ordini' &&
        state.orders
          .filter(item => item.fund === fund.id || item.fund === fund.name)
          .map(item => (
            <View key={item.id} style={s.card}>
              <Text style={s.strong}>{item.action}</Text>
              <Money cents={Math.round(item.amount * 100)} hidden={hidden} />
              <Link
                label={`Ordine ${item.id}`}
                onPress={() => onOpen('order', item.id)}
              />
            </View>
          ))}
      {operations && (
        <View testID="fund-operation-menu" style={styles.operationMenu}>
          <Text style={styles.sectionHeading}>Operazioni</Text>
          {[
            'subscribe',
            'redeem',
            'add',
            'switch',
            ...(fund.type === 'PAC'
              ? [
                  'advance',
                  'modify',
                  contract.pacStatus === 'suspended' ? 'reactivate' : 'suspend',
                  'revoke',
                ]
              : fund.type === 'Risparmia e investi'
              ? contract.savingsStatus === 'active'
                ? ['modify', 'suspend', 'revoke']
                : contract.savingsStatus === 'suspended'
                ? ['reactivate', 'revoke']
                : ['activate']
              : []),
          ].map(action => (
            <Pressable
              key={action}
              accessibilityRole="button"
              accessibilityLabel={
                fundActionLabels[fundActionFromRoute(action)] +
                (fund.type === 'PAC' &&
                ['modify', 'suspend', 'reactivate', 'revoke'].includes(action)
                  ? ' PAC'
                  : '')
              }
              onPress={() => onOpen('operation', fund.id, action)}
              style={styles.operationRow}
            >
              <Text style={styles.operationText}>
                {fundActionLabels[fundActionFromRoute(action)] +
                  (fund.type === 'PAC' &&
                  ['modify', 'suspend', 'reactivate', 'revoke'].includes(action)
                    ? ' PAC'
                    : '')}
              </Text>
              <AssetGlyph asset={forth} width={16} height={16} />
            </Pressable>
          ))}
        </View>
      )}
      <InvestmentFooter>
        <Button label="Operazioni" onPress={() => setOperations(!operations)} />
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
const styles = StyleSheet.create({
  titleLinks: { marginTop: 12, gap: 8, alignItems: 'flex-start' },
  titleLink: { paddingVertical: 8 },
  titleLinkText: {
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 28,
    color: '#007a91',
  },
  sectionHeading: {
    fontFamily: tokens.font,
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 28,
    color: '#262626',
    marginBottom: 16,
  },
  dataGrid: { gap: 8 },
  dataPair: { flexDirection: 'row', gap: 16 },
  emptyCell: { flex: 1, minWidth: 0, paddingHorizontal: 12 },
  dataCell: {
    flex: 1,
    minWidth: 0,
    minHeight: 72,
    padding: 12,
    borderRadius: 16,
    gap: 8,
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
  },
  dataLabel: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 20,
    color: '#262626',
  },
  dataValue: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 20,
    color: '#262626',
  },
  operationMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    padding: 16,
  },
  operationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  operationText: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: '#262626',
    flexShrink: 1,
  },
});
