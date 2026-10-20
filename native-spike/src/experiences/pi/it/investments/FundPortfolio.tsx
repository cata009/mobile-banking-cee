import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import {
  allocateValues,
  formatInvestmentReferenceDate,
} from '@/features/investments/mobileFirstValuation';
import type { InvestmentFund } from '@/experiences/pi/it/mobile-first/investmentsFundsContent';
import down from '@/assets/mobile-first/it/investments/funds/661401-imgNavigationAndActionDownK10.svg';
import ordersIcon from '@/assets/mobile-first/it/investments/funds/661401-imgInvestmentsOrdersAndTransactions.svg';
import searchIcon from '@/assets/mobile-first/it/investments/funds/661401-imgNavigationAndActionSearchK10.svg';
import savingsIcon from '@/assets/mobile-first/it/investments/funds/661401-imgInvestmentsBankInsurance.svg';
import fundsIcon from '@/assets/mobile-first/it/investments/funds/661402-imgIconsInvestimentiGraficoPortafoglio.svg';
import bottomLine from '@/assets/mobile-first/it/investments/funds/661402-imgLineBottom.svg';
import topLine from '@/assets/mobile-first/it/investments/funds/661402-imgLineTop.svg';
import cardLine from '@/assets/mobile-first/it/investments/funds/661417-imgLine21.svg';
import { Button, tokens } from './Primitives';

function Amount({
  value,
  hidden,
  decimals = 2,
  size = 18,
  currencySize = 12,
  lineHeight = 22,
  currencyLineHeight = lineHeight,
}: {
  value: number;
  hidden: boolean;
  decimals?: number;
  size?: number;
  currencySize?: number;
  lineHeight?: number;
  currencyLineHeight?: number;
}) {
  const [integer, fraction] = value
    .toLocaleString('it-IT', {
      useGrouping: true,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    .split(',');
  return (
    <View style={styles.amountRow}>
      <Text style={[styles.amount, { fontSize: size, lineHeight }]}>
        {hidden ? '••••' : integer}
      </Text>
      {!hidden && (
        <Text
          style={[
            styles.currency,
            { fontSize: currencySize, lineHeight: currencyLineHeight },
          ]}
        >{`,${fraction} €`}</Text>
      )}
    </View>
  );
}

/** Source fund portfolio composition; valuation and percentage allocation stay canonical. */
export function FundPortfolio({
  positions,
  empty,
  hidden,
  initialPir = false,
  onOpen,
  onScrollTo,
}: {
  positions: readonly InvestmentFund[];
  empty: boolean;
  hidden: boolean;
  initialPir?: boolean;
  onOpen: (view: string, instrument?: string, action?: string) => void;
  onScrollTo?: (y: number) => void;
}) {
  const [pir, setPir] = useState(initialPir);
  const [depositWidth, setDepositWidth] = useState(358);
  const [sectionPositions, setSectionPositions] = useState<
    Record<string, number>
  >({});
  const [rootOffset, setRootOffset] = useState(0);
  const totals = positions.reduce(
    (sum, fund) => ({
      value: sum.value + Math.round(fund.value * 100),
      profit: sum.profit + Math.round(fund.profit * 100),
    }),
    { value: 0, profit: 0 },
  );
  const cost = totals.value - totals.profit;
  const allocation = allocateValues(
    Array.from(new Set(positions.map(fund => fund.type)), name => ({
      name,
      id: positions.find(fund => fund.type === name)!.id,
      valueCents: positions
        .filter(fund => fund.type === name)
        .reduce((sum, fund) => sum + Math.round(fund.value * 100), 0),
    })),
  );
  const depositAmountSize = Math.min(
    24,
    Math.max(18, (depositWidth - 32) * 0.07),
  );
  if (empty)
    return (
      <View style={styles.empty}>
        <Text style={styles.heading}>I tuoi fondi</Text>
        <Text style={styles.body}>
          Non hai ancora fondi nel tuo portafoglio.
        </Text>
        <Button label="Scopri i fondi" onPress={() => onOpen('catalog')} />
      </View>
    );
  return (
    <View
      style={styles.root}
      onLayout={event => setRootOffset(event.nativeEvent.layout.y)}
    >
      <View
        style={styles.deposit}
        onLayout={event => setDepositWidth(event.nativeEvent.layout.width)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Deposito"
          onPress={() => setPir(!pir)}
          style={styles.depositSelect}
        >
          <Text style={styles.owner}>Deposito</Text>
          <AssetGlyph asset={down} size={16} />
        </Pressable>
        <Text style={[styles.owner, styles.depositOwner]}>
          Andrea Rossini Bianchi{pir ? ' - PIR' : ''}
        </Text>
        <Text style={styles.caption}>
          {pir ? 'n. 00000017838164' : '17010 - 0000017838112'}
        </Text>
        <View style={styles.depositValues}>
          <View style={styles.column}>
            <Text numberOfLines={1} style={styles.depositLabel}>
              Controvalore di mercato
            </Text>
            <Amount
              value={totals.value / 100}
              hidden={hidden}
              size={depositAmountSize}
              currencySize={16}
              lineHeight={depositAmountSize * 1.08334}
              currencyLineHeight={18}
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.depositLabel}>P&L €/%</Text>
            <Amount
              value={totals.profit / 100}
              hidden={hidden}
              size={depositAmountSize}
              currencySize={16}
              lineHeight={depositAmountSize * 1.08334}
              currencyLineHeight={18}
            />
            <Text style={[styles.positive, styles.depositPercent]}>
              {cost
                ? ((totals.profit / cost) * 100).toFixed(2).replace('.', ',')
                : '0,00'}
              %
            </Text>
          </View>
        </View>
        <View style={styles.quickActions}>
          {[
            { label: 'Ordini', icon: ordersIcon, view: 'orders' },
            { label: 'Ricerca fondi', icon: searchIcon, view: 'search' },
            {
              label: pir ? 'Plafond PIR' : 'Risparmia e investi',
              icon: savingsIcon,
              view: pir ? 'pir' : 'savings-plan',
            },
          ].map(item => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => onOpen(item.view)}
              style={styles.quickAction}
            >
              <View style={styles.quickCircle}>
                <AssetGlyph asset={item.icon} size={24} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>I tuoi fondi</Text>
        {allocation.map((item, index) => (
          <Pressable
            key={item.name}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            onPress={() => {
              onScrollTo?.(
                Math.max(
                  0,
                  rootOffset + (sectionPositions[item.name] ?? 0) - 24,
                ),
              );
            }}
            style={styles.allocation}
          >
            <View style={styles.allocationTitle}>
              <AssetGlyph asset={fundsIcon} size={32} />
              <Text style={styles.allocationName}>{item.name}</Text>
            </View>
            <View style={styles.percentColumn}>
              <Text style={styles.percent}>{item.percent}%</Text>
            </View>
            <View style={styles.amountColumn}>
              <Amount value={item.valueCents / 100} hidden={hidden} />
            </View>
            {index > 0 && (
              <View pointerEvents="none" style={styles.topLine}>
                <AssetGlyph asset={topLine} width={361} height={1} />
              </View>
            )}
            <View pointerEvents="none" style={styles.bottomLine}>
              <AssetGlyph asset={bottomLine} width={361} height={1} />
            </View>
          </Pressable>
        ))}
      </View>
      {allocation.map(item => (
        <View
          key={item.name}
          nativeID={`native-fund-${item.name}`}
          onLayout={event =>
            setSectionPositions(previous =>
              previous[item.name] === event.nativeEvent.layout.y
                ? previous
                : { ...previous, [item.name]: event.nativeEvent.layout.y },
            )
          }
          style={styles.section}
        >
          <Text style={styles.subheading}>{item.name}</Text>
          <View style={styles.fundList}>
            {positions
              .filter(fund => fund.type === item.name && fund.shares > 0)
              .map(fund => (
                <Pressable
                  key={fund.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Apri ${fund.name}`}
                  testID={`fund-portfolio-card-${fund.id}`}
                  onPress={() => onOpen('fund', fund.id)}
                  style={styles.card}
                >
                  <Text style={styles.owner}>{fund.name}</Text>
                  <Text style={styles.caption}>{fund.manager}</Text>
                  <View style={styles.cardGrid}>
                    {[
                      [
                        { label: 'PMC', value: fund.pmc, decimals: 4 },
                        { label: 'NAV', value: fund.nav, decimals: 4 },
                      ],
                      [
                        {
                          label: 'Controvalore',
                          value: fund.value,
                          decimals: 2,
                        },
                        { label: 'P&L | %', value: fund.profit, decimals: 2 },
                      ],
                    ].map((row, index) => (
                      <View key={index} style={styles.cardRow}>
                        {row.map(field => (
                          <View key={field.label} style={styles.cardCell}>
                            <Text style={styles.cardLabel}>{field.label}</Text>
                            <Amount
                              value={field.value}
                              decimals={field.decimals}
                              hidden={hidden}
                              currencySize={14}
                            />
                            {field.label === 'P&L | %' && (
                              <Text style={styles.cardPercent}>
                                {fund.percent}
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                  <View style={styles.cardLine}>
                    <AssetGlyph asset={cardLine} width={329} height={0.5} />
                  </View>
                  <Text style={styles.caption}>
                    Valore NAV riferito al {formatInvestmentReferenceDate()}{' '}
                    (dati demo)
                  </Text>
                </Pressable>
              ))}
          </View>
        </View>
      ))}
    </View>
  );
}
const regular = { fontFamily: tokens.font, color: tokens.text };
const strong = { fontFamily: tokens.strongFont, color: tokens.text };
const styles = StyleSheet.create({
  depositOwner: { marginBottom: 4 },
  depositPercent: { marginTop: 2 },
  percentColumn: { width: 36 },
  amountColumn: { flex: 1, alignItems: 'flex-end' },
  amountRow: { flexDirection: 'row', alignItems: 'baseline' },
  root: { gap: 24 },
  section: { marginBottom: 16 },
  deposit: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginBottom: 16,
  },
  depositSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  owner: { ...strong, fontSize: 18, lineHeight: 24 },
  caption: { ...regular, color: '#666', fontSize: 14, lineHeight: 20 },
  depositValues: { flexDirection: 'row', gap: 16, marginVertical: 24 },
  column: { flex: 1, minWidth: 0, gap: 2 },
  depositLabel: { ...strong, fontSize: 16, lineHeight: 18 },
  positive: { ...strong, color: '#3d7d43', fontSize: 14, lineHeight: 16 },
  quickActions: { flexDirection: 'row', gap: 24 },
  quickAction: { width: 64, gap: 8, alignItems: 'center' },
  quickCircle: {
    width: 64,
    height: 64,
    borderRadius: 98,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    ...regular,
    color: '#666',
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
  },
  heading: { ...strong, fontSize: 28, lineHeight: 32, marginBottom: 24 },
  subheading: { ...strong, fontSize: 24, lineHeight: 28, marginBottom: 16 },
  amount: { ...strong },
  currency: { ...regular },
  allocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    minHeight: 64,
  },
  allocationTitle: {
    width: 156,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  allocationName: { ...regular, fontSize: 18, lineHeight: 20, flex: 1 },
  percent: { ...regular, width: 60, fontSize: 16, lineHeight: 22 },
  topLine: { position: 'absolute', top: 0, left: 0 },
  bottomLine: { position: 'absolute', bottom: 0, left: 0 },
  fundList: { gap: 4 },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    gap: 8,
    borderRadius: 16,
    minHeight: 256,
  },
  cardGrid: {
    flexDirection: 'column',
    gap: 16,
    marginVertical: 12,
  },
  cardRow: { flexDirection: 'row', gap: 16 },
  cardCell: { flex: 1, minWidth: 0, gap: 4 },
  cardLabel: { ...regular, color: '#666', fontSize: 14, lineHeight: 22 },
  cardPercent: { ...strong, color: '#3d7d43', fontSize: 14, lineHeight: 22 },
  cardLine: { position: 'absolute', left: 16, top: 139 },
  empty: { paddingVertical: 24, gap: 24 },
  body: { ...regular, fontSize: 16, lineHeight: 22 },
});
