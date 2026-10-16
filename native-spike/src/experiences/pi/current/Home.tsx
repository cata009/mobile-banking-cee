import React, { useMemo, useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import lighthouse from '@/assets/6f4a518088433560480f90c7a7448fdc1d294def.png';
import {
  SourceCustomIcon,
  SourceVector,
} from '../../../universal/SourceCustomIcon';
import { getProductIcon } from '@/app/components/products/productGlyph';
import { Text } from '../../../universal/Typography';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import { isAccountDetailProduct, type Product } from '@/data/products';
import { isInvestmentsPortfolioAvailable } from '@/app/utils/investmentsAvailability';
import { createCurrentProducts, currentFeature } from './context';
import { IconAction } from './Primitives';
import type { CurrentScreenProps } from './contracts';
import Svg, { Path } from 'react-native-svg';
import { localized } from './products/Products';
import { sourceColor } from '../../../universal/sourceColor';
import BaselineHome from './baseline/Home';
import { isPiBaselineHomeContext } from './baseline/policy';

export default function Home(host: CurrentScreenProps) {
  return isPiBaselineHomeContext(host) ? (
    <BaselineHome host={host} />
  ) : (
    <LegacyCurrentHome {...host} />
  );
}
function LegacyCurrentHome(host: CurrentScreenProps) {
  const model = useMemo(
    () =>
      createCurrentProducts({
        country: host.country,
        release: host.release,
        productCounts: host.productCounts,
      }),
    [host.country, host.release, host.productCounts],
  );
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const hidden = (value: ReturnType<typeof model.calculateTotalAvailable>) =>
    maskAmountParts(value, host.amountsHidden);
  const available = hidden(model.calculateTotalAvailable());
  const owed = hidden(model.calculateTotalOwed());
  const redesigned = currentFeature(host, 'fx_cardsRedesign');
  const myBanker = currentFeature(host, 'fx_rsMyBanker');
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
    <View style={[s.page, { backgroundColor: host.tokens.background }]}>
      <View
        style={{
          paddingTop: host.screenTopInset,
          backgroundColor: host.tokens.background,
        }}
      >
        <View style={s.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Prime"
            onPress={() => host.onNavigate({ screen: 'prime' })}
            style={s.prime}
          >
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Path
                d="M7.98926 15L4.69434 6H11.2812L7.98926 15ZM9.70215 13.2139L12.3457 6H16L9.70215 13.2139ZM6.24316 13.2129L0 6H3.63184L6.24316 13.2129ZM3.7041 5H0L2.86523 1.5H5.2334L3.7041 5ZM9.65527 1.5L11.1846 5H4.79395L6.32324 1.5H9.65527ZM15.9785 5H12.2744L10.7451 1.5H13.1133L15.9785 5Z"
                fill="#fff"
              />
            </Svg>
            <Text style={s.primeLabel}>Prime</Text>
          </Pressable>
          <View style={s.actions}>
            {myBanker && (
              <IconAction
                host={host}
                size={20}
                slotSize={32}
                name="nav-analytics"
                label="Spending"
                onPress={() => host.onNavigate({ screen: 'pfm' })}
              />
            )}
            <IconAction
              host={host}
              size={20}
              slotSize={32}
              name={host.amountsHidden ? 'amount-show' : 'amount-hide'}
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
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          accessibilityRole="header"
          style={[s.title, { color: host.tokens.text }]}
        >
          Your Homepage
        </Text>
        <View
          testID="baseline-balance-summary"
          style={[
            s.summary,
            redesigned ? s.summaryRedesigned : s.summaryBaseline,
            !redesigned && {
              backgroundColor: sourceColor(
                'var(--uc-teal-soft)',
                host.tokens.background === '#121212',
              ),
            },
          ]}
        >
          <View style={s.summaryCopy}>
            <Text style={[s.smallStrong, { color: host.tokens.text }]}>
              {host.t(redesigned ? 'home.totalBalance' : 'home.totalAvailable')}
            </Text>
            <Text
              accessibilityLabel={`${available.integer}${available.decimals} ${available.currency}`}
              style={[s.total, { color: host.tokens.text }]}
            >
              {available.integer}
              <Text style={s.decimals}>
                {available.decimals} {available.currency}
              </Text>
            </Text>
            <View style={[s.divider, { backgroundColor: host.tokens.text }]} />
            <Text style={[s.smallStrong, { color: host.tokens.text }]}>
              {localized(host, 'home.totalOwed', 'Total Owed')}
            </Text>
            <Text style={[s.owed, { color: host.tokens.text }]}>
              {owed.integer}
              <Text style={s.owedDecimals}>
                {owed.decimals} {owed.currency}
              </Text>
            </Text>
          </View>
          <Image
            source={
              typeof lighthouse === 'number' ? lighthouse : { uri: lighthouse }
            }
            resizeMode="cover"
            style={s.lighthouse}
          />
        </View>
        {model.categories
          .filter(category => !myBanker || category.key !== 'investments')
          .map(category => {
            const expanded = !!open[category.key];
            const shown = expanded
              ? category.products
              : category.products.slice(0, 1);
            const total = hidden(model.calculateTotal(category.products));
            return (
              <View key={category.key} style={s.category}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={category.title}
                  accessibilityState={{ expanded }}
                  disabled={category.products.length < 2}
                  onPress={() => {
                    if (Platform.OS !== 'web')
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut,
                      );
                    setOpen(previous => ({
                      ...previous,
                      [category.key]: !expanded,
                    }));
                  }}
                  style={s.categoryHeading}
                >
                  <Text style={[s.heading, { color: host.tokens.text }]}>
                    {category.title}
                  </Text>
                  {category.products.length > 1 && (
                    <View
                      style={[
                        exactSourceStyles.inline1,
                        {
                          transform: [{ rotate: expanded ? '180deg' : '0deg' }],
                        },
                      ]}
                    >
                      <SourceCustomIcon
                        name="chevron-down-wide"
                        size={20}
                        color={host.tokens.text}
                      />
                    </View>
                  )}
                </Pressable>
                <View style={s.cards}>
                  {shown.map(product => {
                    const value = hidden(model.formatProductAmount(product));
                    return (
                      <Pressable
                        key={product.id}
                        testID={`baseline-product-${product.id}`}
                        accessibilityRole="button"
                        accessibilityLabel={product.name}
                        onPress={() => select(product)}
                        style={[
                          s.card,
                          { backgroundColor: host.tokens.surface },
                        ]}
                      >
                        <View style={s.productTop}>
                          <View style={s.productVisual}>
                            <SourceVector
                              node={getProductIcon(product)}
                              color={host.tokens.accent}
                            />
                          </View>
                          <View style={s.productCopy}>
                            <Text
                              style={[
                                s.productTitle,
                                { color: host.tokens.text },
                              ]}
                            >
                              {product.name}
                            </Text>
                            <Text
                              style={[
                                s.smallStrong,
                                { color: host.tokens.text },
                              ]}
                            >
                              {model.getProductDisplayNumber(product)}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[s.productAmount, { color: host.tokens.text }]}
                        >
                          {value.integer}
                          <Text style={s.productDecimals}>
                            {value.decimals} {value.currency}
                          </Text>
                        </Text>
                      </Pressable>
                    );
                  })}
                  {!expanded && category.products.length > 1 && (
                    <View
                      accessible={false}
                      style={[
                        s.stack,
                        {
                          backgroundColor: sourceColor(
                            'var(--uc-surface)',
                            host.tokens.background === '#121212',
                          ),
                        },
                      ]}
                    />
                  )}
                  {expanded &&
                    category.products.length > 1 &&
                    category.key !== 'cards' && (
                      <View
                        style={[
                          s.totalRow,
                          { backgroundColor: host.tokens.surface },
                        ]}
                      >
                        <View style={exactSourceStyles.inline2}>
                          <Text
                            style={[
                              exactSourceStyles.inline3,
                              {
                                color: host.tokens.text,
                                fontFamily: host.tokens.font,
                              },
                            ]}
                          >
                            Total
                          </Text>
                          <Text style={[s.owed, { color: host.tokens.text }]}>
                            {total.integer}
                            <Text style={s.productDecimals}>
                              {total.decimals} {total.currency}
                            </Text>
                          </Text>
                        </View>
                      </View>
                    )}
                </View>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  summaryRedesigned: { backgroundColor: '#89c7d2' },
  summaryBaseline: { backgroundColor: '#94b1ba' },
  futureGainCard: { marginTop: 16, minHeight: 160, backgroundColor: '#f6df9f' },
  futureGainHeading: { color: '#262626' },
  futureGainBody: { marginTop: 12, color: '#262626' },
  page: { flex: 1 },
  header: {
    height: 56,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  actions: { flexDirection: 'row', gap: 8, height: 32, alignItems: 'center' },
  prime: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#202a30',
  },
  primeLabel: {
    color: '#fff',
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 16,
  },
  scroll: { paddingBottom: 96 },
  title: {
    paddingHorizontal: 24,
    fontSize: 28,
    lineHeight: 31,
    fontFamily: 'UniCredit-bold',
    paddingBottom: 24,
  },
  summary: {
    marginHorizontal: 24,
    minHeight: 149.25,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  summaryCopy: { flex: 1, padding: 24, gap: 4 },
  lighthouse: {
    position: 'absolute',
    top: 24,
    right: 0,
    width: 96,
    height: 239.26,
  },
  total: { fontSize: 30, lineHeight: 33, fontFamily: 'UniCredit-bold' },
  decimals: { fontSize: 20, lineHeight: 22, fontFamily: 'UniCredit-bold' },
  smallStrong: { fontSize: 14, fontFamily: 'UniCredit-bold', lineHeight: 15 },
  owed: { fontSize: 20, lineHeight: 22, fontFamily: 'UniCredit-bold' },
  owedDecimals: { fontSize: 14, lineHeight: 15 },
  divider: { height: 0.25, width: 205 },
  category: { paddingTop: 24 },
  categoryHeading: {
    paddingHorizontal: 24,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: { fontFamily: 'UniCredit-bold', fontSize: 24, lineHeight: 26.4 },
  cards: { paddingHorizontal: 24, paddingTop: 8, gap: 2 },
  card: {
    borderRadius: 8,
    gap: 4,
    padding: 16,
    alignItems: 'stretch',
  },
  productTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  productVisual: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productCopy: { flex: 1, minWidth: 0 },
  productTitle: {
    fontSize: 18,
    lineHeight: 20,
    fontFamily: 'UniCredit-regular',
  },
  productAmount: {
    alignSelf: 'flex-end',
    fontSize: 20,
    fontFamily: 'UniCredit-bold',
    lineHeight: 22,
  },
  productDecimals: {
    fontSize: 14,
    lineHeight: 15,
    fontFamily: 'UniCredit-regular',
  },
  stack: {
    alignSelf: 'center',
    width: '97.48%',
    height: 9,
    position: 'absolute',
    top: '100%',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  totalRow: { padding: 16, alignItems: 'flex-end', gap: 4 },
});

const exactSourceStyles = StyleSheet.create({
  inline1: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline2: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  inline3: { fontSize: 18, lineHeight: 20 },
});
