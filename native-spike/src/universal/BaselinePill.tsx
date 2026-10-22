import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  resolvePill,
  createPillSortingModel,
  PILL_SUCCESS_PATH,
  SORTING_OPTIONS,
  PILL_SORTING_CONTRACT as sorting,
  type PillVariant,
  type PillSortingValue,
  type PillSortingOption,
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
  interactive = true,
  style,
  labelStyle,
  presentation = 'default',
  selected,
}: {
  variant?: PillVariant;
  label?: string;
  counterText?: string;
  disabled?: boolean;
  onPress?: () => void;
  dark?: boolean;
  /** False for pill content inside an already interactive card. */
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  presentation?: 'default' | 'navigation';
  selected?: boolean;
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
    opacity: contract.opacity,
    backgroundColor: sourceColor(`var(${contract.backgroundToken})`, dark),
    boxShadow: '0 2px 4px rgba(0,0,0,.2)',
    ...(presentation === 'navigation'
      ? {
          width: undefined,
          height: undefined,
          minHeight: 33,
          borderRadius: 4,
          paddingLeft: 19,
          paddingRight: 18,
          paddingVertical: 9,
          backgroundColor: '#f5f5f5',
          boxShadow: undefined,
        }
      : {}),
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
    lineHeight: contract.lineHeight,
    color: sourceColor(`var(${contract.textToken})`, dark),
    flexShrink: 1,
    ...(presentation === 'navigation'
      ? { color: '#262626', textTransform: 'uppercase' as const }
      : {}),
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
  const content = (
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
      <Text numberOfLines={1} style={[textStyle, labelStyle]}>
        {contract.label}
      </Text>
    </View>
  );
  if (!interactive) return <View style={[rootStyle, style]}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={contract.label}
      aria-pressed={selected}
      accessibilityState={{
        disabled: contract.disabled,
        busy: Boolean(contract.busy),
        selected,
      }}
      disabled={contract.disabled}
      onPress={() => {
        if (!contract.disabled) onPress?.();
      }}
      style={[rootStyle, style]}
    >
      {content}
    </Pressable>
  );
}
interface PillSortingPresentationProps {
  dark?: boolean;
  ariaLabel?: string;
  presentation?: 'default' | 'filter';
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  chipStyle?: StyleProp<ViewStyle>;
  selectedChipStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  selectedLabelStyle?: StyleProp<TextStyle>;
}
type LegacyPillSortingProps = PillSortingPresentationProps & {
  options?: undefined;
  selectedValue?: PillSortingValue | null;
  value?: never;
  onChange?: (value: PillSortingValue) => void;
};
type CustomPillSortingProps<Value extends string> =
  PillSortingPresentationProps & {
    options: readonly PillSortingOption<Value>[];
    value: Value | null;
    selectedValue?: never;
    onChange?: (value: Value) => void;
  };
export type BaselinePillSortingProps<Value extends string = PillSortingValue> =
  LegacyPillSortingProps | CustomPillSortingProps<Value>;

/** One controlled chip renderer; callers own option availability and ordering policy. */
export function BaselinePillSorting<Value extends string = PillSortingValue>(
  props: BaselinePillSortingProps<Value>,
) {
  const { dark = false, ariaLabel, presentation = 'default' } = props;
  const filter = presentation === 'filter';
  const model =
    props.options === undefined
      ? createPillSortingModel(
          SORTING_OPTIONS,
          props.selectedValue === undefined
            ? 'max-percent'
            : props.selectedValue,
          props.onChange,
        )
      : createPillSortingModel(props.options, props.value, props.onChange);
  const rootStyle: ViewStyle = {
    width: sorting.width,
    height: sorting.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sorting.gap,
  };
  const chips = model.options.map(option => {
    const selected = model.value === option.value,
      color = sourceColor(
        selected
          ? filter
            ? 'var(--uc-text-inverse)'
            : 'var(--uc-static-white)'
          : 'var(--uc-text)',
        dark,
      );
    const chipStyle: ViewStyle = {
      height: sorting.chipHeight,
      borderRadius: sorting.chipRadius,
      paddingHorizontal: sorting.paddingHorizontal,
      paddingVertical: sorting.paddingVertical,
      borderWidth: selected && !filter ? 0 : 1,
      borderColor: sourceColor(
        selected && !filter ? 'var(--uc-static-black)' : 'var(--uc-text)',
        dark,
      ),
      backgroundColor: selected
        ? filter
          ? sourceColor('var(--uc-text)', dark)
          : sorting.selectedBackground
        : 'transparent',
      justifyContent: 'center',
      ...(filter ? { alignItems: 'center' as const } : {}),
    };
    const textStyle = {
      fontFamily: selected && !filter ? 'UniCredit-bold' : 'UniCredit-regular',
      fontSize: sorting.fontSize,
      lineHeight: filter ? 15 : sorting.lineHeight,
      color,
      ...(filter && Platform.OS === 'web'
        ? {
            fontFamily: 'UniCredit-regular, sans-serif',
            fontWeight: '400' as const,
            fontSynthesis: 'none',
          }
        : {}),
    };
    return (
      <Pressable
        key={option.value}
        accessibilityRole="button"
        accessibilityLabel={option.label}
        accessibilityState={{ selected }}
        aria-pressed={selected}
        onPress={() => model.activate(option.value)}
        style={[
          chipStyle,
          props.chipStyle,
          selected ? props.selectedChipStyle : undefined,
        ]}
      >
        <Text
          numberOfLines={filter ? 1 : undefined}
          style={[
            textStyle,
            props.labelStyle,
            selected ? props.selectedLabelStyle : undefined,
          ]}
        >
          {option.label}
        </Text>
      </Pressable>
    );
  });
  const filterRootStyle: ViewStyle = { width: '100%' };
  const filterContentStyle: ViewStyle = {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 18,
  };
  if (filter)
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        role="group"
        accessible={false}
        accessibilityLabel={ariaLabel}
        style={[filterRootStyle, props.style]}
        contentContainerStyle={[
          filterContentStyle,
          props.contentContainerStyle,
        ]}
      >
        {chips}
      </ScrollView>
    );
  return (
    <View
      role={ariaLabel ? 'group' : undefined}
      accessible={false}
      accessibilityLabel={ariaLabel}
      style={[rootStyle, props.style, props.contentContainerStyle]}
    >
      {chips}
    </View>
  );
}
