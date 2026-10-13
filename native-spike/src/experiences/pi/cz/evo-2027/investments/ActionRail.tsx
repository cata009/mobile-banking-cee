import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Copy } from './Primitives';
import { InvestmentGlyph, type InvestmentGlyphName } from './Glyph';

export function ActionRail({
  items,
}: {
  items: readonly {
    id: string;
    label: string;
    accessibilityLabel: string;
    icon: InvestmentGlyphName;
    onPress: () => void;
  }[];
}) {
  return (
    <View style={s.rail}>
      {items.map(item => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={item.accessibilityLabel}
          onPress={item.onPress}
          style={s.item}
        >
          <View style={s.icon}>
            <InvestmentGlyph name={item.icon} />
          </View>
          <Copy style={s.label}>{item.label}</Copy>
        </Pressable>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  rail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 18,
    marginHorizontal: -8,
  },
  item: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4 },
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center', fontSize: 14, lineHeight: 15 },
});
