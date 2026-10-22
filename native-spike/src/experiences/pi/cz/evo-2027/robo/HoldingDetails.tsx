import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';
import type { InvestmentBasketFundHolding } from '@/app/config/investmentBasketFundsConfig';
import {
  buildInvestmentChartPoints,
  INVESTMENT_PERIODS,
} from '@/app/config/investmentsPortfolioConfig';
import type {
  InvestmentCatalogSecurity,
  InvestmentPeriodId,
} from '@/app/config/investmentsPortfolioConfig';
import { Amount } from '../investments/Amount';
import { PerformanceChart } from '../investments/Charts';
import { Copy, Notice } from '../investments/Primitives';
import { BaselineInvestmentPeriodChips } from '../../../../../universal/BaselineInvestmentPeriodChips';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';

const holdingPeriods = INVESTMENT_PERIODS.filter(period => period.id !== '6m');

export function HoldingDetails({
  holding,
  security,
}: {
  holding: InvestmentBasketFundHolding;
  security: InvestmentCatalogSecurity | null;
}) {
  const [period, setPeriod] = useState<InvestmentPeriodId>('3y');
  const [documentOpen, setDocumentOpen] = useState(false);
  return (
    <View testID="cz-holding-details-content" style={s.content}>
      {security ? (
        <>
          <Copy style={s.meta}>Actual market price</Copy>
          <Amount
            value={security.marketPrice}
            currency={security.instrumentCurrency}
            scale="hero"
          />
          <View style={s.performance}>
            <Copy style={s.performanceLabel}>Performance:</Copy>
            <Copy strong style={s.performanceValue}>
              {formatPerformancePercent(security.performancePercent)}
            </Copy>
            <Copy muted style={s.performanceDate}>
              · from {security.lastUpdate}
            </Copy>
          </View>
          <PerformanceChart
            points={buildInvestmentChartPoints(security.marketPrice, period)}
          />
          <View testID="cz-holding-period-chips" style={s.periods}>
            <BaselineInvestmentPeriodChips
              periods={holdingPeriods}
              selectedPeriodId={period}
              onChange={setPeriod}
              ariaLabel="Performance period"
              softUnselected
              preset="figma"
            />
          </View>
          <Copy strong style={s.heading}>
            Market info
          </Copy>
          <DetailField label="Product ID" value={security.productId} />
          <DetailField
            label="Fund type"
            value={
              security.productType === 'Fund' ? 'Funds' : security.productType
            }
          />
          <View style={s.description}>
            <Copy style={s.fieldLabel}>Security description</Copy>
            <Copy strong style={s.descriptionValue}>
              {security.description}
            </Copy>
          </View>
          <Pressable
            style={s.documentRow}
            accessibilityRole="button"
            accessibilityLabel="Open Key Information Document (KID)"
            onPress={() => setDocumentOpen(true)}
          >
            <SourceCustomIcon
              name="investment-documents"
              size={24}
              color="#262626"
            />
            <View style={s.documentCopy}>
              <Copy strong style={s.documentTitle}>
                Key Information Document (KID)
              </Copy>
              <Copy muted style={s.documentSubtitle}>
                {security.title}
              </Copy>
            </View>
            <SourceCustomIcon name="chevron-right" size={24} color="#262626" />
          </Pressable>
          <DetailField label="Last update" value={security.lastUpdate} />
        </>
      ) : (
        <>
          <DetailField
            label="Product ID"
            value={holding.productId ?? 'Not available'}
          />
          <DetailField label="Allocation" value={`${holding.percent ?? 0}%`} />
          <Notice text="Current quote unavailable" />
        </>
      )}
      {documentOpen ? (
        <SourceBottomSheet
          title="Key Information Document (KID)"
          onClose={() => setDocumentOpen(false)}
          maxHeightOffsetPx={72}
        >
          <View style={s.documentPreview}>
            <Copy strong style={s.documentPreviewTitle}>
              {security?.title ?? holding.title}
            </Copy>
            <Copy>Product ID: {security?.productId ?? holding.productId}</Copy>
            <View style={s.documentPage}>
              <Copy strong>KEY INFORMATION DOCUMENT</Copy>
              <Copy>PDF preview</Copy>
            </View>
          </View>
        </SourceBottomSheet>
      ) : null}
    </View>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.field}>
      <Copy style={s.fieldLabel}>{label}</Copy>
      <Copy strong style={s.fieldValue}>
        {value}
      </Copy>
    </View>
  );
}

function formatPerformancePercent(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value).toFixed(2).replace('.', ',')}%`;
}

const s = StyleSheet.create({
  documentPreview: { paddingHorizontal: 24, gap: 16 },
  documentPreviewTitle: { fontSize: 18, lineHeight: 22 },
  documentPage: {
    minHeight: 400,
    backgroundColor: '#E5E5E5',
    padding: 24,
    alignItems: 'center',
    paddingTop: 64,
    gap: 24,
  },
  content: { paddingHorizontal: 24 },
  meta: { fontSize: 14, lineHeight: 16 },
  performance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  performanceLabel: { fontSize: 14, lineHeight: 18 },
  performanceValue: { color: '#3D7D43', fontSize: 14, lineHeight: 18 },
  performanceDate: { fontSize: 14, lineHeight: 18 },
  periods: { alignSelf: 'center', marginTop: 8 },
  heading: { fontSize: 18, lineHeight: 22, marginTop: 24, marginBottom: 4 },
  field: {
    minHeight: 80,
    justifyContent: 'center',
    gap: 4,
  },
  fieldLabel: { fontSize: 16, lineHeight: 16 },
  fieldValue: { fontSize: 18, lineHeight: 20 },
  description: { minHeight: 132, justifyContent: 'center', gap: 4 },
  descriptionValue: { fontSize: 18, lineHeight: 20 },
  documentRow: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  documentCopy: { flex: 1, gap: 4 },
  documentTitle: { fontSize: 16, lineHeight: 18 },
  documentSubtitle: { fontSize: 16, lineHeight: 18 },
});
