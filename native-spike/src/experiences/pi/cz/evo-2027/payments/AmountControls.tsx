import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text, TextInput } from '../../../../../universal/Typography';
import {
  appendPaymentToken,
  evaluatePaymentExpression,
  paymentAmountPresets,
} from '@/app/utils/paymentAmountCalculator';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { tokens } from '../accounts/Primitives';

/** Original Evo expression policy, with a real native decimal input and native taps. */
export function AmountControls({
  expression,
  currency,
  onChange,
  error,
}: {
  expression: string;
  currency: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const evaluated = evaluatePaymentExpression(expression);
  const complete = Number.isFinite(evaluated);
  const hasOperator = /[+\-*/]/.test(expression);
  const display = expression
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−');
  const sized =
    hasOperator && complete
      ? `${display}=${String(evaluated).replace('.', ',')}`
      : display || '0';
  const fontSize =
    sized.length <= 6
      ? 48
      : sized.length <= 8
      ? 40
      : sized.length <= 10
      ? 34
      : sized.length <= 12
      ? 28
      : 24;
  const key = (
    label: string,
    action: () => void,
    disabled = false,
    keypad = false,
  ) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={action}
      style={[styles.key, keypad && styles.keypad, disabled && styles.disabled]}
    >
      {label === 'Delete digit' ? (
        <Svg
          width={25}
          height={25}
          viewBox="0 0 24 24"
          fill="none"
          stroke={tokens.text}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Exact lucide-react 0.487.0 Delete geometry used by Source (ISC). */}
          <Path d="M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
          <Path d="m12 9 6 6" />
          <Path d="m18 9-6 6" />
        </Svg>
      ) : (
        <Text style={[styles.keyText, keypad && styles.keypadText]}>
          {label === 'Decimal separator' ? ',' : label}
        </Text>
      )}
    </Pressable>
  );
  return (
    <View>
      <View style={styles.amountRow}>
        <TextInput
          accessibilityLabel="Amount"
          value={display}
          keyboardType="decimal-pad"
          autoFocus
          placeholder="0"
          placeholderTextColor={tokens.muted}
          onChangeText={value =>
            onChange(
              value
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/−/g, '-')
                .replace(/[^\d,+\-*/.]/g, '')
                .replace(/\./g, ',')
                .slice(0, 24),
            )
          }
          style={[styles.input, { fontSize, lineHeight: fontSize + 4 }]}
        />
        <Text style={styles.currency}>{currency}</Text>
      </View>
      {hasOperator && complete && (
        <Text accessibilityLiveRegion="polite" style={styles.result}>
          = {formatEvo2027Number(evaluated)} {currency}
        </Text>
      )}
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      <View
        style={styles.grid}
        accessibilityLabel={
          expression ? 'Amount calculator' : 'Suggested amounts'
        }
      >
        {expression ? (
          <>
            {(
              [
                ['+', '+'],
                ['−', '-'],
                ['×', '*'],
                ['÷', '/'],
              ] as const
            ).map(([label, token]) =>
              key(label, () => onChange(appendPaymentToken(expression, token))),
            )}
            {key(
              '=',
              () => {
                if (hasOperator && complete)
                  onChange(String(evaluated).replace('.', ','));
              },
              !hasOperator || !complete,
            )}
          </>
        ) : (
          paymentAmountPresets(currency).map(preset =>
            key(
              `${new Intl.NumberFormat('de-DE', {
                maximumFractionDigits: 0,
              }).format(preset)} ${currency}`,
              () => onChange(String(preset)),
            ),
          )
        )}
      </View>
      <View style={styles.grid} accessibilityLabel="Amount keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0'].map(token => (
          <View key={token} style={styles.keyCell}>
            {key(
              token === ',' ? 'Decimal separator' : token,
              () => onChange(appendPaymentToken(expression, token)),
              false,
              true,
            )}
          </View>
        ))}
        <View style={styles.keyCell}>
          {expression ? (
            key(
              'Delete digit',
              () => onChange(expression.slice(0, -1)),
              false,
              true,
            )
          ) : (
            <View style={styles.keypad} />
          )}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: 6,
    paddingTop: 34,
  },
  input: {
    minWidth: 54,
    maxWidth: '85%',
    padding: 0,
    textAlign: 'right',
    color: tokens.text,
    fontFamily: tokens.strongFont,
    includeFontPadding: false,
  },
  currency: { fontFamily: tokens.font, fontSize: 16, color: tokens.muted },
  result: {
    textAlign: 'center',
    marginTop: 8,
    fontFamily: tokens.strongFont,
    fontSize: 18,
    color: tokens.text,
  },
  error: {
    textAlign: 'center',
    color: '#e2001a',
    fontFamily: tokens.font,
    fontSize: 12,
    marginTop: 8,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  key: {
    flex: 1,
    minHeight: 44,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontFamily: tokens.strongFont, color: tokens.text, fontSize: 20 },
  keyCell: { width: '31.7%' },
  keypad: { minHeight: 50, borderWidth: 0, borderRadius: 12 },
  keypadText: { fontSize: 26 },
  disabled: { opacity: 0.4 },
});
