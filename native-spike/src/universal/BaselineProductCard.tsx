import React, { useState } from 'react';
import { Pressable, View, type GestureResponderEvent } from 'react-native';
import {
  resolveProductCard,
  type ProductCardOptions,
} from '@/app/components/contracts/productCard';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
export interface BaselineProductAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  ariaLabel?: string;
  onPress?: () => void;
}
export function BaselineProductCard({
  icon,
  title,
  accountNumber,
  amount,
  decimals,
  currency,
  thirdLine,
  actions,
  footer,
  onPress,
  dark = false,
  ...options
}: ProductCardOptions & {
  icon: React.ReactNode;
  title: string;
  accountNumber: string;
  amount: string;
  decimals: string;
  currency: string;
  thirdLine?: string;
  actions?: readonly BaselineProductAction[];
  footer?: React.ReactNode;
  onPress?: () => void;
  dark?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const state = resolveProductCard({
      ...options,
      actionCount: actions?.length,
      hasFooter: Boolean(footer),
      interactive: Boolean(onPress),
    }),
    color = (token: string) =>
      sourceColor(
        token === '--uc-primary-k0'
          ? `var(${token}, ${sourceColor('var(--uc-text)', dark)})`
          : `var(${token})`,
        dark,
      );
  const shell = {
    padding: state.padding,
    gap: state.gap,
    backgroundColor: color(state.backgroundToken),
    borderTopLeftRadius: state.evolution ? state.topRadius : state.radius,
    borderTopRightRadius: state.evolution ? state.topRadius : state.radius,
    borderBottomLeftRadius: state.evolution ? state.bottomRadius : state.radius,
    borderBottomRightRadius: state.evolution
      ? state.bottomRadius
      : state.radius,
    borderTopWidth: state.hasSeparator ? 0.5 : 0,
    borderColor: color('--uc-border-muted'),
  };
  const top = {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      gap: 16,
    },
    textShell = { flex: 1, minWidth: 0, gap: state.evolution ? 4 : 0 },
    leading = {
      width: state.leadingWidth,
      height: state.leadingHeight,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };
  const titleStyle = {
    fontFamily:
      state.titleWeight === 700 ? 'UniCredit-bold' : 'UniCredit-regular',
    fontSize: state.titleFontSize,
    lineHeight:
      typeof state.titleLineHeight === 'number'
        ? state.titleLineHeight
        : undefined,
    color: color(state.titleToken),
  };
  const subtitleStyle = {
    fontFamily:
      state.subtitleWeight === 700 ? 'UniCredit-bold' : 'UniCredit-regular',
    fontSize: state.subtitleFontSize,
    lineHeight:
      typeof state.subtitleLineHeight === 'number'
        ? state.subtitleLineHeight
        : undefined,
    color: color(state.textToken),
  };
  const amountShell = {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    justifyContent: state.evolution
      ? ('flex-start' as const)
      : ('flex-end' as const),
    marginTop: state.evolution ? 8 : 4,
  };
  const thirdLineStyle = { ...subtitleStyle, fontFamily: 'UniCredit-regular' };
  const amountStyle = {
      fontFamily: 'UniCredit-bold',
      fontSize: state.amountFontSize,
      lineHeight:
        typeof state.amountLineHeight === 'number'
          ? state.amountLineHeight
          : undefined,
      color: color(state.textToken),
    },
    decimalStyle = {
      fontFamily: 'UniCredit-regular',
      fontSize: 14,
      lineHeight: state.evolution ? 16 : undefined,
      color: color(state.textToken),
    };
  const viewStyle1 = { flexDirection: 'row', gap: 8 } as const;
  const pressableStyle2 = {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 6,
  } as const;
  const viewStyle3 = {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: color('--uc-surface-muted'),
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const viewStyle4 = {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const textStyle5 = [decimalStyle, { textAlign: 'center' }] as const;
  const content = (
    <>
      <View>
        <View style={top}>
          {!state.evolution ? <View style={leading}>{icon}</View> : null}
          <View style={textShell}>
            <Text style={titleStyle}>{title}</Text>
            <Text style={subtitleStyle}>{accountNumber}</Text>
            {thirdLine ? <Text style={thirdLineStyle}>{thirdLine}</Text> : null}
          </View>
          {state.evolution ? <View style={leading}>{icon}</View> : null}
        </View>
        <View style={amountShell}>
          <Text style={amountStyle}>{amount}</Text>
          <Text style={decimalStyle}>
            {decimals} {currency}
          </Text>
        </View>
      </View>
      {state.hasActions ? (
        <View style={viewStyle1}>
          {actions?.slice(0, state.actionLimit).map(action => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={
                action.ariaLabel ?? action.label.replace(/\s+/g, ' ').trim()
              }
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                action.onPress?.();
              }}
              style={pressableStyle2}
            >
              <View style={viewStyle3}>
                <View style={viewStyle4}>{action.icon}</View>
              </View>
              <Text style={textStyle5}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
      {state.hasFooter ? footer : null}
    </>
  );
  const pressableStyle6 = [
    shell,
    { opacity: hovered ? state.hoverOpacity : 1 },
  ] as const;
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={pressableStyle6}
    >
      {content}
    </Pressable>
  ) : (
    <View style={shell}>{content}</View>
  );
}
