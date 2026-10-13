import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import utilities from '@/assets/mobile-first/it/account/utilities.svg';
import taxes from '@/assets/mobile-first/it/account/taxes.svg';
import expenses from '@/assets/mobile-first/it/account/expenses.svg';
import incomes from '@/assets/mobile-first/it/account/incomes.svg';
type Kind = 'utilities' | 'taxes' | 'expenses' | 'incomes';
export default function CategoryMark({
  kind,
  card = false,
}: {
  kind: Kind;
  card?: boolean;
}) {
  return (
    <View style={[styles.mark, (card ? cardStyles : styles)[kind]]}>
      <AssetGlyph
        asset={{ utilities, taxes, expenses, incomes }[kind]}
        width={kind === 'utilities' ? 12 : kind === 'incomes' ? 16 : 14.6667}
        height={kind === 'incomes' ? 16 : 14.6667}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  mark: {
    width: 32,
    height: 32,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  utilities: { backgroundColor: '#546100' },
  taxes: { backgroundColor: '#7757a4' },
  expenses: { backgroundColor: '#535453' },
  incomes: { backgroundColor: '#3d7d43' },
});
const cardStyles = StyleSheet.create({
  utilities: { backgroundColor: '#536700' },
  taxes: { backgroundColor: '#7757a4' },
  expenses: { backgroundColor: '#555' },
  incomes: { backgroundColor: '#398342' },
});
