import React, { useId, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { sourceColor } from '../../../../universal/sourceColor';
/** Same Source badge layers/angle/stop positions. Device blend fidelity requires validation. */
export default function PrimeBackground({ dark }: { dark: boolean }) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const id = useId().replace(/[^a-z0-9]/gi, '');
  const color = (name: string) => sourceColor(`var(${name})`, dark);
  const a = (193 * Math.PI) / 180,
    dx = Math.sin(a),
    dy = -Math.cos(a),
    length = Math.abs(size.width * dx) + Math.abs(size.height * dy);
  const start = {
    x: (size.width - dx * length) / 2,
    y: (size.height - dy * length) / 2,
  };
  const base = id + 'base',
    deep = id + 'deep',
    light = id + 'light';
  return (
    <View
      pointerEvents="none"
      style={styles.host}
      onLayout={e => setSize(e.nativeEvent.layout)}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient
            id={base}
            gradientUnits="userSpaceOnUse"
            x1={start.x + dx * length * -0.3231}
            y1={start.y + dy * length * -0.3231}
            x2={start.x + dx * length * 0.6001}
            y2={start.y + dy * length * 0.6001}
          >
            <Stop offset="0" stopColor={color('--uc-product-blue')} />
            <Stop offset="1" stopColor={color('--uc-static-black')} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${base})`} />
      </Svg>
      <View style={styles.layer}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient
              id={deep}
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
              <Stop
                offset="1"
                stopColor={color('--uc-static-black')}
                stopOpacity={0.2}
              />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${deep})`} />
        </Svg>
      </View>
      <View style={styles.highlight}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient
              id={light}
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
          <Rect width="100%" height="100%" fill={`url(#${light})`} />
        </Svg>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  host: StyleSheet.absoluteFill,
  layer: StyleSheet.absoluteFill,
  highlight: { ...StyleSheet.absoluteFill, mixBlendMode: 'soft-light' },
});
