import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  View,
  type ViewStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  resolvePill,
  PILL_SUCCESS_PATH,
  SORTING_OPTIONS,
  PILL_SORTING_CONTRACT as sorting,
  type PillVariant,
  type PillSortingValue,
} from '@/app/components/contracts/pill';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

export function BaselinePill({
  variant = 'primary',
  label,
  counterText,
  disabled,
  onPress,
  dark = false,
}: {
  variant?: PillVariant;
  label?: string;
  counterText?: string;
  disabled?: boolean;
  onPress?: () => void;
  dark?: boolean;
}) {
  const contract = resolvePill({ variant, label, counterText, disabled });
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!contract.loading) return;
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: contract.spinnerDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [contract.loading, contract.spinnerDuration, rotation]);
  const rootStyle: ViewStyle = {
    width: contract.width,
    height: contract.height,
    borderRadius: contract.radius,
    paddingHorizontal: contract.paddingHorizontal,
    paddingVertical: contract.paddingVertical,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: contract.disabled ? 0.5 : 1,
    backgroundColor: sourceColor(`var(${contract.backgroundToken})`, dark),
    boxShadow: '0 2px 2px rgba(0,0,0,.2)',
  };
  const contentStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 0,
  };
  const textStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.fontSize,
    lineHeight: contract.fontSize,
    color: sourceColor(`var(${contract.textToken})`, dark),
    flexShrink: 1,
  };
  const successStyle: ViewStyle = {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sourceColor('var(--uc-green-success)', dark),
  };
  const spinnerStyle: ViewStyle = {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: sourceColor('var(--uc-neutral-300)', dark),
  };
  const spinnerTopStyle = [
    spinnerStyle,
    {
      position: 'absolute' as const,
      borderColor: 'transparent',
      borderTopColor: sourceColor('var(--uc-neutral-700)', dark),
      transform: [
        {
          rotate: rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    },
  ];
  const iconStyle: ViewStyle = {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={contract.label}
      accessibilityState={{
        disabled: contract.disabled,
        busy: Boolean(contract.busy),
      }}
      disabled={contract.disabled}
      onPress={() => {
        if (!contract.disabled) onPress?.();
      }}
      style={rootStyle}
    >
      <View style={contentStyle}>
        {contract.loading ? (
          <View style={iconStyle}>
            <View style={spinnerStyle} />
            <Animated.View style={spinnerTopStyle} />
          </View>
        ) : contract.activated ? (
          <View style={successStyle}>
            <SvgXml
              xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="${PILL_SUCCESS_PATH}" fill="none" stroke="${sourceColor(
                'var(--uc-static-white)',
                dark,
              )}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
              width={10}
              height={10}
            />
          </View>
        ) : null}
        <Text numberOfLines={1} style={textStyle}>
          {contract.label}
        </Text>
      </View>
    </Pressable>
  );
}
export function BaselinePillSorting({
  selectedValue = 'max-percent',
  onChange,
  dark = false,
}: {
  selectedValue?: PillSortingValue | null;
  onChange?: (value: PillSortingValue) => void;
  dark?: boolean;
}) {
  const rootStyle: ViewStyle = {
    width: sorting.width,
    height: sorting.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sorting.gap,
  };
  return (
    <View style={rootStyle}>
      {SORTING_OPTIONS.map(option => {
        const selected = selectedValue === option.value,
          color = sourceColor(
            selected ? 'var(--uc-static-white)' : 'var(--uc-text)',
            dark,
          );
        const chipStyle: ViewStyle = {
          height: sorting.chipHeight,
          borderRadius: sorting.chipRadius,
          paddingHorizontal: sorting.paddingHorizontal,
          paddingVertical: sorting.paddingVertical,
          borderWidth: 1,
          borderColor: sourceColor(
            selected ? 'var(--uc-static-black)' : 'var(--uc-text)',
            dark,
          ),
          backgroundColor: selected
            ? sourceColor('var(--uc-static-black)', dark)
            : 'transparent',
          justifyContent: 'center',
        };
        const textStyle = {
          fontFamily: selected ? 'UniCredit-bold' : 'UniCredit-regular',
          fontSize: sorting.fontSize,
          lineHeight: sorting.lineHeight,
          color,
        };
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange?.(option.value)}
            style={chipStyle}
          >
            <Text style={textStyle}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
