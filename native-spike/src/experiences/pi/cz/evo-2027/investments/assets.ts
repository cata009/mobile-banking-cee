import intro from '@/assets/investments/robo-advisor-intro.png';
import goalsSummary from '@/assets/investments/goals-summary-illustration.png';
import onemarket from '@/assets/investments/funds/fund-onemarket.png';
import selectionPlus from '@/assets/investments/funds/fund-selection-plus.png';
import featured from '@/assets/investments/funds/fund-featured.png';
import equity from '@/assets/investments/funds/fund-equity.png';
import balanced from '@/assets/investments/funds/fund-balanced.png';
import conservative from '@/assets/investments/funds/fund-conservative.png';
import amundi from '@/assets/investments/funds/fund-amundi-logo.png';
import quit from '@/assets/investments/robo-quit-info-large.svg';
import type { ImageSourcePropType } from 'react-native';

/** Original Source assets; imports resolve to URLs on RNWeb and bundled resources on device. */
export const investmentAssets = {
  intro,
  goalsSummary,
  quit,
  amundi,
  collections: {
    onemarket,
    'selection-plus': selectionPlus,
    featured,
    equity,
    balanced,
    conservative,
  },
};
export function investmentImageSource(
  value: string | number,
): ImageSourcePropType {
  return typeof value === 'number' ? value : { uri: value };
}
