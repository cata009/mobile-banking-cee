import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { sourceColor } from '../../../../universal/sourceColor';
type BackgroundStyle = ViewStyle & {
  backgroundImage: string;
  backgroundBlendMode: string;
};
/** The original Home badge CSS layers, confined to the Native Web renderer. */
export default function PrimeBackground({ dark }: { dark: boolean }) {
  const color = (name: string) => sourceColor(`var(${name})`, dark);
  const style: BackgroundStyle = {
    ...StyleSheet.absoluteFill,
    backgroundImage: `radial-gradient(37.18% 73.78% at 70% 28.98%, color-mix(in srgb, ${color('--uc-primary-k1')} 0%, transparent) 0%, color-mix(in srgb, ${color('--uc-primary-k1')} 20%, transparent) 100%), radial-gradient(61.85% 49.94% at 50.13% 50.06%, color-mix(in srgb, ${color('--uc-product-blue-deep')} 20%, transparent) 0%, color-mix(in srgb, ${color('--uc-static-black')} 20%, transparent) 100%), linear-gradient(193deg, ${color('--uc-product-blue')} -32.31%, ${color('--uc-static-black')} 60.01%)`,
    backgroundBlendMode: 'soft-light, normal, soft-light, normal',
  };
  return <View pointerEvents="none" style={style} />;
}
