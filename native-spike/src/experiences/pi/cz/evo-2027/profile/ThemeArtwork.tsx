import React, { useId } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
  Path,
} from 'react-native-svg';
import {
  getApp2027Theme,
  type HomeTheme,
} from '@/features/products/evoAppearance';

/** Native vector rendition of Source theme swatches; original wallpaper resources are referenced directly. */
export function ThemeArtwork({
  theme,
  wallpaper = false,
}: {
  theme: HomeTheme;
  wallpaper?: boolean;
}) {
  const definition = getApp2027Theme(theme),
    id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const colors = definition.swatch.match(/#[a-fA-F0-9]{6}/g) ?? [
    '#f5f5f5',
    '#262626',
  ];
  const linear = definition.swatch.slice(
    definition.swatch.lastIndexOf('linear-gradient'),
  );
  const baseColors = linear.match(/#[a-fA-F0-9]{6}/g) ?? colors;
  const angle =
      (Number(linear.match(/\((\d+)deg/)?.[1] ?? 135) * Math.PI) / 180,
    dx = Math.sin(angle),
    dy = -Math.cos(angle);
  const radius = (Math.abs(dx) + Math.abs(dy)) / 2;
  const gradient = (
    <LinearGradient
      id={`theme-${id}`}
      x1={0.5 - dx * radius}
      y1={0.5 - dy * radius}
      x2={0.5 + dx * radius}
      y2={0.5 + dy * radius}
    >
      {baseColors.map((color, index) => (
        <Stop
          key={`${color}-${index}`}
          offset={
            theme === 'standard'
              ? index === 0
                ? '48%'
                : '49%'
              : `${(index / Math.max(1, baseColors.length - 1)) * 100}%`
          }
          stopColor={color}
        />
      ))}
    </LinearGradient>
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <Defs>
          {gradient}
          {theme === 'solar' || theme === 'nordlys' ? (
            <RadialGradient
              id={`glow-${id}`}
              cx="72%"
              cy={theme === 'solar' ? '28%' : '72%'}
              r="32%"
            >
              <Stop offset="0" stopColor="#fbb800" />
              <Stop offset="1" stopColor="#fbb800" stopOpacity={0} />
            </RadialGradient>
          ) : null}
        </Defs>
        <Rect width="100" height="100" fill={`url(#theme-${id})`} />
        {theme === 'solar' || theme === 'nordlys' ? (
          <Rect width="100" height="100" fill={`url(#glow-${id})`} />
        ) : null}
        {theme === 'blue-lines'
          ? Array.from({ length: 12 }, (_, index) => (
              <Path
                key={index}
                d={`M${index * 18 - 100} 0 l150 100`}
                stroke="#4fc6dd"
                strokeWidth={2}
              />
            ))
          : null}
        {theme === 'blockcraft' ? (
          <>
            <Path d="M0 0H100L50 50Z" fill="#9aa82f" />
            <Path d="M100 0V100L50 50Z" fill="#174c3c" />
            <Path d="M100 100H0L50 50Z" fill="#d3a02c" />
            <Path d="M0 100V0L50 50Z" fill="#748320" />
          </>
        ) : null}
      </Svg>
      {wallpaper && definition.image ? (
        <Image
          source={
            typeof definition.image === 'number'
              ? definition.image
              : { uri: definition.image }
          }
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );
}
