import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Copy } from './Primitives';
export type InvestmentSection =
  | 'portfolio'
  | 'explore'
  | 'catalog'
  | 'history'
  | 'more';
const sections = [
  { id: 'portfolio', label: 'Portfolio', icon: 'robo-nav-portfolio' },
  { id: 'explore', label: 'Explore', icon: 'robo-nav-explore' },
  { id: 'catalog', label: 'Invest', icon: 'robo-nav-invest' },
  { id: 'history', label: 'Activity', icon: 'investment-history' },
  { id: 'more', label: 'More', icon: 'nav-more' },
] as const;
export function ModuleNavigation({
  value,
  onChange,
}: {
  value: InvestmentSection;
  onChange: (value: InvestmentSection) => void;
}) {
  return (
    <View style={s.reserve}>
      <View style={s.bar}>
        {sections.map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: value === item.id }}
            onPress={() => onChange(item.id)}
            style={s.item}
          >
            <SourceCustomIcon
              name={item.icon}
              size={22}
              color={value === item.id ? '#007A91' : '#666666'}
            />
            <Copy style={[s.label, value === item.id && s.active]}>
              {item.label}
            </Copy>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  reserve: {
    paddingHorizontal: 6,
    paddingBottom: 34,
    paddingTop: 8,
    backgroundColor: '#F5F5F5',
  },
  bar: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 5,
  },
  item: {
    flex: 1,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 12,
    paddingHorizontal: 1,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.168,
    color: '#666666',
  },
  active: { color: '#007A91' },
});
