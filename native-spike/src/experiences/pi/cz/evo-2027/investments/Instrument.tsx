import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  buildInvestmentChartPoints,
  INVESTMENT_PERIODS,
  type InvestmentCatalogSecurity,
  type InvestmentHistoryTransaction,
  type InvestmentPeriodId,
} from '@/app/config/investmentsPortfolioConfig';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import {
  Button,
  Copy,
  Notice,
  Page,
  Row,
  investmentColors,
} from './Primitives';
import { PerformanceChart } from './Charts';
import { Amount } from './Amount';
import { ProductLogo } from './ProductRow';
import { PeriodChips } from './PeriodChips';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import { czInvestmentTokens } from './Primitives';

function Field({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <View style={[s.field, multiline && s.multiline]}>
      <Copy style={s.label}>{label}</Copy>
      {typeof value === 'string' ? (
        <Copy strong style={s.value}>
          {value}
        </Copy>
      ) : (
        value
      )}
    </View>
  );
}

export function InvestmentInstrument({
  security,
  onBack,
  onBuy,
  onSell,
  onHistory,
  hidden = false,
  hideBuy = false,
  transactions = [],
}: {
  security: InvestmentCatalogSecurity;
  onBack: () => void;
  onBuy: () => void;
  onSell?: () => void;
  onHistory?: () => void;
  hidden?: boolean;
  hideBuy?: boolean;
  transactions?: readonly InvestmentHistoryTransaction[];
}) {
  const [period, setPeriod] = useState<InvestmentPeriodId>('3y'),
    [kidOpen, setKidOpen] = useState(false);
  const money = (value: number) =>
    formatInvestmentMoney(value, 'CZ', security.instrumentCurrency, hidden);
  const hasPosition = security.owned && security.quantity > 0;
  const canBuy = !hideBuy && security.status === 'active',
    canSell = hasPosition && security.status === 'active' && !!onSell;
  const productTransactions = transactions
    .filter(transaction => transaction.securityId === security.id)
    .sort((left, right) => Date.parse(right.date) - Date.parse(left.date));
  return (
    <Page
      kind="investment-detail"
      title={security.title}
      titleAccessory={<ProductLogo id={security.logoId} size={32} />}
      onBack={onBack}
      contentTop={16}
      footer={
        canBuy || canSell ? (
          <View style={s.actions}>
            {canSell ? (
              <View style={s.action}>
                <Button label="Sell" secondary onPress={onSell!} />
              </View>
            ) : null}
            {canBuy ? (
              <View style={s.action}>
                <Button label="Buy" onPress={onBuy} />
              </View>
            ) : null}
          </View>
        ) : undefined
      }
    >
      <Copy style={s.priceLabel}>Actual market price</Copy>
      <View style={s.price}>
        <Amount
          value={security.marketPrice}
          currency={security.instrumentCurrency}
          hidden={hidden}
          scale="hero"
        />
      </View>
      <Copy style={s.performance}>
        Performance:{' '}
        <Copy
          strong
          style={[
            s.performanceStrong,
            {
              color:
                security.performancePercent < 0
                  ? investmentColors.negative
                  : investmentColors.positive,
            },
          ]}
        >
          {hidden
            ? '••%'
            : `${
                security.performancePercent > 0 ? '+' : ''
              }${security.performancePercent.toFixed(2).replace('.', ',')}%`}
        </Copy>
        <Copy muted style={s.performance}>
          {' '}
          · from {security.lastUpdate}
        </Copy>
      </Copy>
      <View style={s.chart}>
        <PerformanceChart
          points={buildInvestmentChartPoints(security.marketPrice, period)}
          hidden={hidden}
          currency={security.instrumentCurrency}
        />
        <PeriodChips
          items={INVESTMENT_PERIODS.filter(item => item.id !== '6m')}
          value={period}
          onChange={setPeriod}
          comfortable
        />
      </View>
      {hasPosition ? (
        <>
          <Copy strong style={s.heading}>
            My security
          </Copy>
          <Field
            label="Total value in portfolio / client currency"
            value={
              <Amount
                value={security.localValue}
                currency={security.localCurrency}
                hidden={hidden}
                scale="field"
              />
            }
          />
          <Field
            label="Quantity"
            value={
              hidden
                ? '*,*** PCS'
                : `${security.quantity.toFixed(3).replace('.', ',')} PCS`
            }
          />
        </>
      ) : null}
      <Copy strong style={s.heading}>
        Market info
      </Copy>
      <Field label="Product ID" value={security.productId} />
      <Field
        label="Fund type"
        value={security.productType === 'Fund' ? 'Funds' : security.productType}
      />
      <Field
        label="Security description"
        value={security.description}
        multiline
      />
      <Row
        title="Key Information Document (KID)"
        subtitle={security.title}
        onPress={() => setKidOpen(true)}
      />
      <Field label="Last update" value={security.lastUpdate} />
      <Field
        label="Purchase options"
        value={
          security.contributionType === 'RECURRENT'
            ? 'One off and recurrent order'
            : 'One off order'
        }
      />
      {productTransactions.length ? (
        <>
          <Copy strong style={s.heading}>
            TRANSACTIONS
          </Copy>
          {productTransactions.slice(0, 2).map(transaction => (
            <Row
              key={transaction.id}
              title={transaction.type}
              subtitle={transaction.date.slice(0, 10)}
              value={money(transaction.amount)}
            />
          ))}
          {onHistory ? <Row title="See more" onPress={onHistory} /> : null}
        </>
      ) : null}
      <ModalPanel
        tokens={czInvestmentTokens}
        title="Key Information Document (KID)"
        visible={kidOpen}
        onClose={() => setKidOpen(false)}
        closeLabel="Close document"
      >
        <Notice text="Demo document preview. This document has no PDF attachment." />
        <Copy>{security.title}</Copy>
      </ModalPanel>
    </Page>
  );
}
const s = StyleSheet.create({
  performanceStrong: { fontSize: 14, lineHeight: 18 },
  field: {
    minHeight: 80,
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  multiline: { minHeight: 132, justifyContent: 'flex-start' },
  label: { fontSize: 16, lineHeight: 16 },
  value: { fontSize: 18, lineHeight: 20 },
  priceLabel: { fontSize: 14, lineHeight: 16 },
  price: { marginTop: 4 },
  performance: { fontSize: 14, lineHeight: 18, marginTop: 8 },
  heading: { fontSize: 20, lineHeight: 24, marginTop: 16 },
  chart: { marginHorizontal: -8, marginTop: 8, marginBottom: 28 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  action: { flex: 1 },
});
