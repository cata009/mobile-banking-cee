import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  resolveMoreCard,
  type MoreCardVariant,
} from '@/app/components/contracts/moreCard';
import { moreAssets } from '../experiences/pi/current/profile/assets';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';
import { useDuoPreview, useDuoLocalViewport } from './DuoPreview';

/** Canonical More renderer shared by active screens, RNWeb and isolated previews. */
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
  const c = resolveMoreCard({ variant, badgeCount });
  const duo = useDuoPreview();
  const local = useDuoLocalViewport();
  const preserveAspect = !!duo && !!local && local.width > duo.referenceWidth;
  // Keep the Source artwork's offsets and crop anchored to the original card
  // dimensions; widening the card must not move the artwork toward its centre.
  const referenceArt = preserveAspect
    ? {
        top: undefined,
        left: undefined,
        right: (parseFloat(c.image.right) / 100) * 155.5,
        bottom: (parseFloat(c.image.bottom) / 100) * c.height,
        width:
          (1 - (parseFloat(c.image.left) + parseFloat(c.image.right)) / 100) *
          155.5,
        height:
          (1 - (parseFloat(c.image.top) + parseFloat(c.image.bottom)) / 100) *
          c.height,
      }
    : undefined;
  const [hovered, setHovered] = useState(false);
  const color = (value: string) => sourceColor(value, dark);
  const gradient = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 120"><defs><linearGradient id="card"><stop offset="0" stop-color="${color(
    'var(--uc-app-bg)',
  )}"/><stop offset="1" stop-color="${color(
    'var(--uc-neutral-400)',
  )}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#card)"/></svg>`;
  const artStyle: ViewStyle = {
    position: 'absolute',
    top: c.image.top,
    right: c.image.right,
    bottom: c.image.bottom,
    left: c.image.left,
    overflow: 'hidden',
    ...referenceArt,
  };
  const asset = variant === 'base' ? image : moreAssets[variant];
  const assetSource = typeof asset === 'string' ? { uri: asset } : asset;
  const imageUri =
    typeof asset === 'string'
      ? asset
      : typeof asset === 'number'
        ? Image.resolveAssetSource(asset)?.uri
        : Array.isArray(asset)
          ? asset[0]?.uri
          : asset && 'uri' in asset
            ? asset.uri
            : undefined;
  const cardStyle = {
    width,
    height: c.height,
    borderRadius: c.radius,
    opacity: hovered ? c.hoverOpacity : 1,
  };
  const raster =
    Platform.OS === 'web' ? (
      React.createElement('img', {
        src: imageUri,
        alt: '',
        decoding: 'async',
        loading: 'eager',
        draggable: false,
        style: {
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          maxWidth: 'none',
          ...(preserveAspect
            ? { objectFit: 'contain', objectPosition: 'right bottom' }
            : {}),
        },
      })
    ) : (
      <Image
        source={assetSource}
        resizeMode={preserveAspect ? 'contain' : 'stretch'}
        style={StyleSheet.absoluteFill as ImageStyle}
      />
    );
  return (
    <Pressable
      testID={`ro-more-card-${variant}`}
      accessibilityRole="button"
      accessibilityLabel={
        c.badgeText === null ? title : `${title} ${c.badgeText}`
      }
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[s.card, cardStyle]}
    >
      <View style={StyleSheet.absoluteFill}>
        <SvgXml xml={gradient} width={width} height={c.height} />
      </View>
      {variant === 'base' ? (
        image ? (
          <View style={s.baseImageContainer}>
            <Image
              source={typeof image === 'number' ? image : { uri: image }}
              resizeMode="contain"
              style={s.baseImage}
            />
          </View>
        ) : null
      ) : variant === 'gdpr-consent' && Platform.OS === 'web' ? (
        React.createElement('div', {
          'data-testid': 'ro-more-art-gdpr-consent',
          style: {
            ...artStyle,
            backgroundImage: `url('${imageUri}')`,
            backgroundSize: '61.60000091791153px 62.90000093728304px',
            backgroundPosition: 'top left',
          } as React.CSSProperties,
        })
      ) : (
        <View
          testID={`ro-more-art-${variant}`}
          pointerEvents="none"
          style={[
            artStyle,
            variant === 'third-party-consent' && s.thirdPartyFrame,
          ]}
        >
          {variant === 'gdpr-consent' ? (
            Array.from(
              { length: Math.ceil((width * 0.6158) / 61.60000091791153) * 2 },
              (_, index) => {
                const columns = Math.ceil((width * 0.6158) / 61.60000091791153);
                return (
                  <Image
                    key={index}
                    source={assetSource}
                    resizeMode="stretch"
                    style={[
                      s.tile,
                      {
                        left: (index % columns) * 61.60000091791153,
                        top: Math.floor(index / columns) * 62.90000093728304,
                      },
                    ]}
                  />
                );
              },
            )
          ) : variant === 'third-party-consent' ? (
            <View
              testID="ro-more-third-party-artwork"
              style={s.thirdPartyArtwork}
            >
              <View style={[StyleSheet.absoluteFill, s.rasterClip]}>
                {raster}
              </View>
            </View>
          ) : (
            raster
          )}
        </View>
      )}
      <View style={s.titleContainer}>
        <Text style={[s.title, { color: color('var(--uc-text)') }]}>
          {title}
        </Text>
      </View>
      {c.badgeText !== null && (
        <View style={s.badge}>
          <View
            style={[
              s.badgeCorner,
              { backgroundColor: color('var(--uc-brand)') },
            ]}
          />
          <View style={s.badgeNumber}>
            <Text
              testID="ro-more-documents-badge"
              style={[s.badgeText, { color: color('var(--uc-static-white)') }]}
            >
              {c.badgeText}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  baseImageContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '50%',
    height: '50%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  baseImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 0.9 }],
    transformOrigin: 'bottom right',
  },
  card: { position: 'relative', overflow: 'hidden' },
  thirdPartyFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  thirdPartyArtwork: {
    width: 151,
    height: 158.373,
    flexShrink: 0,
    transform: [{ rotate: '-156deg' }, { scaleY: -1 }],
  },
  rasterClip: { overflow: 'hidden' },
  titleContainer: {
    position: 'absolute',
    inset: 0,
    padding: 16,
    alignItems: 'flex-start',
  },
  title: { fontFamily: 'UniCredit-bold', fontSize: 18, textAlign: 'left' },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    zIndex: 20,
  },
  badgeCorner: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 30,
    height: 30,
    borderBottomLeftRadius: 30,
  },
  badgeNumber: { position: 'absolute', right: 7, top: 4 },
  badgeText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 14,
  },
  tile: {
    position: 'absolute',
    width: 61.60000091791153,
    height: 62.90000093728304,
  },
});
