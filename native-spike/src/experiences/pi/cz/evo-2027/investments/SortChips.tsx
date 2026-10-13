import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  INVESTMENT_SORT_OPTIONS,
  type InvestmentSortId,
} from '@/app/config/investmentsPortfolioConfig';
import { Copy } from './Primitives';

export function SortChips({
  value,
  onChange,
}: {
  value: InvestmentSortId;
  onChange: (value: InvestmentSortId) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.row}
    >
      {INVESTMENT_SORT_OPTIONS.map(item => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: item.id === value }}
          onPress={() => onChange(item.id)}
        >
          <View style={[s.chip, item.id === value && s.active]}>
            <Copy style={[s.label, item.id === value && s.activeLabel]}>
              {item.label}
            </Copy>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  row: { justifyContent: 'center', gap: 8, paddingTop: 8, paddingBottom: 16 },
  chip: {
    height: 24,
    borderRadius: 14.5,
    borderWidth: 1,
    borderColor: '#262626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  active: { backgroundColor: '#262626' },
  label: { fontSize: 14, lineHeight: 15 },
  activeLabel: { color: '#FFFFFF' },
});
