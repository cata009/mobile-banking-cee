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
export default function PrimeBackground({ variant = 'prime', badge = false }: { variant?: 'prime' | 'private'; badge?: boolean } = {}) {
  const isPrivate = variant === 'private';
  const affineBadge = isPrivate && badge;
  const color = useSourceColors(),
    viewport = useDemoViewport();
  const width = badge ? 141 : viewport.width, height = badge ? 32 : viewport.height;
  const angle = ((isPrivate ? badge ? 186.335 : 206 : 209.194) * Math.PI) / 180,
    dx = Math.sin(angle),
    dy = -Math.cos(angle),
    length = Math.abs(width * dx) + Math.abs(height * dy);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient
            id="prime-base"
            gradientUnits={affineBadge ? 'objectBoundingBox' : 'userSpaceOnUse'}
            gradientTransform={affineBadge ? 'matrix(-0.526367514782241 1.3352048089244397 -1.2778686852150096 -0.6251349915717538 1.6666351523424976 -0.38534921231275354)' : undefined}
            x1={affineBadge ? 0 : (width - dx * length) / 2 + (isPrivate ? dx * length * -0.4726 : 0)}
            y1={affineBadge ? 0.5 : (height - dy * length) / 2 + (isPrivate ? dy * length * -0.4726 : 0)}
            x2={affineBadge ? 1 : isPrivate ? (width - dx * length) / 2 + dx * length * 0.5918 : (width + dx * length) / 2}
            y2={affineBadge ? 0.5 : isPrivate ? (height - dy * length) / 2 + dy * length * 0.5918 : (height + dy * length) / 2}
          >
            <Stop offset={isPrivate ? affineBadge ? '0.4807692486792803%' : '0%' : '32.305%'} stopColor={isPrivate ? '#ffffff' : color('--uc-product-blue')} />
            <Stop offset={isPrivate ? '100%' : '60.005%'} stopColor={isPrivate ? '#222222' : color('--uc-static-black')} />
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
              stopColor={isPrivate ? '#fee2aa' : color('--uc-product-blue-deep')}
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
