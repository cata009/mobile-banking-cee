import React from 'react';
import {
  Platform,
  Pressable,
  View,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  resolveProductOfferCard,
  type MarketingCardVariant,
} from '@/app/components/contracts/marketingCard';
import { RasterImage } from '../experiences/pi/current/baseline/offers/RasterImage';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';

export interface ProductOfferCardData {
  id: string;
  title: string;
  description: string;
  caption?: string;
}

/** Canonical campaign renderer; feature owners supply tone, original asset and action. */
export function BaselineProductOfferCard({
  offer,
  tone,
  variant = 'standard',
  onPress,
  dark = false,
  presentation,
  artwork,
}: {
  offer: ProductOfferCardData;
  tone: {
    backgroundColor: string;
    textColor: string;
    chevronColor: string;
    imageSrc: string | number;
  };
  variant?: MarketingCardVariant;
  onPress?: (offer: ProductOfferCardData) => void;
  dark?: boolean;
  presentation?: {
    width?: number;
    height?: number;
    radius?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    titleFontSize?: number;
    titleLineHeight?: number;
    titleLines?: number;
    descriptionFontSize?: number;
    descriptionLineHeight?: number;
    descriptionLines?: number;
    captionFontSize?: number;
    captionLineHeight?: number;
    gap?: number;
  };
  artwork?: React.ReactNode;
}) {
  const contract = {
    ...resolveProductOfferCard({ variant, caption: offer.caption }),
    ...presentation,
  };
  const color = sourceColor(tone.textColor, dark);
  const rootStyle: ViewStyle = {
    width: contract.width,
    height: contract.height,
    overflow: 'hidden',
    borderRadius: contract.radius,
    backgroundColor: sourceColor(tone.backgroundColor, dark),
  };
  const chevronStyle: ViewStyle = {
    position: 'absolute',
    left: contract.chevron.left,
    top: '50%',
    transform: [{ translateY: -contract.chevron.height / 2 }],
  };
  const photoStyle: ImageStyle = {
    position: 'absolute',
    right: 0,
    top: 0,
    width: contract.imageWidth,
    height: contract.height,
  };
  const bodyStyle: ViewStyle = {
    zIndex: 10,
    height: '100%',
    justifyContent: contract.contentAlign,
    paddingLeft: contract.paddingLeft,
    paddingRight: contract.paddingRight,
    paddingTop: contract.paddingTop,
    paddingBottom: contract.paddingBottom,
  };
  const copyStyle: ViewStyle = { gap: contract.gap, alignItems: 'flex-start' };
  const titleStyle: TextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.titleFontSize,
    lineHeight: contract.titleLineHeight,
    alignSelf: 'stretch',
    color,
  };
  const descriptionStyle: TextStyle = {
    fontFamily: 'UniCredit-regular',
    fontSize: contract.descriptionFontSize,
    lineHeight: contract.descriptionLineHeight,
    alignSelf: 'stretch',
    color,
  };
  const captionStyle: TextStyle = {
    fontFamily: 'UniCredit-regular',
    fontSize: contract.captionFontSize,
    lineHeight: contract.captionLineHeight,
    color,
  };
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(offer)}
      style={rootStyle}
    >
      {artwork !== undefined ? (
        artwork
      ) : (
        <>
          {Platform.OS === 'web' ? (
            React.createElement(
              'svg',
              {
                'aria-hidden': true,
                viewBox: contract.chevron.viewBox,
                preserveAspectRatio: 'xMidYMid meet',
                style: {
                  position: 'absolute',
                  left: contract.chevron.left,
                  top: '50%',
                  width: contract.chevron.width,
                  height: contract.chevron.height,
                  transform: 'translateY(-50%)',
                },
              },
              React.createElement('path', {
                fillRule: 'evenodd',
                clipRule: 'evenodd',
                d: contract.chevron.path,
                fill: sourceColor(tone.chevronColor, dark),
              }),
            )
          ) : (
            <Svg
              width={contract.chevron.width}
              height={contract.chevron.height}
              viewBox={contract.chevron.viewBox}
              style={chevronStyle}
            >
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d={contract.chevron.path}
                fill={sourceColor(tone.chevronColor, dark)}
              />
            </Svg>
          )}
          <RasterImage
            source={
              typeof tone.imageSrc === 'number'
                ? tone.imageSrc
                : { uri: tone.imageSrc }
            }
            resizeMode="cover"
            style={photoStyle}
          />
        </>
      )}
      <View style={bodyStyle}>
        <View style={copyStyle}>
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
