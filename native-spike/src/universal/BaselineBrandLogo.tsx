import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { getBrandLogo } from '@/app/config/brandLogos';

/** A brand mark by logo id (bank, security issuer, merchant), square, with an accessible name. */
export function BaselineBrandLogo({
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
      style={[styles.fixed, { width: size, height: size }]}
    >
      <SvgXml xml={logo.svg} width={size} height={size} />
    </View>
  ) : null;
}

const styles = StyleSheet.create({ fixed: { flexShrink: 0 } });
