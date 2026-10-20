import React, { useId } from 'react';
import { Image, StyleSheet, View, type ImageStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { primeBackground } from '../experiences/pi/current/profile/assets';
import { STANDARD_FILL_SVGS } from './primeStandardFills';

/** The same original affine Standard paint is used by the advisor page and home entry. */
export function PrimeStandardBackground({ badge = false }: { badge?: boolean } = {}) {
  const prefix = useId().replace(/[^a-z0-9]/gi, '');
  return <View testID={badge ? 'standard-badge-background' : 'standard-advisor-background'} pointerEvents="none" style={StyleSheet.absoluteFill}>
    {STANDARD_FILL_SVGS.map((xml, index) => <View key={index} style={[StyleSheet.absoluteFill, index === 1 && s.softLight]}><SvgXml xml={xml.replaceAll('standard-fill-', `${prefix}-standard-fill-`)} width="100%" height="100%" /></View>)}
    <Image source={primeBackground} resizeMode="cover" style={[StyleSheet.absoluteFill, s.texture]} />
    <View style={[StyleSheet.absoluteFill, s.shade]} />
  </View>;
}
const s = StyleSheet.create({ softLight: { mixBlendMode: 'soft-light' }, texture: { width: '100%', height: '100%', opacity: 0.1, mixBlendMode: 'soft-light' } as ImageStyle, shade: { backgroundColor: 'rgba(0,0,0,0.2)' } });
