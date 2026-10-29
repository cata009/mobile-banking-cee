import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { getPfmCategory, type PfmCategoryName } from '@/data/pfmCategories';
import {
  createSpendingCategoryDetail,
  type SpendingAnalyticsPeriod,
  type SpendingAnalyticsTimeline,
  type SpendingAnalyticsTransaction,
} from '@/data/spendingAnalytics';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { getAnalyticsCategoryDisplayLabel } from '@/app/screens/analytics/analyticsCategoryLabels';
import { buildCenteredPeriodIndicator } from '@/app/components/contracts/analyticsIndicator';
import type { CurrentScreenProps } from '../../../contracts';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { BaselineAccountActionBar } from '../../../../../../universal/BaselineAccountActionBar';
import { BaselineTransactionRow } from '../../../../../../universal/BaselineTransactionRow';
import { BaselineTransactionDivider } from '../../../../../../universal/BaselineTransactionDivider';
import { BaselineBanner } from '../../../../../../universal/BaselineBanner';
import { Text } from '../../../../../../universal/Typography';
import { DuoFullWidthSection } from '../../../../../../universal/DuoPreview';
import { sourceColor } from '../../../../../../universal/sourceColor';
import { BaselinePfmPeriodCarousel } from '../PeriodCarousel';
import { BaselinePeriodIndicator, BaselineSubcategoryBubbles } from '../charts';

export interface RoBaselinePfmCategoryDetailProps {
  host: CurrentScreenProps;
  timeline: SpendingAnalyticsTimeline;
  activePeriodKey: string;
  category: PfmCategoryName;
  direction: 'out' | 'in';
  onPeriodChange: (periodKey: string) => void;
  onBack: () => void;
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void;
}

function formatPeriodTitle(period: SpendingAnalyticsPeriod) {
  if (period.kind === 'year') return period.year;
  const month = period.label.toLocaleLowerCase();
  return `${month.charAt(0).toLocaleUpperCase()}${month.slice(1)} ${
    period.year
  }`;
}

/** Composition selects the Source policies; filtering remains in the Source analytics helper. */
export function RoBaselinePfmCategoryDetail({
  host,
  timeline,
  activePeriodKey,
  category,
  direction,
  onPeriodChange,
  onBack,
  onTransactionClick,
}: RoBaselinePfmCategoryDetailProps) {
  const [showUncategorizedTip, setShowUncategorizedTip] = useState(true);
  const [excludedSubcategories, setExcludedSubcategories] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const categoryDefinition = getPfmCategory(category);
  const categoryLabel = getAnalyticsCategoryDisplayLabel(category, host.t);
  const activeIndex = Math.max(
    timeline.periods.findIndex(period => period.key === activePeriodKey),
    0,
  );
  const indicatorKeys = useMemo(
    () =>
      buildCenteredPeriodIndicator(
        timeline.periods.map(period => period.key),
        activeIndex,
      ),
    [activeIndex, timeline.periods],
  );
  useEffect(() => {
    setExcludedSubcategories(new Set());
  }, [activePeriodKey, category, direction]);

  const toggleSubcategory = (label: string) => {
    setExcludedSubcategories(current => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };
  const activeSummary = timeline.summariesByPeriodKey[activePeriodKey];
  const detail = activeSummary
    ? createSpendingCategoryDetail(
        activeSummary,
        category,
        direction,
        excludedSubcategories,
      )
    : null;
  const activePeriod = timeline.periods.find(
    period => period.key === activePeriodKey,
  );
  const formatAmount = (amount: number) =>
    maskFormattedAmount(
      formatMoneyNumber(amount, host.country),
      host.amountsHidden,
    );
  const renderPeriod = (period: SpendingAnalyticsPeriod) => {
    const summary = timeline.summariesByPeriodKey[period.key];
    if (!summary) return null;
    const filtered = createSpendingCategoryDetail(
      summary,
      category,
      direction,
      excludedSubcategories,
    );
    const complete = createSpendingCategoryDetail(summary, category, direction);
    return (
      <>
        <View testID={`ro-pfm-category-hero-${period.key}`} style={styles.hero}>
          <Text
            style={[styles.showingData, { color: color('--uc-text-muted') }]}
          >
            {host.t('runtime.analytics.showingDataFor', 'Showing data for')}
          </Text>
          <Text style={[styles.periodTitle, { color: color('--uc-text') }]}>
            {formatPeriodTitle(period)}
          </Text>
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.total, { color: color('--uc-text') }]}
          >
            {formatAmount(filtered.total)} {summary.currency}
          </Text>
        </View>
        <BaselineSubcategoryBubbles
          host={host}
          subcategories={complete.subcategories}
          colorVar={categoryDefinition.colorVar}
          inactiveSubcategories={excludedSubcategories}
          onToggle={toggleSubcategory}
        />
      </>
    );
  };
  return (
    <View
      testID="ro-pfm-category-detail"
      style={[styles.screen, { backgroundColor: color('--uc-surface') }]}
    >
      <DuoFullWidthSection backgroundColor={color('--uc-app-bg')}>
        <BaselinePageHeader
          title={categoryLabel}
          onBack={onBack}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          showHelp={false}
          variant="gray"
          largeTitleColor={color(categoryDefinition.colorVar)}
          dark={dark}
        />
      </DuoFullWidthSection>
      <ScrollView
        style={[
          styles.scroll,
          { backgroundColor: color('--uc-surface') },
          Platform.OS === 'web' ? styles.webScroll : undefined,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DuoFullWidthSection backgroundColor={color('--uc-app-bg')}>
          <BaselinePfmPeriodCarousel
            hideInactivePanels
            periods={timeline.periods}
            activePeriodKey={activePeriodKey}
            onPeriodChange={onPeriodChange}
            renderPeriod={renderPeriod}
            testID="ro-pfm-category-period-carousel"
          />
          <BaselinePeriodIndicator
            host={host}
            activePeriodKey={activePeriodKey}
            periodKeys={indicatorKeys}
          />
          <BaselineAccountActionBar
            align="end"
            dark={dark}
            items={[
              {
                id: 'add-transaction',
                iconName: 'add-money',
                label: host.t(
                  'runtime.analytics.addTransaction',
                  'Add Transaction',
                ),
                onPress: host.onAddTransaction,
              },
            ]}
            style={styles.actionBar}
          />
        </DuoFullWidthSection>
        <DuoFullWidthSection backgroundColor={color('--uc-surface')}>
          {activeSummary && detail ? (
            <View
              style={[
                styles.transactions,
                { backgroundColor: color('--uc-surface') },
              ]}
            >
              <BaselineTransactionDivider
                title={
                  activePeriod?.kind === 'year'
                    ? activePeriod.year
                    : (activePeriod?.label ?? activeSummary.periodLabel)
                }
                total={formatAmount(
                  direction === 'out' ? -detail.total : detail.total,
                )}
                currency={activeSummary.currency}
                dark={dark}
              />
              {detail.transactions.length ? (
                detail.transactions.map((transaction, index) => (
                  <View key={transaction.id}>
                    <BaselineTransactionRow
                      transaction={transaction}
                      formattedAmount={formatAmount(
                        Math.abs(transaction.amount),
                      )}
                      currency={activeSummary.currency}
                      avatarPresentation="category"
                      onPress={() => onTransactionClick?.(transaction)}
                      dark={dark}
                    />
                    {category === 'Uncategorized' &&
                    index === 0 &&
                    showUncategorizedTip ? (
                      <View style={styles.helper}>
                        <BaselineBanner
                          variant="helper"
                          title={host.t(
                            'runtime.analytics.uncategorizedTransaction',
                            'Uncategorized transaction',
                          )}
                          description={host.t(
                            'runtime.analytics.uncategorizedTransactionDescription',
                            'Choose a category for this transaction and the app will remember it in the future.',
                          )}
                          dismissible
                          closeLabel={host.t(
                            'runtime.analytics.dismissUncategorizedTip',
                            'Dismiss uncategorized transaction tip',
                          )}
                          onClose={() => setShowUncategorizedTip(false)}
                          dark={dark}
                        />
                      </View>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text
                  style={[styles.empty, { color: color('--uc-text-muted') }]}
                >
                  {host.t(
                    'runtime.analytics.noTransactionsForPeriod',
                    'No transactions for this period',
                  )}
                </Text>
              )}
            </View>
          ) : null}
        </DuoFullWidthSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%' },
  scroll: { flex: 1 },
  webScroll: { transform: 'none' },
  hero: { paddingHorizontal: 24, paddingTop: 6 },
  showingData: { fontFamily: 'UniCredit-bold', fontSize: 16, letterSpacing: 0 },
  periodTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    marginTop: 2,
    letterSpacing: 0,
  },
  total: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    marginTop: 2,
    letterSpacing: 0,
  },
  actionBar: { paddingHorizontal: 16, paddingVertical: 0, paddingBottom: 8 },
  transactions: { paddingBottom: 24 },
  helper: { paddingHorizontal: 16, paddingVertical: 8 },
  empty: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    paddingHorizontal: 24,
    paddingVertical: 20,
    letterSpacing: 0,
  },
});
