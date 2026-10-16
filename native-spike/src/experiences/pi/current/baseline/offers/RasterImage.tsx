import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from 'react-native';

/** Source uses img/object-fit; retain that renderer for browser parity and RN Image on devices. */
export function RasterImage({
  source,
  style,
  resizeMode = 'cover',
  objectPosition = 'center',
  accessibilityLabel,
}: {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain';
  objectPosition?: string;
  accessibilityLabel?: string;
}) {
  if (Platform.OS !== 'web')
    return (
      <Image
        source={source}
        style={style}
        resizeMode={resizeMode}
        accessibilityLabel={accessibilityLabel}
      />
    );
  const resolved =
    typeof source === 'number'
      ? Image.resolveAssetSource(source)
      : Array.isArray(source)
      ? source[0]
      : source;
  return React.createElement('img', {
    src: resolved?.uri,
    alt: accessibilityLabel ?? '',
    draggable: false,
    style: {
      display: 'block',
      ...StyleSheet.flatten(style),
      objectFit: resizeMode,
      objectPosition,
    } as React.CSSProperties,
  });
}
