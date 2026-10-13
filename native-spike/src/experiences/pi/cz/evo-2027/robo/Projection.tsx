import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ROBO_STRATEGIES } from '@/features/investments/robo/catalog';
import { getPortfoliosForStrategy } from '@/features/investments/robo/model';
import type { RoboAdvisorFlowState } from '@/features/investments/robo/legacyFlowState';
import type { RoboEvent } from '@/features/investments/robo/flowState';
import { FormField } from '../../../../../universal/FormField';
import {
  Button,
  Copy,
  Page,
  czInvestmentTokens,
} from '../investments/Primitives';
import { ProjectionChart } from '../investments/Charts';

/** Native pointer drag and accessibility increment/decrement on Source control ranges. */
function AmountControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: string) => void;
}) {
  const [width, setWidth] = useState(327);
  const change = (x: number) =>
    onChange(
      String(
        Math.min(
          max,
          Math.max(
            min,
            Math.round((min + (x / width) * (max - min)) / step) * step,
          ),
        ),
      ),
    );
  const position = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return (
    <View style={s.amount}>
      <FormField
        tokens={czInvestmentTokens}
        label={label}
        value={String(value)}
        onChange={onChange}
        inputProps={{ keyboardType: 'number-pad' }}
      />
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`${label} slider`}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={event =>
          onChange(
            String(
              Math.min(
                max,
                Math.max(
                  min,
                  value +
                    (event.nativeEvent.actionName === 'increment'
                      ? step
                      : -step),
                ),
              ),
            ),
          )
        }
        onLayout={event => setWidth(event.nativeEvent.layout.width || 327)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={event => change(event.nativeEvent.locationX)}
        onResponderMove={event => change(event.nativeEvent.locationX)}
        style={s.slider}
      >
        <View style={s.track}>
          <View style={[s.fill, { width: `${position * 100}%` }]} />
        </View>
        <View style={[s.thumb, { left: Math.max(0, width * position - 12) }]} />
      </View>
    </View>
  );
}
export function Projection({
  view,
  dispatch,
  onBack,
  onExit,
}: {
  view: RoboAdvisorFlowState;
  dispatch: React.Dispatch<RoboEvent>;
  onBack: () => void;
  onExit: () => void;
}) {
  const strategy =
    ROBO_STRATEGIES.find(
      candidate => candidate.id === view.selectedStrategyId,
    ) ?? ROBO_STRATEGIES[0]!;
  const initial = Number(view.initialAmount) || 50000,
    monthly = Number(view.monthlyContribution) || 2000,
    years = view.horizonYears || Number(view.manualHorizon) || 10;
  return (
    <Page
      kind="projection"
      title={`Projection for ${strategy.name}`}
      description={`Adjust the amount invested now and the monthly contribution to see how your ${strategy.name} strategy could develop over ${years} years.`}
      onBack={onBack}
      onClose={onExit}
      footer={
        <Button
          label="Choose portfolio"
          onPress={() => {
            dispatch({ type: 'open-portfolio', from: 'projection' });
            dispatch({
              type: 'portfolio-selected',
              portfolio: getPortfoliosForStrategy(strategy.id)[0] ?? null,
            });
          }}
        />
      }
    >
      <ProjectionChart
        strategy={strategy}
        initial={initial}
        monthly={monthly}
        years={years}
      />
      <AmountControl
        label="Invest now"
        value={initial}
        min={10000}
        max={1000000}
        step={10000}
        onChange={value =>
          dispatch({ type: 'draft-changed', field: 'initialAmount', value })
        }
      />
      <AmountControl
        label="Invest monthly"
        value={monthly}
        min={0}
        max={20000}
        step={500}
        onChange={value =>
          dispatch({
            type: 'draft-changed',
            field: 'monthlyContribution',
            value,
          })
        }
      />
      <Copy>
        These projections are estimates, not a promise of future performance.
        Actual results and the amount you get back may be lower.
      </Copy>
    </Page>
  );
}
const s = StyleSheet.create({
  amount: { marginTop: 30 },
  slider: { height: 40, justifyContent: 'center' },
  track: { height: 4, borderRadius: 2, backgroundColor: '#E5E5E5' },
  fill: { height: 4, borderRadius: 2, backgroundColor: '#007A91' },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007A91',
    top: 8,
  },
});
