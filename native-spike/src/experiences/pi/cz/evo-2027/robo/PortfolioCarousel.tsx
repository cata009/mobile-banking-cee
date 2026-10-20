import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useDemoCanvas } from '../../../../../universal/DemoViewport';
import { BaselineCarouselIndicator } from '../../../../../universal/BaselineCarouselIndicator';

const cardWidth = 299;
const interval = cardWidth + 16;

/** Native touch scrolling plus mouse dragging in the scaled web preview. */
export function PortfolioCarousel({
  children,
  count,
  selectedIndex,
  onSelect,
}: {
  children: React.ReactNode;
  count: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const rail = useRef<React.ElementRef<typeof ScrollView>>(null);
  const offset = useRef(selectedIndex * interval);
  const initialOffset = useRef({ x: selectedIndex * interval, y: 0 });
  const origin = useRef(0);
  const pointerStart = useRef(0);
  const dragging = useRef(false);
  const scrollEnd = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTarget = useRef<number | null>(null);
  const [width, setWidth] = useState(327);
  const scale = useDemoCanvas()?.scale ?? 1;
  const latest = useRef({ count, onSelect, scale });
  latest.current = { count, onSelect, scale };
  const selectAtOffset = useCallback((x: number) => {
    const index = Math.max(
      0,
      Math.min(latest.current.count - 1, Math.round(x / interval)),
    );
    latest.current.onSelect(index);
    return index;
  }, []);
  const scrollToIndex = useCallback((index: number) => {
    if (scrollEnd.current) clearTimeout(scrollEnd.current);
    scrollEnd.current = null;
    const target = index * interval;
    if (scrollTarget.current === target) return;
    scrollTarget.current =
      Math.abs(offset.current - target) < 1 ? null : target;
    offset.current = target;
    rail.current?.scrollTo({ x: offset.current, y: 0, animated: true });
  }, []);
  const settle = useCallback(() => {
    const index = selectAtOffset(offset.current);
    scrollToIndex(index);
  }, [selectAtOffset, scrollToIndex]);
  useEffect(
    () => () => {
      if (scrollEnd.current) clearTimeout(scrollEnd.current);
    },
    [],
  );
  const drag = useMemo(() => {
    const finish = () => {
      dragging.current = false;
      settle();
    };
    return PanResponder.create({
      onStartShouldSetPanResponderCapture: event => {
        scrollTarget.current = null;
        if (scrollEnd.current) clearTimeout(scrollEnd.current);
        origin.current = offset.current;
        pointerStart.current = event.nativeEvent.pageX;
        return false;
      },
      onMoveShouldSetPanResponderCapture: (_event, gesture) =>
        Platform.OS === 'web' &&
        Math.abs(gesture.dx) > 8 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: () => {
        dragging.current = true;
        if (scrollEnd.current) clearTimeout(scrollEnd.current);
      },
      onPanResponderMove: (_event, gesture) => {
        offset.current = Math.max(
          0,
          Math.min(
            (latest.current.count - 1) * interval,
            origin.current -
              (gesture.moveX - pointerStart.current) / latest.current.scale,
          ),
        );
        rail.current?.scrollTo({ x: offset.current, y: 0, animated: false });
      },
      onPanResponderRelease: (_event, gesture) => {
        offset.current = Math.max(
          0,
          Math.min(
            (latest.current.count - 1) * interval,
            origin.current -
              (gesture.moveX - pointerStart.current) / latest.current.scale,
          ),
        );
        finish();
      },
      onPanResponderTerminate: finish,
    });
  }, [settle]);
  useEffect(() => {
    scrollToIndex(selectedIndex);
  }, [selectedIndex, scrollToIndex]);
  return (
    <View {...drag.panHandlers} testID="cz-portfolio-carousel-gesture">
      <ScrollView
        ref={rail}
        testID="cz-portfolio-carousel"
        horizontal
        snapToInterval={interval}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentOffset={initialOffset.current}
        style={styles.rail}
        contentContainerStyle={[
          styles.content,
          { paddingRight: Math.max(24, width - cardWidth) },
        ]}
        onLayout={event => setWidth(event.nativeEvent.layout.width)}
        scrollEventThrottle={16}
        onScroll={event => {
          offset.current = event.nativeEvent.contentOffset.x;
          if (scrollTarget.current !== null) {
            if (Math.abs(offset.current - scrollTarget.current) < 1)
              scrollTarget.current = null;
            return;
          }
          // RN Web emits scroll ticks, but no native momentum-end callback.
          if (Platform.OS === 'web' && !dragging.current) {
            if (scrollEnd.current) clearTimeout(scrollEnd.current);
            scrollEnd.current = setTimeout(settle, 120);
          }
        }}
        onMomentumScrollEnd={event => {
          selectAtOffset(event.nativeEvent.contentOffset.x);
        }}
        onScrollBeginDrag={() => {
          scrollTarget.current = null;
        }}
      >
        {children}
      </ScrollView>
      <View style={styles.dots}>
        <BaselineCarouselIndicator
          count={count}
          activeIndex={selectedIndex}
          windowSize={count}
          itemLabels={Array.from(
            { length: count },
            (_, index) => `Portfolio ${index + 1} of ${count}`,
          )}
          onSelect={index => latest.current.onSelect(index)}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  rail: { flexGrow: 0 },
  content: { gap: 16 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
});
