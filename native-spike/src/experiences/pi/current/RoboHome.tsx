import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import lighthouse from '@/assets/6f4a518088433560480f90c7a7448fdc1d294def.png';
import { getProductIcon } from '@/app/components/products/productGlyph';
import { FUTURE_CZ_ACCOUNT_CARD_ACTIONS } from '@/features/products/currentActions';
import {
  formatAmount,
  isAccountDetailProduct,
  type Product,
} from '@/data/products';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import { isInvestmentsPortfolioAvailable } from '@/app/utils/investmentsAvailability';
import {
  SourceCustomIcon,
  SourceVector,
} from '../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../universal/sourceColor';
import { Text } from '../../../universal/Typography';
import { createCurrentProducts } from './context';
import { IconAction } from './Primitives';
import type { CurrentScreenProps } from './contracts';
type Amount = ReturnType<typeof formatAmount>;
function AmountLabel({
  host,
  value,
  large = false,
  compact = false,
}: {
  host: CurrentScreenProps;
  value: Amount;
  large?: boolean;
  compact?: boolean;
}) {
  return (
    <Text
      accessibilityLabel={`${value.integer}${value.decimals} ${value.currency}`}
      style={[
        styles.amount,
        { color: host.tokens.text },
        large ? styles.totalAmount : undefined,
        compact ? styles.compactAmount : undefined,
      ]}
    >
      {value.integer}
      <Text style={large ? styles.summaryDecimals : styles.amountDecimals}>
        {value.decimals} {value.currency}
      </Text>
    </Text>
  );
}
function ProductEvolution({
  host,
  product,
  title,
  value,
  number,
  role,
  onPress,
  goal = false,
}: {
  host: CurrentScreenProps;
  product?: Product;
  title: string;
  value: Amount;
  number: string;
  role: 'single' | 'first' | 'middle' | 'last';
  onPress?: () => void;
  goal?: boolean;
}) {
  const actions =
    product?.type === 'current_account' ? FUTURE_CZ_ACCOUNT_CARD_ACTIONS : [];
  return (
    <View
      testID="robo-home-evolution-card"
      style={[
        styles.card,
        {
          backgroundColor: host.tokens.surface,
          borderColor: host.tokens.border,
        },
        role === 'single'
          ? styles.single
          : role === 'first'
          ? styles.first
          : role === 'last'
          ? styles.last
          : undefined,
        role === 'middle' || role === 'last' ? styles.separator : undefined,
      ]}
    >
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={title}
        onPress={onPress}
        style={styles.body}
      >
        <View style={styles.productTop}>
          <View style={styles.productCopy}>
            <Text style={[styles.productTitle, { color: host.tokens.text }]}>
              {title}
            </Text>
            <Text style={[styles.number, { color: host.tokens.text }]}>
              {number}
            </Text>
          </View>
          <View style={styles.visual}>
            {goal ? (
              <SourceCustomIcon
                name="investment-goals-product"
                size={32}
                color={host.tokens.accent}
              />
            ) : product ? (
              <SourceVector
                node={getProductIcon(product)}
                color={host.tokens.accent}
              />
            ) : null}
          </View>
        </View>
        <AmountLabel host={host} value={value} />
      </Pressable>
      {actions.length ? (
        <View style={styles.quickActions}>
          {actions.map(action => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.ariaLabel}
              style={styles.quickAction}
              onPress={() => {
                if (action.id === 'new-payment')
                  host.onNavigate({ screen: 'payment-create' });
                if (action.id === 'account-info' && product)
                  host.onNavigate({
                    screen: 'account-info',
                    params: { productId: product.id, accountId: product.id },
                  });
              }}
            >
              <View
                style={[
                  styles.actionCircle,
                  { backgroundColor: host.tokens.background },
                ]}
              >
                <SourceCustomIcon
                  name={action.iconName}
                  size={action.iconSize}
                  color={host.tokens.text}
                />
              </View>
              <Text style={[styles.actionLabel, { color: host.tokens.text }]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
export default function RoboHome(host: CurrentScreenProps) {
  const model = useMemo(() => createCurrentProducts(host), [host]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const mask = (value: Amount) => maskAmountParts(value, host.amountsHidden);
  // AccountSummary publishes this Home fixture independently of goal-detail state.
  const goalValue = 151_241.33;
  const select = (product: Product) => {
    if (product.type === 'investment_account') {
      if (isInvestmentsPortfolioAvailable('PI', host.country))
        host.onNavigate({ screen: 'investments' });
    } else if (product.type === 'debit_card' || product.type === 'credit_card')
      host.onNavigate({
        screen: 'card',
        params: { productId: product.id, cardId: product.id },
      });
    else if (isAccountDetailProduct(product))
      host.onNavigate({
        screen: 'account',
        params: { productId: product.id, accountId: product.id },
      });
  };
  return (
    <View style={[styles.page, { backgroundColor: host.tokens.background }]}>
      <View
        style={{
          paddingTop: host.screenTopInset,
          backgroundColor: host.tokens.background,
        }}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Prime"
            onPress={() => host.onNavigate({ screen: 'prime' })}
            style={styles.prime}
          >
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Path
                d="M7.98926 15L4.69434 6H11.2812L7.98926 15ZM9.70215 13.2139L12.3457 6H16L9.70215 13.2139ZM6.24316 13.2129L0 6H3.63184L6.24316 13.2129ZM3.7041 5H0L2.86523 1.5H5.2334L3.7041 5ZM9.65527 1.5L11.1846 5H4.79395L6.32324 1.5H9.65527ZM15.9785 5H12.2744L10.7451 1.5H13.1133L15.9785 5Z"
                fill="#ffffff"
              />
            </Svg>
            <Text style={styles.primeLabel}>Prime</Text>
          </Pressable>
          <View style={styles.headerActions}>
            <IconAction
              host={host}
              name={host.amountsHidden ? 'amount-show' : 'amount-hide'}
              size={20}
              slotSize={32}
              label={host.amountsHidden ? 'Show amounts' : 'Hide amounts'}
              onPress={host.onAmountsToggle}
            />
            <IconAction
              host={host}
              size={20}
              slotSize={32}
              name="header-profile"
              label="Profile"
            />
            <IconAction
              host={host}
              size={20}
              slotSize={32}
              name="header-messages"
              label="Messages"
              onPress={() => host.onNavigate({ screen: 'messages' })}
            />
          </View>
        </View>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: host.tokens.text }]}
        >
          Your Homepage
        </Text>
        <View
          testID="robo-home-balance-summary"
          style={[
            styles.summary,
            {
              backgroundColor: sourceColor(
                'var(--uc-teal-soft)',
                host.tokens.background === '#121212',
              ),
            },
          ]}
        >
          <View style={styles.summaryCopy}>
            <Text style={[styles.smallStrong, { color: host.tokens.text }]}>
              {host.t('home.totalAvailable')}
            </Text>
            <AmountLabel
              host={host}
              value={mask(model.calculateTotalAvailable())}
              large
            />
            <View
              style={[styles.divider, { backgroundColor: host.tokens.text }]}
            />
            <Text style={[styles.smallStrong, { color: host.tokens.text }]}>
              Total Owed
            </Text>
            <AmountLabel
              host={host}
              value={mask(model.calculateTotalOwed())}
              compact
            />
          </View>
          <Image
            source={
              typeof lighthouse === 'number' ? lighthouse : { uri: lighthouse }
            }
            accessibilityLabel="Lighthouse"
            resizeMode="contain"
            style={styles.lighthouse}
          />
        </View>
        {model.categories.map(category => {
          const investment =
            category.key === 'investments' && category.products.length > 0;
          const count = category.products.length + (investment ? 1 : 0);
          const open = !!expanded[category.key];
          const shown = open
            ? category.products
            : category.products.slice(0, 1);
          const hasTotal = category.key !== 'cards' && count >= 2;
          const total = mask(
            investment
              ? formatAmount(
                  category.products.reduce(
                    (sum, product) => sum + product.balance,
                    goalValue,
                  ),
                  'CZK',
                )
              : model.calculateTotal(category.products),
          );
          return (
            <View key={category.key} style={styles.category}>
              <Pressable
                accessibilityRole={count !== 1 ? 'button' : undefined}
                accessibilityLabel={category.title}
                accessibilityState={{ expanded: open }}
                disabled={count === 1}
                onPress={() =>
                  setExpanded(previous => ({
                    ...previous,
                    [category.key]: !open,
                  }))
                }
                style={styles.categoryHeader}
              >
                <Text
                  style={[styles.categoryTitle, { color: host.tokens.text }]}
                >
                  {category.title}
                </Text>
                {count !== 1 ? (
                  <View
                    style={[
                      exactSourceStyles.inline1,
                      { transform: [{ rotate: open ? '180deg' : '0deg' }] },
                    ]}
                  >
                    <SourceCustomIcon
                      name="chevron-down-wide"
                      size={20}
                      color={host.tokens.text}
                    />
                  </View>
                ) : null}
              </Pressable>
              <View style={styles.products}>
                {shown.map((product, index) => (
                  <ProductEvolution
                    key={product.id}
                    host={host}
                    product={product}
                    title={investment ? 'Security Portfolio' : product.name}
                    number={model.getProductDisplayNumber(product)}
                    value={mask(model.formatProductAmount(product))}
                    role={
                      count === 1
                        ? 'single'
                        : index === 0
                        ? 'first'
                        : index === count - 1 && !hasTotal
                        ? 'last'
                        : 'middle'
                    }
                    onPress={() => select(product)}
                  />
                ))}
                {open && investment ? (
                  <ProductEvolution
                    host={host}
                    title="Investment goals"
                    number=""
                    goal
                    value={mask({
                      integer: '151 241',
                      decimals: '.33',
                      currency: 'CZK',
                    })}
                    role={hasTotal ? 'middle' : 'last'}
                    onPress={() =>
                      host.onNavigate({
                        screen: 'investments',
                        params: { view: 'goals' },
                      })
                    }
                  />
                ) : null}
                {!open && count > 1 ? (
                  <View
                    testID={`robo-home-stack-${category.key}`}
                    style={styles.stack}
                  >
                    <Svg
                      width="100%"
                      height={9}
                      viewBox="0 0 319 9"
                      preserveAspectRatio="none"
                    >
                      <Path
                        d="M0 0H319V5C319 7.20914 317.209 9 315 9H4C1.79086 9 0 7.20914 0 5V0Z"
                        fill={host.tokens.surface}
                      />
                      <Path
                        d="M0 0.5H319"
                        stroke={host.tokens.border}
                        opacity={0.296317}
                      />
                    </Svg>
                  </View>
                ) : null}
                {open && hasTotal ? (
                  <View
                    style={[
                      styles.totalRow,
                      {
                        backgroundColor: host.tokens.surface,
                        borderColor: host.tokens.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.totalLabel, { color: host.tokens.text }]}
                    >
                      {investment ? 'Total investments' : 'Total'}
                    </Text>
                    <View style={styles.totalMoney}>
                      <AmountLabel host={host} value={total} compact />
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  header: {
    height: 56,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  prime: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#202a30',
  },
  primeLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 16,
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    height: 32,
    alignItems: 'center',
  },
  scroll: { paddingBottom: 96 },
  title: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 31,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  summary: {
    marginHorizontal: 24,
    backgroundColor: '#9bc6cd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  summaryCopy: { padding: 24, gap: 4 },
  smallStrong: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 15 },
  amount: { fontFamily: 'UniCredit-bold', fontSize: 24, lineHeight: 28 },
  amountDecimals: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 16,
  },
  totalAmount: {
    fontFamily: 'UniCredit-bold',
    fontSize: 30,
    lineHeight: 33,
  },
  compactAmount: { fontSize: 20, lineHeight: 22 },
  summaryDecimals: {
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
    lineHeight: 22,
  },
  divider: { width: 205, height: 0.25 },
  lighthouse: {
    position: 'absolute',
    top: 24,
    right: 0,
    width: 96,
    height: (96 * 481) / 193,
  },
  category: { paddingTop: 24 },
  categoryHeader: {
    height: 48,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryTitle: { fontFamily: 'UniCredit-bold', fontSize: 20, lineHeight: 24 },
  products: { paddingHorizontal: 24, paddingTop: 8 },
  card: { padding: 16 },
  body: { gap: 8 },
  productTop: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  productCopy: { flex: 1, minWidth: 0, gap: 4 },
  productTitle: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 18 },
  number: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 16 },
  visual: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: { marginTop: 32, flexDirection: 'row', gap: 8 },
  quickAction: { flex: 1, minWidth: 0, alignItems: 'center', gap: 6 },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
  },
  single: { borderRadius: 8 },
  first: { borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  last: { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  separator: { borderTopWidth: 0.5 },
  stack: {
    height: 9,
    width: '97.48%',
    alignSelf: 'center',
    position: 'absolute',
    top: '100%',
  },
  totalRow: {
    borderTopWidth: 1,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    padding: 16,
    gap: 4,
  },
  totalLabel: { fontFamily: 'UniCredit-regular', fontSize: 18, lineHeight: 20 },
  totalMoney: { alignItems: 'flex-end' },
});

const exactSourceStyles = StyleSheet.create({
  inline1: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
