import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, {
  Circle,
  Line,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import {
  ROBO_TOP_UP_RANGES,
  validateRoboTopUpAmount,
  type RoboTopUpProjection,
} from '@/features/investments/robo/topUpProjection';
import { formatCzkInteger } from '@/features/investments/robo/model';
import { TextInput } from '../../../../../universal/Typography';
import { SourceRangeSlider } from '../../../../../universal/SourceRangeSlider';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { formatRoboChartNumber, formatRoboCompactMoney } from './amountDisplay';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import {
  Button,
  Copy,
  Page,
  czInvestmentTokens as colors,
  investmentColors,
} from '../investments/Primitives';

type ProjectionPeriod = RoboTopUpProjection['periods'][number];
type ProjectionPoint = RoboTopUpProjection['curve'][number];
type ProjectionSeries = Exclude<keyof ProjectionPoint, 'month'>;

const isPartialYear = ({ year, month }: ProjectionPeriod) => month < year * 12;
const yearLabel = (period: ProjectionPeriod) =>
  isPartialYear(period)
    ? 'Target date'
    : period.year === 0
      ? 'Today'
      : 'Year ' + period.year;
const czkContextAmount = new Intl.NumberFormat('de-DE', {
  maximumFractionDigits: 2,
});
const dashedStroke = '4 4';
const chartIntervals = 3;
const roundChartSteps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
const scenarios = [
  { key: 'positive', label: 'Positive', color: investmentColors.higher },
  { key: 'neutral', label: 'Neutral', color: investmentColors.estimated },
  { key: 'negative', label: 'Negative', color: investmentColors.lower },
] as const;
type Scenario = (typeof scenarios)[number];

function formatted(amount: number, hidden: boolean, signed = false) {
  return hidden
    ? undefined
    : formatInvestmentMoney(amount, 'CZ', 'CZK', false, 0, 0, signed);
}

export function TopUpProjection({
  forecast,
  amountsHidden,
  initial,
  monthly,
  date,
  account,
  canReview,
  helpOpen,
  onOpenHelp,
  onCloseHelp,
  onReview,
  onBack,
}: {
  forecast: RoboTopUpProjection;
  amountsHidden: boolean;
  initial?: { value: string; onChange: (value: string) => void };
  monthly?: { value: string; onChange: (value: string) => void };
  date: string;
  account: React.ReactNode;
  canReview: boolean;
  helpOpen: boolean;
  onOpenHelp: () => void;
  onCloseHelp: () => void;
  onReview: () => void;
  onBack: () => void;
}) {
  const [period, setPeriod] = useState(forecast.years);
  const [adjustingAmount, setAdjustingAmount] = useState(false);
  const selected = forecast.periods[Math.min(period, forecast.years)]!;
  const capitalLabel =
    forecast.opening === 0 ? 'Total contributions' : 'Capital base';
  const contextAmount = (value: number) =>
    amountsHidden ? '••••' : czkContextAmount.format(value) + ' CZK';

  if (helpOpen) return <ProjectionHelp onBack={onCloseHelp} />;

  return (
    <Page
      title="Investment projection"
      kind="top-up-projection"
      onBack={onBack}
      onHelp={onOpenHelp}
      contentTop={12}
      footerTop={0}
      footer={
        <Button
          label="Review investment"
          onPress={onReview}
          disabled={!canReview}
        />
      }
    >
      <View style={styles.stack}>
        <View style={styles.context}>
          <Copy muted style={styles.label}>
            Portfolio today · {contextAmount(forecast.opening)}
          </Copy>
          <Copy muted style={styles.label}>
            Target {contextAmount(forecast.target)} · {forecast.goalYears}{' '}
            {forecast.goalYears === 1 ? 'year' : 'years'} left
          </Copy>
        </View>
        <View style={styles.stackSmall}>
          <Copy strong header>
            Projected portfolio value
          </Copy>
          <ScenarioComparison
            selected={selected}
            amountsHidden={amountsHidden}
            capitalLabel={capitalLabel}
          />
          <ProjectionChart
            forecast={forecast}
            selected={selected}
            amountsHidden={amountsHidden}
            adjustingAmount={adjustingAmount}
            onSelect={setPeriod}
          />
          {forecast.goalYears > forecast.years ? (
            <Copy muted style={styles.label}>
              Showing the first {forecast.years} years
            </Copy>
          ) : null}
        </View>
        {initial ? (
          <Amount
            label="Add today"
            kind="initial"
            {...initial}
            onInteractionChange={setAdjustingAmount}
          />
        ) : null}
        {monthly ? (
          <Amount
            label="New monthly contribution"
            kind="monthly"
            {...monthly}
            onInteractionChange={setAdjustingAmount}
          />
        ) : null}
        {monthly && date ? (
          <Copy>Your first monthly contribution is scheduled for {date}.</Copy>
        ) : null}
        {account}
        <Copy muted style={styles.disclaimer}>
          Forecasts are not a reliable indicator of future performance. You may
          get back less than you invest.
        </Copy>
      </View>
    </Page>
  );
}

function ScenarioComparison({
  selected,
  amountsHidden,
  capitalLabel,
}: {
  selected: ProjectionPeriod;
  amountsHidden: boolean;
  capitalLabel: string;
}) {
  return (
    <View
      style={styles.comparison}
      accessibilityLabel={`Comparison for ${yearLabel(selected)}`}
    >
      <View style={styles.comparisonRow}>
        <Copy muted style={[styles.label, styles.scenarioColumn]}>
          Scenario
        </Copy>
        <Copy muted style={[styles.comparisonAmount, styles.valueColumn]}>
          Portfolio value
        </Copy>
        <Copy muted style={[styles.comparisonAmount, styles.differenceColumn]}>
          Est. gain / loss
        </Copy>
      </View>
      {scenarios.map(scenario => (
        <View key={scenario.key} style={styles.comparisonRow}>
          <View style={[styles.scenarioLabel, styles.scenarioColumn]}>
            <Svg width={9} height={9} accessible={false}>
              <ScenarioMarker scenario={scenario} x={4.5} y={4.5} />
            </Svg>
            <Copy strong style={[styles.label, styles.scenarioName]}>
              {scenario.label}
            </Copy>
          </View>
          <Copy
            strong
            accessibilityLabel={formatted(
              selected[scenario.key],
              amountsHidden,
            )}
            style={[styles.comparisonAmount, styles.valueColumn]}
          >
            {formatRoboCompactMoney(selected[scenario.key], amountsHidden)}
          </Copy>
          <Copy
            strong
            accessibilityLabel={formatted(
              selected[scenario.key] - selected.capital,
              amountsHidden,
              true,
            )}
            style={[styles.comparisonAmount, styles.differenceColumn]}
          >
            {formatRoboCompactMoney(
              selected[scenario.key] - selected.capital,
              amountsHidden,
              true,
            )}
          </Copy>
        </View>
      ))}
      <View style={[styles.flexRow, styles.capitalRow]}>
        <View style={styles.scenarioLabel}>
          <Svg width={14} height={8} accessible={false}>
            <Line
              x1={0}
              x2={14}
              y1={4}
              y2={4}
              stroke={colors.muted}
              strokeWidth={1.5}
              strokeDasharray="3 2"
            />
          </Svg>
          <Copy strong style={styles.label}>
            {capitalLabel}
          </Copy>
        </View>
        <Copy
          strong
          accessibilityLabel={formatted(selected.capital, amountsHidden)}
          style={styles.comparisonAmount}
        >
          {formatRoboCompactMoney(selected.capital, amountsHidden)}
        </Copy>
      </View>
    </View>
  );
}

function ScenarioMarker({
  scenario,
  x,
  y,
  onChart = false,
}: {
  scenario: Scenario;
  x: number;
  y: number;
  onChart?: boolean;
}) {
  const paint = {
    fill: scenario.color,
    stroke: onChart ? colors.background : 'none',
    strokeWidth: 1,
  };
  if (scenario.key === 'positive') {
    return <Rect x={x - 4} y={y - 4} width={8} height={8} rx={1} {...paint} />;
  }
  if (scenario.key === 'negative') {
    return (
      <Polygon
        points={`${x},${y - 4} ${x + 4},${y} ${x},${y + 4} ${x - 4},${y}`}
        {...paint}
      />
    );
  }
  return <Circle cx={x} cy={y} r={4} {...paint} />;
}

function useReducedChartMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') {
      const preference = window.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      );
      if (!preference) return;
      const update = () => setReduced(preference.matches);
      update();
      preference.addEventListener('change', update);
      return () => preference.removeEventListener('change', update);
    }

    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (active) setReduced(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduced,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}

function useProjectionMotion(
  curve: readonly ProjectionPoint[],
  selectedMonth: number,
  reducedMotion: boolean,
) {
  const [display, setDisplay] = useState({ curve, month: selectedMonth });
  const lastFrame = useRef(display);

  useEffect(() => {
    const from = lastFrame.current;
    const target = { curve, month: selectedMonth };
    const render = (frame: typeof target) => {
      lastFrame.current = frame;
      setDisplay(frame);
    };
    if (from.curve === curve && from.month === selectedMonth) return;
    if (reducedMotion || from.curve.length !== curve.length) {
      render(target);
      return;
    }
    let request: number;
    let startedAt: number | undefined;
    const animate = (now: number) => {
      startedAt ??= now;
      const progress = Math.min(1, (now - startedAt) / 160);
      if (progress === 1) {
        render(target);
        return;
      }
      const ease = 1 - (1 - progress) ** 3;
      const interpolate = (oldValue: number, value: number) =>
        oldValue + (value - oldValue) * ease;
      render({
        curve:
          from.curve === curve
            ? curve
            : curve.map((point, index) => ({
                month: point.month,
                capital: interpolate(from.curve[index]!.capital, point.capital),
                positive: interpolate(
                  from.curve[index]!.positive,
                  point.positive,
                ),
                neutral: interpolate(from.curve[index]!.neutral, point.neutral),
                negative: interpolate(
                  from.curve[index]!.negative,
                  point.negative,
                ),
              })),
        month: interpolate(from.month, selectedMonth),
      });
      request = requestAnimationFrame(animate);
    };
    request = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(request);
  }, [curve, selectedMonth, reducedMotion]);

  return display.curve.length === curve.length && !reducedMotion
    ? display
    : { curve, month: selectedMonth };
}

function projectionTick(maximum: number): number {
  const paddedTick = Math.max(1, (maximum * 1.2) / chartIntervals);
  const magnitude = 10 ** Math.floor(Math.log10(paddedTick));
  const step =
    roundChartSteps.find(value => value * magnitude >= paddedTick) ?? 10;
  return step * magnitude;
}

function ProjectionChart({
  forecast,
  selected,
  amountsHidden,
  adjustingAmount,
  onSelect,
}: {
  forecast: RoboTopUpProjection;
  selected: ProjectionPeriod;
  amountsHidden: boolean;
  adjustingAmount: boolean;
  onSelect: (year: number) => void;
}) {
  const { width, scale = 1 } = useDemoViewport();
  const reducedMotion = useReducedChartMotion();
  const plot = useRef<React.ComponentRef<typeof View>>(null);
  const plotOrigin = useRef<number | null>(null);
  const gestureId = useRef(0);
  const [dragMonth, setDragMonth] = useState<number | null>(null);
  const display = useProjectionMotion(
    forecast.curve,
    dragMonth ?? selected.month,
    reducedMotion || dragMonth !== null,
  );
  const left = 45;
  const insetRight = 16;
  const plotWidth = Math.max(
    width - 48,
    left + insetRight + forecast.years * 26,
  );
  const right = plotWidth - insetRight;
  const top = 9;
  const bottom = 148;
  const finalPeriod = forecast.periods.at(-1)!;
  const maxMonth = finalPeriod.month || 1;
  const x = (month: number) => left + ((right - left) * month) / maxMonth;
  const priorPeriod = forecast.periods.at(-2);
  const staggerTarget =
    isPartialYear(finalPeriod) &&
    priorPeriod !== undefined &&
    right - x(priorPeriod.month) < 50;
  const height = bottom + (staggerTarget ? 44 : 26);
  const maximum = useMemo(
    () =>
      forecast.curve.reduce(
        (max, { capital, positive, neutral, negative }) =>
          Math.max(max, capital, positive, neutral, negative),
        0,
      ),
    [forecast.curve],
  );
  const [storedTick, setStoredTick] = useState(() => projectionTick(maximum));
  const storedUpper = storedTick * chartIntervals;
  // Expand before plotting the new forecast. Shrink only once the drag and curve animation have settled.
  const shouldResize =
    maximum > storedUpper ||
    (!adjustingAmount &&
      display.curve === forecast.curve &&
      maximum < storedUpper * 0.4);
  const tick = shouldResize ? projectionTick(maximum) : storedTick;
  if (tick !== storedTick) setStoredTick(tick);
  const upper = tick * chartIntervals;
  const y = (value: number) => bottom - ((bottom - top) * value) / upper;
  const path = (key: ProjectionSeries) =>
    display.curve
      .map(
        (point, index) =>
          (index ? 'L' : 'M') + x(point.month) + ' ' + y(point[key]),
      )
      .join(' ');
  const cursorMonth = display.month;
  const selectedX = x(cursorMonth);
  const upperIndex = display.curve.findIndex(
    point => point.month >= cursorMonth,
  );
  const later = display.curve[upperIndex] ?? display.curve.at(-1)!;
  const earlier = display.curve[Math.max(0, upperIndex - 1)] ?? later;
  const ratio =
    later.month === earlier.month
      ? 0
      : (cursorMonth - earlier.month) / (later.month - earlier.month);
  const markerY = (key: ProjectionSeries) =>
    y(earlier[key] + (later[key] - earlier[key]) * ratio);
  const markers = [scenarios[1], scenarios[0], scenarios[2]].reduce<Scenario[]>(
    (visible, scenario) => {
      if (
        visible.every(
          item => Math.abs(markerY(item.key) - markerY(scenario.key)) >= 7,
        )
      )
        visible.push(scenario);
      return visible;
    },
    [],
  );
  const showCapitalMarker = markers.every(
    item => Math.abs(markerY(item.key) - markerY('capital')) >= 7,
  );

  const scrub = (pageX: number) => {
    if (plotOrigin.current === null) return;
    const month = Math.min(
      finalPeriod.month,
      Math.max(
        0,
        (((pageX - plotOrigin.current) / scale - left) * maxMonth) /
          (right - left),
      ),
    );
    setDragMonth(month);
    const nearest = forecast.periods.reduce((best, period) =>
      Math.abs(period.month - month) < Math.abs(best.month - month)
        ? period
        : best,
    );
    onSelect(nearest.year);
  };
  const dragEnabled = plotWidth <= width - 48 && finalPeriod.month > 0;
  const interaction = useRef({ scrub, dragEnabled });
  interaction.current = { scrub, dragEnabled };
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = plot.current as unknown as HTMLElement | null;
    if (!node) return;
    let pointer: { id: number; x: number; y: number } | null = null;
    let dragging = false;
    let suppressClick = false;
    const down = (event: PointerEvent) => {
      suppressClick = false;
      if (
        !interaction.current.dragEnabled ||
        !event.isPrimary ||
        event.button !== 0
      )
        return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    };
    const move = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const distanceX = Math.abs(event.clientX - pointer.x);
      const distanceY = Math.abs(event.clientY - pointer.y);
      if (!dragging) {
        if (distanceY > 5 && distanceY >= distanceX) {
          pointer = null;
          return;
        }
        if (distanceX <= 5) return;
        plotOrigin.current = node.getBoundingClientRect().left + window.scrollX;
        dragging = true;
        suppressClick = true;
      }
      event.preventDefault();
      interaction.current.scrub(event.pageX);
    };
    const stop = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      if (dragging) {
        if (event.type === 'pointerup') interaction.current.scrub(event.pageX);
        plotOrigin.current = null;
        setDragMonth(null);
      }
      pointer = null;
      dragging = false;
    };
    const click = (event: MouseEvent) => {
      if (!suppressClick || event.detail === 0) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    };
    node.addEventListener('pointerdown', down);
    node.addEventListener('click', click, true);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      node.removeEventListener('pointerdown', down);
      node.removeEventListener('click', click, true);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, []);

  const { panHandlers } = useMemo(() => {
    const stop = () => {
      gestureId.current++;
      plotOrigin.current = null;
      setDragMonth(null);
    };
    return PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_event, gesture) =>
        interaction.current.dragEnabled &&
        Math.abs(gesture.dx) > 5 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: event => {
        const id = ++gestureId.current;
        const pointerX = event.nativeEvent.pageX;
        plot.current?.measure((_x, _y, _width, _height, pageX) => {
          if (id !== gestureId.current) return;
          plotOrigin.current = pageX;
          interaction.current.scrub(pointerX);
        });
      },
      onPanResponderMove: (event, gesture) =>
        interaction.current.scrub(event.nativeEvent.pageX ?? gesture.moveX),
      onPanResponderRelease: stop,
      onPanResponderTerminate: stop,
    });
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chartScroll}
    >
      <View
        ref={plot}
        collapsable={false}
        style={[
          { width: plotWidth, height },
          Platform.OS === 'web' && dragEnabled && styles.scrubbablePlot,
        ]}
        {...(Platform.OS === 'web' ? {} : panHandlers)}
      >
        <Svg width={plotWidth} height={height} accessible={false}>
          {!amountsHidden ? (
            <>
              {[0, tick, 2 * tick, upper].map(
                (value, index) => (
                  <React.Fragment key={index}>
                    <Line
                      x1={left}
                      x2={right}
                      y1={y(value)}
                      y2={y(value)}
                      stroke={colors.border}
                    />
                    <SvgText
                      x={left - 7}
                      y={y(value) + 4}
                      fill={colors.muted}
                      fontFamily={colors.font}
                      fontSize={14}
                      textAnchor="end"
                    >
                      {formatRoboChartNumber(value)}
                    </SvgText>
                  </React.Fragment>
                ),
              )}
              <Line
                x1={selectedX}
                x2={selectedX}
                y1={top}
                y2={bottom}
                stroke={colors.accent}
                strokeOpacity={0.7}
                strokeDasharray="3 3"
              />
              <Path
                d={path('capital')}
                stroke={colors.muted}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dashedStroke}
                fill="none"
              />
              {scenarios.map(scenario => (
                <Path
                  key={scenario.key}
                  d={path(scenario.key)}
                  stroke={scenario.color}
                  strokeWidth={scenario.key === 'neutral' ? 2.5 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}
              {showCapitalMarker ? (
                <Circle
                  cx={selectedX}
                  cy={markerY('capital')}
                  r={3.5}
                  stroke={colors.muted}
                  strokeWidth={2}
                  fill={colors.background}
                />
              ) : null}
              {markers.map(scenario => (
                <ScenarioMarker
                  key={scenario.key}
                  scenario={scenario}
                  x={selectedX}
                  y={markerY(scenario.key)}
                  onChart
                />
              ))}
            </>
          ) : null}
          {forecast.periods.map(period => (
            <SvgText
              key={period.year}
              x={x(period.month)}
              y={bottom + (isPartialYear(period) && staggerTarget ? 36 : 18)}
              fill={
                period.year === selected.year ? colors.accent : colors.muted
              }
              fontFamily={
                period.year === selected.year ? colors.strongFont : colors.font
              }
              fontSize={14}
              textAnchor={isPartialYear(period) ? 'end' : 'middle'}
            >
              {isPartialYear(period)
                ? 'Target'
                : period.year === 0
                  ? 'Today'
                  : period.year + 'Y'}
            </SvgText>
          ))}
        </Svg>
        {forecast.periods.map((period, index, periods) => {
          const { year, month } = period;
          const previous = periods[index - 1];
          const next = periods[index + 1];
          const start = previous ? (x(previous.month) + x(month)) / 2 : 0;
          const end = next ? (x(next.month) + x(month)) / 2 : plotWidth;
          return (
            <Pressable
              key={year}
              accessibilityRole="button"
              accessibilityLabel={yearLabel(period)}
              accessibilityState={{ selected: year === selected.year }}
              onPress={() => onSelect(year)}
              style={[styles.chartTarget, { left: start, width: end - start }]}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

function ProjectionHelp({ onBack }: { onBack: () => void }) {
  return (
    <Page
      kind="top-up-projection-help"
      title="About this projection"
      onBack={onBack}
      contentTop={16}
    >
      <View style={styles.stack}>
        <Copy>
          Compare three estimates for how your first investment could grow.
        </Copy>
        <View style={styles.context}>
          <Copy strong>Total contributions</Copy>
          <Copy>
            Your one-off investment plus the monthly contributions due by the
            selected year.
          </Copy>
        </View>
        <View style={styles.context}>
          <Copy strong>Portfolio Value</Copy>
          <Copy>
            For the selected year, the table shows the projected value and
            estimated gain or loss for each scenario.
          </Copy>
        </View>
        <View style={styles.example}>
          <Copy strong>Example at year 5</Copy>
          <Copy>35.000 CZK today + 1.000 CZK a month</Copy>
          <Copy>Total contributions 95.000 CZK</Copy>
          <Copy>Positive 126.462 CZK</Copy>
          <Copy>Neutral 114.581 CZK</Copy>
          <Copy>Negative 88.754 CZK</Copy>
        </View>
        <View style={styles.context}>
          <Copy strong>Use the chart</Copy>
          <Copy>
            Select a year to see all three estimates. The dashed line shows your
            total contributions over the same period.
          </Copy>
        </View>
        <View style={styles.context}>
          <Copy strong>About the estimate</Copy>
          <Copy>
            The figures are illustrative. Investment returns can vary and you
            may get back less than you invest.
          </Copy>
        </View>
      </View>
    </Page>
  );
}

function Amount({
  label,
  kind,
  value,
  onChange,
  onInteractionChange,
}: {
  label: string;
  kind: keyof typeof ROBO_TOP_UP_RANGES;
  value: string;
  onChange: (value: string) => void;
  onInteractionChange: (active: boolean) => void;
}) {
  const range = ROBO_TOP_UP_RANGES[kind];
  const valid = validateRoboTopUpAmount(Number(value), kind);
  const [editing, setEditing] = useState(false);
  const errorId = 'cz-projection-amount-' + useId().replace(/[^a-z0-9-]/gi, '');
  const error = valid
    ? undefined
    : `Enter ${formatCzkInteger(range.min)}–${formatCzkInteger(range.max)} CZK.`;
  return (
    <View style={styles.stackSmall}>
      <View style={styles.flexRow}>
        <Copy strong style={[styles.label, styles.amountLabel]}>
          {label}
        </Copy>
        <View
          style={[
            styles.amountBox,
            {
              borderColor: error
                ? investmentColors.negative
                : editing
                  ? colors.accent
                  : colors.border,
            },
          ]}
        >
          <TextInput
            accessibilityLabel={label}
            accessibilityHint={error}
            aria-invalid={!valid}
            aria-describedby={error ? errorId : undefined}
            value={editing || !value ? value : formatCzkInteger(value)}
            onChangeText={next => onChange(next.replace(/\D/g, ''))}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            selectTextOnFocus
            inputMode="numeric"
            style={styles.amountInput}
          />
          <Copy style={styles.amountCurrency}>CZK</Copy>
        </View>
      </View>
      {error ? (
        <View nativeID={errorId} accessibilityLiveRegion="polite">
          <Copy style={styles.amountError}>{error}</Copy>
        </View>
      ) : null}
      <SourceRangeSlider
        label={`${label} slider`}
        {...range}
        value={Math.min(
          range.max,
          Math.max(range.min, Number(value) || range.min),
        )}
        color={colors.accent}
        presentation="feedback"
        onChange={next => onChange(String(next))}
        onInteractionChange={onInteractionChange}
      />
      <View style={styles.flexRow}>
        <Copy muted>{formatCzkInteger(range.min)} CZK</Copy>
        <Copy muted>{formatCzkInteger(range.max)} CZK</Copy>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  stackSmall: { gap: 8 },
  context: { gap: 3 },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  label: { fontSize: 14, lineHeight: 19 },
  amountLabel: { flex: 1 },
  amountBox: {
    minHeight: 36,
    width: 124,
    borderWidth: 1,
    borderRadius: colors.radius,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountInput: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    textAlign: 'right',
    color: colors.text,
    fontFamily: colors.strongFont,
    fontSize: 16,
    lineHeight: 20,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
    ...(Platform.OS === 'web' ? { outlineWidth: 0 } : {}),
  },
  amountCurrency: { fontSize: 12, lineHeight: 20, includeFontPadding: false },
  amountError: {
    color: investmentColors.negative,
    fontSize: 14,
    textAlign: 'right',
  },
  comparison: {
    backgroundColor: colors.surface,
    borderRadius: colors.radius,
    padding: 8,
    gap: 8,
  },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scenarioLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  scenarioName: { flexShrink: 1 },
  scenarioColumn: { width: 70 },
  valueColumn: { flex: 104, minWidth: 0 },
  differenceColumn: { flex: 121, minWidth: 0 },
  comparisonAmount: {
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  capitalRow: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 8 },
  chartScroll: { flexGrow: 0 },
  scrubbablePlot: { touchAction: 'pan-y' } as ViewStyle & {
    touchAction: 'pan-y';
  },
  chartTarget: { position: 'absolute', top: 0, bottom: 0 },
  disclaimer: { fontSize: 14, lineHeight: 20 },
  example: {
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 4,
  },
});
