import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { InvestmentBasketFundHolding } from '@/app/config/investmentBasketFundsConfig';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import { buildInvestmentChartPoints } from '@/app/config/investmentsPortfolioConfig';
import { Amount } from '../investments/Amount';
import { PerformanceChart } from '../investments/Charts';
import { Copy, Notice, Row } from '../investments/Primitives';

export function HoldingDetails({
  holding,
  security,
}: {
  holding: InvestmentBasketFundHolding;
  security: InvestmentCatalogSecurity | null;
}) {
  return (
    <ScrollView contentContainerStyle={s.content}>
      {security ? (
        <>
          <Copy style={s.meta}>Actual market price</Copy>
          <Amount
            value={security.marketPrice}
            currency={security.instrumentCurrency}
            scale="hero"
          />
          <PerformanceChart
            points={buildInvestmentChartPoints(security.marketPrice, '3y')}
          />
          <Copy strong style={s.heading}>
            Market info
          </Copy>
          <Row title="Product ID" subtitle={security.productId} />
          <Row
            title="Fund type"
            subtitle={
              security.productType === 'Fund' ? 'Funds' : security.productType
            }
          />
          <View style={s.description}>
            <Copy>Security description</Copy>
            <Copy strong>{security.description}</Copy>
          </View>
          <Row
            title="Key Information Document (KID)"
            subtitle={security.title}
          />
          <Row title="Last update" subtitle={security.lastUpdate} />
          <Row
            title="Purchase options"
            subtitle={
              security.contributionType === 'RECURRENT'
                ? 'One off and recurrent order'
                : 'One off order'
            }
          />
        </>
      ) : (
        <>
          <Row
            title="Product ID"
            subtitle={holding.productId ?? 'Not available'}
          />
          <Row title="Allocation" subtitle={`${holding.percent ?? 0}%`} />
          <Notice text="Current quote unavailable" />
        </>
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  content: { paddingBottom: 24 },
  meta: { fontSize: 14, lineHeight: 16 },
  heading: { fontSize: 20, lineHeight: 24, marginTop: 16 },
  description: { paddingVertical: 16, gap: 4 },
});
