import React, { useEffect, useId, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { AssetGlyph } from './AssetGlyph';

export interface VectorArtworkLayerProps {
  asset: string | number;
  x?: number;
  y?: number;
  width: number;
  height: number;
  opacity?: number;
  fit?: 'contain' | 'stretch' | 'cover';
}

/** Namespace only local identifiers/references; keep source paths, colors and transforms intact. */
export function namespaceSvgArtworkXml(xml: string, namespace: string): string {
  const ids = new Map<string, string>();
  const withIds = xml.replace(
    /([\s<])id\s*=\s*(["'])([^"']+)\2/g,
    (_, prefix: string, quote: string, id: string) => {
      if (!ids.has(id)) ids.set(id, `${namespace}-${ids.size}`);
      return `${prefix}id=${quote}${ids.get(id)}${quote}`;
    },
  );
  return withIds
    .replace(
      /url\(\s*(["']?)#([^\s)"']+)\1\s*\)/g,
      (reference, _quote: string, id: string) =>
        // SvgXml's native brush parser accepts the equivalent unquoted form.
        ids.has(id) ? `url(#${ids.get(id)})` : reference,
    )
    .replace(
      /([\s<])((?:xlink:)?href)\s*=\s*(["'])#([^"']+)\3/g,
      (
        reference,
        prefix: string,
        attribute: string,
        quote: string,
        id: string,
      ) =>
        ids.has(id)
          ? `${prefix}${attribute}=${quote}#${ids.get(id)}${quote}`
          : reference,
    );
}

function inlineSvgXml(asset: string | number): string | undefined {
  if (typeof asset !== 'string') return undefined;
  if (/^\s*(?:<\?xml[^>]*>\s*)?<svg\b/.test(asset)) return asset;
  if (!/^data:image\/svg\+xml(?:;[^,]*)?,/i.test(asset)) return undefined;
  const content = asset.slice(asset.indexOf(',') + 1);
  return /;base64,/i.test(asset) ? atob(content) : decodeURIComponent(content);
}

/**
 * Position original SVG XML as native vector content. SvgImage's Fresco bitmap
 * path cannot decode SVG data URIs on Android. Web SVG URLs are read as XML too;
 * only raster assets use Image through AssetGlyph. No source asset is rewritten.
 */
export function VectorArtworkLayer({
  asset,
  x = 0,
  y = 0,
  width,
  height,
  opacity = 1,
  fit = 'stretch',
}: VectorArtworkLayerProps) {
  const namespace = `artwork-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const inline = useMemo(() => inlineSvgXml(asset), [asset]);
  const svgUrl =
    typeof asset === 'string' && !inline && /\.svg(?:[?#].*)?$/i.test(asset)
      ? asset
      : undefined;
  const [remote, setRemote] = useState<{ asset: string; xml: string }>();
  useEffect(() => {
    if (!svgUrl) return;
    let cancelled = false;
    fetch(svgUrl)
      .then(response => {
        if (!response.ok)
          throw new Error(`Cannot read SVG artwork (${response.status})`);
        return response.text();
      })
      .then(xml => {
        if (!cancelled && /<svg\b/.test(xml)) setRemote({ asset: svgUrl, xml });
      })
      .catch(() => {
        /* Keep failed SVG requests out of the bitmap decoder. */
      });
    return () => {
      cancelled = true;
    };
  }, [svgUrl]);
  const xml = inline ?? (remote?.asset === svgUrl ? remote?.xml : undefined);
  const namespaced = useMemo(
    () => (xml ? namespaceSvgArtworkXml(xml, namespace) : undefined),
    [xml, namespace],
  );
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={[styles.layer, { left: x, top: y, width, height, opacity }]}
    >
      {namespaced ? (
        <SvgXml
          xml={namespaced}
          width={width}
          height={height}
          preserveAspectRatio={
            fit === 'stretch'
              ? 'none'
              : fit === 'cover'
              ? 'xMidYMid slice'
              : 'xMidYMid meet'
          }
        />
      ) : !svgUrl && !inline ? (
        <AssetGlyph asset={asset} width={width} height={height} fit={fit} />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({ layer: { position: 'absolute' } });
