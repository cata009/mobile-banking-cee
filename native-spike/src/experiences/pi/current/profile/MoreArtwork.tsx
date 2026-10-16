import React from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import type { MoreCardType } from '@/app/config/moreCardsConfig';
import { moreAssets } from './assets';
/** Unchanged Source card percentages and transforms, applied to original PNG assets. */
const positions: Record<MoreCardType, ViewStyle> = {
  contacts: { top: '36.67%', right: '-2.62%', bottom: 0, left: '52.69%' },
  documents: {
    top: '46.67%',
    right: '-9.15%',
    bottom: '-13.33%',
    left: '35.98%',
  },
  settings: {
    top: '47.86%',
    right: '-30.03%',
    bottom: '-29.17%',
    left: '42.2%',
  },
  'gdpr-consent': {
    top: '50%',
    right: '-0.24%',
    bottom: '-35.83%',
    left: '38.66%',
  },
  'third-party-consent': {
    top: '15.28%',
    right: '-37.87%',
    bottom: '-87.03%',
    left: '14.48%',
  },
  'digital-activities': {
    top: '56.42%',
    right: '-46.69%',
    bottom: '-46.75%',
    left: '49.96%',
  },
  'my-requests': { top: '37.22%', right: 0, bottom: '-6.36%', left: '29.88%' },
  tutorial: { top: '38.33%', right: 0, bottom: 0, left: '51.83%' },
};
export function MoreArtwork({
  card,
  cardWidth,
}: {
  card: MoreCardType;
  cardWidth: number;
}) {
  if (card === 'gdpr-consent') {
    const columns = Math.ceil((cardWidth * 0.6158) / 61.60000091791153);
    return (
      <View
        testID={`current-more-art-${card}`}
        pointerEvents="none"
        style={[styles.art, positions[card]]}
      >
        {Array.from({ length: columns * 2 }, (_, index) => (
          <Image
            key={index}
            source={moreAssets[card]}
            resizeMode="stretch"
            style={[
              styles.tile,
              {
                left: (index % columns) * 61.60000091791153,
                top: Math.floor(index / columns) * 62.90000093728304,
              },
            ]}
          />
        ))}
      </View>
    );
  }
  return (
    <View
      testID={`current-more-art-${card}`}
      pointerEvents="none"
      style={[
        styles.art,
        positions[card],
        card === 'third-party-consent' ? styles.center : undefined,
      ]}
    >
      <Image
        source={moreAssets[card]}
        resizeMode="stretch"
        style={
          card === 'third-party-consent'
            ? styles.thirdParty
            : StyleSheet.absoluteFill
        }
      />
    </View>
  );
}
const styles = StyleSheet.create({
  art: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  thirdParty: {
    width: 151,
    height: 158.373,
    transform: [{ rotate: '-156deg' }, { scaleY: -1 }],
  },
  tile: {
    position: 'absolute',
    width: 61.60000091791153,
    height: 62.90000093728304,
  },
});
