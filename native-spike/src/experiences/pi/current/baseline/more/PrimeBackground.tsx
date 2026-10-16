import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
  type ImageStyle,
} from 'react-native';
import type { CurrentScreenProps } from '../../contracts';
import LegacyBackground from '../../profile/PrimeBackground';
import { primeBackground } from '../../profile/assets';
import { sourceColor } from '../../../../../universal/sourceColor';
import { RasterImage } from '../offers/RasterImage';
type LayerStyle = ViewStyle & {
  backgroundImage?: string;
  mixBlendMode?: string;
};
export default function PrimeBackground({
  host,
}: {
  host: CurrentScreenProps;
}) {
  if (Platform.OS !== 'web') return <LegacyBackground />;
  const color = (name: string) =>
    sourceColor(`var(${name})`, host.tokens.background === '#121212');
  const layer = (style: LayerStyle) => (
    <View style={[StyleSheet.absoluteFill, style]} />
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {layer({
        backgroundImage: `linear-gradient(209.194deg, ${color(
          '--uc-product-blue',
        )} 32.305%, ${color('--uc-static-black')} 60.005%)`,
      })}
      {layer({
        mixBlendMode: 'soft-light',
        backgroundImage: `radial-gradient(61.85% 49.94% at 50.13% 50.06%, color-mix(in srgb, ${color(
          '--uc-product-blue-deep',
        )} 20%, transparent) 0%, color-mix(in srgb, ${color(
          '--uc-static-black',
        )} 20%, transparent) 100%)`,
      })}
      {layer({
        backgroundImage: `radial-gradient(37.18% 73.78% at 70% 28.98%, color-mix(in srgb, ${color(
          '--uc-primary-k1',
        )} 0%, transparent) 0%, color-mix(in srgb, ${color(
          '--uc-primary-k1',
        )} 20%, transparent) 100%)`,
      })}
      <RasterImage source={primeBackground} style={styles.art} />
      {layer({
        backgroundColor: sourceColor(
          'rgb(var(--uc-shadow-rgb) / 0.2)',
          host.tokens.background === '#121212',
        ),
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  art: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0.1,
    mixBlendMode: 'soft-light',
  } as ImageStyle,
});
