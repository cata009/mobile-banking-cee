import React from 'react';
import { Pressable, View } from 'react-native';
import { AssetGlyph } from '../../../universal/AssetGlyph';
import { homeAssets as a } from './homeAssets';
import { homeStyles as s } from './homeStyles';
const Icon = AssetGlyph;
export function BrandToggle({
  profile,
  onPress,
}: {
  profile: 'UniCredit' | 'buddy';
  onPress: () => void;
}) {
  const layers = [
    [52, 7, 13.93, 18, 20.33],
    [52.44, 7.25, 12.87, 17.5, 14.69],
    [52.28, 7.58, 12.29, 17.19, 11.85],
    [52.53, 8, 11.33, 16.63, 7.39],
    [52.74, 8.42, 10.36, 16.01, 3.09],
    [52.93, 9, 9.29, 15, 0],
  ];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="UniCredit e buddy"
      onPress={onPress}
      style={s.brand}
    >
      <View
        style={[s.brandActive, profile === 'buddy' && s.brandBuddyActive]}
      />
      {layers.map(([left, top, width, height, angle], i) => (
        <View
          key={i}
          style={[
            s.absolute,
            {
              left,
              top,
              transform: [{ rotate: `${angle}deg` }],
            },
          ]}
        >
          <AssetGlyph
            asset={a.brandB[i]}
            width={width}
            height={height}
            fit="stretch"
          />
        </View>
      ))}
      <View style={s.brandLogo}>
        <Icon asset={a.unicredit} size={16} />
      </View>
    </Pressable>
  );
}
