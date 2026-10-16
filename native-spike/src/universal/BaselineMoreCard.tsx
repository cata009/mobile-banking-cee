import React, { useState } from 'react';
import { Image, Pressable, View, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  resolveMoreCard,
  type MoreCardVariant,
} from '@/app/components/contracts/moreCard';
import { MoreArtwork } from '../experiences/pi/current/profile/MoreArtwork';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';

/** Reuses the existing original Source assets/crops; platform theme filters remain unverified. */
export function BaselineMoreCard({
  variant,
  title,
  onPress,
  badgeCount,
  image,
  width = 155.5,
  dark = false,
}: {
  variant: MoreCardVariant;
  title: string;
  onPress: () => void;
  badgeCount?: number;
  image?: string | number;
  width?: number;
  dark?: boolean;
}) {
  const contract = resolveMoreCard({ variant, badgeCount }),
    [hovered, setHovered] = useState(false);
  const rootStyle: ViewStyle = {
    height: contract.height,
    width,
    overflow: 'hidden',
    borderRadius: contract.radius,
    opacity: hovered ? contract.hoverOpacity : 1,
  };
  const titleContainer: ViewStyle = {
    position: 'absolute',
    inset: 0,
    padding: contract.padding,
  };
  const titleStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.titleFontSize,
    color: sourceColor('var(--uc-text)', dark),
  };
  const backgroundStyle: ViewStyle = { position: 'absolute', inset: 0 };
  const baseImageContainer: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '50%',
    height: '50%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  };
  const baseImageStyle = {
    width: '100%' as const,
    height: '100%' as const,
    transform: [{ scale: 0.9 }],
    transformOrigin: 'bottom right',
  };
  const badgeStyle: ViewStyle = {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    zIndex: 20,
  };
  const badgeCorner: ViewStyle = {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 30,
    height: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: sourceColor('var(--uc-brand)', dark),
  };
  const badgeNumber: ViewStyle = { position: 'absolute', right: 7, top: 4 };
  const badgeTextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 14,
    color: sourceColor('var(--uc-static-white)', dark),
  };
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 120"><defs><linearGradient id="more-gradient"><stop offset="0" stop-color="${sourceColor(
    'var(--uc-app-bg)',
    dark,
  )}"/><stop offset="1" stop-color="${sourceColor(
    'var(--uc-neutral-400)',
    dark,
  )}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#more-gradient)"/></svg>`;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={rootStyle}
    >
      <View style={backgroundStyle}>
        <SvgXml xml={xml} width={width} height={contract.height} />
      </View>
      {variant === 'base' ? (
        image && (
          <View style={baseImageContainer}>
            <Image
              source={typeof image === 'number' ? image : { uri: image }}
              resizeMode="contain"
              style={baseImageStyle}
            />
          </View>
        )
      ) : (
        <MoreArtwork card={variant} cardWidth={width} />
      )}
      <View style={titleContainer}>
        <Text style={titleStyle}>{title}</Text>
      </View>
      {contract.badgeText !== null && (
        <View style={badgeStyle}>
          <View style={badgeCorner} />
          <View style={badgeNumber}>
            <Text style={badgeTextStyle}>{contract.badgeText}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
