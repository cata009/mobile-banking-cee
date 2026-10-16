import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { NAVIGATION_LINK } from '@/app/components/contracts/navigationLink';
import { Text } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
export function BaselineNavigationLink({
  text,
  onPress,
  dark = false,
  chevronSize,
}: {
  text: string;
  onPress?: () => void;
  dark?: boolean;
  chevronSize?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const state = NAVIGATION_LINK;
  const color = sourceColor(`var(${state.colorToken})`, dark);
  const pressableStyle1 = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: state.gap,
    opacity: hovered ? state.hoverOpacity : 1,
  } as const;
  const textStyle2 = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.fontSize,
    color,
  } as const;
  const viewStyle3 = {
    width: state.iconSlot,
    height: state.iconSlot,
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
        <SourceCustomIcon
          name="chevron-link"
          color={color}
          size={chevronSize}
        />
      </View>
    </Pressable>
  );
}
