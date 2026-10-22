import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import type { Security } from '@/features/investments/mobileFirstSecurities';
import { formatInvestmentReferenceDate } from '@/features/investments/mobileFirstValuation';
import { Money, Rows, s } from './Primitives';
export default function Quote({
  security,
  hidden,
  position,
  advanced = false,
  onPress,
}: {
  security: Security;
  hidden: boolean;
  position?: boolean;
  advanced?: boolean;
  onPress: () => void;
}) {
  const averageCost = security.averageCost;
  const performance = position
    ? security.quantity > 0 && averageCost !== undefined && averageCost > 0
      ? (security.price / averageCost - 1) * 100
      : undefined
    : security.change;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Apri ${security.name}`}
      onPress={onPress}
      style={styles.quoteCard}
    >
      <View style={styles.quoteGrid}>
        <View style={styles.quoteColumn}>
          <Text style={s.strong}>{security.name}</Text>
          <Text style={s.small}>{security.market}</Text>
        </View>
        <View style={styles.quoteColumn}>
          <Text style={s.small}>
            {position ? 'CTV Mercato' : 'Ultimo prezzo'}
          </Text>
          <Money
            cents={
              position
                ? Math.round(security.price * security.quantity * 100)
                : security.price * 100
            }
            decimals={!position && security.price < 1 ? 4 : 2}
            hidden={hidden}
            integerSize={24}
            integerLineHeight={26}
            currencySize={18}
          />
        </View>
      </View>
      <View style={styles.quoteGrid}>
        <View style={styles.quoteColumn}>
          <Text style={s.small}>{position ? 'Qtà.' : 'ISIN'}</Text>
          <Text style={s.strong}>
            {position ? security.quantity : security.isin}
          </Text>
        </View>
        <View style={styles.quoteColumn}>
          <Text style={s.small}>{position ? 'P&L | %' : 'Variazione | %'}</Text>
          <Text
            style={[
              s.body,
              performance !== undefined && performance < 0
                ? s.negative
                : s.positive,
            ]}
          >
            {performance === undefined
              ? 'N.D.'
              : `${performance > 0 ? '+' : ''}${performance
                  .toFixed(2)
                  .replace('.', ',')}%`}
          </Text>
        </View>
      </View>
      {advanced && (
        <Rows
          rows={[
            {
              label: 'Prezzo medio di carico',
              value:
                averageCost === undefined ? (
                  'N.D.'
                ) : (
                  <Money cents={averageCost * 100} hidden={hidden} />
                ),
            },
            {
              label: 'Valore di carico',
              value:
                security.costCents === undefined ? (
                  'N.D.'
                ) : (
                  <Money cents={security.costCents} hidden={hidden} />
                ),
            },
            { label: 'Performance 1A', value: `${security.performance}%` },
            {
              label: 'Dividend Yield',
              value: `${((security.dividend / security.price) * 100).toFixed(
                2,
              )}%`,
            },
          ]}
        />
      )}
      <Text style={s.small}>
        Aggiornato al {formatInvestmentReferenceDate()} (dati demo)
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  quoteCard: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    gap: 24,
  },
  quoteGrid: { flexDirection: 'row', gap: 16 },
  quoteColumn: { flex: 1, minWidth: 0, gap: 8 },
});
