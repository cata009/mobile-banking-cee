import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { insuranceAssets as a } from '@/experiences/pi/it/mobile-first/insuranceAssets';
import { ActionButton } from '../../../../universal/ActionButton';

export function InsuranceButton(
  props: React.ComponentProps<typeof ActionButton>,
) {
  return (
    <ActionButton
      {...props}
      containerStyle={[
        p.button,
        props.secondary && p.secondaryButton,
        props.disabled && p.disabledButton,
        props.containerStyle,
      ]}
      labelStyle={[
        p.buttonLabel,
        props.disabled && p.disabledLabel,
        props.labelStyle,
      ]}
    />
  );
}

export function InsuranceLink({
  label,
  text,
  onPress,
  disabled = false,
  asset = a.forth,
  glyphSize = 16,
}: {
  label: string;
  text?: string;
  onPress: () => void;
  disabled?: boolean;
  asset?: string | number;
  glyphSize?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={[p.link, disabled && p.disabled]}
    >
      <Text style={p.linkLabel}>{(text ?? label).toLocaleUpperCase('it')}</Text>
      <AssetGlyph asset={asset} size={glyphSize} />
    </Pressable>
  );
}

export function InsuranceAmount({
  value,
  hidden,
  compact = false,
}: {
  value: number;
  hidden: boolean;
  compact?: boolean;
}) {
  const [integer, decimals] = value
    .toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: 'always',
    })
    .split(',');
  return (
    <Text style={[p.integer, compact && p.compactInteger]}>
      {hidden ? integer.replace(/\d/g, '*') : integer}
      <Text style={[p.decimals, compact && p.compactDecimals]}>
        ,{hidden ? '**' : decimals} €
      </Text>
    </Text>
  );
}

const p = StyleSheet.create({
  button: { borderWidth: 1, borderColor: 'transparent', borderRadius: 120 },
  buttonLabel: { fontSize: 18, lineHeight: 24 },
  secondaryButton: { backgroundColor: '#fff', borderColor: '#262626' },
  disabledButton: { opacity: 1, backgroundColor: '#e5e5e5' },
  disabledLabel: { color: '#909090' },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 24,
    alignSelf: 'flex-start',
  },
  linkLabel: {
    fontFamily: tokens.strongFont,
    color: tokens.accent,
    fontSize: 14,
    lineHeight: 16,
  },
  disabled: { opacity: 0.5 },
  integer: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 24,
    lineHeight: 26,
  },
  decimals: { fontFamily: tokens.font, fontSize: 16, lineHeight: 18 },
  compactInteger: { fontSize: 18, lineHeight: 20 },
  compactDecimals: { fontSize: 14, lineHeight: 16 },
});
