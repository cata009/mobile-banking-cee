import React from 'react';
import { Platform, Pressable, View, type TextStyle } from 'react-native';
import { Text } from './Typography';

export interface BaselineInvestmentProductRowProps {
  title: string;
  value: React.ReactNode;
  performance: { integer: string; decimal: string; currency: string };
  percent: string;
  contribution?: string;
  recurringIcon?: React.ReactNode;
  onPress?: () => void;
  testID?: string;
  paddingRight?: number;
  textColor?: string;
  backgroundColor?: string;
  percentColor?: string;
}

/** Presentation only. Features supply formatted/masked parts, contribution visibility and tone. */
export function BaselineInvestmentProductRow({
  title,
  value,
  performance,
  percent,
  contribution,
  recurringIcon,
  onPress,
  testID,
  paddingRight = 24,
  textColor = '#262626',
  backgroundColor = '#FFFFFF',
  percentColor = textColor,
}: BaselineInvestmentProductRowProps) {
  const copy = (bold = false): TextStyle => ({
    fontFamily:
      Platform.OS === 'web'
        ? `${bold ? 'UniCredit-bold' : 'UniCredit-regular'}, sans-serif`
        : bold
          ? 'UniCredit-bold'
          : 'UniCredit-regular',
    ...(Platform.OS === 'web'
      ? { fontWeight: bold ? '700' : '400', fontSynthesis: 'none' }
      : {}),
    fontSize: 14,
    color: textColor,
  });
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={{
        minHeight: 95,
        paddingVertical: 16,
        paddingLeft: 16,
        paddingRight,
        gap: 4,
        backgroundColor,
      }}
    >
      <Text numberOfLines={1} style={[copy(true), { lineHeight: 15 }]}>
        {title}
      </Text>
      <View
        style={{
          minHeight: 22,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text numberOfLines={1} style={[copy(), { flex: 1, lineHeight: 18 }]}>
          {value}
        </Text>
        <Text
          style={{
            color: textColor,
            fontFamily: 'UniCredit-regular',
            fontSize: 16,
            lineHeight: 24,
          }}
        >
          <Text
            style={{
              fontFamily: 'UniCredit-bold',
              fontSize: 20,
              lineHeight: 22,
            }}
          >
            {performance.integer}
          </Text>
          <Text
            style={{
              fontFamily: 'UniCredit-regular',
              fontSize: 14,
              lineHeight: 21,
            }}
          >
            {performance.decimal} {performance.currency}
          </Text>
        </Text>
      </View>
      <View
        style={{
          minHeight: 18,
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {contribution ? (
            <Text style={[copy(), { lineHeight: 18 }]}>{contribution}</Text>
          ) : null}
          {recurringIcon}
        </View>
        <Text style={[copy(true), { lineHeight: 18, color: percentColor }]}>
          {percent}
        </Text>
      </View>
    </Pressable>
  );
}
