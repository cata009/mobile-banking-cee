import React from 'react';
import { Pressable, View, type GestureResponderEvent } from 'react-native';
import { resolveAccountBalanceCard } from '@/app/components/contracts/accountBalanceCard';
import { Text } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
export function BaselineAccountBalanceCard({
  account,
  availableInteger,
  availableDecimals,
  currency,
  currentBalance,
  onPress,
  onCopy,
  active,
  showSubAccount,
  productType,
  progress,
  progressLabel = 'Product progress',
  showCopy,
  dark = false,
}: {
  account: { accountName: string; accountNumber: string; subAccount?: string };
  availableInteger: string;
  availableDecimals: string;
  currency: string;
  currentBalance: string;
  onPress?: () => void;
  onCopy?: () => void;
  active?: boolean;
  showSubAccount?: boolean;
  productType?: string;
  progress?: number;
  progressLabel?: string;
  showCopy?: boolean;
  dark?: boolean;
}) {
  const state = resolveAccountBalanceCard({
      productType,
      progress,
      active,
      hasSubAccount: Boolean(account.subAccount),
      showSubAccount,
      showCopy,
    }),
    color = (token: string) => sourceColor(`var(${token})`, dark);
  const shell = {
    width: state.width,
    height: state.height,
    borderRadius: state.radius,
    padding: state.padding,
    gap: state.gap,
    backgroundColor: color(state.backgroundToken),
    opacity: state.opacity,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: 16,
        blurRadius: 32,
        color: sourceColor('rgb(var(--uc-shadow-rgb)/0.08)', dark),
      },
      {
        offsetX: 0,
        offsetY: 3,
        blurRadius: 10,
        color: sourceColor('rgb(var(--uc-shadow-rgb)/0.05)', dark),
      },
    ],
  };
  const muted = {
      fontFamily: 'UniCredit-bold',
      fontSize: state.bodyFontSize,
      color: color(state.mutedToken),
    },
    value = { ...muted, color: color(state.textToken) };
  const textStyle1 = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.titleFontSize,
    color: color(state.actionToken),
  } as const;
  const viewStyle2 = {
    marginTop: 8,
    height: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as const;
  const textStyle3 = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.ibanFontSize,
    color: color(state.mutedToken),
    maxWidth: state.ibanMaxWidth,
  } as const;
  const pressableStyle4 = {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const viewStyle5 = { height: 80, gap: 8 } as const;
  const textStyle6 = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.amountFontSize,
    lineHeight: 33,
    color: color(state.textToken),
  } as const;
  const textStyle7 = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.decimalsFontSize,
    lineHeight: 22,
  } as const;
  const viewStyle8 = {
    height: state.progressHeight,
    width: state.progressWidth,
    borderRadius: 99,
    overflow: 'hidden',
    backgroundColor: color(state.borderToken),
  } as const;
  const viewStyle9 = {
    height: '100%',
    width: `${(state.progressFraction ?? 0) * 100}%`,
    borderRadius: 99,
    backgroundColor: color(state.actionToken),
  } as const;
  const viewStyle10 = {
    height: 1,
    width: state.progressWidth,
    backgroundColor: color(state.borderToken),
  } as const;
  const viewStyle11 = { flexDirection: 'row', gap: 4 } as const;
  const content = (
    <>
      <View>
        <Text style={textStyle1}>{account.accountName}</Text>
        <View style={viewStyle2}>
          <Text numberOfLines={1} style={textStyle3}>
            {account.accountNumber}
          </Text>
          {state.showCopy ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Copy account number"
              onPress={(event: GestureResponderEvent) => {
                event.stopPropagation();
                onCopy?.();
              }}
              style={pressableStyle4}
            >
              <SourceCustomIcon
                name="copy-documents"
                size={20}
                color={color('--uc-icon')}
              />
            </Pressable>
          ) : null}
        </View>
        {state.hasSubAccount ? (
          <Text style={muted}>
            SUB ACCOUNT <Text style={value}>{account.subAccount}</Text>
          </Text>
        ) : null}
      </View>
      <View style={viewStyle5}>
        <View>
          <Text style={muted}>{state.availableLabel}</Text>
          <Text style={textStyle6}>
            {availableInteger}
            <Text style={textStyle7}>
              {availableDecimals} {currency}
            </Text>
          </Text>
        </View>
        {state.progressFraction !== undefined ? (
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={progressLabel}
            accessibilityValue={{
              min: 0,
              max: 100,
              now: state.progressPercent,
            }}
            style={viewStyle8}
          >
            <View style={viewStyle9} />
          </View>
        ) : (
          <View style={viewStyle10} />
        )}
        {state.showCurrent ? (
          <View style={viewStyle11}>
            <Text style={muted}>{state.currentLabel}</Text>
            <Text style={value}>
              {currentBalance} {currency}
            </Text>
          </View>
        ) : null}
      </View>
    </>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={shell}>
      {content}
    </Pressable>
  ) : (
    <View style={shell}>{content}</View>
  );
}
