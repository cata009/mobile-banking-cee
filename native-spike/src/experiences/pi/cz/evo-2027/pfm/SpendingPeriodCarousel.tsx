import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useMouseCarousel } from '../mouseCarousel';

export function SpendingPeriodCarousel({
  count,
  activeIndex,
  onSelect,
  renderItem,
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  renderItem: (index: number) => React.ReactNode;
}) {
  const window = useWindowDimensions();
  const [viewportWidth, setViewportWidth] = useState(
    Math.min(343, window.width - 32),
  );
  const cardWidth = Math.max(0, viewportWidth - 48);
  const stepWidth = cardWidth + 12;
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const offsets = useMemo(
    () =>
      Array.from(
        { length: count },
        (_, index) =>
          index === 0
            ? 0
            : index === count - 1
              ? Math.max(0, index * stepWidth - 24)
              : index * stepWidth,
      ),
    [count, stepWidth],
  );
  const mouse = useMouseCarousel({ rail, offsets, onSelect });

  useEffect(() => {
    const offset = offsets[activeIndex] ?? 0;
    mouse.trackOffset(offset);
    rail.current?.scrollTo({ x: offset, y: 0, animated: false });
  }, [activeIndex, offsets]);

  return (
    <View
      style={{ width: '100%' }}
      onLayout={event => {
        const measuredWidth = event.nativeEvent.layout.width;
        if (measuredWidth > 0) setViewportWidth(measuredWidth);
      }}
      ref={mouse.containerRef}
      {...mouse.panHandlers}
    >
      <ScrollView
        testID="cz-pfm-period-rail"
        ref={rail}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={stepWidth}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingLeft: activeIndex === 0 ? 0 : 24,
          paddingRight: activeIndex === count - 1 ? 0 : 24,
          gap: 12,
        }}
        onScroll={event => mouse.trackOffset(event.nativeEvent.contentOffset.x)}
        onMomentumScrollEnd={event => {
          onSelect(
            Math.max(
              0,
              Math.min(
                count - 1,
                Math.round(event.nativeEvent.contentOffset.x / stepWidth),
              ),
            ),
          );
        }}
      >
        {Array.from({ length: count }, (_, index) => (
          <View
            key={index}
            style={{ width: cardWidth }}
            accessibilityElementsHidden={index !== activeIndex}
            importantForAccessibility={
              index === activeIndex ? 'auto' : 'no-hide-descendants'
            }
          >
            {renderItem(index)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
