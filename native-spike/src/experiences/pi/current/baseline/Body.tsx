import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
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
import { BaselineBanner } from '../../../../universal/BaselineBanner';
import { BaselineCarouselIndicator } from '../../../../universal/BaselineCarouselIndicator';
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
  const securityNotice = host.bankingPresentation?.homeSecurityNotice;
  const summaryRail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [summaryWidth, setSummaryWidth] = useState(327);
  const [summaryIndex, setSummaryIndex] = useState(0);
  const summaryStep = summaryWidth + 12;
  useEffect(() => {
    if (Platform.OS !== 'web' || !securityNotice) return;
    const node = summaryRail.current?.getScrollableNode() as
      HTMLElement | undefined;
    if (!node?.addEventListener) return;
    let pressed = false,
      moved = false,
      startX = 0,
      startScroll = 0,
      suppressUntil = 0;
    const finish = () => {
      if (!pressed) return;
      pressed = false;
      node.style.cursor = 'grab';
      if (!moved) return;
      suppressUntil = Date.now() + 100;
      const index = Math.max(
        0,
        Math.min(1, Math.round(node.scrollLeft / summaryStep)),
      );
      setSummaryIndex(index);
      summaryRail.current?.scrollTo({
        x: index * summaryStep,
        y: 0,
        animated: true,
      });
    };
    const down = (event: MouseEvent) => {
      if (event.button === 0) {
        pressed = true;
        moved = false;
        startX = event.clientX;
        startScroll = node.scrollLeft;
      }
    };
    const move = (event: MouseEvent) => {
      if (!pressed) return;
      if (event.buttons !== 1) {
        finish();
        return;
      }
      const delta = event.clientX - startX;
      if (!moved && Math.abs(delta) < 4) return;
      moved = true;
      event.preventDefault();
      node.style.cursor = 'grabbing';
      const scale = node.getBoundingClientRect().width / node.clientWidth || 1;
      node.scrollLeft = startScroll - delta / scale;
    };
    const click = (event: MouseEvent) => {
      if (moved && Date.now() < suppressUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const preventDrag = (event: Event) => event.preventDefault();
    node.style.cursor = 'grab';
    node.addEventListener('mousedown', down);
    node.addEventListener('click', click, true);
    node.addEventListener('dragstart', preventDrag);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', finish);
    return () => {
      node.removeEventListener('mousedown', down);
      node.removeEventListener('click', click, true);
      node.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', finish);
    };
  }, [securityNotice, summaryStep]);
  const model = useMemo(
    () =>
      createCurrentProducts({
        country: host.country,
        release: host.release,
        productCounts: host.productCounts,
        bankingPresentation: host.bankingPresentation,
        virtualCards: host.virtualCards,
      }),
    [
      host.country,
      host.release,
      host.productCounts,
      host.bankingPresentation,
      host.virtualCards,
    ],
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

  const summary = (
    <View style={[summaryStyle, securityNotice ? { height: 157 } : undefined]}>
      <View style={styles.summaryCopy}>
        <View style={styles.balanceBlock}>
          <Text style={labelStyle}>
            {host.t(redesigned ? 'home.totalBalance' : 'home.totalAvailable')}
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
            style={[styles.redesignInfo, { borderTopColor: `${textColor}33` }]}
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
            typeof lighthouse === 'number' ? lighthouse : { uri: lighthouse }
          }
          accessibilityLabel="Lighthouse"
          resizeMode="cover"
          style={styles.lighthouse}
        />
      </View>
    </View>
  );
  return (
    <>
      <>
        <View
          style={[
            styles.summaryGutter,
            securityNotice ? { paddingHorizontal: 0 } : undefined,
          ]}
          onLayout={event =>
            setSummaryWidth(Math.max(1, event.nativeEvent.layout.width - 48))
          }
        >
          {securityNotice ? (
            <>
              <ScrollView
                ref={summaryRail}
                testID="home-security-carousel"
                horizontal
                snapToOffsets={[0, summaryStep]}
                snapToEnd={false}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                scrollEventThrottle={16}
                onScroll={event =>
                  setSummaryIndex(
                    Math.max(
                      0,
                      Math.min(
                        1,
                        Math.round(
                          event.nativeEvent.contentOffset.x / summaryStep,
                        ),
                      ),
                    ),
                  )
                }
                style={{ width: summaryWidth + 48 }}
              >
                <View style={{ width: summaryWidth }}>
                  <BaselineBanner
                    variant="pending"
                    title={securityNotice.title}
                    description={securityNotice.description}
                    tagLabel={securityNotice.tagLabel}
                    presentation={{ width: '100%' }}
                    onPress={() =>
                      host.onNavigate({
                        screen: 'transactions',
                        params: { fraudAction: 'review-alerts' },
                      })
                    }
                    dark={dark}
                  />
                </View>
                <View style={{ width: summaryWidth }}>{summary}</View>
              </ScrollView>
              <BaselineCarouselIndicator
                count={2}
                activeIndex={summaryIndex}
                itemLabels={['Show security alert', 'Show total available']}
                onSelect={index => {
                  setSummaryIndex(index);
                  summaryRail.current?.scrollTo({
                    x: index * summaryStep,
                    y: 0,
                    animated: true,
                  });
                }}
                dark={dark}
              />
            </>
          ) : (
            summary
          )}
        </View>
      </>
      {model.categories.map((category, categoryIndex) => {
        const showTotal = category.key !== 'cards';
        const total =
          showTotal && category.products.length >= 2
            ? model.calculateTotal(category.products)
            : undefined;
        return (
          <React.Fragment key={category.key}>
            <View
              style={[
                styles.category,
                securityNotice && categoryIndex === 0
                  ? { paddingTop: 12 }
                  : undefined,
              ]}
            >
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
                    total
                      ? maskAmountParts(total, host.amountsHidden)
                      : undefined
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
          </React.Fragment>
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
