import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Image,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/** Original Source asset with native cover cropping matching CSS object-position. */
export function SourcePhoto({
  asset,
  position = 'center',
  height,
  style,
}: {
  asset: string | number;
  position?: string;
  height: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [width, setWidth] = useState(0);
  const [natural, setNatural] = useState<{
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    setNatural(null);
    let alive = true;
    if (typeof asset === 'number') {
      const resolved = Image.resolveAssetSource(asset);
      if (resolved?.width && resolved.height)
        setNatural({ width: resolved.width, height: resolved.height });
    } else if (typeof asset === 'string')
      Image.getSize(
        asset,
        (w, h) => {
          if (alive) setNatural({ width: w, height: h });
        },
        () => {},
      );
    return () => {
      alive = false;
    };
  }, [asset]);
  const [x = 'center', y = 'center'] = position.split(' ');
  const percent = (value: string) =>
    value === 'left' || value === 'top'
      ? 0
      : value === 'right' || value === 'bottom'
      ? 1
      : value.endsWith('%')
      ? parseFloat(value) / 100
      : 0.5;
  const scale =
    natural && width > 0
      ? Math.max(width / natural.width, height / natural.height)
      : 0;
  const imageStyle =
    natural && scale
      ? {
          position: 'absolute' as const,
          width: natural.width * scale,
          height: natural.height * scale,
          left: (width - natural.width * scale) * percent(x),
          top: (height - natural.height * scale) * percent(y),
        }
      : { width: '100%' as const, height };
  return (
    <View
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
      style={[[sourceStyles.overflowhiddenwidth100, { height }], style]}
    >
      <Image
        source={typeof asset === 'number' ? asset : { uri: asset }}
        resizeMode="cover"
        style={imageStyle}
        accessible={false}
      />
    </View>
  );
}

const sourceStyles = StyleSheet.create({
  overflowhiddenwidth100: { overflow: 'hidden', width: '100%' },
});
