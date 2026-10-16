import React from 'react';
import { Pressable } from 'react-native';
import { resolveAmountSuggestionChip } from '@/app/components/contracts/amountSuggestionChip';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
export function BaselineAmountSuggestionChip({
  label,
  selected,
  onSelect,
  dark = false,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  dark?: boolean;
}) {
  const state = resolveAmountSuggestionChip({ selected });
  const formStyle0 = {
    height: state.height,
    borderRadius: state.radius,
    paddingHorizontal: state.paddingHorizontal,
    paddingVertical: state.paddingVertical,
    borderWidth: state.borderWidth,
    borderColor: sourceColor(`var(${state.borderToken})`, dark),
    backgroundColor: sourceColor(`var(${state.backgroundToken})`, dark),
  } as const;
  const formStyle1 = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.fontSize,
    lineHeight: state.lineHeight,
    color: sourceColor(`var(${state.textToken})`, dark),
  } as const;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onSelect}
      style={formStyle0}
    >
      <Text style={formStyle1}>{label}</Text>
    </Pressable>
  );
}
