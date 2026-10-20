import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { getSecurityPositions } from '@/features/investments/mobileFirstValuation';
import { securitiesDeposits } from '@/experiences/pi/it/mobile-first/investmentsSecuritiesContent';
import orders from '@/assets/mobile-first/it/investments/securities/imgInvestmentsOrdersAndTransactionsK10.svg';
import search from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionSearchK10.svg';
import markets from '@/assets/mobile-first/it/investments/securities/imgInvestmentsIndexK10.svg';
import assembly from '@/assets/mobile-first/it/investments/securities/imgMiscellaneousNewsK10.svg';
import { tokens } from './Primitives';

function DepositAmount({ cents, hidden }: { cents: number; hidden: boolean }) {
  const [integer, fraction] = (cents / 100)
    .toLocaleString('it-IT', {
      useGrouping: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .split(',');
  return (
    <View style={styles.amount}>
      <Text style={styles.amountInteger}>{hidden ? '••••' : integer}</Text>
      {!hidden && <Text style={styles.amountCurrency}>{`,${fraction} €`}</Text>}
    </View>
  );
}

export function SecuritiesDeposit({
  positions,
  depositId,
  onChooserOpen,
  hidden,
  onOpen,
}: {
  positions: ReturnType<typeof getSecurityPositions>;
  depositId: string;
  onChooserOpen: () => void;
  hidden: boolean;
  onOpen: (view: string) => void;
}) {
  const deposit = securitiesDeposits.find(item => item.id === depositId)!;
  const market = positions.reduce((sum, item) => sum + item.valueCents, 0);
  const costKnown = positions
    .filter(item => item.quantity > 0)
    .every(item => item.costCents !== undefined);
  const cost = costKnown
    ? positions.reduce((sum, item) => sum + (item.costCents ?? 0), 0)
    : undefined;
  const profit = cost === undefined ? undefined : market - cost;
  return (
    <>
      <View testID="securities-deposit-card" style={styles.card}>
        <View style={styles.grid}>
          <View style={styles.identityColumn}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Deposito"
              onPress={onChooserOpen}
            >
              <Text style={styles.label}>Deposito⌄</Text>
            </Pressable>
            <Text style={styles.owner}>{deposit.owner}</Text>
            <Text numberOfLines={1} style={styles.number}>
              {deposit.label}
            </Text>
          </View>
          <View style={styles.identityColumn}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sottodeposito"
              onPress={onChooserOpen}
            >
              <Text style={styles.label}>Sottodeposito⌄</Text>
            </Pressable>
            <Text style={styles.owner}>{deposit.owner}</Text>
          </View>
        </View>
        <View style={styles.grid}>
          <View style={styles.metric}>
            <Text numberOfLines={1} style={styles.metricLabel}>
              Controvalore di mercato
            </Text>
            <DepositAmount cents={market} hidden={hidden} />
            <Text style={styles.accrual}>Ratei lordi N.D.</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>P&L €/%</Text>
            <View style={styles.profit}>
              {profit === undefined ? (
                <Text style={styles.profitUnavailable}>N.D.</Text>
              ) : (
                <DepositAmount cents={profit} hidden={hidden} />
              )}
              <Text style={styles.positive}>
                {cost && profit !== undefined
                  ? `${((profit / cost) * 100).toFixed(2).replace('.', ',')}%`
                  : 'N.D.'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.quick}>
          {[
            { label: 'Ordini e movimenti', icon: orders, view: 'orders' },
            { label: 'Ricerca titoli', icon: search, view: 'search' },
            { label: 'Vetrina mercati', icon: markets, view: 'markets' },
            {
              label: 'Biglietti assembleari',
              icon: assembly,
              view: 'assembly',
            },
          ].map(item => (
            <Pressable
              key={item.view}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => onOpen(item.view)}
              style={styles.action}
            >
              <View style={styles.circle}>
                <AssetGlyph asset={item.icon} size={24} />
              </View>
              <Text numberOfLines={2} style={styles.actionLabel}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
}
const regular = { fontFamily: tokens.font, color: tokens.text };
export function SecuritiesDepositChooser({
  onDeposit,
  onClose,
}: {
  onDeposit: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel="Seleziona deposito"
      style={styles.dialog}
    >
      <Text style={styles.heading}>Seleziona deposito e sottodeposito</Text>
      {securitiesDeposits.map(item => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={item.owner}
          onPress={() => {
            onDeposit(item.id);
            onClose();
          }}
          style={styles.choice}
        >
          <Text style={styles.owner}>{item.owner}</Text>
          <Text style={styles.caption}>{item.label}</Text>
          <Text style={styles.caption}>{item.sub}</Text>
        </Pressable>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Chiudi selezione"
        onPress={onClose}
      >
        <Text style={styles.link}>CHIUDI SELEZIONE</Text>
      </Pressable>
    </View>
  );
}
const strong = { fontFamily: tokens.strongFont, color: tokens.text };
const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#f5f5f5', borderRadius: 16, gap: 24 },
  grid: { flexDirection: 'row', gap: 16 },
  identityColumn: { flex: 1, gap: 8, minWidth: 0 },
  label: { ...strong, fontSize: 18, lineHeight: 24 },
  owner: { ...strong, fontSize: 18, lineHeight: 24 },
  number: { ...regular, marginTop: -4, fontSize: 14, lineHeight: 20 },
  metric: { flex: 1, gap: 2, minWidth: 0 },
  metricLabel: { ...strong, fontSize: 16, lineHeight: 18 },
  accrual: { ...regular, fontSize: 14, lineHeight: 20 },
  profit: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'baseline',
    minHeight: 26,
  },
  profitUnavailable: { ...regular, fontSize: 18, lineHeight: 24 },
  positive: { ...strong, color: '#3d7d43', fontSize: 14, lineHeight: 24 },
  amount: { flexDirection: 'row', alignItems: 'baseline', minHeight: 27 },
  amountInteger: { ...strong, fontSize: 24, lineHeight: 26 },
  amountCurrency: { ...regular, fontSize: 16, lineHeight: 18 },
  quick: { flexDirection: 'row', gap: 24 },
  action: { flex: 1, alignItems: 'center', gap: 8 },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    ...regular,
    color: '#666',
    fontSize: 14,
    lineHeight: 16,
    height: 32,
    textAlign: 'center',
  },
  dialog: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    padding: 16,
    gap: 24,
    backgroundColor: '#fff',
  },
  heading: { ...strong, fontSize: 24, lineHeight: 28 },
  choice: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 24,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  caption: { ...regular, fontSize: 14, lineHeight: 20 },
  link: { ...strong, color: '#007a91', fontSize: 14, lineHeight: 20 },
});
