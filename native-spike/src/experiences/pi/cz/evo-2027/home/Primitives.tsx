import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { NavigationRow } from '../../../../../universal/controls';
import MovementAvatar from '../accounts/MovementAvatar';
import type { AccountTransaction } from '@/data/accountDetails';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { evoGlyphs } from './glyphs';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import { formatEvo2027Amount } from '@/app/utils/evo2027Formatting';
import type { Currency } from '@/data/products';
import { evoTokens as tokens } from './tokens';

export const textStyles = StyleSheet.create({
  body: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 14,
    lineHeight: 18,
    includeFontPadding: false,
  },
  muted: { color: tokens.muted },
  strong: { fontFamily: tokens.strongFont },
  title: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 24,
    lineHeight: 28,
  },
  section: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 20,
    lineHeight: 24,
  },
});
export function Glyph({
  name,
  size = 24,
  color,
}: {
  name: keyof typeof evoGlyphs;
  size?: number;
  color?: string;
}) {
  const originalName =
    name === 'profile'
      ? 'header-profile'
      : name === 'messages'
      ? 'header-messages'
      : name === 'analytics'
      ? 'nav-analytics'
      : name === 'show'
      ? 'amount-show'
      : name === 'hide'
      ? 'amount-hide'
      : name === 'forward'
      ? 'chevron-right'
      : name === 'back'
      ? 'back-heavy'
      : name;
  if (
    originalName === 'header-profile' ||
    originalName === 'header-messages' ||
    originalName === 'nav-analytics' ||
    originalName === 'amount-show' ||
    originalName === 'amount-hide' ||
    originalName === 'chevron-right' ||
    originalName.includes('-')
  )
    return <SourceCustomIcon name={originalName} size={size} color={color} />;
  return (
    <AssetGlyph
      asset={`data:image/svg+xml;utf8,${encodeURIComponent(evoGlyphs[name])}`}
      size={size}
      tintColor={color}
    />
  );
}
export function IconAction({
  label,
  onPress,
  name,
}: {
  label: string;
  onPress: () => void;
  name: keyof typeof evoGlyphs;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={s.icon}
    >
      <Glyph name={name} size={20} />
    </Pressable>
  );
}
export function Money({
  amount,
  currency = 'CZK',
  hidden,
  role = 'product',
  testID,
  signed = false,
}: {
  amount: number | ReturnType<typeof formatEvo2027Amount>;
  currency?: Currency;
  hidden: boolean;
  role?: 'hero' | 'product' | 'support';
  testID?: string;
  signed?: boolean;
}) {
  const parts = maskAmountParts(
    typeof amount === 'number' ? formatEvo2027Amount(amount, currency) : amount,
    hidden,
  );
  const scale =
    role === 'hero'
      ? [28, 16, 32]
      : role === 'support'
      ? [16, 12, 20]
      : [24, 14, 28];
  const sign =
    signed && !hidden && typeof amount === 'number'
      ? amount < 0
        ? '−'
        : amount > 0
        ? '+'
        : ''
      : '';
  return (
    <Text
      testID={testID}
      accessibilityLabel={`${sign}${parts.integer}${parts.decimals} ${parts.currency}`}
      style={[
        textStyles.body,
        textStyles.strong,
        { fontSize: scale[0], lineHeight: scale[2] },
      ]}
    >
      {sign}
      {parts.integer}
      <Text style={{ fontSize: scale[1], fontFamily: tokens.font }}>
        {parts.decimals} {parts.currency}
      </Text>
    </Text>
  );
}
export function Progress({
  label,
  value,
  max = 100,
  accessibilityValue,
}: {
  label: string;
  value: number;
  max?: number;
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
}) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={accessibilityValue ?? { min: 0, max, now: value }}
      style={s.progress}
    >
      <View style={[s.fill, { width: `${percent}%` }]} />
    </View>
  );
}
export function Rail({
  title,
  items,
  onAdd,
  hideCount = false,
  peek = true,
}: {
  title: string;
  items: readonly { id: string; label: string; content: React.ReactNode }[];
  onAdd?: () => void;
  hideCount?: boolean;
  peek?: boolean;
}) {
  const { width } = useWindowDimensions();
  const [railWidth, setRailWidth] = useState(Math.min(560, width - 32));
  const [page, setPage] = useState(0);
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const pageWidth = railWidth - (items.length > 1 && peek ? 24 : 0);
  const stepWidth = pageWidth + 12;
  return (
    <View
      style={s.group}
      onLayout={e =>
        setRailWidth(e.nativeEvent.layout.width || Math.min(560, width - 32))
      }
    >
      <View style={s.groupHeader}>
        <View style={s.groupLabel}>
          <Text accessibilityRole="header" style={textStyles.title}>
            {title}
          </Text>
          {!hideCount && (
            <Text style={[textStyles.body, textStyles.muted, s.count]}>
              {items.length} {items.length === 1 ? 'product' : 'products'}
            </Text>
          )}
        </View>
        {onAdd && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${title}`}
            onPress={onAdd}
            style={s.add}
          >
            <Text style={s.addLabel}>+</Text>
          </Pressable>
        )}
      </View>
      {items.length ? (
        <ScrollView
          ref={rail}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={stepWidth}
          contentContainerStyle={s.rail}
          decelerationRate="fast"
          onMomentumScrollEnd={e =>
            setPage(Math.round(e.nativeEvent.contentOffset.x / stepWidth))
          }
        >
          {items.map(item => (
            <View key={item.id} style={{ width: pageWidth }}>
              {item.content}
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={[textStyles.body, s.empty]}>No products yet</Text>
      )}
      {items.length > 1 && (
        <View
          accessibilityLabel={`Page ${Math.min(page + 1, items.length)} of ${
            items.length
          }`}
          style={s.dots}
        >
          {items.map((item, i) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Go to ${item.label}`}
              accessibilityState={{ selected: page === i }}
              onPress={() => {
                setPage(i);
                rail.current?.scrollTo({ x: i * stepWidth, animated: true });
              }}
              style={s.dotControl}
            >
              <View
                style={[
                  s.dot,
                  {
                    backgroundColor: page === i ? tokens.accent : tokens.border,
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
export function TransactionRow({
  label,
  detail,
  amount,
  currency,
  hidden,
  onPress,
  transaction,
  amountLabel,
}: {
  label: string;
  detail?: string;
  amount: number;
  currency: Currency;
  hidden: boolean;
  onPress: () => void;
  transaction?: AccountTransaction;
  amountLabel?: string;
}) {
  return (
    <NavigationRow
      tokens={{
        ...tokens,
        rowHeight: 52,
        rowPaddingVertical: 8,
        rowSubtitleSize: 13,
      }}
      title={`Open ${label} transaction, ${
        hidden ? 'amount hidden' : `${amountLabel ?? amount} ${currency}`
      }`}
      titleContent={label}
      titleStyle={s.rowTitle}
      subtitleStyle={s.rowSubtitle}
      borderWidth={0}
      subtitle={detail}
      payload={label}
      onSelect={onPress}
      icon={
        transaction ? (
          <MovementAvatar transaction={transaction} size={32} />
        ) : undefined
      }
      trailing={
        amountLabel ? (
          <Text style={[s.rowAmount, amount > 0 && s.positive]}>
            {maskFormattedAmount(amountLabel, hidden)}{' '}
            <Text style={s.rowCurrency}>{currency}</Text>
          </Text>
        ) : (
          <Money
            amount={amount}
            currency={currency}
            hidden={hidden}
            role="support"
            signed
          />
        )
      }
    />
  );
}
const s = StyleSheet.create({
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    marginTop: 16,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  fill: { height: 12, borderRadius: 6, backgroundColor: tokens.accent },
  group: { overflow: 'hidden' },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    minHeight: 48,
    marginBottom: 12,
    gap: 12,
  },
  groupLabel: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  count: { fontSize: 13, lineHeight: 16 },
  add: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    color: tokens.muted,
    fontSize: 24,
    lineHeight: 26,
    fontFamily: tokens.font,
  },
  rail: { gap: 12 },
  rowTitle: { fontSize: 14, lineHeight: 18 },
  rowSubtitle: { fontSize: 13, lineHeight: 16 },
  rowAmount: {
    fontSize: 15,
    lineHeight: 18,
    fontFamily: tokens.strongFont,
    color: tokens.text,
  },
  rowCurrency: { fontSize: 13, lineHeight: 16, fontFamily: tokens.font },
  positive: { color: '#398347' },
  empty: { padding: 16 },
  dots: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 4,
  },
  dotControl: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
