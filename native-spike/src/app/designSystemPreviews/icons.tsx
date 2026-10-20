import React, { useState } from 'react';
import { View } from 'react-native';
import {
  CANONICAL_ICONS,
  CANONICAL_ICON_PREVIEW_VARIANTS,
} from '@/app/components/contracts/canonicalIcons';
import { BaselineCanonicalIcon } from '../../universal/BaselineCanonicalIcon';
import { Select } from '../../universal/Select';
import { Text } from '../../universal/Typography';
import { mobileFirstTokens } from '../../universal/tokens';
import type { DesignSystemPreviewProps } from './core';

/** One composition; themes and states are restricted to actual authored sources. */
export function CanonicalIconsDesignSystemPreview(
  props: DesignSystemPreviewProps,
) {
  return (
    <CanonicalIconSample
      key={`${props.componentId}:${props.variantId ?? ''}`}
      {...props}
    />
  );
}
function CanonicalIconSample({
  componentId,
  variantId,
  dark,
}: DesignSystemPreviewProps) {
  const allowed = CANONICAL_ICON_PREVIEW_VARIANTS[componentId] ?? [];
  const sources = CANONICAL_ICONS.filter(s => allowed.includes(s.variantId));
  const initial = sources.find(s => s.variantId === variantId) ?? sources[0];
  if (!initial) return null;
  return (
    <CanonicalIconControls
      key={initial.variantId}
      sources={sources}
      initial={initial}
      dark={dark}
    />
  );
}
function CanonicalIconControls({
  sources,
  initial,
  dark,
}: {
  sources: typeof CANONICAL_ICONS;
  initial: (typeof CANONICAL_ICONS)[number];
  dark?: boolean;
}) {
  const [selectedId, setSelectedId] = useState(initial.variantId);
  const source = sources.find(s => s.variantId === selectedId) ?? initial;
  const peers = sources.filter(
    s => s.icon === source.icon && s.group === source.group,
  );
  const themed = peers.filter(s => s.theme === source.theme);
  const tokens = dark
    ? {
        ...mobileFirstTokens,
        text: '#FFFFFF',
        background: '#262626',
        surface: '#333333',
      }
    : mobileFirstTokens;
  const choices = [
    ...new Map(
      sources.map(s => [
        s.icon,
        { value: s.icon, label: `${s.group} / ${s.icon}` },
      ]),
    ).values(),
  ];
  return (
    <View style={{ gap: 16, width: '100%', maxWidth: 375 }}>
      <Select
        tokens={tokens}
        label="Icon"
        value={source.icon}
        items={choices}
        onChange={icon => {
          const next = sources.find(s => s.icon === icon);
          if (next) setSelectedId(next.variantId);
        }}
      />
      {peers.some(s => s.theme !== 'source') ? (
        <Select
          tokens={tokens}
          label="Theme"
          value={source.theme}
          items={[...new Set(peers.map(s => s.theme))].map(theme => ({
            value: theme,
            label: theme,
          }))}
          onChange={theme => {
            const next =
              peers.find(s => s.theme === theme && s.state === source.state) ??
              peers.find(s => s.theme === theme);
            if (next) setSelectedId(next.variantId);
          }}
        />
      ) : null}
      {themed.length > 1 ? (
        <Select
          tokens={tokens}
          label="State"
          value={source.variantId}
          items={themed.map(s => ({ value: s.variantId, label: s.sourceName }))}
          onChange={setSelectedId}
        />
      ) : null}
      <View
        style={{
          minHeight: 112,
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            source.theme === 'dark' ||
            source.variantId === '10183:62963' ||
            source.variantId === '10183:62979' ||
            source.variantId === '10183:62886' ||
            source.variantId === '10183:61024'
              ? '#262626'
              : '#FFFFFF',
        }}
      >
        <BaselineCanonicalIcon
          variantId={source.variantId}
          label={source.icon}
        />
      </View>
      <Text
        style={{
          fontFamily: tokens.font,
          fontSize: 14,
          lineHeight: 20,
          color: tokens.text,
        }}
      >
        {source.width} × {source.height} · {source.sourceName}
      </Text>
      {source.usage === 'documentation-only' ? (
        <Text style={{ fontFamily: tokens.font, color: tokens.text }}>
          Historical gallery glyph: documentation and compatibility only; new
          usage requires review.
        </Text>
      ) : null}
      {source.motion ? (
        <Text style={{ fontFamily: tokens.font, color: tokens.text }}>
          Static authored loading glyph. Animation is not specified in this
          source.
        </Text>
      ) : null}
    </View>
  );
}
