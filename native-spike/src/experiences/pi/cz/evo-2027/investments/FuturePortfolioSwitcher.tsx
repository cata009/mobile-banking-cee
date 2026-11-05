import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { RoboExistingGoal } from '@/features/investments/robo/types';
import { futureCopy } from '@/features/investments/future-overview/copy';
import type { ControlTokens } from '../../../../../universal/tokens';
import { Select } from '../../../../../universal/Select';
import { Text } from '../../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';

export function FuturePortfolioSwitcher({
  tokens,
  language = 'en',
  value,
  goals,
  onChange,
}: {
  tokens: ControlTokens;
  language?: string;
  value: string;
  goals: readonly RoboExistingGoal[];
  onChange(value: string): void;
}) {
  const c = futureCopy(language);
  const items = [
    { value: 'portfolio', label: c.portfolio },
    { value: 'goals', label: c.goals },
  ];
  const selectedValue = value.startsWith('goal:') ? 'goals' : 'portfolio';
  const selectedGoal = value.startsWith('goal:')
    ? goals.find(g => g.id === value.slice(5))
    : undefined;
  return (
    <Select
      tokens={tokens}
      label={c.switchPortfolio}
      value={value === 'goals' ? 'goals' : selectedValue}
      items={items}
      onChange={onChange}
      closeLabel={c.close}
      renderPanel={({ visible, onClose, children }) =>
        visible ? (
          <SourceBottomSheet
            title={c.switchPortfolio}
            onClose={onClose}
            dark={tokens.background === '#121212'}
          >
            {children}
          </SourceBottomSheet>
        ) : null
      }
      renderTrigger={({ open, expanded, label }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${c.switchPortfolio}: ${selectedGoal?.name ?? label}`}
          accessibilityState={{ expanded }}
          onPress={open}
          style={s.trigger}
        >
          <View style={s.label}>
            <Text
              numberOfLines={1}
              style={{
                color: tokens.text,
                fontFamily: tokens.strongFont,
                fontSize: 16,
              }}
            >
              {selectedGoal?.name ?? label}
            </Text>
          </View>
          <SourceCustomIcon name="chevron-down" size={12} color={tokens.text} />
        </Pressable>
      )}
    />
  );
}
const s = StyleSheet.create({
  trigger: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: { flexShrink: 1 },
});
