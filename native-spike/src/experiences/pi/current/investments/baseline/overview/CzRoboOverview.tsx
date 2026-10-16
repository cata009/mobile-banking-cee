import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Path, SvgXml } from 'react-native-svg';
import {
  INVESTMENT_PERIODS,
  INVESTMENT_PORTFOLIO_TABS,
  INVESTMENT_SORT_OPTIONS,
  buildInvestmentChartPoints,
  buildInvestmentDistributionItems,
  getInvestmentDistributionTitle,
  sortInvestmentSecurities,
  type InvestmentDistributionItem,
  type InvestmentPeriodId,
  type InvestmentPortfolioTabId,
  type InvestmentSecurity,
} from '@/app/config/investmentsPortfolioConfig';
import { getCountryConfig } from '@/app/registry/countryConfig';
import { getBrandLogo } from '@/app/config/brandLogos';
import { formatInvestmentAmountParts } from '@/app/utils/investmentAmountFormatting';
import type { CurrentScreenProps } from '../../../contracts';
import type { BaselineInvestmentOverviewProps } from '../contracts';
import { investmentColor, investmentDark } from '../Frame';
import {
  Amount,
  Copy,
} from './ui';
import { BaselineInvestmentPortfolioChart } from './PortfolioChart';
import {
  ModuleNavigation,
  type InvestmentSection,
} from '../../../../cz/evo-2027/investments/ModuleNavigation';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { SourceBottomSheet } from '../../../../../../universal/SourceBottomSheet';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';

export type CzRoboOverviewProps = BaselineInvestmentOverviewProps & {
  onModuleSelect: (section: InvestmentSection) => void;
};

const tabTranslationKeys: Record<InvestmentPortfolioTabId, string> = {
  performance: 'performance',
  'product-type': 'productType',
  currency: 'currency',
  'asset-class': 'assetClass',
  'account-list': 'accountList',
};

function PerformanceTrendIcon({
  direction,
}: {
  direction: 'up' | 'down' | null;
}) {
  if (direction === 'up')
    return (
      <Svg width={13} height={10} viewBox="0 0 13 10" accessibilityElementsHidden>
        <Path
          d="M7.13534 0C7.26313 1.00262 7.83168 1.5437 8.75884 1.57239C9.28176 1.58803 9.80467 1.57499 10.3276 1.57499C10.3458 1.6441 10.3654 1.71189 10.3837 1.78099C9.40825 2.78101 8.43153 3.77972 7.45352 4.78104C7.82386 5.19305 8.15117 5.55681 8.5189 5.9649C9.57777 4.91012 10.574 3.91923 11.6903 2.80839C11.835 4.26865 11.3252 5.85929 13.3177 6.28303V0H7.13403H7.13534Z"
          fill="#3D7D43"
        />
        <Path
          d="M0.586201 6.67738C-0.0618973 7.31102 -0.00582445 8.00725 0.594025 8.75303C1.71679 7.76475 2.84737 6.7882 3.95188 5.78166C4.2844 5.47788 4.49174 5.47527 4.79558 5.81947C5.38108 6.4818 6.01093 7.10502 6.65902 7.78039C7.09848 7.34883 7.44926 7.00463 7.77657 6.68259C6.62121 5.52481 5.51149 4.41267 4.3496 3.24707C3.11209 4.36704 1.80937 5.48179 0.586201 6.67607V6.67738Z"
          fill="#3D7D43"
        />
      </Svg>
    );
  if (direction === 'down')
    return (
      <Svg width={17} height={23} viewBox="0 0 17 23" accessibilityElementsHidden>
        <Path
          d="M3.69405 2.94426C2.33845 2.1411 1.19458 2.54851 0.212192 3.89131C2.37686 5.33196 4.52534 6.79102 6.71243 8.1928C7.37216 8.61449 7.46982 8.96147 7.02855 9.62653C6.17982 10.9077 5.41672 12.2457 4.57426 13.6379C5.49664 14.1816 6.23245 14.6158 6.92048 15.0205C8.34475 12.5595 9.71293 10.1957 11.1474 7.72026C8.70998 6.14617 6.25199 4.46025 3.69624 2.94368L3.69405 2.94426Z"
          fill="#E30000"
        />
        <Path
          d="M13.957 8.93774C12.3309 9.60344 11.6781 10.8016 12.0471 12.3713C12.2561 13.2564 12.5133 14.1286 12.7486 15.0067C12.6407 15.0684 12.5357 15.1318 12.4279 15.1935C10.3098 14.0056 8.19335 12.8149 6.07192 11.6232C5.54673 12.4304 5.08318 13.1437 4.56338 13.9448C6.81095 15.2482 8.92308 16.4753 11.2906 17.8499C8.9037 18.7499 6.00334 18.6094 6.18832 22.1459L16.7386 19.319L13.9564 8.93555L13.957 8.93774Z"
          fill="#E30000"
        />
      </Svg>
    );
  return null;
}

export function CzRoboSecurityRow({
  host,
  security,
  onPress,
}: {
  host: Pick<CurrentScreenProps, 'country' | 'tokens' | 'amountsHidden'>;
  security: InvestmentSecurity;
  onPress: () => void;
}) {
  const logo = getBrandLogo(security.logoId ?? 'unicredit');
  const quantity = host.amountsHidden
    ? '*,*** PCS'
    : `${security.quantity.toFixed(3).replace('.', ',')} PCS`;
  const currentPrice = formatInvestmentAmountParts(
    security.marketPrice,
    host.country,
    security.instrumentCurrency,
    host.amountsHidden,
  );
  const portfolioValue = formatInvestmentAmountParts(
    security.localValue,
    host.country,
    security.localCurrency,
    host.amountsHidden,
  );
  const percent = host.amountsHidden
    ? '••%'
    : `${security.performancePercent > 0 ? '+' : security.performancePercent < 0 ? '-' : ''}${Math.abs(security.performancePercent).toFixed(1).replace('.', ',')}%`;
  const percentColor = investmentColor(
    host,
    security.performancePercent > 0
      ? '--uc-green-olive'
      : security.performancePercent < 0
        ? '--uc-status-red'
        : '--uc-text',
  );

  return (
    <Pressable
      testID={`baseline-investment-product-${security.id}`}
      accessibilityRole="button"
      accessibilityLabel={security.title}
      onPress={onPress}
      style={styles.securityRow}
    >
      <View style={styles.securityRowContent}>
        {logo ? (
          <View accessibilityLabel={`${security.title} product`}>
            <SvgXml xml={logo.svg} width={32} height={32} />
          </View>
        ) : (
          <View style={styles.brandPlaceholder} />
        )}
        <View style={styles.securityDetails}>
          <View style={styles.securityMainColumn}>
            <Copy host={host} bold numberOfLines={1} style={styles.securityTitle}>
              {security.title}
            </Copy>
            <View style={styles.securityMetaLine}>
              <Copy host={host} style={styles.securityMeta}>
                {quantity}
              </Copy>
              <Copy host={host} style={styles.securityMeta}>
                ·
              </Copy>
              <Amount
                host={host}
                parts={currentPrice}
                integerSize={14}
                minorSize={14}
                integerLine={18}
                minorLine={18}
              />
            </View>
          </View>
          <View style={styles.securityValueColumn}>
            <Amount
              host={host}
              parts={portfolioValue}
              integerSize={20}
              minorSize={14}
              integerLine={22}
              minorLine={17}
            />
            <Copy
              host={host}
              bold
              style={[styles.securityPercent, { color: percentColor }]}
            >
              {percent}
            </Copy>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function DistributionRows({
  host,
  items,
  onSelect,
}: {
  host: BaselineInvestmentOverviewProps['host'];
  items: readonly InvestmentDistributionItem[];
  onSelect: (item: InvestmentDistributionItem) => void;
}) {
  return (
    <View style={styles.distributionRows}>
      {items.map(item => {
        const amount = formatInvestmentAmountParts(
          item.value,
          host.country,
          item.currency,
          host.amountsHidden,
        );
        return (
          <Pressable
            key={item.id}
            testID={`cz-robo-distribution-${item.id}`}
            accessibilityRole="button"
            accessibilityLabel={`${item.label} ${amount.integer}${amount.decimal} ${amount.currency} ${item.percent}%`}
            onPress={() => onSelect(item)}
            style={styles.distributionRow}
          >
            <View style={styles.distributionLabelGroup}>
              <View style={[styles.distributionDot, { backgroundColor: item.color }]} />
              <View style={styles.distributionCopy}>
                <Copy host={host} bold numberOfLines={1} style={styles.distributionTitle}>
                  {item.label}
                </Copy>
                <Amount
                  host={host}
                  parts={amount}
                  integerSize={20}
                  minorSize={14}
                  integerLine={22}
                  minorLine={17}
                />
                {item.secondaryLabel ? (
                  <Copy
                    host={host}
                    numberOfLines={1}
                    style={[
                      styles.distributionSecondary,
                      { color: investmentColor(host, '--uc-text-muted') },
                    ]}
                  >
                    {item.secondaryLabel}
                  </Copy>
                ) : null}
              </View>
            </View>
            <Copy host={host} bold style={styles.distributionPercent}>
              {item.percent}%
            </Copy>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CzRoboOverview({
  host,
  snapshot,
  state,
  onStateChange,
  onOpenSecurity,
  onOpenDistribution,
  onModuleSelect,
}: CzRoboOverviewProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const currency = getCountryConfig(host.country).currency;
  const performance = snapshot.performance;
  const totalValueParts = formatInvestmentAmountParts(
    performance.totalValue,
    host.country,
    currency,
    host.amountsHidden,
  );
  const performanceParts = formatInvestmentAmountParts(
    performance.performanceAmount,
    host.country,
    currency,
    host.amountsHidden,
    true,
  );
  const percentage = host.amountsHidden
    ? '**,**%'
    : `${Math.abs(performance.performancePercent).toFixed(2).replace('.', ',')}%`;
  const percentageWithSign =
    host.amountsHidden || performance.performancePercent === 0
      ? percentage
      : `${performance.performancePercent > 0 ? '+' : '-'}${percentage}`;
  const performanceDirection =
    performance.performanceAmount > 0 || performance.performancePercent > 0
      ? 'up'
      : performance.performanceAmount < 0 || performance.performancePercent < 0
        ? 'down'
        : null;
  const performanceColor = investmentColor(
    host,
    performance.performanceAmount > 0 || performance.performancePercent > 0
      ? '--uc-green-olive'
      : performance.performanceAmount < 0 || performance.performancePercent < 0
        ? '--uc-status-red'
        : '--uc-text',
  );
  const sortedSecurities = sortInvestmentSecurities(
    snapshot.securities,
    state.sortId,
  );
  const activeSecurities = sortedSecurities.filter(
    security => security.status === 'active',
  );
  const activeSortOptionLabel =
    INVESTMENT_SORT_OPTIONS.find(option => option.id === state.sortId)?.label ??
    'MAX VALUE';
  const activeSortDescending =
    state.sortId === 'max-value' || state.sortId === 'max-percent';
  const chartPoints = buildInvestmentChartPoints(
    performance.totalValue,
    state.periodId,
  );
  const distributionContent = (
    tab: Exclude<InvestmentPortfolioTabId, 'performance'>,
  ) => (
    <>
      <View style={styles.distributionHeading}>
        <Copy host={host} bold style={styles.distributionTitleHeading}>
          {getInvestmentDistributionTitle(tab)}
        </Copy>
      </View>
      <DistributionRows
        host={host}
        items={buildInvestmentDistributionItems(snapshot.securities, tab)}
        onSelect={item => onOpenDistribution(tab, item)}
      />
    </>
  );

  return (
    <View style={[styles.shell, { backgroundColor: investmentColor(host, '--uc-app-bg') }]}>
      <BaselinePageHeader
        title=""
        onBack={host.onBack}
        variant="gray"
        backIconName="close-flow"
        backLabel="Back to mobile banking"
        includeSafeArea
        safeAreaReserve={host.screenTopInset}
        renderLargeTitle={false}
        hideCollapsedTitleWhenHidden
        showHelp
        onHelpPress={() => undefined}
        dark={investmentDark(host)}
      />
      <View
        style={[
          styles.contentShell,
          { backgroundColor: investmentColor(host, '--uc-surface') },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.contentScroll}
          contentContainerStyle={styles.contentPadding}
        >
          <View style={styles.pageTitleWrap}>
            <Copy host={host} bold style={styles.pageTitle}>
              Portfolio details
            </Copy>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryTotal}>
              <Copy host={host} bold style={styles.summaryLabel}>
                {host.t('runtime.investments.totalValue', 'Total value')}:
              </Copy>
              <Amount
                host={host}
                parts={totalValueParts}
                integerSize={26}
                minorSize={16}
                integerLine={30}
                minorLine={20}
              />
            </View>
            <View style={styles.summaryPerformance}>
              <Amount
                host={host}
                parts={performanceParts}
                integerSize={14}
                minorSize={14}
                integerLine={18}
                minorLine={18}
              />
              <PerformanceTrendIcon direction={performanceDirection} />
              <Copy
                host={host}
                bold
                style={[styles.summaryPercent, { color: performanceColor }]}
              >
                {percentageWithSign}
              </Copy>
            </View>
          </View>

          {snapshot.securities.length > 0 ? (
            <>
              <View style={styles.chartSection}>
                <BaselineInvestmentPortfolioChart
                  host={host}
                  points={chartPoints}
                  currency={currency}
                  amountsHidden={host.amountsHidden}
                  showVerticalGridLines={false}
                  edgeToEdge
                  tightBottomPadding
                  czRoboPresentation={host.country === 'CZ'}
                />
                <CzRoboPeriods
                  value={state.periodId}
                  onChange={periodId => onStateChange({ periodId })}
                  host={host}
                />
              </View>

              <Copy host={host} bold style={styles.allocationHeading}>
                Investments allocation by
              </Copy>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                accessibilityRole="tablist"
                accessibilityLabel="Investments allocation by"
                contentContainerStyle={styles.allocationTabs}
              >
                {INVESTMENT_PORTFOLIO_TABS.map(tab => {
                  const selected = tab.id === state.tabId;
                  const label = host.t(
                    `runtime.investments.tabs.${tabTranslationKeys[tab.id]}`,
                    tab.label,
                  );
                  return (
                    <Pressable
                      key={tab.id}
                      accessibilityRole="tab"
                      accessibilityLabel={label}
                      accessibilityState={{ selected }}
                      onPress={() => onStateChange({ tabId: tab.id })}
                      style={[
                        styles.allocationTab,
                        {
                          borderColor: selected
                            ? investmentColor(host, '--uc-action')
                            : 'transparent',
                          backgroundColor: selected
                            ? investmentColor(host, '--uc-action-strong')
                            : investmentColor(host, '--uc-neutral-100'),
                        },
                      ]}
                    >
                      <Copy
                        host={host}
                        bold
                        style={[
                          styles.allocationTabText,
                          {
                            color: selected
                              ? investmentColor(host, '--uc-static-white')
                              : investmentColor(host, '--uc-text'),
                          },
                        ]}
                      >
                        {label}
                      </Copy>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {state.tabId === 'performance' ? (
                <View style={styles.activeSecurities}>
                  <View style={styles.activeSecuritiesHeading}>
                    <Copy host={host} bold style={styles.activeSecuritiesTitle}>
                      {host.t(
                        'runtime.investments.activeSecurities',
                        'ACTIVE SECURITIES',
                      )}{' '}
                      ({activeSecurities.length})
                    </Copy>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Sort securities. Current sort: ${activeSortOptionLabel}`}
                      accessibilityState={{ expanded: sortOpen }}
                      onPress={() => setSortOpen(true)}
                      style={styles.sortTrigger}
                    >
                      <Copy host={host} bold style={styles.sortLabel}>
                        {activeSortOptionLabel}
                      </Copy>
                      <View
                        style={[
                          styles.sortIcon,
                          {
                            transform: [
                              {
                                rotate: activeSortDescending ? '180deg' : '0deg',
                              },
                            ],
                          },
                        ]}
                      >
                        <Svg width={16} height={16} viewBox="0 0 16 16">
                          <Path
                            d="M8.00016 0.666992L14.6668 6.64145C13.7451 7.46519 12.2535 7.46519 11.3335 6.64145L9.17794 4.71057V15.3337L6.8215 15.3328V4.71057L4.66683 6.64145C3.74683 7.46519 2.2535 7.46519 1.3335 6.64145L8.00016 0.666992Z"
                            fill="#007A91"
                          />
                        </Svg>
                      </View>
                    </Pressable>
                  </View>
                  {activeSecurities.map(security => (
                    <CzRoboSecurityRow
                      key={security.id}
                      host={host}
                      security={security}
                      onPress={() => onOpenSecurity(security.id)}
                    />
                  ))}
                </View>
              ) : (
                distributionContent(state.tabId)
              )}
            </>
          ) : (
            <View style={styles.emptyPortfolio}>
              <SourceCustomIcon
                name="info-circle"
                size={24}
                color={investmentColor(host, '--uc-text-muted')}
              />
              <View style={styles.emptyPortfolioCopy}>
                <Copy host={host} bold style={styles.emptyPortfolioTitle}>
                  {host.t(
                    'runtime.investments.emptyPortfolioTitle',
                    'Your portfolio is still empty',
                  )}
                </Copy>
                <Copy host={host} style={styles.emptyPortfolioBody}>
                  {host.t(
                    'runtime.investments.emptyPortfolioNextStep',
                    'Select Invest to explore available investment products.',
                  )}
                </Copy>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <ModuleNavigation value="portfolio" onChange={onModuleSelect} />

      {sortOpen ? (
        <SourceBottomSheet
          title="Sort securities"
          onClose={() => setSortOpen(false)}
          dark={investmentDark(host)}
        >
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="Sort securities"
            style={styles.sortOptions}
          >
            {INVESTMENT_SORT_OPTIONS.map(option => {
              const selected = option.id === state.sortId;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ checked: selected }}
                  onPress={() => {
                    onStateChange({ sortId: option.id });
                    setSortOpen(false);
                  }}
                  style={[
                    styles.sortOption,
                    {
                      borderBottomColor: investmentColor(
                        host,
                        '--uc-border-muted',
                      ),
                    },
                  ]}
                >
                  <Copy host={host} bold style={styles.sortOptionText}>
                    {option.label}
                  </Copy>
                  <SourceCustomIcon
                    name={selected ? 'radio-selected' : 'radio-unselected'}
                    size={24}
                    color={investmentColor(
                      host,
                      selected ? '--uc-action' : '--uc-text-muted',
                    )}
                  />
                </Pressable>
              );
            })}
          </View>
        </SourceBottomSheet>
      ) : null}
    </View>
  );
}

function CzRoboPeriods({
  host,
  value,
  onChange,
}: {
  host: BaselineInvestmentOverviewProps['host'];
  value: InvestmentPeriodId;
  onChange: (periodId: InvestmentPeriodId) => void;
}) {
  return (
    <View style={styles.periods}>
      {INVESTMENT_PERIODS.map(period => {
        const selected = period.id === value;
        return (
          <Pressable
            key={period.id}
            accessibilityRole="button"
            accessibilityLabel={period.label}
            accessibilityState={{ selected }}
            aria-pressed={selected}
            onPress={() => onChange(period.id)}
            style={styles.periodTarget}
          >
            <View
              style={[
                styles.periodChip,
                {
                  borderColor: 'transparent',
                  backgroundColor: selected
                    ? investmentColor(host, '--uc-action-strong')
                    : investmentColor(host, '--uc-neutral-100'),
                },
              ]}
            >
              <Copy
                host={host}
                bold
                style={[
                  styles.periodLabel,
                  {
                    color: selected
                      ? investmentColor(host, '--uc-static-white')
                      : investmentColor(host, '--uc-text'),
                  },
                ]}
              >
                {period.label}
              </Copy>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' },
  contentShell: {
    flex: 1,
    minHeight: 0,
    marginTop: 8,
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    boxShadow: '0 -8px 20px rgba(0,0,0,0.045)',
  },
  contentScroll: { flex: 1 },
  contentPadding: { paddingBottom: 28 },
  pageTitleWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 28, lineHeight: 34 },
  summary: { paddingHorizontal: 16, paddingTop: 16 },
  summaryTotal: { gap: 2 },
  summaryLabel: { fontSize: 14, lineHeight: 18 },
  summaryPerformance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryPercent: { fontSize: 14, lineHeight: 18 },
  chartSection: { paddingHorizontal: 16, paddingTop: 8 },
  periods: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  periodTarget: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  periodChip: {
    height: 21,
    minWidth: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 3.5,
    paddingHorizontal: 8,
  },
  periodLabel: { fontSize: 14, lineHeight: 15 },
  allocationHeading: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    fontSize: 20,
    lineHeight: 24,
  },
  allocationTabs: {
    height: 48,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  allocationTab: {
    height: 34,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  allocationTabText: { fontSize: 14, lineHeight: 18 },
  activeSecurities: { flexDirection: 'column' },
  activeSecuritiesHeading: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 16,
  },
  activeSecuritiesTitle: { flex: 1, minWidth: 0, fontSize: 14, lineHeight: 18 },
  sortTrigger: {
    height: 34,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortLabel: { color: '#007A91', fontSize: 14, lineHeight: 16 },
  sortIcon: { width: 16, height: 16 },
  securityRow: {
    minHeight: 95,
    width: '100%',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  securityRowContent: {
    width: '100%',
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  brandPlaceholder: { width: 32, height: 32, flexShrink: 0 },
  securityDetails: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  securityMainColumn: { flex: 1, minWidth: 0 },
  securityTitle: { fontSize: 14, lineHeight: 15 },
  securityMetaLine: {
    minHeight: 18,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  securityMeta: { fontSize: 14, lineHeight: 18 },
  securityValueColumn: { alignItems: 'flex-end', gap: 2 },
  securityPercent: { fontSize: 14, lineHeight: 18, textAlign: 'right' },
  distributionHeading: { marginTop: 8, paddingHorizontal: 16 },
  distributionTitleHeading: { fontSize: 16, lineHeight: 20 },
  distributionRows: { marginTop: 18 },
  distributionRow: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  distributionLabelGroup: { flex: 1, minWidth: 0, flexDirection: 'row', gap: 10 },
  distributionDot: {
    width: 10,
    height: 10,
    flexShrink: 0,
    borderRadius: 5,
    marginTop: 5,
  },
  distributionCopy: { flex: 1, minWidth: 0 },
  distributionTitle: { fontSize: 16, lineHeight: 18 },
  distributionSecondary: { marginTop: 2, fontSize: 12, lineHeight: 15 },
  distributionPercent: { fontSize: 20, lineHeight: 22 },
  emptyPortfolio: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#D9D9D9',
  },
  emptyPortfolioCopy: { flex: 1, minWidth: 0 },
  emptyPortfolioTitle: { fontSize: 16, lineHeight: 20 },
  emptyPortfolioBody: { marginTop: 8, fontSize: 16, lineHeight: 20 },
  sortOptions: { paddingHorizontal: 8 },
  sortOption: {
    minHeight: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  sortOptionText: { fontSize: 16, lineHeight: 20 },
});
