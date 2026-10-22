import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import svgPaths from '@/imports/svg-i4inyt2jkm';
import { sourceColor } from './sourceColor';

export interface BaselineUniCreditLogoProps {
  /** Omit when surrounding content already identifies the bank. */
  ariaLabel?: string;
  /** Matches the existing web UniCreditLogo lettering color API. */
  textColor?: string;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  dark?: boolean;
}

/** Dedicated DS wordmark; preserves the existing web SVG paths and transforms. */
export function BaselineUniCreditLogo({
  ariaLabel,
  textColor = 'var(--uc-static-white)',
  width = 174,
  height = 24,
  style,
  dark = false,
}: BaselineUniCreditLogoProps) {
  // The bank mark is fixed artwork, matching the original SourceLogo in every theme.
  const brand = '#e2001a';
  const white = '#ffffff';
  const lettering = sourceColor(textColor, dark);

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 174 24"
      fill="none"
      style={style}
      accessible={Boolean(ariaLabel)}
      accessibilityRole={ariaLabel ? 'image' : undefined}
      accessibilityLabel={ariaLabel}
      accessibilityElementsHidden={!ariaLabel}
      importantForAccessibility={ariaLabel ? 'yes' : 'no-hide-descendants'}
    >
      <G transform="translate(0, 1.2)">
        <Path d={svgPaths.p1c620d00} fill={brand} />
        <Path d={svgPaths.p17bca3c0} fill={brand} />
        <Path
          d={svgPaths.p2a77a780}
          fill={white}
          clipRule="evenodd"
          fillRule="evenodd"
        />
      </G>
      <G transform="translate(27.5, 2.8)">
        {[
          svgPaths.p2bbcf1c0,
          svgPaths.p31616600,
          svgPaths.p2cf54f00,
          svgPaths.p1776a200,
          svgPaths.p2f2c2800,
          svgPaths.p5e6d200,
          svgPaths.p3aedad60,
          svgPaths.p1cf60e80,
          svgPaths.p1ebae3f0,
          svgPaths.p378e5e80,
          svgPaths.p159ffa60,
          svgPaths.p5405500,
          svgPaths.p2cc5f200,
        ].map((path, index) => (
          <Path key={index} d={path} fill={lettering} />
        ))}
      </G>
    </Svg>
  );
}
