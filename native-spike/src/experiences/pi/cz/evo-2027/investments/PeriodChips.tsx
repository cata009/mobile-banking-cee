import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type {
  InvestmentPeriodId,
  InvestmentPeriodOption,
} from '@/app/config/investmentsPortfolioConfig';
import { Copy } from './Primitives';

export function PeriodChips({
  items,
  value,
  onChange,
  comfortable = false,
}: {
  items: readonly InvestmentPeriodOption[];
  value: InvestmentPeriodId;
  onChange: (value: InvestmentPeriodId) => void;
  comfortable?: boolean;
}) {
  return (
    <View style={s.rail}>
      {items.map(item => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: item.id === value }}
          onPress={() => onChange(item.id)}
          style={comfortable ? s.touch : undefined}
        >
          <View style={[s.chip, item.id === value && s.selected]}>
            <Copy
              strong
              style={[s.label, item.id === value && s.selectedLabel]}
            >
              {item.label}
            </Copy>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    marginTop: 12,
  },
  touch: {
    minWidth: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    height: 21,
    minWidth: 35,
    paddingHorizontal: 8,
    borderRadius: 3.5,
    borderWidth: 1,
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: { borderColor: 'transparent', backgroundColor: '#007A91' },
  label: { fontSize: 14, lineHeight: 15 },
  selectedLabel: { color: '#FFFFFF' },
});
