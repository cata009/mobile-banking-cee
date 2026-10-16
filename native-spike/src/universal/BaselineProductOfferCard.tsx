import React from 'react';
import {
  Image,
  Pressable,
  View,
  type ViewStyle,
  type ImageStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  resolveProductOfferCard,
  type MarketingCardVariant,
} from '@/app/components/contracts/marketingCard';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';

/** Tone and original banner image come from the existing feature/config owner. */
export function BaselineProductOfferCard({
  offer,
  tone,
  variant = 'standard',
  onPress,
  dark = false,
}: {
  offer: { id: string; title: string; description: string; caption?: string };
  tone: {
    backgroundColor: string;
    textColor: string;
    chevronColor: string;
    imageSrc: string | number;
  };
  variant?: MarketingCardVariant;
  onPress?: (offer: {
    id: string;
    title: string;
    description: string;
    caption?: string;
  }) => void;
  dark?: boolean;
}) {
  const contract = resolveProductOfferCard({ variant, caption: offer.caption }),
    color = sourceColor(tone.textColor, dark);
  const rootStyle: ViewStyle = {
    width: contract.width,
    height: contract.height,
    overflow: 'hidden',
    borderRadius: contract.radius,
    backgroundColor: sourceColor(tone.backgroundColor, dark),
  };
  const imageStyle: ImageStyle = {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    width: contract.imageWidth,
  };
  const chevronStyle: ViewStyle = {
    position: 'absolute',
    left: contract.chevron.left,
    top: 0,
  };
  const bodyStyle: ViewStyle = {
    zIndex: 10,
    height: '100%',
    justifyContent: 'center',
    paddingLeft: contract.paddingLeft,
    paddingRight: contract.paddingRight,
  };
  const contentStyle: ViewStyle = {
    gap: contract.gap,
    alignItems: 'flex-start',
  };
  const titleStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.titleFontSize,
    color,
  };
  const descriptionStyle = {
    fontFamily: 'UniCredit-regular',
    fontSize: contract.descriptionFontSize,
    color,
  };
  const captionStyle = {
    fontFamily: 'UniCredit-regular',
    fontSize: contract.captionFontSize,
    color,
  };
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${
    contract.chevron.viewBox
  }"><path fill-rule="evenodd" clip-rule="evenodd" d="${
    contract.chevron.path
  }" fill="${sourceColor(tone.chevronColor, dark)}"/></svg>`;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(offer)}
      style={rootStyle}
    >
      <View style={chevronStyle}>
        <SvgXml
          xml={xml}
          width={contract.chevron.width}
          height={contract.chevron.height}
        />
      </View>
      <Image
        source={
          typeof tone.imageSrc === 'number'
            ? tone.imageSrc
            : { uri: tone.imageSrc }
        }
        resizeMode="cover"
        style={imageStyle}
      />
      <View style={bodyStyle}>
        <View style={contentStyle}>
          <Text numberOfLines={contract.titleLines} style={titleStyle}>
            {offer.title}
          </Text>
          <Text
            numberOfLines={contract.descriptionLines}
            style={descriptionStyle}
          >
            {offer.description}
          </Text>
          {contract.showCaption && (
            <Text numberOfLines={1} style={captionStyle}>
              {offer.caption}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
