import React from 'react';
import { Pressable, ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { CHOICE_CHIP_ROW, resolveChoiceChip } from '@/app/components/contracts/choiceChip';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** One option of a choice row: action fill when chosen, soft neutral fill otherwise. */
export function BaselineChoiceChip({
  label,
  selected = false,
  onPress,
  dark = false,
  accessibilityLabel,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  dark?: boolean;
  accessibilityLabel?: string;
}) {
  const chip = resolveChoiceChip({ selected });
  const fill = sourceColor(`var(${chip.backgroundToken})`, dark);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      aria-pressed={selected}
      onPress={onPress}
      style={{
        borderRadius: chip.radius,
        paddingHorizontal: chip.paddingHorizontal,
        paddingVertical: chip.paddingVertical,
        borderWidth: chip.borderWidth,
        borderColor: sourceColor(`var(${chip.borderToken})`, dark),
        backgroundColor: fill,
      }}
    >
      <Text
        style={[
          styles.label,
          {
            fontSize: chip.fontSize,
            lineHeight: chip.lineHeight,
            color: sourceColor(`var(${chip.textToken})`, dark),
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** A sideways-scrolling row of choice chips; the feature owns the options and the selected value. */
export function BaselineChoiceChips<T extends string | number>({
  items,
  value,
  onChange,
  dark = false,
  contentStyle,
}: {
  items: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  dark?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, contentStyle]}
    >
      {items.map(item => (
        <BaselineChoiceChip
          key={String(item.value)}
          label={item.label}
          selected={item.value === value}
          dark={dark}
          onPress={() => onChange(item.value)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: 'UniCredit-bold' },
  row: { gap: CHOICE_CHIP_ROW.gap, paddingVertical: CHOICE_CHIP_ROW.paddingVertical },
});
