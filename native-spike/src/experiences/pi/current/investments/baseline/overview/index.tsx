import React from 'react';
import { Pressable, View } from 'react-native';
import {
  buildInvestmentChartPoints,
  buildInvestmentDistributionItems,
  getInvestmentDistributionGroupKey,
  getInvestmentDistributionTitle,
  sortInvestmentSecurities,
} from '@/app/config/investmentsPortfolioConfig';
import { formatInvestmentAmountParts } from '@/app/utils/investmentAmountFormatting';
import { getCountryConfig } from '@/app/registry/countryConfig';
import { BaselineSectionDivider } from '../../../../../../universal/BaselineSectionDivider';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { PrimaryButton } from '../../../../../../universal/PrimaryButton';
import type {
  BaselineInvestmentOverviewProps,
  BaselineInvestmentDistributionProps,
} from '../contracts';
import {
  BaselineInvestmentFrame,
  investmentColor,
  investmentDark,
} from '../Frame';
import {
  Copy,
  Amount,
  PortfolioTabs,
  Periods,
  Sorts,
  Accordion,
  ProductRow,
  Actions,
} from './ui';
import { BaselineInvestmentPortfolioChart } from './PortfolioChart';
import { Distribution } from './Distribution';
export { BaselineInvestmentPortfolioChart } from './PortfolioChart';

export function BaselineInvestmentOverview({
  host,
  snapshot,
  state,
  onStateChange,
  onOpenSecurity,
  onOpenDistribution,
  onOpenCatalog,
  onOpenHistory,
  onOpenApprovals,
}: BaselineInvestmentOverviewProps) {
  const currency = getCountryConfig(host.country).currency,
    perf = snapshot.performance,
    total = formatInvestmentAmountParts(
      perf.totalValue,
      host.country,
      currency,
      host.amountsHidden,
    ),
    performance = formatInvestmentAmountParts(
      perf.performanceAmount,
      host.country,
      currency,
      host.amountsHidden,
    ),
    signed = perf.performanceAmount || perf.performancePercent,
    color = investmentColor(
      host,
      signed > 0
        ? '--uc-green-olive'
        : signed < 0
        ? '--uc-status-red'
        : '--uc-text',
    ),
    percentage = host.amountsHidden
      ? '**,**%'
      : `${
          perf.performancePercent > 0
            ? '+'
            : perf.performancePercent < 0
            ? '-'
            : ''
        }${Math.abs(perf.performancePercent).toFixed(2).replace('.', ',')}%`;
  const securities = sortInvestmentSecurities(
      snapshot.securities,
      state.sortId,
    ),
    active = securities.filter(s => s.status === 'active'),
    inactive = securities.filter(s => s.status === 'inactive');
  const actions = (
    <Actions
      host={host}
      onHistory={onOpenHistory}
      onApprovals={onOpenApprovals}
      onInvest={onOpenCatalog}
    />
  );
  const distributionKeys = {
    'product-type': 'productType',
    currency: 'currency',
    'asset-class': 'assetClass',
    'account-list': 'accountList',
  };
  const baselineInvestmentOverviewCopyStyle4 = {
    color,
    lineHeight: 24,
  } as const;
  const performanceValueStyle = { color, lineHeight: 21 } as const;
  const baselineInvestmentOverviewViewStyle8 = {
    borderWidth: 1,
    borderColor: investmentColor(host, '--uc-border'),
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  } as const;
  const baselineInvestmentOverviewCopyStyle10 = {
    marginTop: 8,
    color: investmentColor(host, '--uc-text-muted'),
  } as const;
  return (
    <BaselineInvestmentFrame
      host={host}
      title={host.t('runtime.investments.title', 'Investment')}
      onBack={host.onBack}
      headerOptions={{ showHelp: true }}
    >
      <PortfolioTabs
        host={host}
        value={state.tabId}
        onChange={tabId => onStateChange({ tabId })}
      />
      <View style={styles.baselineInvestmentOverviewViewStyle1}>
        <View style={styles.baselineInvestmentOverviewViewStyle2}>
          <Copy host={host} bold style={styles.summaryLabel}>
            {host.t('runtime.investments.totalValue', 'Total value')}:
          </Copy>
          <Amount host={host} parts={total} minorLine={21} />
        </View>
        <View style={styles.baselineInvestmentOverviewViewStyle3}>
          <Copy host={host} bold style={styles.summaryLabel}>
            {host.t('runtime.investments.performance', 'Performance')}:
          </Copy>
          <Copy
            host={host}
            size={16}
            style={baselineInvestmentOverviewCopyStyle4}
          >
            <Copy host={host} bold style={performanceValueStyle}>
              {performance.integer}
              {performance.decimal} {performance.currency} / {percentage}
            </Copy>
          </Copy>
        </View>
      </View>
      {snapshot.securities.length ? (
        state.tabId === 'performance' ? (
          <>
            <View style={styles.baselineInvestmentOverviewViewStyle5}>
              <BaselineInvestmentPortfolioChart
                host={host}
                points={buildInvestmentChartPoints(
                  perf.totalValue,
                  state.periodId,
                )}
                currency={currency}
                amountsHidden={host.amountsHidden}
              />
              <Periods
                host={host}
                value={state.periodId}
                onChange={periodId => onStateChange({ periodId })}
              />
            </View>
            {actions}
            <View style={styles.baselineInvestmentOverviewViewStyle6}>
              <BaselineSectionDivider
                title={host.t(
                  'runtime.investments.allProducts',
                  'ALL PRODUCTS',
                )}
                count={snapshot.securities.length}
                countAlign="end"
                dark={investmentDark(host)}
              />
            </View>
            <Sorts
              host={host}
              value={state.sortId}
              onChange={sortId => onStateChange({ sortId })}
            />
            <Accordion
              host={host}
              title={host.t(
                'runtime.investments.activeSecurities',
                'ACTIVE SECURITIES',
              )}
              count={active.length}
              open
            >
              {active.map(s => (
                <ProductRow
                  key={s.id}
                  host={host}
                  security={s}
                  onPress={() => onOpenSecurity(s.id)}
                />
              ))}
            </Accordion>
            <Accordion
              host={host}
              title={host.t(
                'runtime.investments.inactiveSecurities',
                'INACTIVE SECURITIES',
              )}
              count={inactive.length}
              open={false}
            >
              {inactive.map(s => (
                <ProductRow
                  key={s.id}
                  host={host}
                  security={s}
                  onPress={() => onOpenSecurity(s.id)}
                />
              ))}
            </Accordion>
          </>
        ) : (
          <Distribution
            host={host}
            title={host.t(
              `runtime.investments.distributionTitles.${
                distributionKeys[state.tabId]
              }`,
              getInvestmentDistributionTitle(state.tabId),
            )}
            items={buildInvestmentDistributionItems(
              snapshot.securities,
              state.tabId,
            )}
            actions={actions}
            onSelect={item => {
              if (state.tabId !== 'performance')
                onOpenDistribution(state.tabId, item);
            }}
          />
        )
      ) : (
        <View style={styles.baselineInvestmentOverviewViewStyle7}>
          <View style={baselineInvestmentOverviewViewStyle8}>
            <SourceCustomIcon
              name="info-circle"
              size={24}
              color={investmentColor(host, '--uc-text-muted')}
            />
            <View style={styles.baselineInvestmentOverviewViewStyle9}>
              <Copy host={host} size={16} bold>
                {host.t(
                  'runtime.investments.emptyPortfolioTitle',
                  'Your portfolio is still empty',
                )}
              </Copy>
              <Copy
                host={host}
                size={16}
                style={baselineInvestmentOverviewCopyStyle10}
              >
                {host.t(
                  'runtime.investments.emptyPortfolioNextStep',
                  'Select Invest to explore available investment products.',
                )}
              </Copy>
            </View>
          </View>
          <View style={styles.baselineInvestmentOverviewViewStyle11}>
            <PrimaryButton
              label={host.t('runtime.investments.actions.invest', 'Invest')}
              onPress={onOpenCatalog}
              dark={investmentDark(host)}
            />
          </View>
        </View>
      )}
      {snapshot.securities.length ? (
        <View style={styles.baselineInvestmentOverviewViewStyle12} />
      ) : null}
    </BaselineInvestmentFrame>
  );
}

export function BaselineInvestmentDistributionDetail({
  host,
  item,
  tab,
  securities,
  onBack,
}: BaselineInvestmentDistributionProps) {
  const total = formatInvestmentAmountParts(
      item.value,
      host.country,
      item.currency,
      host.amountsHidden,
    ),
    rows = securities.filter(
      s => getInvestmentDistributionGroupKey(s, tab) === item.id,
    );
  const baselineInvestmentDistributionDetailViewStyle3 = {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: item.color,
  } as const;
  return (
    <BaselineInvestmentFrame
      host={host}
      title=""
      onBack={onBack}
      headerOptions={{ showHelp: true }}
    >
      <View style={styles.baselineInvestmentDistributionDetailViewStyle1}>
        <View style={styles.baselineInvestmentDistributionDetailViewStyle2}>
          <View style={baselineInvestmentDistributionDetailViewStyle3} />
          <Copy
            host={host}
            size={28}
            bold
            style={styles.baselineInvestmentDistributionDetailCopyStyle4}
          >
            {item.label.toUpperCase()}
          </Copy>
        </View>
        <View style={styles.baselineInvestmentDistributionDetailViewStyle5}>
          <Copy
            host={host}
            bold
            style={styles.baselineInvestmentDistributionDetailCopyStyle6}
          >
            Total value
          </Copy>
          <View
            style={styles.baselineInvestmentDistributionDetailViewStyle7}
            accessibilityLabel={`${item.label} total value`}
          >
            <Amount
              host={host}
              parts={total}
              integerSize={30}
              minorSize={18}
              integerLine={34}
              minorLine={22}
            />
          </View>
        </View>
      </View>
      <View style={styles.baselineInvestmentDistributionDetailViewStyle8}>
        {rows.map(s => {
          const primary = formatInvestmentAmountParts(
              s.value,
              host.country,
              s.currency,
              host.amountsHidden,
            ),
            local = formatInvestmentAmountParts(
              s.localValue,
              host.country,
              s.localCurrency,
              host.amountsHidden,
            );
          const baselineInvestmentDistributionDetailPressableStyle9 = {
            height: 80,
            width: '100%',
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: investmentColor(host, '--uc-surface'),
          } as const;
          const baselineInvestmentDistributionDetailCopyStyle13 = {
            lineHeight: 17,
            color: investmentColor(host, '--uc-text-muted'),
          } as const;
          return (
            <Pressable
              key={s.id}
              testID={`baseline-investment-category-row-${s.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${s.title} ${primary.integer}${
                primary.decimal
              } ${primary.currency}${
                s.currency !== s.localCurrency
                  ? ` (${local.integer}${local.decimal} ${local.currency})`
                  : ''
              }`}
              style={baselineInvestmentDistributionDetailPressableStyle9}
            >
              <View
                style={styles.baselineInvestmentDistributionDetailViewStyle10}
              >
                <Copy
                  host={host}
                  bold
                  style={styles.baselineInvestmentDistributionDetailCopyStyle11}
                  numberOfLines={1}
                >
                  {s.title}
                </Copy>
                <View
                  style={styles.baselineInvestmentDistributionDetailViewStyle12}
                >
                  <Amount
                    host={host}
                    parts={primary}
                    integerLine={24}
                    minorLine={17}
                  />
                  {s.currency !== s.localCurrency ? (
                    <Copy
                      host={host}
                      style={baselineInvestmentDistributionDetailCopyStyle13}
                    >
                      {' '}
                      ({local.integer}
                      {local.decimal} {local.currency})
                    </Copy>
                  ) : null}
                </View>
              </View>
              <View
                style={styles.baselineInvestmentDistributionDetailViewStyle14}
              >
                <SourceCustomIcon
                  name="chevron-link"
                  size={28}
                  color={investmentColor(host, '--uc-text')}
                />
              </View>
            </Pressable>
          );
        })}
        {!rows.length ? (
          <View style={styles.baselineInvestmentDistributionDetailViewStyle15}>
            <Copy
              host={host}
              size={16}
              bold
              style={styles.baselineInvestmentDistributionDetailCopyStyle16}
            >
              No securities in this category
            </Copy>
          </View>
        ) : null}
      </View>
      <View style={styles.baselineInvestmentDistributionDetailViewStyle17} />
    </BaselineInvestmentFrame>
  );
}

const styles = {
  summaryLabel: { lineHeight: 21 },
  baselineInvestmentOverviewViewStyle1: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  baselineInvestmentOverviewViewStyle2: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  baselineInvestmentOverviewViewStyle3: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  baselineInvestmentOverviewViewStyle5: { paddingHorizontal: 8 },
  baselineInvestmentOverviewViewStyle6: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  baselineInvestmentOverviewViewStyle7: {
    marginHorizontal: 16,
    marginTop: 24,
    paddingBottom: 24,
  },
  baselineInvestmentOverviewViewStyle9: { flex: 1 },
  baselineInvestmentOverviewViewStyle11: { marginTop: 24 },
  baselineInvestmentOverviewViewStyle12: { height: 28 },
  baselineInvestmentDistributionDetailViewStyle1: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  baselineInvestmentDistributionDetailViewStyle2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  baselineInvestmentDistributionDetailCopyStyle4: {
    lineHeight: 31,
  },
  baselineInvestmentDistributionDetailViewStyle5: { paddingTop: 44 },
  baselineInvestmentDistributionDetailCopyStyle6: { lineHeight: 16 },
  baselineInvestmentDistributionDetailViewStyle7: { marginTop: 14 },
  baselineInvestmentDistributionDetailViewStyle8: { paddingTop: 18 },
  baselineInvestmentDistributionDetailViewStyle10: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 12,
  },
  baselineInvestmentDistributionDetailCopyStyle11: { lineHeight: 17 },
  baselineInvestmentDistributionDetailViewStyle12: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  baselineInvestmentDistributionDetailViewStyle14: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baselineInvestmentDistributionDetailViewStyle15: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  baselineInvestmentDistributionDetailCopyStyle16: { lineHeight: 20 },
  baselineInvestmentDistributionDetailViewStyle17: { height: 34 },
} as const;
