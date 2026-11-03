import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as flagModule from 'country-flag-icons/string/1x1';

const flags = flagModule as unknown as Record<string, string>;

const CURRENCY_COUNTRY: Record<string, string> = {
  BAM: 'BA',
  CHF: 'CH',
  CNY: 'CN',
  CZK: 'CZ',
  EUR: 'EU',
  GBP: 'GB',
  HUF: 'HU',
  PLN: 'PL',
  RON: 'RO',
  RSD: 'RS',
  USD: 'US',
};

/** Round flag for a country code, or for the country a currency stands for. */
export function CountryFlag({
  country,
  currency,
  size = 28,
}: {
  country?: string;
  currency?: string;
  size?: number;
}) {
  const requested = currency ? CURRENCY_COUNTRY[currency] : country;
  const code = requested === 'BA_BL' ? 'BA' : requested;
  const xml = (code && flags[code]) || flags.EU;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[s.roundel, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
}

const s = StyleSheet.create({
  roundel: {
    overflow: 'hidden',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
  },
});
