import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { View } from 'react-native';
import { useMouseCarousel } from '../mouseCarousel';
import { useDuoPreview } from '../../../../../universal/DuoPreview';
export interface CarouselGeometry {
  width: number;
  height: number;
  gap: number;
  gutter: number;
  inactiveScale: number;
  inactiveOpacity?: number;
  inactiveFilter?: ViewStyle['filter'];
  paddingBottom?: number;
  paddingTop?: number;
}
/** Source center/clamp geometry, in layout points, independent of DOM transforms. */
export function carouselOffsets(
  count: number,
  viewport: number,
  geometry: CarouselGeometry,
) {
  const { width, gap, gutter } = geometry,
    max = Math.max(
      0,
      gutter * 2 + count * width + Math.max(0, count - 1) * gap - viewport,
    );
  return Array.from(
    {
      length: count,
    },
    (_, index) =>
      index === 0
        ? 0
        : index === count - 1
          ? max
          : Math.max(
              0,
              Math.min(
                max,
                gutter + index * (width + gap) - (viewport - width) / 2,
              ),
            ),
  );
}
export default function Carousel<
  T extends {
    id: string;
  },
>({
  items,
  selectedId,
  onSelect,
  geometry,
  renderItem,
  label,
}: {
  items: readonly T[];
  selectedId: string;
  onSelect: (value: T) => void;
  geometry: CarouselGeometry;
  renderItem: (value: T) => React.ReactNode;
  label: (value: T) => string;
}) {
  const duo = useDuoPreview();
  const [viewport, setViewport] = useState(375),
    ref = useRef<React.ElementRef<typeof ScrollView>>(null),
    offsets = useMemo(
      () => carouselOffsets(items.length, viewport, geometry),
      [items.length, viewport, geometry],
    ),
    selectedIndex = items.findIndex(item => item.id === selectedId);
  const mouse = useMouseCarousel({
    rail: ref,
    offsets,
    onSelect: index => {
      const item = items[index];
      if (item) onSelect(item);
    },
  });
  useEffect(() => {
    if (selectedIndex >= 0)
      ref.current?.scrollTo({
        x: offsets[selectedIndex] ?? 0,
        y: 0,
        animated: false,
      });
  }, [selectedIndex, offsets]);
  return (
    <View ref={mouse.containerRef} {...mouse.panHandlers}>
      <ScrollView
        accessibilityRole={Platform.OS === 'web' ? 'tablist' : undefined}
        ref={ref}
        horizontal
        onLayout={event => {
          if (event.nativeEvent.layout.width > 0)
            setViewport(event.nativeEvent.layout.width);
        }}
        decelerationRate="fast"
        snapToOffsets={offsets}
        contentOffset={{
          x: offsets[selectedIndex] ?? 0,
          y: 0,
        }}
        showsHorizontalScrollIndicator={false}
        onScroll={event => mouse.trackOffset(event.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
        contentContainerStyle={[
          c.rail,
          {
            paddingHorizontal: geometry.gutter,
            gap: geometry.gap,
            paddingBottom: geometry.paddingBottom ?? 18,
            paddingTop: geometry.paddingTop ?? 8,
          },
        ]}
        onMomentumScrollEnd={event => {
          const x = event.nativeEvent.contentOffset.x,
            index = offsets.reduce(
              (best, offset, candidateIndex) =>
                Math.abs(offset - x) < Math.abs((offsets[best] ?? 0) - x)
                  ? candidateIndex
                  : best,
              0,
            );
          const item = items[index];
          if (item) onSelect(item);
        }}
      >
        {items.map(item => (
          <Pressable
            key={item.id}
            accessibilityRole={Platform.OS === 'web' ? 'tab' : 'button'}
            accessibilityLabel={label(item)}
            accessibilityState={{
              selected: item.id === selectedId,
            }}
            onPress={() => onSelect(item)}
            style={[
              item.id === selectedId
                ? extractedStyles.item0
                : {
                    opacity: geometry.inactiveOpacity ?? 1,
                  },
              {
                width: geometry.width,
                height: geometry.height,
                filter:
                  item.id === selectedId ? undefined : geometry.inactiveFilter,
                transform: duo
                  ? [
                      {
                        scale:
                          item.id === selectedId ? 1 : geometry.inactiveScale,
                      },
                    ]
                  : [
                      {
                        scaleY:
                          item.id === selectedId ? 1 : geometry.inactiveScale,
                      },
                    ],
              },
            ]}
          >
            {renderItem(item)}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
const c = StyleSheet.create({
  rail: {
    paddingVertical: 8,
    paddingBottom: 18,
  },
});
const extractedStyles = StyleSheet.create({
  item0: {
    opacity: 1,
  },
});
