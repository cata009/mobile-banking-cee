import React from 'react';
import { Image, Pressable, View, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  resolveShopsmartOfferCard,
  SHOPSMART_GIFT_PATH,
} from '@/app/components/contracts/marketingCard';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
import { SourceCustomIcon } from './SourceCustomIcon';
import { BaselinePill } from './BaselinePill';

export function BaselineShopsmartOfferCard({
  merchant,
  title,
  statusText,
  imageSrc,
  imageAlt,
  imageHeight = 130,
  imageOverlay = false,
  imageLayer,
  pillLabel,
  pillTone = 'teal',
  tagLabel,
  distance,
  trailingIcon = 'website',
  variant = 'default',
  onPress,
  dark = false,
}: {
  merchant: string;
  title: string;
  statusText: string;
  imageSrc: string | number;
  imageAlt?: string;
  imageHeight?: 130 | 143;
  imageOverlay?: boolean;
  /** Caller-rendered original image; default native image remains available. */
  imageLayer?: React.ReactNode;
  pillLabel?: string;
  pillTone?: 'teal' | 'white';
  tagLabel?: string;
  distance?: string;
  trailingIcon?: 'website' | 'partners';
  variant?: 'default' | 'partner';
  onPress?: () => void;
  dark?: boolean;
}) {
  const contract = resolveShopsmartOfferCard({
    interactive: Boolean(onPress),
    imageHeight,
    variant,
    trailingIcon,
    pillTone,
  });
  const rootStyle: ViewStyle = {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: contract.radius,
    borderStyle: 'solid',
    borderWidth: contract.borderWidth,
    borderColor: contract.borderColor,
    backgroundColor: sourceColor('var(--uc-surface)', dark),
    boxShadow: variant === 'partner' ? '0 1px 2px rgba(0,0,0,.08)' : undefined,
  };
  const imageContainer: ViewStyle = {
    width: '100%',
    height: contract.imageHeight,
    overflow: 'hidden',
  };
  const imageStyle = { width: '100%' as const, height: '100%' as const };
  const overlayStyle: ViewStyle = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,.2)',
  };
  const tagStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    top: 16,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: contract.tagColor,
  };
  const tagTextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    color: sourceColor('var(--uc-static-white)', dark),
  };
  const pillStyle: ViewStyle = {
    position: 'absolute',
    right: contract.pillRight,
    top: contract.pillTop,
    width: contract.pillWidth,
    height: contract.pillHeight,
    borderRadius: contract.pillRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sourceColor(
      pillTone === 'white' ? 'var(--uc-surface)' : 'var(--uc-action-strong)',
      dark,
    ),
    boxShadow: '0 0 4px rgba(0,0,0,.25)',
    paddingHorizontal: 0,
    paddingVertical: 0,
  };
  const pillTextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 18,
    color: sourceColor(
      pillTone === 'white' ? 'var(--uc-text)' : 'var(--uc-static-white)',
      dark,
    ),
  };
  const bodyStyle: ViewStyle = {
    flex: 1,
    gap: contract.bodyGap,
    paddingHorizontal: contract.paddingHorizontal,
    paddingTop: contract.paddingTop,
    paddingBottom: contract.paddingBottom,
  };
  const merchantStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.merchantFontSize,
    lineHeight: contract.merchantLineHeight,
    letterSpacing: contract.merchantLetterSpacing,
    color: sourceColor('var(--uc-action)', dark),
  };
  const titleStyle = {
    marginTop: 1,
    fontFamily: 'UniCredit-bold',
    fontSize: contract.titleFontSize,
    lineHeight: contract.titleLineHeight,
    letterSpacing: contract.titleLetterSpacing,
    color: sourceColor('var(--uc-text)', dark),
  };
  const statusStyle: ViewStyle = {
    marginTop: 'auto',
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  };
  const statusTextStyle = {
    fontFamily: 'UniCredit-regular',
    fontSize: contract.statusFontSize,
    lineHeight: contract.statusLineHeight,
    letterSpacing: contract.statusLetterSpacing,
    color: sourceColor('var(--uc-text)', dark),
    flexShrink: 1,
  };
  const trailingStyle: ViewStyle = {
    height: 32,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  };
  const distanceStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0.22,
    color: sourceColor('var(--uc-text)', dark),
  };
  const iconStyle: ViewStyle = {
    width: contract.iconSlotSize,
    height: contract.iconSlotSize,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const content = (
    <>
      <View style={imageContainer}>
        {imageLayer ?? (
          <Image
            source={typeof imageSrc === 'number' ? imageSrc : { uri: imageSrc }}
            accessibilityLabel={imageAlt ?? merchant}
            resizeMode="cover"
            style={imageStyle}
          />
        )}
        {imageOverlay && <View style={overlayStyle} />}
      </View>
      {tagLabel && (
        <View style={tagStyle}>
          <SvgXml
            xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="${SHOPSMART_GIFT_PATH}" fill="${sourceColor(
              'var(--uc-static-white)',
              dark,
            )}"/></svg>`}
            width={15}
            height={15}
          />
          <Text style={tagTextStyle}>{tagLabel.toUpperCase()}</Text>
        </View>
      )}
      {pillLabel && (
        <BaselinePill
          interactive={false}
          label={pillLabel}
          variant={pillTone === 'white' ? 'active-counter' : 'primary'}
          dark={dark}
          style={pillStyle}
          labelStyle={pillTextStyle}
        />
      )}
      <View style={bodyStyle}>
        <View>
          <Text style={merchantStyle}>{merchant}</Text>
          <Text style={titleStyle}>{title}</Text>
        </View>
        <View style={statusStyle}>
          <Text style={statusTextStyle}>{statusText}</Text>
          <View style={trailingStyle}>
            {distance && <Text style={distanceStyle}>{distance}</Text>}
            <View style={iconStyle}>
              <SourceCustomIcon
                name={contract.icon}
                size={contract.iconSize}
                color={sourceColor('var(--uc-text)', dark)}
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={rootStyle}>
      {content}
    </Pressable>
  ) : (
    <View style={rootStyle}>{content}</View>
  );
}
