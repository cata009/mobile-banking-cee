import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  buildInvestmentChartPoints,
  INVESTMENT_PERIODS,
  type InvestmentPeriodId,
} from '@/app/config/investmentsPortfolioConfig';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { Text } from '../../../../../../universal/Typography';
import { BaselineAccountActionBar } from '../../../../../../universal/BaselineAccountActionBar';
import { ProductLogo } from '../../../../cz/evo-2027/investments/ProductRow';
import { BaselineInvestmentPortfolioChart } from '../overview/PortfolioChart';
import { Periods } from '../overview/ui';
import { InvestmentMarket } from '../../Market';
import {
  BaselineInvestmentFrame,
  BaselineInvestmentField,
  BaselineInvestmentSection,
  investmentColor,
  investmentDark,
} from '../Frame';
import type { BaselineInstrumentProps } from './contracts';
export function BaselineInvestmentInstrument({
  host,
  security,
  onBack,
  onHistory,
  onBuy,
  onSell,
}: BaselineInstrumentProps) {
  const [period, setPeriod] = useState<InvestmentPeriodId>('3y');
  const [progress, setProgress] = useState(0);
  const money = (value: number, currency: string) =>
    formatInvestmentMoney(value, host.country, currency, host.amountsHidden);
  const hasPosition = security.owned && security.quantity > 0;
  const heroValue = security.owned ? security.localValue : security.value;
  const heroCurrency = security.owned
    ? security.localCurrency
    : security.currency;
  const color = investmentColor(host, '--uc-text');
  const text = {
    fontFamily: 'UniCredit-regular',
    color,
  };
  const performance = `${
    security.performancePercent > 0
      ? '+'
      : security.performancePercent < 0
      ? '-'
      : ''
  }${Math.abs(security.performancePercent).toFixed(2).replace('.', ',')}%`;
  const renderStyle1 = {
    backgroundColor: investmentColor(host, '--uc-app-bg'),
  } as const;
  const renderStyle2 = {
    ...text,
  } as const;
  const renderStyle3 = {
    ...text,
  } as const;
  const renderStyle4 = {
    ...text,
  } as const;
  const renderStyle5 = {
    ...text,
  } as const;
  const renderStyle6 = {
    color: investmentColor(
      host,
      security.performancePercent < 0
        ? '--uc-status-red'
        : security.performancePercent > 0
        ? '--uc-green-olive'
        : '--uc-text',
    ),
  } as const;
  const renderStyle7 = {
    ...text,
  } as const;
  const renderStyle8 = {
    ...text,
  } as const;
  const titleClipStyle = {
    width: '100%',
    overflow: 'hidden',
    maxHeight: 64 * (1 - progress),
    opacity: 1 - progress,
  } as const;
  return (
    <InvestmentMarket country={host.country}>
      <BaselineInvestmentFrame
        host={host}
        title={security.title}
        onBack={onBack}
        collapseDistance={96}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 96)),
          )
        }
        headerOptions={{
          variant: 'gray',
          compact: true,
          renderLargeTitle: false,
        }}
      >
        <View style={[renderStyle1, baselineStyles.inline1]}>
          <View
            style={[baselineStyles.inline2, { opacity: 1 - progress * 0.35 }]}
          >
            <ProductLogo id={security.logoId ?? 'unicredit'} size={40} />
            <View style={titleClipStyle}>
              <Text style={[renderStyle2, baselineStyles.inline3]}>
                {security.title}
              </Text>
            </View>
            <Text style={[renderStyle3, baselineStyles.inline4]}>
              {money(heroValue, heroCurrency).replace(` ${heroCurrency}`, '')}
              <Text style={[renderStyle4, baselineStyles.inline5]}>
                {' '}
                {heroCurrency}
              </Text>
            </Text>
            <Text style={[renderStyle5, baselineStyles.inline6]}>
              PERFORMANCE <Text style={renderStyle6}>{performance}</Text>
            </Text>
            <Text style={[renderStyle7, baselineStyles.inline7]}>
              (last update {security.lastUpdate})
            </Text>
          </View>
        </View>
        <BaselineAccountActionBar
          dark={investmentDark(host)}
          items={[
            {
              id: 'history',
              iconName: 'investment-history',
              label: 'History',
              onPress: () => onHistory(security.title),
            },
            {
              id: 'documents',
              iconName: 'account-option-statement',
              label: 'Documents',
            },
            {
              id: 'sell',
              iconName: 'trade-sell',
              label: 'Sell',
              hidden: !hasPosition || security.status !== 'active',
              iconColor: 'var(--uc-text)',
              onPress: onSell,
            },
            {
              id: 'buy',
              iconName: 'trade-buy',
              label: 'Buy',
              hidden: security.status !== 'active',
              iconColor: 'var(--uc-action)',
              onPress: onBuy,
            },
          ]}
        />
        <View style={baselineStyles.inline8} />
        {security.owned ? (
          <>
            <Text style={[renderStyle8, baselineStyles.inline9]}>
              My security
            </Text>
            <BaselineInvestmentField
              host={host}
              label="Total value in portfolio / client currency"
              value={money(security.localValue, security.localCurrency)}
            />
            <BaselineInvestmentField
              host={host}
              label="Quantity"
              value={`${
                host.amountsHidden
                  ? '*,***'
                  : security.quantity.toFixed(3).replace('.', ',')
              } PCS`}
            />
          </>
        ) : null}
        <BaselineInvestmentSection host={host} title="MARKET INFO" />
        <BaselineInvestmentField
          host={host}
          label="Actual market price"
          value={money(security.marketPrice, security.currency)}
        />
        <View style={baselineStyles.inline10}>
          <BaselineInvestmentPortfolioChart
            host={host}
            points={buildInvestmentChartPoints(security.marketPrice, period)}
            currency={security.currency}
            amountsHidden={host.amountsHidden}
          />
          <Periods
            host={host}
            items={INVESTMENT_PERIODS.filter(p => p.id !== '6m')}
            value={period}
            onChange={setPeriod}
            marginTop={12}
          />
        </View>
        <BaselineInvestmentField
          host={host}
          label="Product ID"
          value={security.productId}
        />
        <BaselineInvestmentField
          host={host}
          label="Fund type"
          value={
            security.productType === 'Fund' ? 'Funds' : security.productType
          }
        />
        <BaselineInvestmentField
          host={host}
          label="Security description"
          value={security.description}
          multiline
        />
        <BaselineInvestmentField
          host={host}
          label="Last update"
          value={security.lastUpdate}
        />
        <BaselineInvestmentField
          host={host}
          label="Purchase options"
          value={
            security.contributionType === 'RECURRENT'
              ? 'One off and recurrent order'
              : 'One off order'
          }
        />
        <View style={baselineStyles.inline11} />
      </BaselineInvestmentFrame>
    </InvestmentMarket>
  );
}
const baselineStyles = StyleSheet.create({
  inline1: {
    paddingBottom: 24,
  },
  inline2: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  inline3: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 31,
    marginTop: 8,
    textAlign: 'center',
  },
  inline4: {
    fontFamily: 'UniCredit-bold',
    fontSize: 30,
    lineHeight: 30,
    letterSpacing: 0.2,
    marginTop: 16,
  },
  inline5: {
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: 0,
  },
  inline6: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
  },
  inline7: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
  },
  inline8: {
    height: 24,
  },
  inline9: {
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
    lineHeight: 24,
    paddingHorizontal: 24,
  },
  inline10: {
    paddingHorizontal: 8,
  },
  inline11: {
    height: 34,
  },
});
