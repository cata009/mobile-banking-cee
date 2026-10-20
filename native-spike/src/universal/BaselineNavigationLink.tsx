import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { NAVIGATION_LINK } from '@/app/components/contracts/navigationLink';
import { Text } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
import { AssetGlyph } from './AssetGlyph';
import forthAsset from '@/assets/mobile-first/it/investments/funds/660985-imgNavigationAndActionForthK1.svg';
export function BaselineNavigationLink({
  text,
  onPress,
  dark = false,
  chevronSize,
  presentation = 'default',
}: {
  text: string;
  onPress?: () => void;
  dark?: boolean;
  chevronSize?: number;
  presentation?: 'default' | 'primary';
}) {
  const [hovered, setHovered] = useState(false);
  const state = NAVIGATION_LINK;
  const primary = presentation === 'primary';
  const color = sourceColor(
    primary ? 'var(--uc-action)' : `var(${state.colorToken})`,
    dark,
  );
  const pressableStyle1 = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: primary ? 4 : state.gap,
    minHeight: primary ? 24 : undefined,
    opacity: hovered ? state.hoverOpacity : 1,
  } as const;
  const textStyle2 = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.fontSize,
    lineHeight: primary ? 16 : undefined,
    color,
  } as const;
  const viewStyle3 = {
    width: primary ? 16 : state.iconSlot,
    height: primary ? 16 : state.iconSlot,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={pressableStyle1}
    >
      <Text style={textStyle2}>{text}</Text>
      <View style={viewStyle3}>
        {primary ? (
          <AssetGlyph
            asset={forthAsset}
            width={16}
            height={16}
            tintColor={color}
          />
        ) : (
          <SourceCustomIcon
            name="chevron-link"
            color={color}
            size={chevronSize ?? (primary ? 16 : undefined)}
          />
        )}
      </View>
    </Pressable>
  );
}
