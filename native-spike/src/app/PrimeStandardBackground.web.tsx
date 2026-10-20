import React from 'react';
import { StyleSheet, View, type ViewStyle, type ImageStyle } from 'react-native';
import { RasterImage } from '../experiences/pi/current/baseline/offers/RasterImage';
import { primeBackground } from '../experiences/pi/current/profile/assets';
import { STANDARD_BACKGROUND_LAYERS } from './primeStandardFills';

export function PrimeStandardBackground({ badge = false }: { badge?: boolean } = {}) {
  return <View testID={badge ? 'standard-badge-background' : 'standard-advisor-background'} pointerEvents="none" style={StyleSheet.absoluteFill}>
    {STANDARD_BACKGROUND_LAYERS.map((backgroundImage,index) => <View key={index} style={[StyleSheet.absoluteFill,{ backgroundImage, ...(index === 1 ? { mixBlendMode: 'soft-light' } : {}) } as ViewStyle]} />)}
    <RasterImage source={primeBackground} style={s.texture} />
    <View style={[StyleSheet.absoluteFill, s.shade]} />
  </View>;
}
const s = StyleSheet.create({ texture: { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1, mixBlendMode: 'soft-light' } as ImageStyle, shade: { backgroundColor: 'rgba(0,0,0,0.2)' } });
