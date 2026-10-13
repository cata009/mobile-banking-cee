import React, { memo, useId } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Svg, { Defs, G, Mask, Rect } from 'react-native-svg';

export interface SoftShadowProps {
  width: number;
  height: number;
  radius: number;
  offsetY: number;
  /** CSS shadow blur radius; Gaussian sigma is half this value. */
  blur: number;
  color: string;
  opacity: number;
}

// Normal CDF approximation (absolute error < 8e-8), evaluated in logical units.
function normalCdf(value: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(value));
  const tail =
    (Math.exp((-value * value) / 2) / Math.sqrt(2 * Math.PI)) *
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return value >= 0 ? 1 - tail : tail;
}

/**
 * Android fallback for hardware Canvas paths whose BlurMaskFilter is ignored.
 * Smoothly nested vector contours approximate a Gaussian edge falloff without
 * relying on a hardware blur, bitmap assets, or a device-pixel blur-radius cap.
 * Callers keep their CSS boxShadow on web/iOS. This decoration never takes input.
 */
export const SoftShadow = memo(function ShadowDecoration({
  width,
  height,
  radius,
  offsetY,
  blur,
  color,
  opacity,
}: SoftShadowProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  if (Platform.OS !== 'android' || width <= 0 || height <= 0 || opacity <= 0)
    return null;
  const sigma = Math.max(0.1, blur / 2);
  const extent = Math.ceil(3 * sigma);
  const originalY = extent + Math.max(0, -offsetY);
  const canvasWidth = width + 2 * extent;
  const canvasHeight = height + 2 * extent + Math.abs(offsetY);
  const corner = Math.max(0, Math.min(radius, width / 2, height / 2));
  const maxOpacity = Math.min(1, opacity);
  const steps = Math.max(32, Math.ceil(12 * sigma));
  let accumulated = 0;
  const contours = Array.from({ length: steps + 1 }, (_, step) => {
    const distance = 3 * sigma - (6 * sigma * step) / steps;
    const desired = maxOpacity * normalCdf(-distance / sigma);
    const alpha = (desired - accumulated) / (1 - accumulated);
    accumulated = desired;
    const contourWidth = width + 2 * distance;
    const contourHeight = height + 2 * distance;
    if (contourWidth <= 0 || contourHeight <= 0) return null;
    return (
      <Rect
        key={step}
        x={extent - distance}
        y={originalY + offsetY - distance}
        width={contourWidth}
        height={contourHeight}
        rx={Math.max(
          0,
          Math.min(corner + distance, contourWidth / 2, contourHeight / 2),
        )}
        fill={color}
        fillOpacity={alpha}
      />
    );
  });
  return (
    <Svg
      pointerEvents="none"
      accessible={false}
      width={canvasWidth}
      height={canvasHeight}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      style={[styles.shadow, { left: -extent, top: -originalY }]}
    >
      <Defs>
        <Mask
          id={`soft-shadow-${id}`}
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={canvasWidth}
          height={canvasHeight}
        >
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill="#fff"
          />
          <Rect
            x={extent}
            y={originalY}
            width={width}
            height={height}
            rx={corner}
            fill="#000"
          />
        </Mask>
      </Defs>
      <G mask={`url(#soft-shadow-${id})`}>{contours}</G>
    </Svg>
  );
});
const styles = StyleSheet.create({ shadow: { position: 'absolute' } });
