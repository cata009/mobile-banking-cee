import React, { useId, useMemo } from 'react';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { namespaceSvgArtworkXml } from '../../../../../universal/VectorArtworkLayer';
import { cardGlyphs } from './vectorAssets';
export function CardArtwork({
  variant,
  width = 64,
  height = 40,
}: {
  variant: keyof typeof cardGlyphs;
  width?: number;
  height?: number;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const xml = useMemo(
    () => namespaceSvgArtworkXml(cardGlyphs[variant], `home-card-${id}`),
    [variant, id],
  );
  return (
    <AssetGlyph
      asset={`data:image/svg+xml;utf8,${encodeURIComponent(xml)}`}
      width={width}
      height={height}
    />
  );
}
