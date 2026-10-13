import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';

/** The native host supplies dimensions/accessibility; these root DOM attributes are not SVG geometry. */
export function nativeAssetSvgXml(xml: string): string {
  return xml.replace(/<svg\b[^>]*>/i, root =>
    root.replace(/\s(?:class|aria-hidden)\s*=\s*(["'])[^"']*\1/g, ''),
  );
}

/** Same asset reference works as a web URL, native resource ID, or bundled SVG data URI. */
export function AssetGlyph({
  asset,
  size = 24,
  width = size,
  height = size,
  fit = 'contain',
  tintColor,
}: {
  asset: string | number;
  size?: number;
  width?: number;
  height?: number;
  fit?: 'contain' | 'stretch' | 'cover';
  tintColor?: string;
}) {
  if (
    typeof asset === 'string' &&
    /^data:image\/svg\+xml(?:;utf8)?,/i.test(asset)
  )
    return (
      <SvgXml
        xml={nativeAssetSvgXml(
          decodeURIComponent(asset.slice(asset.indexOf(',') + 1)),
        ).replace(
          /(fill|stroke)=(["'])([^"']+)\2/g,
          (attribute, name, quote, value) =>
            tintColor && value !== 'none' && !value.startsWith('url(')
              ? `${name}="${tintColor}"`
              : attribute,
        )}
        width={width}
        height={height}
        style={styles.asset}
        preserveAspectRatio={fit === 'stretch' ? 'none' : 'xMidYMid meet'}
      />
    );
  return (
    <Image
      source={typeof asset === 'number' ? asset : { uri: asset }}
      style={[styles.asset, { width, height }]}
      resizeMode={fit}
      tintColor={tintColor}
    />
  );
}
const styles = StyleSheet.create({ asset: { flexShrink: 0 } });
