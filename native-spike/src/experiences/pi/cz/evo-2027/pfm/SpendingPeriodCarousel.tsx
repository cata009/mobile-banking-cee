import React, { useEffect, useRef, useState } from 'react';
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
  const [width, setWidth] = useState(Math.min(320, window.width - 32));
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const offsets = Array.from({ length: count }, (_, index) => index * width);
  const mouse = useMouseCarousel({ rail, offsets, onSelect });

  useEffect(() => {
    const offset = activeIndex * width;
    mouse.trackOffset(offset);
    rail.current?.scrollTo({ x: offset, y: 0, animated: false });
  }, [activeIndex, width]);

  return (
    <View
      onLayout={event => setWidth(event.nativeEvent.layout.width || width)}
      ref={mouse.containerRef}
      {...mouse.panHandlers}
    >
      <ScrollView
        testID="cz-pfm-period-rail"
        ref={rail}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={event => mouse.trackOffset(event.nativeEvent.contentOffset.x)}
        onMomentumScrollEnd={event => {
          const pageWidth = event.nativeEvent.layoutMeasurement.width || width;
          onSelect(
            Math.max(
              0,
              Math.min(
                count - 1,
                Math.round(event.nativeEvent.contentOffset.x / pageWidth),
              ),
            ),
          );
        }}
      >
        {Array.from({ length: count }, (_, index) => (
          <View
            key={index}
            style={{ width }}
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
