import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import background from '@/assets/pi/ro/onboarding/branch-map-source.png';
import pin from '@/assets/pi/ro/onboarding/branch-pin.svg';
import { RasterImage } from '../offers/RasterImage';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { sourceColor } from '../../../../../universal/sourceColor';

/** Approved geographic-only crop. Original app chrome and the baked branch panel stay outside the visible map. */
export function OnboardingBranchMap({
  onSelect,
  onClose,
  detail = false,
}: {
  onSelect: () => void;
  onClose: () => void;
  detail?: boolean;
}) {
  const viewport = useDemoViewport();
  const scale = viewport.width / 375;
  return (
    <View style={[s.root, { width: viewport.width, height: viewport.height }]}>
      <View pointerEvents="none" style={s.geography}>
        <RasterImage
          source={{ uri: background }}
          resizeMode="cover"
          style={{
            position: 'absolute',
            width: 733 * scale,
            maxWidth: 733 * scale,
            height: 1587 * scale,
            left: (detail ? -230 : -179) * scale,
            top: (detail ? -175 : -58) * scale,
          }}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sucursala Bucuresti pe hartă"
        onPress={onSelect}
        style={{
          position: 'absolute',
          left: (detail ? 88 : 121) * scale,
          top: (detail ? 91 : 422) * scale,
        }}
      >
        <AssetGlyph asset={pin} size={64 * scale} />
      </Pressable>
      {detail && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Altă sucursală pe hartă"
          onPress={onSelect}
          style={{ position: 'absolute', left: 215 * scale, top: 164 * scale }}
        >
          <AssetGlyph asset={pin} size={64 * scale} />
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Închide harta"
        onPress={onClose}
        style={s.close}
      >
        <SourceCustomIcon
          name="close-flow"
          size={24}
          color={sourceColor('var(--uc-text)')}
        />
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: sourceColor('var(--uc-border)'),
  },
  geography: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    height: 614,
    overflow: 'hidden',
  },
  close: {
    position: 'absolute',
    top: 24,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
