import React, { useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  VIRTUAL_CARD_DESIGNS,
  type VirtualCardDesign,
} from '@/features/cards/virtual-card/model';
import { useMouseCarousel } from '../../../cz/evo-2027/mouseCarousel';
import { Text } from '../../../../../universal/Typography';
import { VirtualCardArt } from './VirtualCardArt';

export function DesignCarousel({
  title,
  items,
  textColor,
  onSelect,
}: {
  title: string;
  items: readonly (typeof VIRTUAL_CARD_DESIGNS)[number][];
  textColor: string;
  onSelect: (id: VirtualCardDesign) => void;
}) {
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [width, setWidth] = useState(327);
  const [page, setPage] = useState(0);
  const maxOffset = Math.max(
    0,
    items.length * 126 + Math.max(0, items.length - 1) * 8 - width,
  );
  const offsets = useMemo(
    () => (maxOffset > 0 ? [0, maxOffset] : [0]),
    [maxOffset],
  );
  const mouse = useMouseCarousel({ rail, offsets, onSelect: setPage });
  const move = (next: number) => {
    const target = Math.max(0, Math.min(offsets.length - 1, next));
    setPage(target);
    mouse.trackOffset(offsets[target] ?? 0);
    rail.current?.scrollTo({ x: offsets[target] ?? 0, y: 0, animated: true });
  };
  const keyboardProps: Pick<
    React.ComponentProps<typeof Pressable>,
    'onKeyDown'
  > = Platform.OS === 'web'
    ? {
        onKeyDown: event => {
          const key: unknown = Reflect.get(event, 'key');
          if (key === 'ArrowRight' || key === 'ArrowLeft') {
            event.preventDefault();
            move(page + (key === 'ArrowRight' ? 1 : -1));
          }
        },
      }
    : {};
  return (
    <View
      style={styles.group}
      onLayout={event => {
        if (event.nativeEvent.layout.width)
          setWidth(event.nativeEvent.layout.width);
      }}
    >
      <Text
        accessibilityRole="header"
        style={[styles.heading, { color: textColor }]}
      >
        {title}
      </Text>
      <View ref={mouse.containerRef} {...mouse.panHandlers}>
        <ScrollView
          ref={rail}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          scrollEventThrottle={16}
          onScroll={event => {
            const x = event.nativeEvent.contentOffset.x;
            mouse.trackOffset(x);
            setPage(offsets.length > 1 && x >= maxOffset / 2 ? 1 : 0);
          }}
        >
          {items.map((item, index) => (
            <Pressable
              key={`${item.id}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.name}${items.slice(0, index).some(previous => previous.id === item.id) ? ' example 2' : ''}`}
              onPress={() => onSelect(item.id)}
              {...keyboardProps}
              style={styles.choice}
            >
              <View style={styles.rotated}>
                <VirtualCardArt design={item.id} width={200} />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  group: { gap: 16 },
  heading: { fontFamily: 'UniCredit-bold', fontSize: 16 },
  rail: { flexDirection: 'row', gap: 8 },
  choice: { width: 126, height: 200, overflow: 'hidden' },
  rotated: {
    position: 'absolute',
    width: 200,
    height: 126,
    left: -37,
    top: 37,
    transform: [{ rotate: '-90deg' }],
  },
});
