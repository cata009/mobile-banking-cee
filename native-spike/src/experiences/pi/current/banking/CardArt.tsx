import React from 'react';
import { StyleSheet } from 'react-native';
import { BaselineCardArtwork } from '../../../../universal/BaselineCardArtwork';
import type { BankingCard } from './model';

/** Existing banking API; rendering delegates to the canonical 64×40 DS geometry. */
export function CardArt({
  card,
  width = 219,
  height = (width / 64) * 40,
}: {
  card: BankingCard;
  width?: number;
  height?: number;
}) {
  const credit = card.type === 'credit_card';
  const standard = !credit && (card.id.endsWith('-2') || card.id === 'card-3');
  return (
    <BaselineCardArtwork
      variant={
        credit
          ? 'mc-credit-partner-standard'
          : standard
          ? 'mc-debit-standard'
          : 'mc-debit-gold'
      }
      ariaLabel={credit ? 'Credit card' : 'Debit card'}
      backgroundRadius={1.656}
      transparentCanvas
      labelFontFamily="Arial"
      style={[styles.canvas, { width, height }]}
    />
  );
}

const styles = StyleSheet.create({ canvas: { borderRadius: 0 } });
