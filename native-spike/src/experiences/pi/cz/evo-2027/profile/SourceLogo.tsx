import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import svgPaths from '@/imports/svg-i4inyt2jkm';

/** Exact paths/transforms from Source UniCreditLogo; original brand SVG stays vector. */
export function SourceLogo({
  color = '#ffffff',
  width = 174,
  height = 24,
}: {
  color?: string;
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 174 24" fill="none">
      <G transform="translate(0, 1.2)">
        <Path d={svgPaths.p1c620d00} fill="#e2001a" />
        <Path d={svgPaths.p17bca3c0} fill="#e2001a" />
        <Path
          d={svgPaths.p2a77a780}
          fill="#ffffff"
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
          <Path key={index} d={path} fill={color} />
        ))}
      </G>
    </Svg>
  );
}
