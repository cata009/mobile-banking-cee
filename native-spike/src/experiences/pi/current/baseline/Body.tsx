import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import lighthouse from '@/assets/6f4a518088433560480f90c7a7448fdc1d294def.png';
import geniusProtectHomeIcon from '@/assets/pi/ro/genius-protect/genius-protect-home-insurance.svg';
import { getCurrencySymbol } from '@/app/registry/countryConfig';
import { getProductIcon } from '@/app/components/products/productGlyph';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import { isInvestmentsPortfolioAvailable } from '@/app/utils/investmentsAvailability';
import { isAccountDetailProduct, type Product } from '@/data/products';
import { accountConvention } from '@/features/accounts-payments/roAccountConvention';
import { createCurrentProducts } from '../context';
import type { CurrentScreenProps } from '../contracts';
import { BaselineAccordion } from '../../../../universal/BaselineAccordion';
import { BaselineProductsList } from '../../../../universal/BaselineProductsList';
import { BaselineProductCard } from '../../../../universal/BaselineProductCard';
import { BaselineBanner } from '../../../../universal/BaselineBanner';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { BaselineCarouselIndicator } from '../../../../universal/BaselineCarouselIndicator';
import {
  SourceCustomIcon,
  SourceVector,
} from '../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../universal/sourceColor';
import { sourceLinearGradient } from '../../../../universal/sourceLinearGradient';
import { Text } from '../../../../universal/Typography';
import {
  needsCurrentAccountFallback,
  sortPendingActions,
} from '@/features/products/homeSurfaces';
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig';
import { getProductBannerTone } from '@/app/config/productBannerVariants';
import { BaselineProductOfferCard } from '../../../../universal/BaselineProductOfferCard';
import { localized } from './offers/Catalog';
import { FutureGainBanner } from '../future-gain/FutureGainBanner';
import { futureGainEnabled } from '../future-gain/model';
import {
  getGeniusProtectSnapshot,
  subscribeGeniusProtect,
} from '@/features/insurance/geniusProtect';

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
  const pendingActions = useMemo(
    () =>
      sortPendingActions(host.bankingPresentation?.homePendingActions ?? []),
    [host.bankingPresentation?.homePendingActions],
  );
  const [summaryHeight, setSummaryHeight] = useState<number | undefined>();
  // The second page is the first commercial card of the Offers shelf (as in the RO baseline).
  const commercialOffer = useMemo(() => {
    const first = getProductsMenuForCountry(host.country).offers[0];
    if (!first) return null;
    return {
      ...first,
      title: localized(
        { t: host.t },
        `runtime.productsMenu.offers.${first.id}.title`,
        first.title,
      ),
      description: localized(
        { t: host.t },
        `runtime.productsMenu.offers.${first.id}.description`,
        first.description,
      ),
    };
  }, [host.country, host.t]);
  const railCount =
    1 +
    (securityNotice ? 1 : 0) +
    (pendingActions.length ? 1 : 0) +
    (commercialOffer ? 1 : 0);
  const geniusProtect = useSyncExternalStore(
    subscribeGeniusProtect,
    getGeniusProtectSnapshot,
  );
  const summaryRail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [summaryWidth, setSummaryWidth] = useState(327);
  const [summaryIndex, setSummaryIndex] = useState(0);
  const summaryStep = summaryWidth + 12;
  useEffect(() => {
    if (Platform.OS !== 'web' || railCount < 2) return;
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
        Math.min(railCount - 1, Math.round(node.scrollLeft / summaryStep)),
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
  }, [railCount, summaryStep]);
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
  const homeTotals = model.calculateHomeTotals();
  const available = maskAmountParts(
    homeTotals.primary.amount,
    host.amountsHidden,
  );
  const owed = homeTotals.secondary
    ? maskAmountParts(homeTotals.secondary.amount, host.amountsHidden)
    : undefined;
  const primaryLabel = redesigned
    ? host.t('home.totalBalance')
    : host.t(homeTotals.primary.labelKey, homeTotals.primary.fallback);
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
    <View
      onLayout={event =>
        setSummaryHeight(Math.round(event.nativeEvent.layout.height))
      }
      style={[
        summaryStyle,
        securityNotice ? { height: 157 } : undefined,
        // A single indicator (BIH) keeps the two-indicator card height so the lighthouse is not clipped.
        !securityNotice && !owed ? { minHeight: 157 } : undefined,
      ]}
    >
      <View style={styles.summaryCopy}>
        <View style={styles.balanceBlock}>
          <Text style={labelStyle}>{primaryLabel}</Text>
          <View style={styles.availableRow}>
            <Text style={availableIntegerStyle}>{available.integer}</Text>
            <Text style={availableDecimalsStyle}>
              {available.decimals} {currency}
            </Text>
          </View>
        </View>
        {owed && homeTotals.secondary ? (
          <>
            <View style={dividerStyle} />
            <View style={styles.balanceBlock}>
              <Text style={labelStyle}>
                {host.t(
                  homeTotals.secondary.labelKey,
                  homeTotals.secondary.fallback,
                )}
              </Text>
              <View style={styles.owedRow}>
                <Text style={owedIntegerStyle}>{owed.integer}</Text>
                <Text style={owedDecimalsStyle}>
                  {owed.decimals} {currency}
                </Text>
              </View>
            </View>
          </>
        ) : null}
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
  const fallbackHeader = needsCurrentAccountFallback(model.products);
  const pages: { key: string; label: string; node: React.ReactNode }[] = [];
  if (securityNotice)
    pages.push({
      key: 'security',
      label: 'Show security alert',
      node: (
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
      ),
    });
  if (pendingActions.length)
    pages.push({
      key: 'pending-actions',
      label: 'Show pending actions',
      node: (
        <BaselineBanner
          variant="pending"
          title={pendingActions[0]!.title}
          description={pendingActions[0]!.description}
          tagLabel={`${pendingActions.length} pending`}
          presentation={{ width: '100%' }}
          onPress={() => host.onNavigate({ screen: 'transactions' })}
          dark={dark}
        />
      ),
    });
  pages.push({
    key: 'totals',
    label: 'Show total available',
    node: fallbackHeader ? (
      <BaselineBanner
        variant="helper"
        title="Open a current account"
        description="Get a current account to unlock payments and your full Home."
        actionLabel="Open a current account"
        onActionPress={() => host.onNavigate({ screen: 'products' })}
        presentation={{ width: '100%' }}
        dark={dark}
      />
    ) : (
      summary
    ),
  });
  if (commercialOffer)
    pages.push({
      key: 'offer',
      label: 'Show offer',
      node: (
        <BaselineProductOfferCard
          offer={commercialOffer}
          tone={getProductBannerTone(
            commercialOffer.colorFamily ?? 'green',
            commercialOffer.lightVersion ?? false,
          )}
          dark={dark}
          presentation={{ width: summaryWidth, height: summaryHeight }}
          onPress={() => host.onNavigate({ screen: 'products' })}
        />
      ),
    });
  return (
    <>
      <>
        <View
          style={[
            styles.summaryGutter,
            railCount > 1 ? { paddingHorizontal: 0 } : undefined,
          ]}
          onLayout={event =>
            setSummaryWidth(Math.max(1, event.nativeEvent.layout.width - 48))
          }
        >
          {railCount > 1 ? (
            <>
              <ScrollView
                ref={summaryRail}
                testID={
                  securityNotice
                    ? 'home-security-carousel'
                    : 'home-header-carousel'
                }
                horizontal
                snapToOffsets={pages.map((_, index) => index * summaryStep)}
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
                        railCount - 1,
                        Math.round(
                          event.nativeEvent.contentOffset.x / summaryStep,
                        ),
                      ),
                    ),
                  )
                }
                style={{ width: summaryWidth + 48 }}
              >
                {pages.map(page => (
                  <View key={page.key} style={{ width: summaryWidth }}>
                    {page.node}
                  </View>
                ))}
              </ScrollView>
              <BaselineCarouselIndicator
                count={pages.length}
                activeIndex={summaryIndex}
                itemLabels={pages.map(page => page.label)}
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
            pages[0]?.node
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
                railCount > 1 && categoryIndex === 0
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
                        thirdLine={accountConvention(
                          host.country,
                          product.type,
                        )}
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
      {host.country === 'RO' &&
      host.release === 'release-current' &&
      host.scenario === 'active' ? (
        <View style={styles.category}>
          <BaselineAccordion
            title={host.language === 'ro' ? 'Asigurări' : 'Insurance'}
            defaultOpen={false}
            dark={dark}
          >
            <BaselineProductsList
              isOpen={false}
              showTotal={false}
              variant="legacy"
              productStyle="pi"
              dark={dark}
            >
              {geniusProtect.policy ? (
                <BaselineProductCard
                  icon={<AssetGlyph asset={geniusProtectHomeIcon} size={32} />}
                  title="Genius Protect"
                  accountNumber={
                    host.language === 'ro'
                      ? 'Poliță de asigurare de viață'
                      : 'Life insurance policy'
                  }
                  thirdLine={geniusProtect.policy.number}
                  amount=""
                  decimals=""
                  currency=""
                  showAmount={false}
                  variant="legacy"
                  productStyle="pi"
                  onPress={() =>
                    host.onNavigate({
                      screen: 'product-detail',
                      params: {
                        title: 'Genius Protect',
                        cardId: 'insurance',
                        optionId: 'genius-protect-policy',
                      },
                    })
                  }
                  dark={dark}
                />
              ) : (
                <BaselineBanner
                  variant="ghost"
                  title={
                    host.language === 'ro'
                      ? 'Obține Genius Protect'
                      : 'Get Genius Protect'
                  }
                  description={
                    host.language === 'ro'
                      ? 'Află despre soluția noastră accesibilă de asigurare de viață pentru situații neprevăzute.'
                      : 'Check our most affordable life insurance solution for unexpected situations.'
                  }
                  iconNode={
                    <SourceCustomIcon
                      name="add-circle"
                      size={24}
                      color={sourceColor('var(--uc-action)', dark)}
                    />
                  }
                  onPress={() =>
                    host.onNavigate({
                      screen: 'product-detail',
                      params: {
                        title: 'Genius Protect',
                        cardId: 'insurance',
                        optionId: 'genius-protect',
                      },
                    })
                  }
                  presentation={{ width: '100%' }}
                  dark={dark}
                />
              )}
            </BaselineProductsList>
          </BaselineAccordion>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  summaryGutter: { paddingHorizontal: 24 },
  futureGainBannerSlot: { paddingTop: 16, alignItems: 'center' },
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
