import React, { useId, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Line,
  Path,
  Text as SvgText,
} from 'react-native-svg';
import type { PortfolioPoint } from '@/features/investments/future-overview/model';
import type { FutureCopy } from '@/features/investments/future-overview/copy';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import type { CurrentScreenProps } from '../../../current/contracts';
import { Text } from '../../../../../universal/Typography';
import { investmentColor } from '../../../current/investments/baseline/Frame';
import { monotoneChartPath, formatChartAxis } from './chartGeometry';

export function FuturePortfolioChart({
  host,
  points,
  copy,
  currency,
}: {
  host: CurrentScreenProps;
  points: readonly PortfolioPoint[];
  copy: FutureCopy;
  currency: string;
}) {
  const [width, setWidth] = useState(343);
  const fillId = 'portfolio-fill-' + useId().replace(/[^a-z0-9]/gi, '');
  const [selected, setSelected] = useState<number | null>(null);
  const accent = investmentColor(host, '--uc-action'),
    muted = investmentColor(host, '--uc-text-muted');
  const fg = investmentColor(host, '--uc-text'),
    border = investmentColor(host, '--uc-border');
  const values = points.flatMap(p => [p.value, p.netInvested]);
  const min = Math.min(...values),
    max = Math.max(...values),
    span = max - min || Math.max(1, max * 0.02);
  const low = min - span * 0.1,
    high = max + span * 0.1;
  const left = 36,
    right = width - 4,
    top = 12,
    bottom = 152;
  const x = (i: number) =>
    left + (i / Math.max(1, points.length - 1)) * (right - left);
  const y = (v: number) => bottom - ((v - low) / (high - low)) * (bottom - top);
  const path = (key: 'value' | 'netInvested') =>
    points
      .map(
        (p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)},${y(p[key]).toFixed(2)}`,
      )
      .join(' ');
  const samples = points
    .map((p, i) => ({ x: x(i), y: y(p.value), i }))
    .filter(
      (p, i) =>
        i === 0 ||
        i === points.length - 1 ||
        i % Math.max(1, Math.floor(points.length / 60)) === 0,
    );
  const valuePath = monotoneChartPath(samples);
  const activeSample =
    selected === null ? null : Math.min(selected, samples.length - 1);
  const activeIndex =
    activeSample === null ? null : (samples[activeSample]?.i ?? null);
  const point = activeIndex === null ? null : points[activeIndex];
  const amount = (v: number) =>
    formatInvestmentMoney(v, host.country, currency, host.amountsHidden);
  const date = (v: string) =>
    new Intl.DateTimeFormat(host.language === 'cs' ? 'cs-CZ' : 'en-GB', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(v));
  const choose = (locationX: number) =>
    setSelected(
      samples.reduce(
        (best, sample, index) =>
          Math.abs(sample.x - locationX) <
          Math.abs(samples[best]!.x - locationX)
            ? index
            : best,
        0,
      ),
    );
  if (!points.length) return null;
  return (
    <View
      testID="future-portfolio-chart"
      onLayout={e => setWidth(Math.max(180, e.nativeEvent.layout.width))}
    >
      {point && (
        <View
          accessibilityLiveRegion="polite"
          style={[
            s.tooltip,
            { backgroundColor: host.tokens.surface, borderColor: border },
          ]}
        >
          <Text style={{ color: fg, fontFamily: host.tokens.strongFont }}>
            {date(point.date)}
          </Text>
          <Text style={{ color: fg }}>
            {copy.value}: {amount(point.value)}
          </Text>
          <Text style={{ color: fg }}>
            {copy.invested}: {amount(point.netInvested)}
          </Text>
        </View>
      )}
      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel={`${copy.value}, ${copy.invested}`}
        accessibilityValue={{
          min: 0,
          max: samples.length - 1,
          now: activeSample ?? samples.length - 1,
          text: point
            ? `${date(point.date)}. ${copy.value} ${amount(point.value)}. ${copy.invested} ${amount(point.netInvested)}`
            : copy.helpBody,
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={e =>
          setSelected(i =>
            Math.min(
              samples.length - 1,
              Math.max(
                0,
                (i ?? samples.length - 1) +
                  (e.nativeEvent.actionName === 'increment' ? 1 : -1),
              ),
            ),
          )
        }
        onKeyDown={e => {
          const key = Reflect.get(e, 'key');
          if (key === 'ArrowLeft' || key === 'ArrowRight') {
            e.preventDefault();
            setSelected(i =>
              Math.min(
                samples.length - 1,
                Math.max(
                  0,
                  (i ?? samples.length - 1) + (key === 'ArrowRight' ? 1 : -1),
                ),
              ),
            );
          }
        }}
        onPress={e => choose(e.nativeEvent.locationX)}
        style={{ minHeight: 190 }}
      >
        <Svg
          width={width}
          height={190}
          pointerEvents="none"
          accessibilityElementsHidden
        >
          <Defs>
            <LinearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={accent} stopOpacity={0.12} />
              <Stop offset="1" stopColor={accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {[0, 1, 2, 3].map(i => {
            const v = low + ((high - low) * i) / 3;
            return (
              <React.Fragment key={i}>
                <Line
                  x1={left}
                  y1={y(v)}
                  x2={right}
                  y2={y(v)}
                  stroke={border}
                  strokeDasharray="3 4"
                />
                <SvgText
                  x={0}
                  y={y(v) + 4}
                  fill={muted}
                  fontSize={11}
                  fontFamily="UniCredit-bold"
                >
                  {host.amountsHidden ? '••' : formatChartAxis(v, high - low)}
                </SvgText>
              </React.Fragment>
            );
          })}
          <Path
            d={`${valuePath} L ${right} ${bottom} L ${left} ${bottom} Z`}
            fill={`url(#${fillId})`}
          />
          <Path
            d={path('netInvested')}
            stroke={muted}
            strokeWidth={1.4}
            strokeDasharray="5 4"
            fill="none"
          />
          <Path d={valuePath} stroke={accent} strokeWidth={3} fill="none" />
          {point && activeIndex !== null && (
            <>
              <Line
                x1={x(activeIndex)}
                x2={x(activeIndex)}
                y1={top}
                y2={bottom}
                stroke={accent}
                strokeDasharray="3 3"
              />
              <Circle
                cx={x(activeIndex)}
                cy={y(point.value)}
                r={4}
                fill={accent}
              />
            </>
          )}
          {[0, Math.floor((points.length - 1) / 2), points.length - 1].map(
            (i, n) => (
              <SvgText
                key={n}
                x={x(i)}
                y={178}
                textAnchor={n === 0 ? 'start' : n === 2 ? 'end' : 'middle'}
                fontSize={11}
                fontFamily="UniCredit-bold"
                fill={muted}
              >
                {new Intl.DateTimeFormat(
                  host.language === 'cs' ? 'cs-CZ' : 'en-GB',
                  { month: 'short', year: 'numeric', timeZone: 'UTC' },
                ).format(new Date(points[i]!.date))}
              </SvgText>
            ),
          )}
        </Svg>
      </Pressable>
      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.line, { backgroundColor: accent }]} />
          <Text style={[s.legendText, { color: fg }]}>{copy.value}</Text>
        </View>
        <View style={s.legendItem}>
          <Text style={{ color: muted }}>┄┄</Text>
          <Text style={[s.legendText, { color: fg }]}>{copy.invested}</Text>
        </View>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
    maxWidth: '85%',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    gap: 2,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingBottom: 12,
  },
  legendItem: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  legendText: { fontSize: 12, lineHeight: 16 },
  line: { width: 18, height: 2 },
});
