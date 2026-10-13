import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import {
  buildRoboProjection,
  projectionPath,
} from '@/features/investments/robo/projectionSelectors';
import type { RoboStrategy } from '@/features/investments/robo/types';
import { Copy, investmentColors } from './Primitives';
export { PerformanceChart } from './PerformanceChart';
export { DistributionChart } from './DistributionChart';

export function ProjectionChart({
  strategy,
  initial,
  monthly,
  years,
}: {
  strategy: RoboStrategy;
  initial: number;
  monthly: number;
  years: number;
}) {
  const projection = buildRoboProjection(strategy, initial, monthly, years);
  const colors = [
    investmentColors.lower,
    investmentColors.estimated,
    investmentColors.higher,
  ];
  return (
    <View testID="cz-projection-chart">
      <Svg width="100%" height={210} viewBox="0 0 280 210">
        {[0, 1, 2, 3].map(index => (
          <Line
            key={index}
            x1={54}
            x2={244}
            y1={168 - index * 49.3}
            y2={168 - index * 49.3}
            stroke="#E5E5E5"
          />
        ))}
        {projection.pointsByScenario.map((points, index) => (
          <Path
            key={index}
            d={projectionPath(points, projection.maxValue)}
            stroke={colors[index]}
            strokeWidth={2}
            fill="none"
          />
        ))}
        {projection.tickYears.map((year, index) => (
          <SvgText
            key={index}
            x={54 + index * 38}
            y={193}
            fill="#666666"
            fontFamily="UniCredit-regular"
            fontSize={12}
            textAnchor="middle"
          >
            {year}
          </SvgText>
        ))}
      </Svg>
      {projection.values.map((value, index) => (
        <Copy key={index} style={[styles.scenario, { color: colors[index] }]}>
          {['Lower', 'Estimated', 'Higher'][index]} scenario:{' '}
          {formatInvestmentMoney(value, 'CZ', 'CZK')}
        </Copy>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ scenario: { marginBottom: 8 } });
