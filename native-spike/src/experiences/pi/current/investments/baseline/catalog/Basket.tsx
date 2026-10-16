import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { InvestmentBasketFund } from '@/app/config/investmentBasketFundsConfig';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import { formatInvestmentAmountParts } from '@/app/utils/investmentAmountFormatting';
import { BaselineAccountActionBar } from '../../../../../../universal/BaselineAccountActionBar';
import { BaselineSectionDivider } from '../../../../../../universal/BaselineSectionDivider';
import {
  BaselineInvestmentFrame,
  BaselineInvestmentField,
  investmentColor,
  investmentDark,
} from '../Frame';
import { Copy, Logo, useLocalBack, type Host } from './shared';

function Amount({
  host,
  value,
  hero = false,
}: {
  host: Host;
  value: number;
  hero?: boolean;
}) {
  const parts = formatInvestmentAmountParts(
    value,
    host.country,
    'EUR',
    host.amountsHidden,
  );
  return (
    <Copy
      host={host}
      bold
      size={hero ? 30 : 18}
      line={hero ? 30 : 20}
      style={hero ? styles.heroTracking : undefined}
    >
      {parts.integer}
      <Copy host={host} size={hero ? 20 : 14} line={hero ? 20 : 18}>
        {parts.decimal}
      </Copy>
      {parts.currency ? (
        <Copy
          host={host}
          size={hero ? 20 : 14}
          line={hero ? 20 : 18}
          style={styles.currencyGap}
        >
          {parts.currency}
        </Copy>
      ) : null}
    </Copy>
  );
}
export function BaselineInvestmentBasket({
  host,
  basket,
  securities,
  onBack,
  onHistory,
}: {
  host: Host;
  basket: InvestmentBasketFund;
  securities: readonly InvestmentCatalogSecurity[];
  onBack(): void;
  onSelect(security: InvestmentCatalogSecurity): void;
  onHistory?: (title: string) => void;
}) {
  useLocalBack(host, () => false);
  const special = basket.id === 'jp-morgan-global-growth',
    dark = investmentDark(host),
    distribution = basket.holdings?.some(h => h.percent !== undefined),
    lastUpdate =
      basket.marketInfo?.lastUpdate ??
      (basket.holdings ?? [])
        .map(
          h =>
            securities.find(
              s =>
                (h.productId &&
                  (s.productId === h.productId || s.id === h.productId)) ||
                s.title.trim().toLocaleLowerCase() ===
                  h.title.trim().toLocaleLowerCase(),
            )?.lastUpdate,
        )
        .find(Boolean);
  return (
    <BaselineInvestmentFrame
      host={host}
      title=""
      onBack={onBack}
      headerOptions={{
        variant: 'gray',
        compact: true,
        renderLargeTitle: false,
        showHelp: false,
      }}
    >
      <View
        style={[
          styles.layout1,
          { backgroundColor: investmentColor(host, '--uc-app-bg') },
        ]}
      >
        <Logo id={basket.logoId} size={40} label={`${basket.title} product`} />
        <Copy host={host} size={28} line={31} bold style={styles.layout2}>
          {basket.title}
        </Copy>
        {special ? (
          <>
            <View style={styles.layout3}>
              <Amount host={host} value={1500} hero />
            </View>
            <Copy host={host} bold style={styles.layout4}>
              PERFORMANCE +0%
            </Copy>
            <Copy host={host} style={styles.layout5}>
              (from 19.07.2022)
            </Copy>
          </>
        ) : null}
      </View>
      <BaselineAccountActionBar
        dark={dark}
        items={[
          {
            id: 'history',
            iconName: 'investment-history',
            label: 'History',
            onPress: () => onHistory?.(basket.title),
          },
          {
            id: 'documents',
            iconName: 'account-option-statement',
            label: 'Documents',
          },
          { id: 'sell', iconName: 'trade-sell', label: 'Sell', hidden: true },
          {
            id: 'buy',
            iconName: 'trade-buy',
            label: 'Buy',
            iconColor: 'var(--uc-action)',
          },
        ]}
      />
      <View style={styles.layout6}>
        <BaselineInvestmentField
          host={host}
          label="Basket fund description"
          value={basket.detailDescription ?? basket.description}
          multiline
          variant="product-detail"
        />
        <BaselineSectionDivider
          dark={dark}
          title={distribution ? 'FUNDS DISTRIBUTION' : 'BASKET CONTENTS'}
          variant="medium-title"
        />
        <View style={styles.layout7}>
          {basket.holdings?.length ? (
            basket.holdings.map((h, index) => (
              <View
                key={h.productId ?? index}
                testID={`baseline-investment-holding-${h.productId ?? index}`}
                style={styles.layout8}
              >
                <Logo />
                <View style={styles.layout9}>
                  <Copy host={host} bold numberOfLines={1}>
                    {h.title}
                  </Copy>
                  {h.productId ? (
                    <Copy host={host} muted>
                      {h.productId}
                    </Copy>
                  ) : null}
                </View>
                {h.percent !== undefined ? (
                  <Copy
                    host={host}
                    size={20}
                    line={24}
                    bold
                    style={styles.layout10}
                  >
                    {h.percent}%
                  </Copy>
                ) : null}
              </View>
            ))
          ) : (
            <Copy host={host} size={16} line={21} style={styles.layout11}>
              {basket.contentsSummary ?? basket.description}
            </Copy>
          )}
        </View>
        <View style={styles.layout12}>
          <BaselineSectionDivider
            dark={dark}
            title="MARKET INFO"
            variant="medium-title"
          />
          {special ? (
            <BaselineInvestmentField
              host={host}
              label="Actual market price"
              value={<Amount host={host} value={535.44} />}
              variant="product-detail"
            />
          ) : null}
          <BaselineInvestmentField
            host={host}
            label="Basket ID"
            value={basket.marketInfo?.basketId ?? basket.id}
            variant="product-detail"
          />
          <BaselineInvestmentField
            host={host}
            label="Basket ISIN"
            value={basket.marketInfo?.basketIsin ?? 'Not available'}
            variant="product-detail"
          />
          <BaselineInvestmentField
            host={host}
            label="Last update"
            value={lastUpdate ?? 'Not available'}
            variant="product-detail"
          />
        </View>
      </View>
      <View style={styles.layout13} />
    </BaselineInvestmentFrame>
  );
}

const styles = StyleSheet.create({
  heroTracking: { letterSpacing: 0.2 },
  currencyGap: { marginLeft: 4 },
  layout1: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 24 },
  layout2: { marginTop: 8, textAlign: 'center' },
  layout3: { marginTop: 16 },
  layout4: { marginTop: 8 },
  layout5: { marginTop: 8 },
  layout6: { paddingTop: 18 },
  layout7: { paddingTop: 8 },
  layout8: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  layout9: { flex: 1, minWidth: 0 },
  layout10: { letterSpacing: 0.2 },
  layout11: { paddingHorizontal: 24, paddingVertical: 16 },
  layout12: { marginTop: 24 },
  layout13: { height: 34 },
});
