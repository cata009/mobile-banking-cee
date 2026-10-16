import React from 'react';
import {
  Pressable,
  View,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  resolveAccountActions,
  type AccountActionAlignment,
  type AccountActionTreatment,
} from '@/app/components/contracts/accountActions';
import { Text } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
import { sourceIconDimensions } from './sourceIconDimensions';
export interface BaselineAccountAction {
  id: string;
  label: string;
  iconName?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  ariaLabel?: string;
  pressed?: boolean;
  iconColor?: string;
  hidden?: boolean;
}
export function BaselineAccountActionBar({
  items,
  align,
  iconTreatment,
  dark = false,
  style,
}: {
  items: readonly BaselineAccountAction[];
  align?: AccountActionAlignment;
  iconTreatment?: AccountActionTreatment;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const state = resolveAccountActions({ align, iconTreatment }),
    shell = {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      paddingHorizontal: state.gutter,
      paddingVertical: state.paddingVertical,
      gap: state.gap,
      justifyContent:
        state.align === 'between'
          ? ('space-between' as const)
          : state.align === 'center'
          ? ('center' as const)
          : state.align === 'end'
          ? ('flex-end' as const)
          : ('flex-start' as const),
    };
  const color = (value: string) => sourceColor(value, dark),
    bubbleColor = color(
      `var(${state.bubbleToken}, ${color(
        `var(${state.bubbleFallbackToken})`,
      )})`,
    );
  const viewStyle1 = [shell, style] as const;
  return (
    <View style={viewStyle1}>
      {items.slice(0, state.actionLimit).map(item => {
        const glyphDimensions = item.iconName
          ? sourceIconDimensions(item.iconName)
          : { width: 20, height: 20 };
        const itemState = resolveAccountActions({
            align,
            iconTreatment,
            label: item.label,
            hidden: item.hidden,
            pressed: item.pressed,
          }),
          glyphColor = color(
            item.iconColor ??
              (state.bubble
                ? `var(${state.foregroundToken}, ${color(
                    `var(${state.foregroundFallbackToken})`,
                  )})`
                : 'var(--uc-text)'),
          );
        const itemStyle = {
            flex: state.stretch ? 1 : undefined,
            minWidth: state.stretch ? 0 : undefined,
            width: state.itemWidth,
            alignItems: 'center' as const,
            gap: state.itemGap,
            opacity: item.hidden ? 0 : 1,
            ...(Platform.OS === 'web' && item.hidden
              ? { visibility: 'hidden' as const }
              : {}),
          },
          iconStyle = {
            width: state.iconSlot,
            height: state.iconSlot,
            borderRadius: state.bubble ? state.iconSlot / 2 : undefined,
            backgroundColor: state.bubble ? bubbleColor : undefined,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
          };
        const labelStyle = {
          fontFamily: 'UniCredit-regular',
          fontSize: state.labelFontSize,
          lineHeight: state.labelLineHeight,
          textAlign: 'center' as const,
          color: color('var(--uc-text)'),
        };
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.ariaLabel ?? itemState.normalizedLabel}
            accessibilityState={{ disabled: Boolean(item.hidden) }}
            aria-pressed={item.pressed}
            disabled={item.hidden}
            accessibilityElementsHidden={item.hidden}
            aria-hidden={item.hidden ? true : undefined}
            importantForAccessibility={
              item.hidden ? 'no-hide-descendants' : 'auto'
            }
            onPress={() => {
              if (!item.hidden) item.onPress?.();
            }}
            style={itemStyle}
          >
            <View style={iconStyle}>
              {state.bubble && item.iconName ? (
                <SourceCustomIcon
                  name={item.iconName}
                  size={24}
                  color={glyphColor}
                />
              ) : (
                item.icon ??
                (item.iconName ? (
                  <SourceCustomIcon
                    name={item.iconName}
                    size={
                      glyphDimensions.width === glyphDimensions.height
                        ? glyphDimensions.width
                        : undefined
                    }
                    width={glyphDimensions.width}
                    height={glyphDimensions.height}
                    color={glyphColor}
                  />
                ) : null)
              )}
            </View>
            <Text style={labelStyle}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
