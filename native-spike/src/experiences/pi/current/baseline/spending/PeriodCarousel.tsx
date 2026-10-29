import React, { useCallback, useEffect, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { SpendingAnalyticsPeriod } from '@/data/spendingAnalytics';
import { useDragCarousel } from '@/hooks/useDragCarousel';
import { useDuoPreview } from '../../../../../universal/DuoPreview';

export const BASELINE_PFM_PERIOD_WIDTH = 375;
interface PeriodCarouselProps {
  periods: readonly SpendingAnalyticsPeriod[];
  activePeriodKey: string;
  onPeriodChange: (periodKey: string) => void;
  renderPeriod: (period: SpendingAnalyticsPeriod) => React.ReactNode;
  testID?: string;
  /** Source detail hides offscreen interactive panels; Source overview does not. */
  hideInactivePanels?: boolean;
}
interface PeriodRailProps extends PeriodCarouselProps {
  children: React.ReactNode;
  constrainViewport?: boolean;
}
const clampIndex = (index: number, count: number) =>
  Math.max(0, Math.min(count - 1, index));

/** Source defines 375px panels even in a wider viewport; snapping preserves that design width. */
export function BaselinePfmPeriodCarousel(props: PeriodCarouselProps) {
  const duo = useDuoPreview();
  const testID = props.testID ?? 'ro-pfm-period-carousel';
  const panels = props.periods.map(period => (
    <View
      key={period.key}
      testID={`${testID}-${period.key}`}
      style={styles.panel}
      aria-hidden={
        props.hideInactivePanels
          ? period.key !== props.activePeriodKey
          : undefined
      }
      accessibilityElementsHidden={
        props.hideInactivePanels
          ? period.key !== props.activePeriodKey
          : undefined
      }
    >
      {props.renderPeriod(period)}
    </View>
  ));
  const Rail = Platform.OS === 'web' ? WebPeriodRail : NativePeriodRail;
  return (
    <Rail {...props} testID={testID} constrainViewport={!!duo}>
      {panels}
    </Rail>
  );
}

function WebPeriodRail({
  periods,
  activePeriodKey,
  onPeriodChange,
  testID,
  children,
  constrainViewport,
}: PeriodRailProps) {
  const rail = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const scrollToPeriod = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      rail.current?.scrollTo({
        left: clampIndex(index, periods.length) * BASELINE_PFM_PERIOD_WIDTH,
        behavior,
      });
    },
    [periods.length],
  );
  const settle = () => {
    const index = clampIndex(
      Math.round((rail.current?.scrollLeft ?? 0) / BASELINE_PFM_PERIOD_WIDTH),
      periods.length,
    );
    const period = periods[index];
    if (!period) return;
    scrollToPeriod(index);
    onPeriodChange(period.key);
  };
  const { isDragging, isPressActiveRef, dragHandlers } = useDragCarousel({
    carouselRef: rail,
    onSettle: settle,
    enabled: periods.length > 1,
  });
  useEffect(() => {
    const index = periods.findIndex(period => period.key === activePeriodKey);
    if (index >= 0) scrollToPeriod(index, 'auto');
  }, [activePeriodKey, periods, scrollToPeriod]);
  useEffect(() => clearTimer, [clearTimer]);
  return React.createElement(
    'div',
    {
      ref: rail,
      'data-testid': testID,
      ...dragHandlers,
      onScroll: () => {
        if (isPressActiveRef.current) return;
        clearTimer();
        timer.current = setTimeout(settle, 120);
      },
      style: {
        ...(constrainViewport
          ? {
              width: BASELINE_PFM_PERIOD_WIDTH,
              maxWidth: '100%',
              alignSelf: 'center',
            }
          : {}),
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
      },
    },
    <View style={styles.rail}>{children}</View>,
  );
}

function NativePeriodRail({
  periods,
  activePeriodKey,
  onPeriodChange,
  testID,
  children,
  constrainViewport,
}: PeriodRailProps) {
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollLeft = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const scrollToPeriod = useCallback(
    (index: number, animated = true) => {
      rail.current?.scrollTo({
        x: clampIndex(index, periods.length) * BASELINE_PFM_PERIOD_WIDTH,
        y: 0,
        animated,
      });
    },
    [periods.length],
  );
  const settle = () => {
    const index = clampIndex(
      Math.round(scrollLeft.current / BASELINE_PFM_PERIOD_WIDTH),
      periods.length,
    );
    const period = periods[index];
    if (!period) return;
    scrollToPeriod(index);
    onPeriodChange(period.key);
  };
  useEffect(() => {
    const index = periods.findIndex(period => period.key === activePeriodKey);
    if (index >= 0) scrollToPeriod(index, false);
  }, [activePeriodKey, periods, scrollToPeriod]);
  useEffect(() => clearTimer, [clearTimer]);
  return (
    <ScrollView
      ref={rail}
      testID={testID}
      style={
        constrainViewport
          ? {
              width: BASELINE_PFM_PERIOD_WIDTH,
              maxWidth: '100%',
              alignSelf: 'center',
            }
          : undefined
      }
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={BASELINE_PFM_PERIOD_WIDTH}
      decelerationRate="fast"
      scrollEventThrottle={16}
      contentContainerStyle={styles.rail}
      onScroll={event => {
        scrollLeft.current = event.nativeEvent.contentOffset.x;
        clearTimer();
        timer.current = setTimeout(settle, 120);
      }}
      onMomentumScrollEnd={settle}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: { flexDirection: 'row' },
  panel: { width: BASELINE_PFM_PERIOD_WIDTH, flexShrink: 0 },
});
