import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../../../../../universal/Typography';
import { getPfmCategory } from '@/data/pfmCategories';
import {
  PFM_CATEGORY_ICONS,
  PFM_ICON_OPTICAL_SIZES,
  PFM_ICON_VIEW_BOXES,
} from './categoryPaths';

const colors: Record<string, string> = {
  '--uc-teal-900': '#006375',
  '--uc-teal-bright': '#00a197',
  '--uc-text': '#262626',
  '--uc-neutral-600': '#909090',
  '--uc-pfm-taxes-penalties': '#7757a4',
  '--uc-pfm-income': '#05829a',
  '--uc-pfm-utilities': '#006375',
  '--uc-pfm-exclude-budget': '#b91823',
  '--uc-pfm-shopping': '#9a000b',
  '--uc-pfm-insurance': '#004c3d',
  '--uc-pfm-groceries': '#a33694',
  '--uc-pfm-home': '#008574',
  '--uc-pfm-education': '#5e3d32',
  '--uc-pfm-lifestyle': '#388bca',
  '--uc-pfm-transportation': '#e67300',
  '--uc-pfm-leisure-time': '#e01e25',
  '--uc-pfm-healthcare': '#dd1860',
  '--uc-pfm-investments': '#363338',
  '--uc-pfm-children': '#006375',
  '--uc-pfm-wallet': '#7e5b01',
  '--uc-pfm-transfers': '#359f42',
  '--uc-pfm-finance': '#535453',
  '--uc-pfm-uncategorized': '#007a6b',
};
export function categoryColor(variable: string) {
  return colors[variable] ?? '#909090';
}
export function CategoryMark({
  category,
  size = 32,
}: {
  category: string;
  size?: number;
}) {
  const definition = getPfmCategory(category);
  const paths = PFM_CATEGORY_ICONS[definition.name];
  const opticalSize = PFM_ICON_OPTICAL_SIZES[definition.name] ?? 20;
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={definition.name}
      style={[
        sourceStyles.alignItemscenterjustifyContentcenter,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: categoryColor(definition.colorVar),
        },
      ]}
    >
      {paths ? (
        <Svg
          width={opticalSize}
          height={opticalSize}
          viewBox={PFM_ICON_VIEW_BOXES[definition.name] ?? '0 0 20 20'}
        >
          {paths.map((p, i) => (
            <Path key={i} {...p} fill="#ffffff" />
          ))}
        </Svg>
      ) : (
        <Text style={sourceStyles.colorffffff}>
          {definition.fallbackInitial}
        </Text>
      )}
    </View>
  );
}

const sourceStyles = StyleSheet.create({
  alignItemscenterjustifyContentcenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorffffff: { color: '#ffffff' },
});
