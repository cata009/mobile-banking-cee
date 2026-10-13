import React from 'react';
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { money } from './Primitives';
export default function AccountAmount({
  value,
  hidden = false,
  signed = false,
  size = 28,
  decimalsSize = 20,
  color = tokens.text,
  cardMask = false,
}: {
  value: number;
  hidden?: boolean;
  signed?: boolean;
  size?: number;
  decimalsSize?: number;
  color?: string;
  cardMask?: boolean;
}) {
  const amountLineHeight = size === 24 ? 26 : size + 4;
  const formatted = money(value, false, signed).replace(/ €$/, ''),
    [integer, decimals] = formatted.split(','),
    integerStyle: StyleProp<TextStyle> = {
      fontFamily: tokens.strongFont,
      fontSize: size,
      lineHeight: amountLineHeight,
      color,
    },
    decimalStyle: StyleProp<TextStyle> = {
      fontFamily: tokens.font,
      fontSize: decimalsSize,
      lineHeight: decimalsSize === 16 ? 18 : decimalsSize + 4,
      color,
    };
  return (
    <Text
      accessibilityLabel={
        cardMask && hidden ? '••••' : money(value, hidden, signed)
      }
      style={[
        styles.amount,
        {
          color,
          fontSize: size,
          lineHeight: amountLineHeight,
        },
      ]}
    >
      <Text style={integerStyle}>
        {hidden ? (cardMask ? '••••' : integer.replace(/\d/g, '*')) : integer}
      </Text>
      {!(hidden && cardMask) && (
        <Text style={decimalStyle}>
          {`,`}
          {hidden ? '**' : decimals} €
        </Text>
      )}
    </Text>
  );
}
const styles = StyleSheet.create({ amount: { fontFamily: tokens.font } });
