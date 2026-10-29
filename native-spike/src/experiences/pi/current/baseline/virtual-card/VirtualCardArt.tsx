import React from 'react';
import ferrariEvening from '@/assets/ro/virtual-card/ferrari-evening.png';
import ferrariMountain from '@/assets/ro/virtual-card/ferrari-mountain.png';
import ferrariRacing from '@/assets/ro/virtual-card/ferrari-racing.png';
import cat from '@/assets/ro/virtual-card/cat.png';
import tennis from '@/assets/ro/virtual-card/tennis.png';
import photography from '@/assets/ro/virtual-card/photography.png';
import alpineLake from '@/assets/ro/virtual-card/alpine-lake.png';
import mediterranean from '@/assets/ro/virtual-card/mediterranean.png';
import forest from '@/assets/ro/virtual-card/forest.png';
import type { VirtualCardDesign } from '@/features/cards/virtual-card/model';
import { BaselineCardArt } from '../../../../../universal/BaselineCardArt';
import { BaselineCardArtwork } from '../../../../../universal/BaselineCardArtwork';
import { virtualCardArtwork } from './artwork';

const photos = {
  'ferrari-evening': ferrariEvening,
  'ferrari-mountain': ferrariMountain,
  'ferrari-racing': ferrariRacing,
  cat,
  tennis,
  photography,
  'alpine-lake': alpineLake,
  mediterranean,
  forest,
} as const;
export function VirtualCardArt({
  design,
  width,
  ariaLabel,
}: {
  design: VirtualCardDesign;
  width: number;
  ariaLabel?: string;
}) {
  const photo =
    design in photos ? photos[design as keyof typeof photos] : undefined;
  if (photo)
    return (
      <BaselineCardArtwork
        variant="mc-virtual-standard-violet"
        ariaLabel={ariaLabel}
        backgroundPhoto={typeof photo === 'number' ? photo : { uri: photo }}
        style={{ width, height: (width * 138) / 219 }}
      />
    );
  return (
    <BaselineCardArt
      variant={virtualCardArtwork[design]}
      width={width}
      ariaLabel={ariaLabel}
    />
  );
}
