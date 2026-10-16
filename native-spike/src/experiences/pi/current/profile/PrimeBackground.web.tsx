import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ViewStyle,
  type ImageStyle,
} from 'react-native';
import { primeBackground } from './assets';
import { useSourceColors } from './Primitives';
type CssStyle = ViewStyle & { backgroundImage?: string; mixBlendMode?: string };
export default function PrimeBackground() {
  const color = useSourceColors();
  const layer = (style: CssStyle) => (
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
      <Image
        source={primeBackground}
        resizeMode="cover"
        style={[StyleSheet.absoluteFill, styles.art]}
      />
      {layer({ backgroundColor: 'rgba(0,0,0,0.2)' })}
    </View>
  );
}
const styles = StyleSheet.create({
  art: {
    width: '100%',
    height: '100%',
    opacity: 0.1,
    mixBlendMode: 'soft-light',
  } as ImageStyle,
});
