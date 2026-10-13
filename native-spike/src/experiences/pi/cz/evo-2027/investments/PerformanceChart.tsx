import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import type { InvestmentChartPoint } from '@/app/config/investmentsPortfolioConfig';
import {
  buildInvestmentTimeline,
  formatInvestmentTimelineTick,
} from '@/app/components/investments/investmentChartTimeline';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { formatChartAxis, monotoneChartPath } from './chartGeometry';

export function PerformanceChart({
  points,
  hidden = false,
  step = false,
  showPerformance = true,
  zeroBaselineOnly = false,
  currency = 'CZK',
}: {
  points: readonly InvestmentChartPoint[];
  hidden?: boolean;
  step?: boolean;
  showPerformance?: boolean;
  zeroBaselineOnly?: boolean;
  currency?: string;
}) {
  const [width, setWidth] = useState(327),
    [active, setActive] = useState<number | null>(null);
  const safe = points.filter(point => Number.isFinite(point.value));
  const values = safe.map(point => point.value),
    min = Math.min(...values),
    max = Math.max(...values),
    range = max - min || 1;
  const zero =
    zeroBaselineOnly && values.length > 0 && values.every(value => value === 0);
  const minimum = zero ? -1 : safe.length ? min - range * 0.08 : -1,
    maximum = zero ? 1 : safe.length ? max + range * 0.08 : 1;
  const ticks = zero
    ? [0]
    : [0, 1, 2, 3].map(index => minimum + ((maximum - minimum) * index) / 3);
  const left = Math.ceil(
      Math.max(
        zero ? 20 : 36,
        ...ticks.map(
          value => formatChartAxis(value, range).length * 11 * 0.7 + 8,
        ),
      ),
    ),
    right = Math.max(left + 1, width - 4),
    top = 8,
    bottom = 152;
  const timeline = buildInvestmentTimeline(safe),
    start = timeline[0] ?? 0,
    end = timeline.at(-1) ?? 1;
  const x = (index: number) =>
    left +
    (((timeline[index] ?? index) - start) / (end - start || 1)) *
      (right - left);
  const y = (value: number) =>
    bottom - ((value - minimum) / (maximum - minimum)) * (bottom - top);
  const coordinates = safe.map((point, index) => ({
    x: x(index),
    y: y(point.value),
  }));
  const path = step
    ? coordinates
        .map((point, index) =>
          index ? `H ${point.x} V ${point.y}` : `M ${point.x} ${point.y}`,
        )
        .join(' ')
    : monotoneChartPath(coordinates);
  const area = coordinates.length
    ? `${path} L ${coordinates.at(-1)!.x} ${bottom} L ${
        coordinates[0]!.x
      } ${bottom} Z`
    : '';
  const select = (location: number) => {
    if (!coordinates.length) return;
    setActive(
      coordinates.reduce(
        (best, point, index) =>
          Math.abs(point.x - location) <
          Math.abs(coordinates[best]!.x - location)
            ? index
            : best,
        0,
      ),
    );
  };
  const selected = active === null ? undefined : safe[active],
    point = active === null ? undefined : coordinates[active];
  const comparison =
    active === null
      ? undefined
      : safe[active - 1] ?? safe[active + 1] ?? selected;
  const tooltipX = point ? Math.min(width - 100, Math.max(6, point.x - 45)) : 0,
    tooltipY = point
      ? point.y + 90 <= 154
        ? point.y + 14
        : Math.max(4, point.y - 88)
      : 0;
  return (
    <View
      testID="cz-performance-chart"
      accessibilityLabel="Investment performance chart"
      style={styles.root}
      onLayout={event => setWidth(event.nativeEvent.layout.width || 327)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={event => select(event.nativeEvent.locationX)}
      onResponderMove={event => select(event.nativeEvent.locationX)}
      onResponderRelease={() => setActive(null)}
      onResponderTerminate={() => setActive(null)}
    >
      <Svg width="100%" height={190} viewBox={`0 0 ${width} 190`}>
        <Defs>
          <LinearGradient id="cz-performance-fill" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0%" stopColor="#007A91" stopOpacity={0.2} />
            <Stop offset="100%" stopColor="#007A91" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {ticks.map((value, index) => (
          <React.Fragment key={index}>
            {!zero ? (
              <Line
                x1={left}
                x2={right}
                y1={y(value)}
                y2={y(value)}
                stroke="#E5E5E5"
                strokeDasharray="2 4"
                strokeLinecap="round"
              />
            ) : null}
            <SvgText
              x={0}
              y={y(value) + 3.9}
              textAnchor="start"
              fontFamily="UniCredit-bold"
              fontSize={11}
              fill="#666666"
            >
              {hidden ? '•••' : formatChartAxis(value, range)}
            </SvgText>
          </React.Fragment>
        ))}
        {!zero ? (
          <Path d={area} fill="url(#cz-performance-fill)" stroke="none" />
        ) : null}
        <Path d={path} stroke="#007A91" strokeWidth={3} fill="none" />
        {safe.map((item, index) =>
          item.showDot ? (
            <Circle
              key={index}
              cx={x(index)}
              cy={y(item.value)}
              r={active === index ? 6 : 3}
              fill={active === index ? '#FFFFFF' : '#007A91'}
              stroke="#007A91"
              strokeWidth={2}
            />
          ) : null,
        )}
        {[0, 1, 2, 3].map(index => {
          const time = start + ((end - start) * index) / 3,
            label = formatInvestmentTimelineTick(time),
            tickX = left + ((right - left) * index) / 3;
          return (
            <React.Fragment key={index}>
              <SvgText
                x={tickX}
                y={172}
                textAnchor={
                  index === 0 ? 'start' : index === 3 ? 'end' : 'middle'
                }
                fontFamily="UniCredit-bold"
                fontSize={11}
                fill="#666666"
              >
                {label.dateLabel}
              </SvgText>
              <SvgText
                x={tickX}
                y={184}
                textAnchor={
                  index === 0 ? 'start' : index === 3 ? 'end' : 'middle'
                }
                fontFamily="UniCredit-bold"
                fontSize={11}
                fill="#666666"
              >
                {label.yearLabel}
              </SvgText>
            </React.Fragment>
          );
        })}
        {selected && point ? (
          <>
            <Rect
              x={tooltipX}
              y={tooltipY}
              width={100}
              height={showPerformance ? 72 : 48}
              fill="#FFFFFF"
              stroke="#D8D8D8"
              rx={4}
            />
            <SvgText
              x={tooltipX + 8}
              y={tooltipY + 16}
              fontSize={11}
              fontFamily="UniCredit-regular"
              fill="#666666"
            >
              {formatInvestmentTimelineTick(timeline[active!]).dateLabel}
            </SvgText>
            <SvgText
              x={tooltipX + 8}
              y={tooltipY + 34}
              fontSize={12}
              fontFamily="UniCredit-bold"
              fill="#262626"
            >
              {formatInvestmentMoney(selected.value, 'CZ', currency, hidden)}
            </SvgText>
            {showPerformance && comparison ? (
              <SvgText
                x={tooltipX + 8}
                y={tooltipY + 54}
                fontSize={11}
                fontFamily="UniCredit-bold"
                fill="#3D7D43"
              >
                {hidden
                  ? '**,**%'
                  : `${(
                      ((selected.value - comparison.value) /
                        (comparison.value || 1)) *
                      100
                    ).toFixed(2)}%`}
              </SvgText>
            ) : null}
          </>
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({ root: { marginTop: 8, height: 190 } });
