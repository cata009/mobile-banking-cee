import React from 'react';
import { View, type ViewStyle } from 'react-native';
import type { ResolvedImageArtwork } from '@/app/components/contracts/imageArtwork';
import { VectorArtworkLayer } from '../VectorArtworkLayer';

/** Original SVG source stays vector. The existing renderer namespaces mask/gradient IDs. */
export function BaselineImageArtwork({
  artwork,
  ariaLabel,
  asset,
}: {
  artwork: ResolvedImageArtwork;
  ariaLabel?: string;
  asset: string | number;
}) {
  const frameStyle: ViewStyle = {
    width: artwork.width,
    height: artwork.height,
    flexShrink: 0,
    overflow: artwork.clip ? 'hidden' : 'visible',
  };
  const sourceStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: artwork.intrinsicWidth,
    height: artwork.intrinsicHeight,
    transform: [{ scale: artwork.scale }],
    transformOrigin: 'top left',
  };
  return (
    <View
      accessible={Boolean(ariaLabel)}
      accessibilityLabel={ariaLabel}
      accessibilityRole={ariaLabel ? 'image' : undefined}
      accessibilityElementsHidden={!ariaLabel}
      importantForAccessibility={ariaLabel ? 'yes' : 'no-hide-descendants'}
      style={frameStyle}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={sourceStyle}
      >
        <VectorArtworkLayer
          asset={asset}
          width={artwork.svgWidth}
          height={artwork.svgHeight}
          fit="contain"
        />
      </View>
    </View>
  );
}
