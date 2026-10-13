import React, { useState } from 'react';
import { View } from 'react-native';
import type { ItalyCard } from '@/experiences/pi/it/mobile-first/cardsContent';
import CardArt from './CardArt';
export default function CardStack({
  cards,
  hidden,
  onOpen,
  onPin,
  activeId,
}: {
  cards: readonly ItalyCard[];
  hidden: boolean;
  onOpen: (id: string) => void;
  onPin?: () => void;
  activeId?: string;
}) {
  const [width, setWidth] = useState(361),
    overlap = 52 - (width * 227) / 361;
  return (
    <View
      testID="card-stack"
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      {cards.map((card, index) => (
        <View key={card.id} style={index ? { marginTop: overlap } : undefined}>
          <CardArt
            card={card}
            hidden={hidden}
            onOpen={card.id === activeId ? undefined : () => onOpen(card.id)}
            onPin={card.id === activeId ? onPin : undefined}
          />
        </View>
      ))}
    </View>
  );
}
