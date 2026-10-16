import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Platform,
  Pressable,
  View,
  type TextStyle,
  type TextProps,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { getBrandLogo } from '@/app/config/brandLogos';
import type { CurrentScreenProps } from '../../../contracts';
import { Text } from '../../../../../../universal/Typography';
import { investmentColor } from '../Frame';

export type Host = CurrentScreenProps;
export function useLocalBack(host: Host, closeLocal: () => boolean) {
  const current = useRef(closeLocal);
  current.current = closeLocal;
  const registerBack = host.onBackHandlerChange;
  useEffect(() => {
    registerBack?.(() => current.current());
    return () => registerBack?.(null);
  }, [registerBack]);
}
export function Logo({
  id = 'unicredit',
  size = 32,
  label,
}: {
  id?: string;
  size?: number;
  label?: string;
}) {
  const logo = getBrandLogo(id);
  return logo ? (
    <View
      accessibilityRole="image"
      accessibilityLabel={label ?? logo.name}
      style={[styles.layout1, { width: size, height: size }]}
    >
      <SvgXml xml={logo.svg} width={size} height={size} />
    </View>
  ) : null;
}
export function Copy({
  host,
  children,
  size = 14,
  line = 17,
  bold = false,
  muted = false,
  style,
  numberOfLines,
  accessibilityRole,
}: {
  host: Host;
  children: React.ReactNode;
  size?: number;
  line?: number;
  bold?: boolean;
  muted?: boolean;
  style?: TextStyle;
  numberOfLines?: number;
  accessibilityRole?: TextProps['accessibilityRole'];
}) {
  const copyStyle: TextStyle = {
    fontFamily: bold ? 'UniCredit-bold' : 'UniCredit-regular',
    ...(Platform.OS === 'web'
      ? {
          fontFamily: `${
            bold ? 'UniCredit-bold' : 'UniCredit-regular'
          }, sans-serif`,
          fontWeight: bold ? ('700' as const) : ('400' as const),
          fontSynthesis: 'none',
          whiteSpace: numberOfLines === 1 ? 'nowrap' : 'normal',
        }
      : {}),
    fontSize: size,
    lineHeight: line,
    color: investmentColor(host, muted ? '--uc-text-muted' : '--uc-text'),
    ...style,
  };
  return (
    <Text accessibilityRole={accessibilityRole} numberOfLines={numberOfLines} style={copyStyle}>
      {children}
    </Text>
  );
}
export const percent = (value: number) =>
  `${value > 0 ? '+' : value < 0 ? '-' : ''}${Math.abs(value)
    .toFixed(2)
    .replace('.', ',')}%`;
export function FilterChoice({
  host,
  label,
  checked,
  checkbox = false,
  onPress,
}: {
  host: Host;
  label: string;
  checked: boolean;
  checkbox?: boolean;
  onPress(): void;
}) {
  const row = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: checkbox ? 56 : 48,
    paddingTop: checkbox ? 12 : 8,
    paddingBottom: checkbox ? 12 : 8,
    borderBottom: checkbox
      ? `1px solid ${investmentColor(host, '--uc-border')}`
      : undefined,
    fontFamily: checkbox ? 'UniCredit-bold' : 'UniCredit-regular',
    fontSize: 16,
    lineHeight: '24px',
    color: investmentColor(host, '--uc-text'),
  };
  if (Platform.OS === 'web')
    return React.createElement(
      'label',
      { style: row },
      React.createElement('input', {
        type: checkbox ? 'checkbox' : 'radio',
        name: checkbox ? undefined : 'investment-currency',
        checked,
        onChange: onPress,
        style: {
          width: 20,
          height: 20,
          margin: 0,
          accentColor: investmentColor(host, '--uc-action'),
        },
      }),
      label,
    );
  const selectedFill =
    checked && checkbox ? investmentColor(host, '--uc-action') : 'transparent';
  return (
    <Pressable
      accessibilityRole={checkbox ? 'checkbox' : 'radio'}
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[
        styles.layout2,
        checkbox ? styles.checkboxRow : styles.radioRow,
        {
          borderBottomColor: investmentColor(host, '--uc-border'),
        },
      ]}
    >
      <View
        style={[
          styles.layout3,
          checkbox ? styles.checkbox : styles.radio,
          {
            borderColor: investmentColor(
              host,
              checked ? '--uc-action' : '--uc-text-muted',
            ),
            backgroundColor: selectedFill,
          },
        ]}
      >
        {checked ? (
          checkbox ? (
            <Copy host={host} size={15} line={16} bold style={styles.layout4}>
              ✓
            </Copy>
          ) : (
            <View
              style={[
                styles.layout5,
                { backgroundColor: investmentColor(host, '--uc-action') },
              ]}
            />
          )
        ) : null}
      </View>
      <Copy host={host} size={16} line={24} bold={checkbox}>
        {label}
      </Copy>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkboxRow: { minHeight: 56, paddingVertical: 12, borderBottomWidth: 1 },
  radioRow: { minHeight: 48, paddingVertical: 8, borderBottomWidth: 0 },
  checkbox: { borderRadius: 2 },
  radio: { borderRadius: 10 },
  layout1: { flexShrink: 0 },
  layout2: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  layout3: {
    width: 20,
    height: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layout4: { color: '#fff' },
  layout5: { width: 10, height: 10, borderRadius: 5 },
});
