import React, { useId, useState, useEffect } from 'react';
import { View, Platform, type GestureResponderEvent } from 'react-native';
import Svg, {
  G,
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
  TSpan,
  Text as SvgText,
} from 'react-native-svg';
import type { InvestmentChartPoint } from '@/app/config/investmentsPortfolioConfig';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import type { CurrentScreenProps } from '../../../contracts';
import {
  monotoneChartPath,
  formatChartAxis,
} from '../../../../cz/evo-2027/investments/chartGeometry';
import { investmentColor } from '../Frame';
import { Copy } from './ui';

const investmentTimelineMonths = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

function buildInvestmentTimeline(points: readonly InvestmentChartPoint[]) {
  const anchors = points.flatMap((point, index) => {
    const [day, month] = point.dateLabel.split(' ');
    const monthIndex = investmentTimelineMonths.indexOf(
      month as (typeof investmentTimelineMonths)[number],
    );
    return monthIndex >= 0 && point.yearLabel
      ? [{ index, time: Date.UTC(Number(point.yearLabel), monthIndex, Number(day)) }]
      : [];
  });

  return points.map((_, index) => {
    const right = anchors.find(anchor => anchor.index >= index) ?? anchors.at(-1);
    const left =
      [...anchors].reverse().find(anchor => anchor.index <= index) ?? anchors[0];
    if (!left || !right) return index;
    const fraction =
      right.index === left.index ? 0 : (index - left.index) / (right.index - left.index);
    return left.time + (right.time - left.time) * fraction;
  });
}

function formatInvestmentTimelineTick(time: number) {
  const date = new Date(time);
  return {
    dateLabel: `${String(date.getUTCDate()).padStart(2, '0')} ${investmentTimelineMonths[date.getUTCMonth()]}`,
    yearLabel: String(date.getUTCFullYear()),
  };
}

/** Match d3-scale's number interpolation for numeric Robo chart axes. */
function scaleInvestmentChartValue(
  value: number,
  domainStart: number,
  domainEnd: number,
  rangeStart: number,
  rangeEnd: number,
) {
  const span = domainEnd - domainStart;
  const ratio = span ? (value - domainStart) / span : 0.5;
  return rangeStart * (1 - ratio) + rangeEnd * ratio;
}

type InvestmentAxisLabel = {
  x: number;
  dateLabel: string;
  yearLabel: string;
  textAnchor: 'start' | 'middle' | 'end';
  testID: string;
};

/** Baseline categorical chart; the temporal Evo chart has a different layout contract. */
export function BaselineInvestmentPortfolioChart({
  host,
  points,
  currency,
  amountsHidden,
  compact = false,
  showVerticalGridLines = true,
  edgeToEdge = false,
  tightBottomPadding = false,
  czRoboPresentation = false,
}: {
  host: CurrentScreenProps;
  points: readonly InvestmentChartPoint[];
  currency: string;
  amountsHidden: boolean;
  compact?: boolean;
  showVerticalGridLines?: boolean;
  edgeToEdge?: boolean;
  tightBottomPadding?: boolean;
  czRoboPresentation?: boolean;
}) {
  const [width, setWidth] = useState(359),
    [active, setActive] = useState<number | null>(null),
    [pointer, setPointer] = useState(false);
  const id = useId().replace(/[^a-z0-9]/gi, ''),
    height = compact ? 190 : tightBottomPadding ? 190 : 210,
    top = 8,
    right = compact ? 4 : edgeToEdge ? 4 : 10,
    xAxisHeight = compact ? 38 : 42,
    bottom = height - xAxisHeight - (compact || tightBottomPadding ? 0 : 36);
  const values = points.map(p => p.value),
    min = values.length ? Math.min(...values) : 0,
    max = values.length ? Math.max(...values) : 0,
    range = max - min || 1,
    low = min - range * 0.08,
    high = max + range * 0.08;
  const ticks = [0, 1, 2, 3].map(i => low + ((high - low) * i) / 3),
    amountFontSize = compact ? 11 : 12,
    roboAxisGutter = czRoboPresentation
      ? Math.ceil(
          Math.max(
            36,
            ...ticks.map(
              tick => formatChartAxis(tick, range).length * amountFontSize * 0.7 + 8,
            ),
          ),
        )
      : 0,
    left = czRoboPresentation ? roboAxisGutter : compact ? 38 : 44,
    padLeft = czRoboPresentation ? 0 : compact ? 18 : 24,
    padRight = czRoboPresentation
      ? 0
      : compact
        ? edgeToEdge ? 0 : 18
        : edgeToEdge ? 0 : 24,
    categoryPlotWidth =
      width -
      left -
      right -
      (padLeft === padRight ? padLeft * 2 : padLeft + padRight);
  const timeline = czRoboPresentation ? buildInvestmentTimeline(points) : [],
    timeStart = timeline[0] ?? 0,
    timeEnd = timeline.at(-1) ?? 1,
    timeTicks = [0, 1, 2, 3].map(
      step => timeStart + (timeEnd - timeStart) * step / 3,
    );
  const coordinates = points.map((p, i) => {
    const valueRatio = (p.value - low) / (high - low);
    return {
      x: czRoboPresentation
        ? scaleInvestmentChartValue(
            timeline[i] ?? i,
            timeStart,
            timeEnd,
            left,
            width - right,
          )
        : left +
          padLeft +
          (categoryPlotWidth * i) /
            Math.max(1, points.length - 1),
      // Match Recharts' d3-scale interpolation order for full-precision dots
      // and pointer coordinates: rangeStart * (1 - t) + rangeEnd * t.
      y: bottom * (1 - valueRatio) + top * valueRatio,
    };
  });
  const chartPoints = czRoboPresentation
    ? points.map((point, index) => {
        const date = formatInvestmentTimelineTick(timeline[index] ?? index);
        return { ...point, label: `${date.dateLabel} ${date.yearLabel}` };
      })
    : points;
  const axisLabels: InvestmentAxisLabel[] = czRoboPresentation
    ? timeTicks.map((time, index) => {
        const date = formatInvestmentTimelineTick(time);
        const textAnchor: InvestmentAxisLabel['textAnchor'] =
          index === 0 ? 'start' : index === timeTicks.length - 1 ? 'end' : 'middle';
        return {
          x: scaleInvestmentChartValue(time, timeStart, timeEnd, left, width - right),
          dateLabel: date.dateLabel,
          yearLabel: date.yearLabel,
          textAnchor,
          testID: `baseline-investment-robo-tick-${index}`,
        };
      })
    : coordinates.map((coordinate, index) => {
        const textAnchor: InvestmentAxisLabel['textAnchor'] =
          edgeToEdge && index === points.length - 1 ? 'end' : 'middle';
        return {
          x: coordinate.x,
          dateLabel: points[index]!.dateLabel,
          yearLabel: points[index]!.yearLabel,
          textAnchor,
          testID: `baseline-investment-date-${index}`,
        };
      });
  // d3-path serializes Recharts curves with three decimal places.
  const serialize = (value: string) =>
    value.replace(/-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/gi, number =>
      String(Math.round(Number(number) * 1000) / 1000),
    );
  const path = serialize(monotoneChartPath(coordinates)),
    fill = coordinates.length
      ? `${path} ${serialize(
          monotoneChartPath(
            [...coordinates]
              .reverse()
              .map(point => ({ x: point.x, y: bottom })),
          ),
        ).replace(/^M/, 'L')} Z`
      : '';
  const color = (token: string) => investmentColor(host, token),
    point = active === null ? null : chartPoints[active],
    coordinate = active === null ? null : coordinates[active];
  useEffect(() => {
    setActive(null);
    setPointer(false);
  }, [points, czRoboPresentation]);
  useEffect(() => {
    if (Platform.OS !== 'web' || active === null) return;
    const clear = () => {
      setActive(null);
      setPointer(false);
    };
    document.addEventListener('pointerup', clear);
    return () => document.removeEventListener('pointerup', clear);
  }, [active]);
  const select = (event: GestureResponderEvent) => {
    if (!points.length) return;
    const type = (event.nativeEvent as { type?: string }).type;
    const mouse = Platform.OS === 'web' && type?.startsWith('mouse');
    const renderedWidth = mouse
      ? (
          event.currentTarget as unknown as {
            getBoundingClientRect?: () => { width: number };
          }
        )?.getBoundingClientRect?.().width
      : undefined;
    const x =
      event.nativeEvent.locationX * (renderedWidth ? width / renderedWidth : 1);
    let index = 0;
    if (czRoboPresentation) {
      index = coordinates.reduce((nearest, candidate, candidateIndex) =>
        Math.abs(candidate.x - x) < Math.abs(coordinates[nearest]!.x - x)
          ? candidateIndex
          : nearest,
      0);
    } else {
      // Recharts mouse selection follows the padded categorical axis. Source's
      // separate touch helper uses the full plot; preserve that touch behavior.
      const leftInset = mouse ? padLeft : 0,
        rightInset = mouse ? padRight : 0,
        plot = Math.max(
          1,
          width -
            left -
            right -
            (leftInset === rightInset
              ? leftInset * 2
              : leftInset + rightInset),
        );
      index = Math.max(
        0,
        Math.min(
          points.length - 1,
          Math.round(
            ((x - left - leftInset) / plot) * Math.max(1, points.length - 1),
          ),
        ),
      );
    }
    setActive(index);
  };
  const comparison =
      active === null
        ? null
        : chartPoints[active - 1] ?? chartPoints[active + 1] ?? point,
    change = point && comparison ? point.value - comparison.value : 0,
    percent =
      point && comparison?.value ? (change / comparison.value) * 100 : 0;
  const baselineInvestmentPortfolioChartViewStyle1 = {
    height,
    marginTop: compact ? 8 : 18,
    width: '100%',
  } as const;
  const baselineInvestmentPortfolioChartViewStyle2 = coordinate
    ? ({
        position: 'absolute',
        left: Math.min(236, Math.max(6, coordinate.x - 45)),
        top:
          coordinate.y + 90 <= 154
            ? coordinate.y + 14
            : Math.max(4, coordinate.y - 88),
        zIndex: 1,
        minWidth: 91,
        borderRadius: 6,
        padding: 8,
        backgroundColor: color('--uc-surface'),
        boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
      } as const)
    : undefined;
  const baselineInvestmentPortfolioChartCopyStyle5 = {
    marginTop: 6,
    lineHeight: 15,
    color: color(change < 0 ? '--uc-danger' : '--uc-green-olive'),
  } as const;
  return (
    <View
      testID="baseline-investment-portfolio-chart"
      accessibilityLabel="Investments portfolio chart"
      onLayout={e => {
        if (e.nativeEvent.layout.width > 0)
          setWidth(e.nativeEvent.layout.width);
      }}
      style={baselineInvestmentPortfolioChartViewStyle1}
      onStartShouldSetResponder={() => true}
      onResponderGrant={e => {
        setPointer(true);
        select(e);
      }}
      onResponderMove={e => {
        if (pointer) select(e);
      }}
      onResponderRelease={() => {
        setPointer(false);
        setActive(null);
      }}
      onResponderTerminate={() => {
        setPointer(false);
        setActive(null);
      }}
      onPointerLeave={() => {
        setPointer(false);
        setActive(null);
      }}
    >
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop
              offset="0%"
              stopColor={color('--uc-action')}
              stopOpacity={0.2}
            />
            <Stop
              offset="100%"
              stopColor={color('--uc-action')}
              stopOpacity={0}
            />
          </LinearGradient>
        </Defs>
        {axisLabels.map(label => (
          <G
            key={label.testID}
            transform={`translate(${label.x},${bottom + 18})`}
          >
            <SvgText
              testID={label.testID}
              x={0}
              y={0}
              textAnchor={label.textAnchor}
              fontFamily="UniCredit-bold"
              fontSize={czRoboPresentation ? 11 : compact ? 10 : 12}
              fill={color('--uc-text-muted')}
            >
              <TSpan x={0} dy={0}>
                {label.dateLabel}
              </TSpan>
              <TSpan x={0} dy={compact ? 12 : 14}>
                {label.yearLabel}
              </TSpan>
            </SvgText>
          </G>
        ))}
        {ticks.map((tick, i) => {
          const y = scaleInvestmentChartValue(tick, low, high, bottom, top);
          return (
            <SvgText
              key={`y-axis-${i}`}
              x={czRoboPresentation ? 0 : left - 8}
              // Source's ordinary axis keeps the first label's half line box inside the chart.
              y={czRoboPresentation ? y : Math.max((compact ? 11 : 12) * 0.75, y)}
              dy=".355em"
              textAnchor={czRoboPresentation ? 'start' : 'end'}
              fontFamily="UniCredit-bold"
              fontSize={amountFontSize}
              fill={color('--uc-text-muted')}
            >
              {formatChartAxis(tick, range)}
            </SvgText>
          );
        })}
        {ticks.map((tick, i) => {
          const y = scaleInvestmentChartValue(tick, low, high, bottom, top);
          return (
            <Line
              key={`horizontal-grid-${i}`}
              x1={left}
              x2={width - right}
              y1={y}
              y2={y}
              stroke={color('--uc-border-muted')}
              strokeDasharray="2 4"
              strokeLinecap="round"
            />
          );
        })}
        {coordinates.map((c, i) => {
          const p = points[i]!;
          return showVerticalGridLines && p.showDot !== false && p.dateLabel ? (
            <Line
              key={`vertical-grid-${i}`}
              x1={c.x}
              x2={c.x}
              y1={bottom}
              y2={top}
              stroke={color('--uc-border-muted')}
              strokeDasharray="2 4"
              strokeLinecap="round"
            />
          ) : null;
        })}
        <Path d={fill} fill={`url(#${id})`} fillOpacity={0.6} />
        <Path
          d={path}
          fill="none"
          stroke={color('--uc-action')}
          strokeWidth={3}
        />
        {coordinates.map((c, i) =>
          points[i]!.showDot === false ? null : (
            <React.Fragment key={i}>
              <Circle
                cx={c.x}
                cy={c.y}
                r={18}
                fill="transparent"
                onPressIn={() => {
                  setPointer(true);
                  setActive(i);
                }}
                onPressOut={() => {
                  setPointer(false);
                  setActive(null);
                }}
              />
              <Circle
                cx={c.x}
                cy={c.y}
                r={active === i ? 5 : 3.5}
                fill={
                  active === i ? color('--uc-surface') : color('--uc-action')
                }
                stroke={color('--uc-action')}
                strokeWidth={2}
              />
            </React.Fragment>
          ),
        )}
      </Svg>
      {point && coordinate ? (
        <View
          pointerEvents="none"
          testID="baseline-investment-chart-tooltip"
          style={baselineInvestmentPortfolioChartViewStyle2}
        >
          <Copy
            host={host}
            style={styles.baselineInvestmentPortfolioChartCopyStyle3}
          >
            {point.label}
          </Copy>
          <Copy
            host={host}
            size={13}
            bold
            style={styles.baselineInvestmentPortfolioChartCopyStyle4}
          >
            {formatInvestmentMoney(
              point.value,
              host.country,
              currency,
              amountsHidden,
            )}
          </Copy>
          <Copy
            host={host}
            size={13}
            bold
            style={baselineInvestmentPortfolioChartCopyStyle5}
          >
            {amountsHidden
              ? '**,**%'
              : `${percent > 0 ? '+' : ''}${percent
                  .toFixed(2)
                  .replace('.', ',')}%`}
          </Copy>
        </View>
      ) : null}
    </View>
  );
}

const styles = {
  baselineInvestmentPortfolioChartCopyStyle3: { lineHeight: 16 },
  baselineInvestmentPortfolioChartCopyStyle4: { marginTop: 6, lineHeight: 15 },
} as const;
