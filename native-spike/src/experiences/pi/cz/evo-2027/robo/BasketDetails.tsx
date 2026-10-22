import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  formatInvestmentBasketPerformance,
  type InvestmentBasketFundHolding,
  type InvestmentBasketMarketInfo,
} from '@/app/config/investmentBasketFundsConfig';
import type { RoboPortfolio } from '@/features/investments/robo/types';
import { ProductLogo } from '../investments/ProductRow';
import { Button, Copy, Page } from '../investments/Primitives';

export function BasketSectionHeading({ children }: { children: string }) {
  return (
    <View style={styles.basketSectionHeading}>
      <Copy strong style={styles.basketSectionTitle}>
        {children}
      </Copy>
    </View>
  );
}

function BasketMarketField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.basketMarketField}>
      <Copy style={styles.basketMarketLabel}>{label}</Copy>
      <Copy strong style={styles.basketMarketValue}>
        {value}
      </Copy>
    </View>
  );
}

/** Shared creation/model presentation. Each flow owns its navigation and holding sheet. */
export function BasketDetails({
  portfolio,
  onBack,
  onClose,
  onOpenHolding,
  holdingSheet,
  kind = 'basket-details',
  marketInfo: marketOverrides,
  footerAction,
}: {
  portfolio: RoboPortfolio;
  onBack: () => void;
  onClose?: () => void;
  onOpenHolding: (holding: InvestmentBasketFundHolding) => void;
  holdingSheet?: React.ReactNode;
  kind?: string;
  marketInfo?: Partial<InvestmentBasketMarketInfo>;
  footerAction?: { label: string; onPress: () => void };
}) {
  const basket = portfolio.basketFund;
  const marketInfo = { ...basket?.marketInfo, ...marketOverrides };
  return (
    <Page
      kind={kind}
      title={basket?.roboCarouselTitle ?? portfolio.name}
      onBack={onBack}
      onClose={onClose}
      contentTop={8}
      titleAccessory={
        basket ? (
          <View testID="cz-basket-title-logo">
            <ProductLogo id={basket.logoId} size={32} />
          </View>
        ) : undefined
      }
      footer={
        footerAction ? (
          <Button
            canonical
            label={footerAction.label}
            onPress={footerAction.onPress}
          />
        ) : undefined
      }
    >
      <View style={styles.basketPerformanceLine}>
        <Copy style={styles.basketPerformanceLabel}>Performance:</Copy>
        <Copy strong style={styles.basketPerformanceValue}>
          {formatInvestmentBasketPerformance(basket?.performancePercent ?? 0)}
        </Copy>
        <Copy muted style={styles.basketPerformancePeriod}>
          · 1Y
        </Copy>
      </View>
      <View
        testID="cz-basket-description"
        style={styles.basketDescriptionGroup}
      >
        <Copy style={styles.basketDescriptionLabel}>
          Basket fund description
        </Copy>
        <Copy strong style={styles.basketDescription}>
          {basket?.detailDescription ?? portfolio.description}
        </Copy>
      </View>
      <View testID="cz-basket-products-section" style={styles.basketSection}>
        <BasketSectionHeading>PRODUCTS DISTRIBUTION</BasketSectionHeading>
        {basket?.holdings.map((holding, index) => (
          <Pressable
            key={`${holding.productId}-${index}`}
            testID={`cz-basket-holding-${index + 1}`}
            accessibilityRole="button"
            accessibilityLabel={`Open ${holding.title} product details`}
            onPress={() => onOpenHolding(holding)}
            style={styles.basketHoldingRow}
          >
            <ProductLogo id={basket.logoId} size={32} />
            <View style={styles.basketHoldingCopy}>
              <Copy strong style={styles.basketHoldingTitle}>
                {holding.title}
              </Copy>
              <Copy muted style={styles.basketHoldingProductId}>
                {holding.productId}
              </Copy>
            </View>
            <Copy
              strong
              style={[
                styles.basketHoldingPercent,
                kind === 'model-portfolio' && styles.modelHoldingPercent,
              ]}
            >
              {holding.percent ?? 0}%
            </Copy>
          </Pressable>
        ))}
      </View>
      <View testID="cz-basket-market-info" style={styles.basketSection}>
        <BasketSectionHeading>MARKET INFO</BasketSectionHeading>
        <BasketMarketField
          label="Basket ID"
          value={marketInfo.basketId ?? 'Not available'}
        />
        <BasketMarketField
          label="Basket ISIN"
          value={marketInfo.basketIsin ?? 'Not available'}
        />
        <BasketMarketField
          label="Last update"
          value={marketInfo.lastUpdate ?? 'Not available'}
        />
      </View>
      {holdingSheet}
    </Page>
  );
}

const styles = StyleSheet.create({
  basketPerformanceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  basketPerformanceLabel: { fontSize: 14, lineHeight: 18 },
  basketPerformanceValue: { fontSize: 14, lineHeight: 18, color: '#3D7D43' },
  basketPerformancePeriod: { fontSize: 14, lineHeight: 18 },
  basketDescriptionGroup: { gap: 4 },
  basketDescriptionLabel: { fontSize: 16, lineHeight: 16 },
  basketDescription: { fontSize: 18, lineHeight: 20 },
  basketSection: { width: '100%' },
  basketSectionHeading: {
    marginTop: 24,
    marginBottom: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D8D8',
  },
  basketSectionTitle: { fontSize: 14, lineHeight: 16 },
  basketHoldingRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
    marginHorizontal: -8,
  },
  basketHoldingCopy: { flex: 1 },
  basketHoldingTitle: { fontSize: 14, lineHeight: 17 },
  basketHoldingProductId: { fontSize: 14, lineHeight: 17 },
  basketHoldingPercent: { fontSize: 18, lineHeight: 24 },
  modelHoldingPercent: { fontSize: 20 },
  basketMarketField: { minHeight: 80, justifyContent: 'center', gap: 4 },
  basketMarketLabel: { fontSize: 16, lineHeight: 16 },
  basketMarketValue: { fontSize: 18, lineHeight: 20 },
});
