import React from 'react';
import { View, Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { InvestmentDistributionItem } from '@/app/config/investmentsPortfolioConfig';
import { formatInvestmentAmountParts } from '@/app/utils/investmentAmountFormatting';
import type { CurrentScreenProps } from '../../../contracts';
import { investmentColor } from '../Frame';
import { Copy } from './ui';

export function Distribution({
  host,
  title,
  items,
  actions,
  onSelect,
}: {
  host: CurrentScreenProps;
  title: string;
  items: readonly InvestmentDistributionItem[];
  actions: React.ReactNode;
  onSelect: (item: InvestmentDistributionItem) => void;
}) {
  const size = 179,
    stroke = 54,
    radius = (size - stroke) / 2,
    circumference = 2 * Math.PI * radius;
  let consumed = 0;
  const slices = items.slice(0, 4).map(item => {
    const raw = (Math.max(0, item.percent) / 100) * circumference,
      mid = (consumed / circumference) * 360 + item.percent * 1.8,
      angle = (mid * Math.PI) / 180,
      x = 187.5 + 89.5 * Math.sin(angle),
      y = 89.5 - 89.5 * Math.cos(angle),
      side = mid > 0 && mid < 180 ? 'right' : 'left',
      slice = {
        item,
        visible: Math.max(0, raw - circumference * 0.006),
        offset: -consumed,
        x,
        y,
        side,
        slot: 90,
      };
    consumed += raw;
    return slice;
  });
  for (const side of ['left', 'right']) {
    const group = slices.filter(s => s.side === side).sort((a, b) => a.y - b.y),
      slots =
        group.length === 1
          ? [90]
          : group.length === 2
          ? [38, 126]
          : group.length === 3
          ? [24, 90, 156]
          : [20, 66, 112, 158];
    group.forEach((s, i) => {
      s.slot = slots[i] ?? 90;
    });
  }
  const labelStyle = (s: (typeof slices)[number]) =>
    ({
      position: 'absolute',
      maxWidth: 70,
      top: s.slot - 20,
      ...(s.side === 'right' ? { right: 16 } : { left: 16 }),
    } as const);
  const labelCopyStyle = (s: (typeof slices)[number]) =>
    ({
      lineHeight: 16,
      letterSpacing: 0.2,
      textAlign: s.side === 'right' ? 'right' : 'left',
    } as const);
  const percentageStyle = (s: (typeof slices)[number]) =>
    ({
      lineHeight: 24,
      textAlign: s.side === 'right' ? 'right' : 'left',
    } as const);
  return (
    <View style={styles.distributionViewStyle1}>
      <View
        style={styles.distributionViewStyle2}
        accessibilityLabel={`100% ${host.t(
          'runtime.investments.total',
          'Total',
        )}`}
      >
        <Svg
          width="100%"
          height={179}
          viewBox="0 0 375 179"
          style={styles.distributionSvgStyle3}
        >
          {slices.map(s => (
            <Path
              key={s.item.id}
              d={`M ${s.x.toFixed(1)} ${s.y.toFixed(1)} L ${
                s.side === 'right' ? 303 : 72
              } ${s.y.toFixed(1)} L ${s.side === 'right' ? 303 : 72} ${s.slot}`}
              fill="none"
              stroke={s.item.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
        <Svg
          width={179}
          height={179}
          viewBox="0 0 179 179"
          style={styles.distributionSvgStyle4}
        >
          <Circle
            cx={89.5}
            cy={89.5}
            r={radius}
            fill="none"
            stroke="#F2F2F2"
            strokeWidth={stroke}
          />
          {slices.map(s => (
            <Circle
              key={s.item.id}
              cx={89.5}
              cy={89.5}
              r={radius}
              fill="none"
              stroke={s.item.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.visible} ${circumference - s.visible}`}
              strokeDashoffset={s.offset}
              transform="rotate(-90 89.5 89.5)"
            />
          ))}
          <Circle
            cx={89.5}
            cy={89.5}
            r={36}
            fill={investmentColor(host, '--uc-surface')}
          />
        </Svg>
        {slices.map(s => (
          <View key={s.item.id} style={labelStyle(s)}>
            <Copy host={host} numberOfLines={2} style={labelCopyStyle(s)}>
              {s.item.label}
            </Copy>
            <Copy host={host} size={20} bold style={percentageStyle(s)}>
              {s.item.percent}%
            </Copy>
          </View>
        ))}
      </View>
      <View style={styles.distributionViewStyle8}>{actions}</View>
      <View style={styles.distributionViewStyle9}>
        <Copy host={host} size={16} bold>
          {title}
        </Copy>
      </View>
      <View style={styles.distributionViewStyle10}>
        {items.map(item => {
          const amount = formatInvestmentAmountParts(
            item.value,
            host.country,
            item.currency,
            host.amountsHidden,
          );
          const distributionViewStyle13 = {
            marginTop: 5,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: item.color,
          } as const;
          const distributionCopyStyle16 = {
            marginTop: 2,
            color: investmentColor(host, '--uc-text-muted'),
          } as const;
          return (
            <Pressable
              key={item.id}
              testID={`baseline-investment-distribution-${item.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} ${amount.integer}${
                amount.decimal
              } ${amount.currency}${
                item.secondaryLabel ? ` ${item.secondaryLabel}` : ''
              } ${item.percent}%`}
              onPress={() => onSelect(item)}
              style={styles.distributionPressableStyle11}
            >
              <View style={styles.distributionViewStyle12}>
                <View style={distributionViewStyle13} />
                <View style={styles.distributionViewStyle14}>
                  <Copy host={host} size={16} bold numberOfLines={1}>
                    {item.label}
                  </Copy>
                  <Copy
                    host={host}
                    size={16}
                    style={styles.distributionCopyStyle15}
                  >
                    {amount.integer}
                    {amount.decimal} {amount.currency}
                  </Copy>
                  {item.secondaryLabel ? (
                    <Copy
                      host={host}
                      numberOfLines={1}
                      style={distributionCopyStyle16}
                    >
                      {item.secondaryLabel}
                    </Copy>
                  ) : null}
                </View>
              </View>
              <Copy
                host={host}
                size={20}
                bold
                style={styles.distributionCopyStyle17}
              >
                {item.percent}%
              </Copy>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = {
  distributionViewStyle1: { paddingTop: 18 },
  distributionViewStyle2: { height: 179, width: '100%', overflow: 'hidden' },
  distributionSvgStyle3: { position: 'absolute', inset: 0 },
  distributionSvgStyle4: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -89.5 }],
  },
  distributionViewStyle8: { marginTop: 8 },
  distributionViewStyle9: { marginTop: 24, paddingHorizontal: 23 },
  distributionViewStyle10: { marginTop: 18 },
  distributionPressableStyle11: {
    minHeight: 80,
    paddingHorizontal: 23,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  distributionViewStyle12: { flexDirection: 'row', gap: 10, flexShrink: 1 },
  distributionViewStyle14: { flexShrink: 1 },
  distributionCopyStyle15: { marginTop: 3 },
  distributionCopyStyle17: { lineHeight: 22 },
} as const;
