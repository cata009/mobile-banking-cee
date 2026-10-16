import React, { useMemo } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import lighthouse from '@/assets/6f4a518088433560480f90c7a7448fdc1d294def.png';
import { getCurrencySymbol } from '@/app/registry/countryConfig';
import { getProductIcon } from '@/app/components/products/productGlyph';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import { isInvestmentsPortfolioAvailable } from '@/app/utils/investmentsAvailability';
import { isAccountDetailProduct, type Product } from '@/data/products';
import { createCurrentProducts } from '../context';
import type { CurrentScreenProps } from '../contracts';
import { BaselineAccordion } from '../../../../universal/BaselineAccordion';
import { BaselineProductsList } from '../../../../universal/BaselineProductsList';
import { BaselineProductCard } from '../../../../universal/BaselineProductCard';
import { SourceVector } from '../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../universal/sourceColor';
import { sourceLinearGradient } from '../../../../universal/sourceLinearGradient';
import { Text } from '../../../../universal/Typography';
import { FutureGainBanner } from '../future-gain/FutureGainBanner';
import { futureGainEnabled } from '../future-gain/model';

function FutureGainBannerSlot({
  host,
  dark,
}: {
  host: CurrentScreenProps;
  dark: boolean;
}) {
  return (
    <View style={styles.futureGainBannerSlot}>
      <FutureGainBanner
        onPress={() => host.onNavigate({ screen: 'smart-investment' })}
        dark={dark}
      />
    </View>
  );
}

/** Shared AccountSummary; experience selection supplies the audited visual variant. */
export function BaselineHomeBody({
  host,
  redesigned = false,
}: {
  host: CurrentScreenProps;
  redesigned?: boolean;
}) {
  const model = useMemo(
    () =>
      createCurrentProducts({
        country: host.country,
        release: host.release,
        productCounts: host.productCounts,
      }),
    [host.country, host.release, host.productCounts],
  );
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const textColor = sourceColor('var(--uc-text)', dark);
  const currency = getCurrencySymbol(host.country);
  const available = maskAmountParts(
    model.calculateTotalAvailable(),
    host.amountsHidden,
  );
  const owed = maskAmountParts(model.calculateTotalOwed(), host.amountsHidden);
  const productAction = (product: Product): (() => void) | undefined => {
    if (
      product.type === 'investment_account' &&
      isInvestmentsPortfolioAvailable('PI', host.country)
    ) {
      return () => host.onNavigate({ screen: 'investments' });
    }
    if (product.type === 'debit_card' || product.type === 'credit_card') {
      return () =>
        host.onNavigate({
          screen: 'card',
          params: { productId: product.id, cardId: product.id },
        });
    }
    if (isAccountDetailProduct(product)) {
      return () =>
        host.onNavigate({
          screen: 'account',
          params: { productId: product.id, accountId: product.id },
        });
    }
    return undefined;
  };
  const summaryStyle = [
    styles.summary,
    { backgroundColor: sourceColor('var(--uc-teal-soft)', dark) },
    redesigned
      ? {
          backgroundColor: 'transparent',
          backgroundImage: sourceLinearGradient(
            sourceColor('var(--uc-product-blue)', dark),
            sourceColor('var(--uc-teal-soft)', dark),
            Platform.OS === 'web' ? 'web' : 'native',
          ),
        }
      : undefined,
  ];
  const labelStyle = [styles.label, { color: textColor }];
  const availableIntegerStyle = [styles.availableInteger, { color: textColor }];
  const availableDecimalsStyle = [
    styles.availableDecimals,
    { color: textColor },
  ];
  const owedIntegerStyle = [styles.owedInteger, { color: textColor }];
  const owedDecimalsStyle = [styles.owedDecimals, { color: textColor }];
  const dividerStyle = [styles.divider, { backgroundColor: textColor }];

  return (
    <>
      <View style={styles.summaryGutter}>
        <View style={summaryStyle}>
          <View style={styles.summaryCopy}>
            <View style={styles.balanceBlock}>
              <Text style={labelStyle}>
                {host.t(
                  redesigned ? 'home.totalBalance' : 'home.totalAvailable',
                )}
              </Text>
              <View style={styles.availableRow}>
                <Text style={availableIntegerStyle}>{available.integer}</Text>
                <Text style={availableDecimalsStyle}>
                  {available.decimals} {currency}
                </Text>
              </View>
            </View>
            <View style={dividerStyle} />
            <View style={styles.balanceBlock}>
              <Text style={labelStyle}>Total Owed</Text>
              <View style={styles.owedRow}>
                <Text style={owedIntegerStyle}>{owed.integer}</Text>
                <Text style={owedDecimalsStyle}>
                  {owed.decimals} {currency}
                </Text>
              </View>
            </View>
            {redesigned ? (
              <View
                style={[
                  styles.redesignInfo,
                  { borderTopColor: `${textColor}33` },
                ]}
              >
                <Text style={[styles.redesignCopy, { color: textColor }]}>
                  ✨ Redesigned card layout
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.lighthousePosition}>
            <Image
              source={
                typeof lighthouse === 'number'
                  ? lighthouse
                  : { uri: lighthouse }
              }
              accessibilityLabel="Lighthouse"
              resizeMode="cover"
              style={styles.lighthouse}
            />
          </View>
        </View>
      </View>
      {model.categories.map(category => {
        const showTotal = category.key !== 'cards';
        const total =
          showTotal && category.products.length >= 2
            ? model.calculateTotal(category.products)
            : undefined;
        return (
          <View key={category.key} style={styles.category}>
            <BaselineAccordion
              title={category.title}
              defaultOpen={false}
              dark={dark}
            >
              <BaselineProductsList
                isOpen={false}
                showTotal={showTotal}
                variant="legacy"
                productStyle="pi"
                totalData={
                  total ? maskAmountParts(total, host.amountsHidden) : undefined
                }
                dark={dark}
              >
                {category.products.map(product => {
                  const amount = maskAmountParts(
                    model.formatProductAmount(product),
                    host.amountsHidden,
                  );
                  return (
                    <BaselineProductCard
                      key={product.id}
                      icon={
                        <SourceVector
                          node={getProductIcon(product)}
                          size={32}
                          color={sourceColor('var(--uc-action)', dark)}
                        />
                      }
                      title={product.name}
                      accountNumber={model.getProductDisplayNumber(product)}
                      amount={amount.integer}
                      decimals={amount.decimals}
                      currency={amount.currency}
                      variant="legacy"
                      productStyle="pi"
                      onPress={productAction(product)}
                      dark={dark}
                    />
                  );
                })}
              </BaselineProductsList>
              {category.key === 'investments' &&
              category.products.length > 0 &&
              futureGainEnabled(host) ? (
                <FutureGainBannerSlot host={host} dark={dark} />
              ) : null}
            </BaselineAccordion>
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  summaryGutter: { paddingHorizontal: 24 },
  futureGainBannerSlot: { paddingTop: 16 },
  summary: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  summaryCopy: { flex: 1, padding: 24, gap: 4 },
  redesignInfo: { marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
  redesignCopy: {
    fontFamily: 'UniCredit-regular',
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.75,
  },
  balanceBlock: { gap: 4 },
  label: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    // Source's bold sans-serif fallback covers glyphs absent from UniCredit.
    // Keep the real bold face for Latin text and prevent synthetic double bold.
    ...(Platform.OS === 'web'
      ? {
          fontFamily: 'UniCredit-bold, sans-serif',
          fontWeight: '700' as const,
          fontSynthesis: 'none',
        }
      : {}),
  },
  availableRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  availableInteger: {
    fontFamily: 'UniCredit-bold',
    fontSize: 30,
  },
  availableDecimals: {
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
  },
  divider: { width: 205, height: 0.25 },
  owedRow: { flexDirection: 'row', alignItems: 'baseline' },
  owedInteger: { fontFamily: 'UniCredit-bold', fontSize: 20 },
  owedDecimals: { fontFamily: 'UniCredit-bold', fontSize: 14 },
  lighthousePosition: { position: 'absolute', top: 24, right: 0, width: 96 },
  // Original PNG is 193×481; Source renders width 96 with its intrinsic aspect.
  lighthouse: { width: 96, aspectRatio: 193 / 481 },
  category: { paddingTop: 24 },
});
