import React from 'react';
import {
  resolveCardArt,
  type CardArtVariant,
} from '@/app/components/contracts/imageArtwork';
import { BaselineImageArtwork } from './images/BaselineImageArtwork';
import { getArtworkAsset } from './images/artworkAssets';

export interface BaselineCardArtProps {
  variant?: CardArtVariant;
  width?: number;
  ariaLabel?: string;
}

/** Full page-7 Card art; does not use the separate 64×40 row-art contract. */
export function BaselineCardArt({
  variant,
  width,
  ariaLabel,
}: BaselineCardArtProps = {}) {
  const artwork = resolveCardArt({ variant, width });
  return (
    <BaselineImageArtwork
      artwork={artwork}
      asset={getArtworkAsset(artwork.nodeId)}
      ariaLabel={ariaLabel}
    />
  );
}
