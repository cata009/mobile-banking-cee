import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  ROBO_TOP_UP_RANGES,
  validateRoboTopUpAmount,
  type RoboTopUpProjection,
} from '@/features/investments/robo/topUpProjection';
import { formatCzkInteger } from '@/features/investments/robo/model';
import { BaselineAmountField } from '../../../../../universal/BaselineAmountField';
import { BaselineBottomSheet } from '../../../../../universal/BaselineBottomSheet';
import { BaselineInvestmentPeriodChips } from '../../../../../universal/BaselineInvestmentPeriodChips';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { SourceRangeSlider } from '../../../../../universal/SourceRangeSlider';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import {
  Button,
  Copy,
  Page,
  czInvestmentTokens as colors,
} from '../investments/Primitives';

const openingColor = '#829496';
const contributionsColor = '#7E5B01';
const currentColor = '#66797D';
const yearLabel = (year: number) => (year === 0 ? 'Today' : `Year ${year}`);
const czkContextAmount = new Intl.NumberFormat('de-DE', {
  maximumFractionDigits: 2,
});

function formatted(amount: number, hidden: boolean) {
  return hidden
    ? '••••'
    : `${amount < 0 ? '−' : ''}${formatCzkInteger(
        Math.round(Math.abs(amount)),
      )}`;
}

export function TopUpProjection({
  name,
  forecast,
  amountsHidden,
  initial,
  monthly,
  date,
  account,
  canReview,
  onReview,
  onBack,
}: {
  name: string;
  forecast: RoboTopUpProjection;
  amountsHidden: boolean;
  initial?: { value: string; onChange: (value: string) => void };
  monthly?: { value: string; onChange: (value: string) => void };
  date: string;
  account: React.ReactNode;
  canReview: boolean;
  onReview: () => void;
  onBack: () => void;
}) {
  const [period, setPeriod] = useState<number | 'all'>(forecast.years);
  const [help, setHelp] = useState(false);
  const { width, height } = useDemoViewport();
  const chosen =
    period === 'all' ? forecast.years : Math.min(period, forecast.years);
  const selected = forecast.periods[chosen]!;
  const plotWidth = Math.max(width - 48, forecast.periods.length * 40);
  const values = (amount: number) => formatted(amount, amountsHidden);
  const contextValue = (amount: number) =>
    amountsHidden ? '••••' : czkContextAmount.format(amount);
  const chartMax = Math.max(
    1,
    ...forecast.periods.flatMap(item => [
      item.current.value,
      item.proposed.value,
      forecast.opening + item.current.contributions,
      forecast.opening + item.proposed.contributions,
    ]),
  );
  const showTarget = forecast.target > 0 && forecast.target <= chartMax * 1.3;
  const scale = Math.max(chartMax, showTarget ? forecast.target : 0) * 1.08;
  const divider = <View style={styles.divider} />;
  const amountDueDate =
    monthly && date
      ? `Your first monthly contribution is scheduled for ${date}.`
      : null;
  const delta = selected.proposed.value - selected.current.value;

  return (
    <>
      <Page
        title="Investment projection"
        kind="top-up-projection"
        onBack={onBack}
        onHelp={() => setHelp(true)}
        contentTop={16}
        footer={
          <Button
            label="Review investment"
            onPress={onReview}
            disabled={!canReview}
          />
        }
      >
        <View style={styles.stack}>
          <View>
            <Copy strong header>
              {name}
            </Copy>
            <Copy muted>
              Portfolio today · {contextValue(forecast.opening)} CZK
            </Copy>
            <Copy muted>
              Target {contextValue(forecast.target)} CZK · {forecast.years}{' '}
              {forecast.years === 1 ? 'year' : 'years'} left
            </Copy>
          </View>
          {divider}
          <Copy strong header>
            Estimated portfolio value (CZK)
          </Copy>
          {period === 'all' ? (
            <>
              <ScrollView horizontal style={styles.chartScroll}>
                <View style={[styles.annualPlot, { width: plotWidth }]}>
                  {showTarget && !amountsHidden ? (
                    <View
                      style={[
                        styles.target,
                        { bottom: 18 + (128 * forecast.target) / scale },
                      ]}
                    />
                  ) : null}
                  {forecast.periods.map(item => (
                    <Pressable
                      key={item.year}
                      accessibilityRole="button"
                      accessibilityLabel={`${yearLabel(
                        item.year,
                      )}, current plan ${values(
                        item.current.value,
                      )} CZK, with changes ${values(item.proposed.value)} CZK`}
                      onPress={() => setPeriod(item.year)}
                      style={styles.yearColumn}
                    >
                      <View style={styles.columnPair}>
                        {[item.current, item.proposed].map((plan, i) => (
                          <View
                            key={i}
                            style={{
                              width: '39%',
                              height: amountsHidden
                                ? 0
                                : plan.value === 0
                                  ? 2
                                  : (128 * plan.value) / scale,
                              backgroundColor: i ? colors.accent : currentColor,
                            }}
                          />
                        ))}
                      </View>
                      <Copy style={styles.yearCaption}>
                        {item.year ? `${item.year} Y` : 'Today'}
                      </Copy>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
              <Legend
                items={[
                  [currentColor, 'Current plan'],
                  [colors.accent, 'With changes'],
                ]}
              />
              {forecast.opening === 0 &&
              selected.current.contributions === 0 ? (
                <Copy muted>
                  No scheduled contributions in the current plan.
                </Copy>
              ) : null}
            </>
          ) : (
            <>
              {(
                [
                  ['With changes', selected.proposed],
                  ['Current plan', selected.current],
                ] as const
              ).map(([label, plan]) => (
                <View key={label} style={styles.stackSmall}>
                  <View style={styles.flexRow}>
                    <Copy strong>{label}</Copy>
                    <Copy strong>{values(plan.value)}</Copy>
                  </View>
                  <View style={styles.bar}>
                    {(
                      [
                        [forecast.opening, openingColor],
                        [plan.contributions, contributionsColor],
                        [Math.max(0, plan.gain), colors.accent],
                      ] as const
                    ).map(([v, color], i) =>
                      v > 0 && !amountsHidden ? (
                        <View
                          key={color}
                          style={{
                            width: `${(100 * v) / scale}%`,
                            backgroundColor: color,
                            borderLeftWidth:
                              i === 2 && plan.contributions > 0 ? 1 : 0,
                            borderLeftColor: colors.background,
                          }}
                        />
                      ) : null,
                    )}
                  </View>
                </View>
              ))}
              <Legend
                items={[
                  [openingColor, 'Portfolio today'],
                  [contributionsColor, 'Contributions'],
                  [colors.accent, 'Est. gain'],
                ]}
              />
            </>
          )}
          {divider}
          <View
            style={styles.table}
            accessibilityLabel={`Comparison for ${yearLabel(chosen)}`}
          >
            <View style={styles.flexRow}>
              <Copy strong style={styles.metric}>
                {yearLabel(chosen)}
              </Copy>
              <Copy strong style={styles.proposed}>
                With changes
              </Copy>
              <Copy strong style={styles.number}>
                Current plan
              </Copy>
            </View>
            {(
              [
                ['Projected value', 'value'],
                ['Contributions from today', 'contributions'],
                ['Estimated gain from today', 'gain'],
              ] as const
            ).map(([label, key]) => (
              <View key={key} style={styles.flexRow}>
                <Copy muted style={styles.metric}>
                  {label}
                </Copy>
                <Copy strong style={styles.number}>
                  {values(selected.proposed[key])}
                </Copy>
                <Copy strong style={styles.number}>
                  {values(selected.current[key])}
                </Copy>
              </View>
            ))}
            {divider}
            <View style={styles.flexRow}>
              <Copy muted>Impact vs. current plan</Copy>
              <Copy strong>
                {!amountsHidden && delta > 0 ? '+' : ''}
                {values(delta)}
              </Copy>
            </View>
            <View style={styles.flexRow}>
              <Copy muted>
                Vs. target at {yearLabel(forecast.years).toLowerCase()}
              </Copy>
              <Copy strong>
                {amountsHidden
                  ? '••••'
                  : forecast.targetDelta === 0
                    ? 'On target'
                    : `${values(Math.abs(forecast.targetDelta))} ${
                        forecast.targetDelta > 0 ? 'above' : 'below'
                      }`}
              </Copy>
            </View>
          </View>
          {divider}
          <BaselineInvestmentPeriodChips
            periods={[
              ...forecast.periods.map(({ year }) => ({
                id: String(year),
                label: year ? `${year} Y` : 'Today',
              })),
              { id: 'all', label: 'All years' },
            ]}
            selectedPeriodId={String(period)}
            onChange={value =>
              setPeriod(value === 'all' ? value : Number(value))
            }
            ariaLabel="Projection period"
            comfortableTouchTargets
            style={styles.periods}
            targetStyle={styles.period}
            inkStyle={styles.periodBadge}
            labelStyle={styles.periodLabel}
          />
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
          {amountDueDate ? <Copy>{amountDueDate}</Copy> : null}
          {account}
          <Copy muted style={styles.disclaimer}>
            Forecasts are not a reliable indicator of future performance. You
            may get back less than you invest.
          </Copy>
        </View>
      </Page>
      {help ? (
        <ModalPortal
          visible
          transparent
          animationType="none"
          onRequestClose={() => setHelp(false)}
        >
          <BaselineBottomSheet
            title="About this estimate"
            onClose={() => setHelp(false)}
            width={width}
            height={height}
            hostedInModal
          >
            <View style={styles.stack}>
              <Copy>
                Current plan uses your existing portfolio and scheduled
                payments. With changes uses the amounts in this preview.
              </Copy>
              <Copy>
                Estimated gain is the projected value minus your portfolio today
                and future contributions. Tap a year for its breakdown.
              </Copy>
              <Copy>
                The forecast uses illustrative assumptions and can change. The
                final difference to your target uses the goal date.
              </Copy>
            </View>
          </BaselineBottomSheet>
        </ModalPortal>
      ) : null}
    </>
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
  return (
    <View style={styles.stackSmall}>
      <BaselineAmountField
        label={label}
        value={value}
        onChange={next => onChange(next.replace(/\D/g, ''))}
        currency="CZK"
        currencyPresentation="suffix"
        inputMode="numeric"
        errorText={
          valid
            ? undefined
            : `Enter ${formatCzkInteger(range.min)}–${formatCzkInteger(
                range.max,
              )} CZK.`
        }
      />
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

function Legend({ items }: { items: [string, string][] }) {
  return (
    <View style={styles.legend}>
      {items.map(([color, label]) => (
        <View key={label} style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: color }]} />
          <Copy muted style={styles.yearCaption}>
            {label}
          </Copy>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  stackSmall: { gap: 8 },
  divider: { height: 1, backgroundColor: colors.border },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  table: { gap: 12 },
  metric: { flex: 1.15, fontSize: 14, lineHeight: 18 },
  number: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  proposed: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    textAlign: 'right',
    color: colors.accent,
  },
  bar: { height: 16, flexDirection: 'row' },
  chartScroll: { flexGrow: 0 },
  annualPlot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  target: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.muted,
  },
  yearColumn: { flex: 1, minWidth: 40, alignItems: 'center' },
  columnPair: {
    height: 128,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 3,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  yearCaption: { fontSize: 14, lineHeight: 18 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  swatch: { width: 8, height: 8 },
  periods: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    gap: 8,
  },
  period: { height: 44, minWidth: 0 },
  periodBadge: { height: 23, minWidth: 33, paddingHorizontal: 7 },
  periodLabel: { letterSpacing: 0.2 },
  disclaimer: { textAlign: 'center', fontSize: 14, lineHeight: 20 },
});
