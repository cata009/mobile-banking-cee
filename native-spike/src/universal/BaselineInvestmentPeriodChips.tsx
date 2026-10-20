import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

export interface BaselineInvestmentPeriodChipsProps<T extends string = string> {
  periods: readonly { id: T; label: string }[];
  selectedPeriodId: T;
  onChange: (periodId: T) => void;
  ariaLabel?: string;
  softUnselected?: boolean;
  comfortableTouchTargets?: boolean;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
  targetStyle?: StyleProp<ViewStyle>;
  inkStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  wrapInk?: boolean;
  /** Fixed original Figma specimen geometry, or existing experience geometry. */
  preset?: 'experience' | 'figma';
}

/** Controlled DS renderer; the feature supplies available periods and selection. */
export function BaselineInvestmentPeriodChips<T extends string>({
  periods,
  selectedPeriodId,
  onChange,
  ariaLabel = 'Investment period',
  softUnselected = false,
  comfortableTouchTargets = false,
  dark = false,
  style,
  targetStyle,
  inkStyle: inkPresentation,
  labelStyle,
  wrapInk = false,
  preset = 'experience',
}: BaselineInvestmentPeriodChipsProps<T>) {
  const figma = preset === 'figma';
  const comfortable = comfortableTouchTargets && !figma;
  return (
    <View
      role="group"
      accessible={false}
      accessibilityLabel={ariaLabel}
      style={[
        styles.group,
        figma && styles.figmaGroup,
        figma && periods.length === 4 && styles.figmaFour,
        style,
      ]}
    >
      {periods.map(period => {
        const selected = period.id === selectedPeriodId;
        const inkStyle: ViewStyle = {
          ...styles.ink,
          ...(figma ? styles.figmaInk : {}),
          borderColor:
            selected || softUnselected
              ? 'transparent'
              : sourceColor('var(--uc-text)', dark),
          backgroundColor: selected
            ? sourceColor('var(--uc-action-strong)', dark)
            : softUnselected
            ? sourceColor('var(--uc-neutral-100)', dark)
            : 'transparent',
        };
        const label = (
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              {
                ...(Platform.OS === 'web'
                  ? {
                      fontFamily: 'UniCredit-bold, sans-serif',
                      fontWeight: '700' as const,
                      fontSynthesis: 'none',
                    }
                  : {}),
                color: sourceColor(
                  selected ? 'var(--uc-static-white)' : 'var(--uc-text)',
                  dark,
                ),
              },
              labelStyle,
            ]}
          >
            {period.label}
          </Text>
        );
        return (
          <Pressable
            key={period.id}
            accessibilityRole="button"
            accessibilityLabel={period.label}
            accessibilityState={{ selected }}
            aria-pressed={selected}
            onPress={() => onChange(period.id)}
            style={
              comfortable
                ? [styles.target, targetStyle]
                : wrapInk
                ? undefined
                : [inkStyle, inkPresentation]
            }
          >
            {comfortable || wrapInk ? (
              <View style={[inkStyle, inkPresentation]}>{label}</View>
            ) : (
              label
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  ink: {
    height: 21,
    minWidth: 35,
    paddingHorizontal: 8,
    borderRadius: 3.5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  figmaGroup: {
    width: 238,
    height: 24,
    gap: 15,
    paddingHorizontal: 1,
    paddingVertical: 1,
    justifyContent: 'flex-start',
  },
  figmaFour: { justifyContent: 'center' },
  figmaInk: { width: 35, height: 22, paddingHorizontal: 0 },
  target: {
    height: 40,
    minWidth: 40,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 15 },
});
