import React, { useState } from 'react';
import { Image, Pressable, View, Platform, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  resolvePaymentHero,
  type PaymentHeroPreset,
} from '@/app/components/contracts/paymentHero';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** Caller owns the original screenshot asset or CSS-art slot; no fallback artwork is redrawn. */
export function BaselinePaymentHero({
  item,
  imageVariant,
  imageSrc,
  artwork,
  disabled = false,
  onSelect,
  dark = false,
}: {
  item: { id: string; title: string; description: string };
  imageVariant?: PaymentHeroPreset;
  imageSrc?: string | number;
  artwork?: React.ReactNode;
  disabled?: boolean;
  onSelect?: (item: { id: string; title: string; description: string }) => void;
  dark?: boolean;
}) {
  const [width, setWidth] = useState(327),
    contract = resolvePaymentHero({
      title: item.title,
      imageVariant,
      disabled,
    });
  const rootStyle: ViewStyle = {
    width: '100%',
    height: contract.height,
    borderRadius: contract.radius,
    overflow: 'hidden',
    opacity: contract.opacity,
  };
  const bodyStyle: ViewStyle = {
    position: 'relative',
    zIndex: 10,
    height: '100%',
    width: '100%',
    paddingHorizontal: contract.paddingHorizontal,
    paddingTop: contract.paddingTop,
  };
  const titleStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.titleFontSize,
    lineHeight:
      typeof contract.titleLineHeight === 'number'
        ? contract.titleLineHeight
        : undefined,
    color: sourceColor('var(--uc-text)', dark),
  };
  const descriptionStyle = {
    fontFamily: 'UniCredit-regular',
    fontSize: contract.descriptionFontSize,
    marginTop: contract.descriptionMargin,
    color: sourceColor('var(--uc-text)', dark),
  };
  const imageStyle = { position: 'absolute' as const, ...contract.image };
  const backgroundStyle: ViewStyle = { position: 'absolute', inset: 0 };
  const textColor = sourceColor('var(--uc-text)', dark);
  const shadowRgb = [1, 3, 5]
    .map(start => parseInt(textColor.slice(start, start + 2), 16))
    .join(',');
  // Source paints its inset shadow above the gradient and below the artwork.
  const shadowStyle: ViewStyle = {
    position: 'absolute',
    inset: 0,
    borderRadius: contract.radius,
    boxShadow: `inset 0 0 0 1px rgba(${shadowRgb},0.06)`,
  };
  const webPaint =
    Platform.OS === 'web'
      ? ({
          backgroundImage: `linear-gradient(105deg, ${sourceColor(
            'var(--uc-surface-muted)',
            dark,
          )} 0%, ${sourceColor(
            'var(--uc-neutral-200)',
            dark,
          )} 48%, ${sourceColor('var(--uc-neutral-300)', dark)} 100%)`,
          boxShadow: shadowStyle.boxShadow,
        } as unknown as ViewStyle)
      : undefined;
  const angle = (105 * Math.PI) / 180,
    dx = Math.sin(angle),
    dy = -Math.cos(angle),
    length = Math.abs(width * dx) + Math.abs(120 * dy);
  const xml = `<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hero" gradientUnits="userSpaceOnUse" x1="${
    width / 2 - (dx * length) / 2
  }" y1="${60 - (dy * length) / 2}" x2="${width / 2 + (dx * length) / 2}" y2="${
    60 + (dy * length) / 2
  }"><stop offset="0" stop-color="${sourceColor(
    'var(--uc-surface-muted)',
    dark,
  )}"/><stop offset=".48" stop-color="${sourceColor(
    'var(--uc-neutral-200)',
    dark,
  )}"/><stop offset="1" stop-color="${sourceColor(
    'var(--uc-neutral-300)',
    dark,
  )}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#hero)"/></svg>`;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={contract.disabled}
      accessibilityState={{ disabled: contract.disabled }}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      onPress={() => {
        if (!contract.disabled) onSelect?.(item);
      }}
      style={[rootStyle, webPaint]}
    >
      {Platform.OS !== 'web' ? (
        <>
          <View style={backgroundStyle}>
            <SvgXml xml={xml} width="100%" height="100%" />
          </View>
          <View
            pointerEvents="none"
            testID="source-payment-hero-inset-shadow"
            style={shadowStyle}
          />
        </>
      ) : null}
      <View style={bodyStyle}>
        <Text style={titleStyle}>{item.title}</Text>
        <Text style={descriptionStyle}>{item.description}</Text>
      </View>
      {imageSrc ? (
        <Image
          source={typeof imageSrc === 'number' ? imageSrc : { uri: imageSrc }}
          resizeMode="contain"
          style={imageStyle}
        />
      ) : (
        artwork
      )}
    </Pressable>
  );
}
