import React, { useId, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
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
import {
  Button,
  Copy,
  Page,
  czInvestmentTokens as colors,
  investmentColors,
} from '../investments/Primitives';

type ProjectionPeriod = RoboTopUpProjection['periods'][number];

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
const axisAmount = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumSignificantDigits: 3,
});
const dashedStroke = '4 4';
const scenarios = [
  { key: 'positive', label: 'Positive', color: investmentColors.higher },
  { key: 'neutral', label: 'Neutral', color: investmentColors.estimated },
  { key: 'negative', label: 'Negative', color: investmentColors.lower },
] as const;
type Scenario = (typeof scenarios)[number];

function formatted(amount: number, hidden: boolean, signed = false) {
  if (hidden) return '••••';
  const rounded = Math.round(amount);
  return (
    (rounded < 0 ? '−' : signed && rounded > 0 ? '+' : '') +
    formatCzkInteger(Math.abs(rounded)) +
    ' CZK'
  );
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
            onSelect={setPeriod}
          />
          {forecast.goalYears > forecast.years ? (
            <Copy muted style={styles.label}>
              Showing the first {forecast.years} years
            </Copy>
          ) : null}
        </View>
        {initial ? (
          <Amount label="Add today" kind="initial" {...initial} />
        ) : null}
        {monthly ? (
          <Amount
            label="New monthly contribution"
            kind="monthly"
            {...monthly}
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
          <Copy strong style={[styles.comparisonAmount, styles.valueColumn]}>
            {formatted(selected[scenario.key], amountsHidden)}
          </Copy>
          <Copy
            strong
            style={[styles.comparisonAmount, styles.differenceColumn]}
          >
            {formatted(
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
        <Copy strong style={styles.comparisonAmount}>
          {formatted(selected.capital, amountsHidden)}
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

function ProjectionChart({
  forecast,
  selected,
  amountsHidden,
  onSelect,
}: {
  forecast: RoboTopUpProjection;
  selected: ProjectionPeriod;
  amountsHidden: boolean;
  onSelect: (year: number) => void;
}) {
  const { width } = useDemoViewport();
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
  const values = forecast.curve.flatMap(
    ({ capital, positive, neutral, negative }) => [
      capital,
      positive,
      neutral,
      negative,
    ],
  );
  const minimum = Math.min(...values);
  const maximum = Math.max(0, ...values);
  const spread = Math.max(maximum - minimum, maximum * 0.04, 1);
  const lower = Math.max(0, minimum - spread * 1.5);
  const upper = Math.max(3, maximum + spread * 0.15);
  const tick = (upper - lower) / 3;
  const y = (value: number) =>
    bottom - ((bottom - top) * (value - lower)) / (upper - lower);
  const path = (key: 'capital' | Scenario['key']) =>
    forecast.curve
      .map(
        (point, index) =>
          (index ? 'L' : 'M') + x(point.month) + ' ' + y(point[key]),
      )
      .join(' ');
  const selectedX = x(selected.month);
  const markers = [scenarios[1], scenarios[0], scenarios[2]].reduce<Scenario[]>(
    (visible, scenario) => {
      if (
        visible.every(
          item =>
            Math.abs(y(selected[item.key]) - y(selected[scenario.key])) >= 7,
        )
      )
        visible.push(scenario);
      return visible;
    },
    [],
  );
  const showCapitalMarker = markers.every(
    item => Math.abs(y(selected[item.key]) - y(selected.capital)) >= 7,
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chartScroll}
    >
      <View style={{ width: plotWidth, height }}>
        <Svg width={plotWidth} height={height} accessible={false}>
          {!amountsHidden ? (
            <>
              {[lower, lower + tick, lower + 2 * tick, upper].map(
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
                      {axisAmount.format(value)}
                    </SvgText>
                  </React.Fragment>
                ),
              )}
              <Line
                x1={selectedX}
                x2={selectedX}
                y1={top}
                y2={bottom}
                stroke={colors.muted}
                strokeDasharray="3 3"
              />
              <Path
                d={path('capital')}
                stroke={colors.muted}
                strokeWidth={1.5}
                strokeDasharray={dashedStroke}
                fill="none"
              />
              {scenarios.map(scenario => (
                <Path
                  key={scenario.key}
                  d={path(scenario.key)}
                  stroke={scenario.color}
                  strokeWidth={scenario.key === 'neutral' ? 2.5 : 2}
                  fill="none"
                />
              ))}
              {showCapitalMarker ? (
                <Circle
                  cx={selectedX}
                  cy={y(selected.capital)}
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
                  y={y(selected[scenario.key])}
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
}: {
  label: string;
  kind: keyof typeof ROBO_TOP_UP_RANGES;
  value: string;
  onChange: (value: string) => void;
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
    fontVariant: ['tabular-nums'],
    ...(Platform.OS === 'web' ? { outlineWidth: 0 } : {}),
  },
  amountCurrency: { fontSize: 12, lineHeight: 16 },
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
  chartTarget: { position: 'absolute', top: 0, bottom: 0 },
  disclaimer: { fontSize: 14, lineHeight: 20 },
  example: {
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 4,
  },
});
