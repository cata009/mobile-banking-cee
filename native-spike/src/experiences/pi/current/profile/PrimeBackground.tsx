import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { primeBackground } from './assets';
import { useSourceColors } from './Primitives';
export default function PrimeBackground() {
  const color = useSourceColors(),
    { width, height } = useDemoViewport();
  const angle = (209.194 * Math.PI) / 180,
    dx = Math.sin(angle),
    dy = -Math.cos(angle),
    length = Math.abs(width * dx) + Math.abs(height * dy);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient
            id="prime-base"
            gradientUnits="userSpaceOnUse"
            x1={(width - dx * length) / 2}
            y1={(height - dy * length) / 2}
            x2={(width + dx * length) / 2}
            y2={(height + dy * length) / 2}
          >
            <Stop offset="32.305%" stopColor={color('--uc-product-blue')} />
            <Stop offset="60.005%" stopColor={color('--uc-static-black')} />
          </LinearGradient>
          <RadialGradient
            id="prime-deep"
            cx="50.13%"
            cy="50.06%"
            rx="61.85%"
            ry="49.94%"
          >
            <Stop
              offset="0"
              stopColor={color('--uc-product-blue-deep')}
              stopOpacity={0.2}
            />
            <Stop offset="1" stopColor="black" stopOpacity={0.2} />
          </RadialGradient>
          <RadialGradient
            id="prime-light"
            cx="70%"
            cy="28.98%"
            rx="37.18%"
            ry="73.78%"
          >
            <Stop
              offset="0"
              stopColor={color('--uc-primary-k1')}
              stopOpacity={0}
            />
            <Stop
              offset="1"
              stopColor={color('--uc-primary-k1')}
              stopOpacity={0.2}
            />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#prime-base)" />
        <Rect width="100%" height="100%" fill="url(#prime-deep)" />
        <Rect width="100%" height="100%" fill="url(#prime-light)" />
      </Svg>
      <Image
        source={primeBackground}
        resizeMode="cover"
        style={[StyleSheet.absoluteFill, styles.art]}
      />
      <View style={[StyleSheet.absoluteFill, styles.shade]} />
    </View>
  );
}
const styles = StyleSheet.create({
  art: {
    width: '100%',
    height: '100%',
    opacity: 0.1,
    mixBlendMode: 'soft-light',
  },
  shade: { backgroundColor: 'rgba(0,0,0,0.2)' },
});
