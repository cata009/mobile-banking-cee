import React from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import {
  CARD_COMPONENT_CONTRACT as geometry,
  CARD_COMPONENT_DEFAULT_CARDS,
} from '@/app/components/contracts/cardComponent';
import type { CardVariant } from '@/app/components/contracts/cardArtwork';
import { BaselineCardArtwork } from './BaselineCardArtwork';
import { Text } from './Typography';

/** Static DS composition; no carousel selection, masking or business logic is introduced. */
export function BaselineCardComponent({
  cardHolderName = 'PETER JAGODIC',
  cardNumber = '9234  ****  ****  4007',
  cards = CARD_COMPONENT_DEFAULT_CARDS,
}: {
  cardHolderName?: string;
  cardNumber?: string;
  cards?: readonly { id: string; variant: CardVariant; ariaLabel?: string }[];
}) {
  const rootStyle: ViewStyle = {
    width: '100%',
    gap: geometry.rootGap,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  };
  const headerStyle: ViewStyle = { gap: geometry.headerGap, paddingLeft: 24 };
  const identityStyle: ViewStyle = { width: 169, gap: 2 };
  const holderStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: geometry.holderFontSize,
    lineHeight: 14,
    color: '#262626',
  };
  const numberStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: geometry.numberFontSize,
    lineHeight: 18,
    color: '#262626',
  };
  const railStyle = { width: 351, height: 140 };
  const contentStyle = {
    gap: geometry.gap,
    paddingLeft: geometry.paddingLeft,
    alignItems: 'center' as const,
  };
  const slotStyle: ViewStyle = {
    width: geometry.slotWidth,
    height: geometry.slotHeight,
    borderRadius: geometry.slotRadius,
    overflow: 'hidden',
    boxShadow: '0 11.265px 11.265px rgba(0,0,0,.2)',
  };
  return (
    <View style={rootStyle}>
      <View style={headerStyle}>
        <View style={identityStyle}>
          <Text style={holderStyle}>{cardHolderName}</Text>
          <Text style={numberStyle}>{cardNumber}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={railStyle}
          contentContainerStyle={contentStyle}
        >
          {cards.map(card => (
            <View key={card.id} style={slotStyle}>
              <BaselineCardArtwork
                variant={card.variant}
                size="large"
                ariaLabel={card.ariaLabel}
                style={{
                  width: geometry.slotWidth,
                  height: geometry.slotHeight,
                  borderRadius: geometry.slotRadius,
                }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
