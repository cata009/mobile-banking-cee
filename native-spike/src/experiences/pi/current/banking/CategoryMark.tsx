import React from 'react';
import Svg, { Path } from 'react-native-svg';
import {
  normalizePfmCategory,
  type PfmCategoryName,
} from '@/data/pfmCategories';
import {
  PFM_CATEGORY_ICONS,
  PFM_ICON_GLYPH_PATHS,
  PFM_ICON_OPTICAL_SIZES,
  PFM_ICON_VIEW_BOXES,
} from './pfmGlyphs';
const colors: Partial<Record<PfmCategoryName, string>> = {
  Income: '#05829A',
  Groceries: '#A33694',
  Shopping: '#9A000B',
  Home: '#008574',
  Children: '#006375',
  Utilities: '#006375',
  Transportation: '#E67300',
  Transfers: '#359F42',
  Wallet: '#7E5B01',
  Education: '#5E3D32',
  Investments: '#363338',
  Insurance: '#004C3D',
  Finance: '#535453',
  Healthcare: '#DD1860',
  Lifestyle: '#388BCA',
  'Leisure time': '#E01E25',
  'Taxes and Penalties': '#7757A4',
  'Exclude from budget': '#B91823',
  Uncategorized: '#007A6B',
};
export function CategoryMark({
  category,
  size = 32,
  color,
}: {
  category: string;
  size?: number;
  color?: string;
}) {
  const normalized = normalizePfmCategory(category);
  const ratio = (PFM_ICON_OPTICAL_SIZES[normalized] ?? 20) / 20;
  const width = size * 0.75 * ratio;
  return (
    <Svg
      accessibilityLabel={normalized}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <Svg
        x={(size - width) / 2}
        y={(size - width) / 2}
        width={width}
        height={width}
        viewBox={PFM_ICON_VIEW_BOXES[normalized] ?? '0 0 20 20'}
      >
        {(
          PFM_ICON_GLYPH_PATHS[normalized] ??
          PFM_CATEGORY_ICONS[normalized] ??
          PFM_CATEGORY_ICONS.Uncategorized ??
          []
        ).map((path, index) => (
          <Path key={index} {...path} fill={color ?? colors[normalized] ?? '#888888'} />
        ))}
      </Svg>
    </Svg>
  );
}
