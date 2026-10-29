import type { CardArtVariant } from '@/app/components/contracts/imageArtwork';
import type { VirtualCardDesign } from '@/features/cards/virtual-card/model';

export const virtualCardArtwork: Partial<
  Record<VirtualCardDesign, CardArtVariant>
> = {
  'clean-green': 'Virtual green',
  blue: 'Virtual blue',
  purple: 'Virtual violet',
};
