import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import type { InvestmentDistributionItem } from '@/app/config/investmentsPortfolioConfig';

export function DistributionChart({
  items,
  hidden = false,
  onSelect,
}: {
  items: readonly InvestmentDistributionItem[];
  hidden?: boolean;
  onSelect?: (id: string) => void;
}) {
  const radius = 62.5,
    circumference = 2 * Math.PI * radius;
  let accumulated = 0;
  const visible = items.slice(0, 4).map(item => {
    const angle = accumulated * 3.6 + item.percent * 1.8,
      raw = (Math.max(0, item.percent) / 100) * circumference,
      offset = (accumulated / 100) * circumference;
    accumulated += Math.max(0, item.percent);
    return {
      item,
      offset,
      length: Math.max(0, raw - circumference * 0.006),
      side: angle > 0 && angle < 180 ? 'right' : 'left',
      x: 187.5 + 89.5 * Math.sin((angle * Math.PI) / 180),
      y: 89.5 - 89.5 * Math.cos((angle * Math.PI) / 180),
      slot: 0,
    };
  });
  for (const side of ['left', 'right']) {
    const leaders = visible
      .filter(slice => slice.side === side)
      .sort((a, b) => a.y - b.y);
    const slots: Record<number, number[]> = {
      1: [90],
      2: [38, 126],
      3: [24, 90, 156],
      4: [20, 66, 112, 158],
    };
    leaders.forEach((leader, index) => {
      leader.slot = slots[leaders.length]?.[index] ?? 90;
    });
  }
  return (
    <View testID="cz-distribution-chart" style={styles.root}>
      <Svg width="100%" height={179} viewBox="0 0 375 179">
        <Circle
          cx={187.5}
          cy={89.5}
          r={radius}
          fill="none"
          stroke="#F2F2F2"
          strokeWidth={54}
        />
        {visible.map(slice => (
          <React.Fragment key={slice.item.id}>
            <Circle
              cx={187.5}
              cy={89.5}
              r={radius}
              fill="none"
              stroke={slice.item.color}
              strokeWidth={54}
              strokeDasharray={`${slice.length} ${
                circumference - slice.length
              }`}
              strokeDashoffset={-slice.offset}
              rotation={-90}
              origin="187.5,89.5"
              onPress={() => onSelect?.(slice.item.id)}
              accessibilityLabel={`${slice.item.label}: ${
                hidden ? 'hidden' : `${slice.item.percent}%`
              }`}
            />
            <Path
              d={`M ${slice.x.toFixed(1)} ${slice.y.toFixed(1)} L ${
                slice.side === 'right' ? 303 : 72
              } ${slice.y.toFixed(1)} L ${slice.side === 'right' ? 303 : 72} ${
                slice.slot
              }`}
              stroke={slice.item.color}
              strokeWidth={1}
              fill="none"
            />
            <SvgText
              x={slice.side === 'right' ? 359 : 16}
              y={slice.slot - 7}
              textAnchor={slice.side === 'right' ? 'end' : 'start'}
              fontFamily="UniCredit-regular"
              fontSize={14}
              fill="#262626"
            >
              {slice.item.label}
            </SvgText>
            <SvgText
              x={slice.side === 'right' ? 359 : 16}
              y={slice.slot + 17}
              textAnchor={slice.side === 'right' ? 'end' : 'start'}
              fontFamily="UniCredit-bold"
              fontSize={20}
              fill="#262626"
            >
              {hidden ? '••%' : `${slice.item.percent}%`}
            </SvgText>
          </React.Fragment>
        ))}
        <Circle cx={187.5} cy={89.5} r={36} fill="#FFFFFF" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({ root: { marginTop: 18 } });
