import React from 'react';
import { Image, Pressable, View, type ViewStyle } from 'react-native';
import {
  resolveProductMenuCard,
  type MarketingCardVariant,
} from '@/app/components/contracts/marketingCard';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';

/** Original raster references or caller-supplied original artwork; no fallback illustrations are redrawn. */
export function BaselineProductMenuCard({
  card,
  variant = 'standard',
  badgeCount,
  onPress,
  artwork,
  dark = false,
}: {
  card: {
    id: string;
    title: string;
    background: string;
    imageSrc?: string | number;
  };
  variant?: MarketingCardVariant;
  badgeCount?: number;
  onPress?: (card: {
    id: string;
    title: string;
    background: string;
    imageSrc?: string | number;
  }) => void;
  artwork?: React.ReactNode;
  dark?: boolean;
}) {
  const contract = resolveProductMenuCard({ id: card.id, variant, badgeCount });
  const rootStyle: ViewStyle = {
    width: '100%',
    height: contract.height,
    maxHeight: contract.height,
    padding: contract.padding,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: contract.gap,
    overflow: 'hidden',
    borderRadius: contract.radius,
    backgroundColor: sourceColor(card.background, dark),
  };
  const titleStyle = {
    zIndex: 10,
    fontFamily: 'UniCredit-bold',
    fontSize: contract.titleFontSize,
    color: sourceColor('var(--uc-text-inverse)', dark),
  };
  const imageStyle = { position: 'absolute' as const, ...contract.image };
  const badgeStyle = {
    zIndex: 10,
    padding: 2,
    borderRadius: 2,
    flexShrink: 0,
    backgroundColor: sourceColor('var(--uc-brand)', dark),
  };
  const badgeTextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 14,
    color: sourceColor('var(--uc-static-white)', dark),
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={card.title.replace(/\n/g, ' ')}
      onPress={() => onPress?.(card)}
      style={rootStyle}
    >
      <Text style={titleStyle}>{card.title}</Text>
      {contract.badgeText !== null && (
        <View style={badgeStyle}>
          <Text style={badgeTextStyle}>{contract.badgeText}</Text>
        </View>
      )}
      {card.imageSrc ? (
        <Image
          source={
            typeof card.imageSrc === 'number'
              ? card.imageSrc
              : { uri: card.imageSrc }
          }
          resizeMode="contain"
          style={imageStyle}
        />
      ) : (
        artwork
      )}
    </Pressable>
  );
}
