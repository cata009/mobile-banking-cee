import React, { useRef } from 'react';
import { Pressable, View, Platform } from 'react-native';
import {
  resolveCarouselIndicator,
  nearestIndicatorIndex,
} from '@/app/components/contracts/carouselIndicator';
import { resolveAnalyticsIndicator } from '@/app/components/contracts/analyticsIndicator';
import { sourceColor } from './sourceColor';

export function BaselineCarouselIndicator({
  count,
  activeIndex,
  onSelect,
  itemLabel = 'account',
  itemLabels,
  windowSize = 4,
  tone = 'default',
  withBackdropBlur = true,
  analyticsKeys,
  activePeriodKey = '',
  dark = false,
}: {
  count: number;
  activeIndex: number;
  onSelect?: (index: number) => void;
  itemLabel?: string;
  itemLabels?: readonly string[];
  windowSize?: number;
  tone?: 'default' | 'inverse';
  withBackdropBlur?: boolean;
  analyticsKeys?: readonly string[];
  activePeriodKey?: string;
  dark?: boolean;
}) {
  const measured = useRef(new Map<number, { x: number; width: number }>());
  const state = resolveCarouselIndicator({
    count,
    activeIndex,
    windowSize,
    tone,
    withBackdropBlur,
  });
  const analytics = analyticsKeys
    ? resolveAnalyticsIndicator({ periodKeys: analyticsKeys, activePeriodKey })
    : undefined;
  const inactive = state.inverse
    ? 'rgba(255,255,255,0.55)'
    : sourceColor('var(--uc-text-muted)', dark);
  const activeColor = sourceColor('var(--uc-action)', dark);
  const frameStyle = {
    height: analytics ? undefined : state.height,
    paddingTop: analytics?.paddingTop,
    paddingBottom: analytics?.paddingBottom,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...(Platform.OS === 'web' && !analytics && state.blur !== undefined
      ? { backdropFilter: `blur(${state.blur}px)` }
      : {}),
  };
  const railStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: analytics ? analytics.gap : state.gap,
  };
  return (
    <View
      style={frameStyle}
      accessibilityElementsHidden={Boolean(analytics)}
      aria-hidden={analytics ? true : undefined}
      importantForAccessibility={analytics ? 'no-hide-descendants' : 'auto'}
    >
      <View style={railStyle}>
        {analytics
          ? analytics.periodKeys.map(key => {
              const dotStyle = {
                height: analytics.dotSize,
                width:
                  key === activePeriodKey
                    ? analytics.activeWidth
                    : analytics.dotSize,
                borderRadius: 999,
                backgroundColor:
                  key === activePeriodKey
                    ? activeColor
                    : sourceColor('var(--uc-text-subtle)', dark),
              };
              return <View key={key} style={dotStyle} />;
            })
          : state.items.map(item => {
              if (item.type === 'mini') {
                const miniStyle = {
                  width: state.miniSize,
                  height: state.miniSize,
                  borderRadius: 999,
                  backgroundColor: inactive,
                };
                return (
                  <View
                    key={item.key}
                    style={miniStyle}
                    accessibilityElementsHidden
                  />
                );
              }
              const selected = item.index === activeIndex;
              const dotStyle = {
                height: state.dotSize,
                width: selected ? state.activeWidth : state.dotSize,
                borderRadius: 999,
                backgroundColor: selected ? activeColor : inactive,
              };
              return (
                <Pressable
                  key={item.index}
                  accessibilityRole="button"
                  accessibilityLabel={
                    itemLabels?.[item.index] ??
                    `Go to ${itemLabel} ${item.index + 1}`
                  }
                  accessibilityState={{ selected }}
                  aria-current={selected ? 'true' : undefined}
                  hitSlop={9}
                  onLayout={event => {
                    measured.current.set(item.index, {
                      x: event.nativeEvent.layout.x,
                      width: event.nativeEvent.layout.width,
                    });
                  }}
                  onPress={event => {
                    if (!onSelect) return;
                    const target = measured.current.get(item.index);
                    const locationX = event?.nativeEvent.locationX;
                    if (!target || !Number.isFinite(locationX)) {
                      onSelect(item.index);
                      return;
                    }
                    const centers = [...measured.current.entries()]
                      .filter(([index]) =>
                        state.items.some(
                          entry =>
                            entry.type === 'item' && entry.index === index,
                        ),
                      )
                      .map(([index, box]) => ({
                        index,
                        center: box.x + box.width / 2,
                      }));
                    onSelect(
                      nearestIndicatorIndex(
                        target.x + locationX,
                        centers,
                        item.index,
                      ),
                    );
                  }}
                  style={dotStyle}
                />
              );
            })}
      </View>
    </View>
  );
}
