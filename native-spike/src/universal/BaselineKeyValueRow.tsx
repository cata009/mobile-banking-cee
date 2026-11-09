import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  resolveKeyValueRow,
  type KeyValueRowOptions,
} from '@/app/components/contracts/keyValueRow';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** The Design System key-value row: inline (label left, value right) or stacked (label above value). */
export function BaselineKeyValueRow({
  label,
  value,
  dark = false,
  testID,
  ...options
}: KeyValueRowOptions & {
  label: string;
  value: string;
  dark?: boolean;
  testID?: string;
}) {
  const row = resolveKeyValueRow(options);
  const labelStyle = [
    row.labelBold ? styles.bold : styles.regular,
    {
      fontSize: row.labelSize,
      color: sourceColor(`var(${row.labelToken})`, dark),
      textTransform: row.labelUppercase ? ('uppercase' as const) : undefined,
    },
  ];
  const valueStyle = [
    row.valueBold ? styles.bold : styles.regular,
    {
      fontSize: row.valueSize,
      color: sourceColor(`var(${row.valueToken})`, dark),
    },
  ];
  if (row.stacked)
    return (
      <View
        testID={testID}
        style={{ paddingTop: row.paddingVertical + 8, gap: row.gap }}
      >
        <Text style={labelStyle}>{label}</Text>
        <Text style={valueStyle}>{value}</Text>
      </View>
    );
  return (
    <View
      testID={testID}
      style={[
        styles.inline,
        row.showDivider ? styles.rule : undefined,
        {
          gap: row.gap,
          paddingVertical: row.paddingVertical,
          borderBottomColor: sourceColor(`var(${row.dividerToken})`, dark),
        },
      ]}
    >
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  rule: { borderBottomWidth: 1 },
  label: { flex: 1 },
  value: { textAlign: 'right' },
  bold: { fontFamily: 'UniCredit-bold' },
  regular: { fontFamily: 'UniCredit-regular' },
});
