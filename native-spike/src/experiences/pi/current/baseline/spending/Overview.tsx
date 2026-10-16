import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { getAnalyticsCategoryDisplayLabel } from '@/app/screens/analytics/analyticsCategoryLabels';
import { buildCenteredPeriodIndicator } from '@/app/components/contracts/analyticsIndicator';
import type { PfmCategoryName } from '@/data/pfmCategories';
import type {
  SpendingAnalyticsSummary,
  SpendingAnalyticsTimeline,
} from '@/data/spendingAnalytics';
import type { CurrentScreenProps } from '../../contracts';
import { BaselineTransactionAvatar } from '../../../../../universal/BaselineTransactionAvatar';
import { BaselineL1Header } from '../../../../../universal/BaselineL1Header';
import {
  BaselineHeaderActionButton,
  BaselineHeaderActionRail,
} from '../../../../../universal/BaselineHeaderActions';
import { BaselineAccountActionBar } from '../../../../../universal/BaselineAccountActionBar';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

export function BaselineSpendingHeader({ host }: { host: CurrentScreenProps }) {
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  return (
    <BaselineL1Header
      variant="analytics"
      title={host.t('runtime.analytics.title', 'My Spendings')}
      dark={dark}
      actions={
        <BaselineHeaderActionRail>
          <BaselineHeaderActionButton
            icon="profile"
            label={host.t('runtime.actions.profile', 'Profile')}
            dark={dark}
            onPress={() => {}}
          />
          <BaselineHeaderActionButton
            icon="messages"
            label={host.t('runtime.actions.messages', 'Messages')}
            dark={dark}
            onPress={() => host.onNavigate({ screen: 'messages' })}
          />
          <BaselineHeaderActionButton
            icon="help"
            label={host.t('runtime.actions.help', 'Help')}
            dark={dark}
            onPress={() => {}}
          />
        </BaselineHeaderActionRail>
      }
    />
  );
}
import { BaselinePfmPeriodCarousel } from './PeriodCarousel';
import {
  BaselineCashFlowChart,
  BaselinePeriodIndicator,
  categoryPillColor,
  categoryPillWidth,
} from './charts';

function CategoryIcon({
  category,
  dark,
}: {
  category: PfmCategoryName;
  dark: boolean;
}) {
  const glyph = (
    <BaselineTransactionAvatar
      identity={{ kind: 'category', category, pfmVariant: 'glyph' }}
      size={32}
      dark={dark}
    />
  );
  if (Platform.OS === 'web') {
    // Source's inline-flex mark exposes its SVG baseline to the enclosing line box.
    // Reproduce that layout so 20/22/24px glyphs retain their different descents.
    return React.createElement(
      'div',
      {
        style: {
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'UniCredit-regular',
          fontSize: 16,
          lineHeight: '24px',
        },
      },
      React.createElement(
        'span',
        {
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
          },
        },
        glyph,
      ),
    );
  }
  return <View style={styles.icon}>{glyph}</View>;
}

function CategoryAmount({
  host,
  amount,
  currency,
  direction,
}: {
  host: CurrentScreenProps;
  amount: number;
  currency: string;
  direction: 'out' | 'in';
}) {
  const formatted = formatMoneyNumber(amount, host.country);
  const parts = formatted.match(/^(.+?)([,.])(\d{2})$/);
  return (
    <Text style={[styles.amount, { color: host.tokens.text }]}>
      {direction === 'out' ? '-' : ''}
      {parts?.[1] ?? formatted}
      {parts?.[2] ?? ''}
      <Text style={styles.decimals}>
        {parts?.[3] ?? ''} {currency}
      </Text>
    </Text>
  );
}

function MoneyCategorySection({
  host,
  title,
  categories,
  currency,
  direction,
  onCategoryClick,
}: {
  host: CurrentScreenProps;
  title: string;
  categories: SpendingAnalyticsSummary['moneyOutCategories'];
  currency: string;
  direction: 'out' | 'in';
  onCategoryClick: (category: PfmCategoryName, direction: 'out' | 'in') => void;
}) {
  const maxTotal = Math.max(...categories.map(category => category.total), 1);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  return (
    <View testID={`ro-pfm-money-${direction}`} style={styles.section}>
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { color: host.tokens.text }]}
      >
        {title}
      </Text>
      {categories.length ? (
        <View style={styles.categories}>
          {categories.map(category => {
            const label = getAnalyticsCategoryDisplayLabel(
              category.category,
              host.t,
            );
            return (
              <Pressable
                key={`${direction}-${category.category}`}
                testID={`ro-pfm-category-${direction}-${category.category}`}
                accessibilityRole="button"
                accessibilityLabel={`${host.t(
                  'runtime.analytics.openCategoryDetails',
                  'Open category details',
                )}: ${label}`}
                onPress={() => onCategoryClick(category.category, direction)}
                style={styles.category}
              >
                <CategoryIcon category={category.category} dark={dark} />
                <View style={styles.categoryContent}>
                  <View
                    style={[
                      styles.pill,
                      {
                        width: categoryPillWidth(category.total, maxTotal),
                        backgroundColor: categoryPillColor(
                          category.colorVar,
                          dark,
                        ),
                      },
                    ]}
                  />
                  <View style={styles.categoryCopy}>
                    <Text
                      style={[
                        styles.categoryLabel,
                        { color: host.tokens.muted },
                      ]}
                    >
                      {label}
                    </Text>
                    <CategoryAmount
                      host={host}
                      amount={category.total}
                      currency={currency}
                      direction={direction}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text style={[styles.empty, { color: host.tokens.muted }]}>
          {host.t(
            'runtime.analytics.noTransactionsForPeriod',
            'No transactions for this period',
          )}
        </Text>
      )}
    </View>
  );
}

export function RoBaselinePfmOverview({
  host,
  timeline,
  activePeriodKey,
  summary,
  onPeriodChange,
  onCategoryClick,
}: {
  host: CurrentScreenProps;
  timeline: SpendingAnalyticsTimeline;
  activePeriodKey: string;
  summary: SpendingAnalyticsSummary;
  onPeriodChange: (key: string) => void;
  onCategoryClick: (category: PfmCategoryName, direction: 'out' | 'in') => void;
}) {
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const activeIndex = Math.max(
    timeline.periods.findIndex(period => period.key === activePeriodKey),
    0,
  );
  const indicatorKeys = buildCenteredPeriodIndicator(
    timeline.periods.map(period => period.key),
    activeIndex,
  );
  return (
    <View
      testID="ro-pfm-overview"
      style={[styles.page, { backgroundColor: host.tokens.background }]}
    >
      <View testID="ro-pfm-top-spacer" style={styles.topSpacer} />
      <BaselineSpendingHeader host={host} />
      <ScrollView
        testID="ro-pfm-overview-scroll"
        style={[
          styles.scroll,
          { backgroundColor: host.tokens.background },
          Platform.OS === 'web' ? styles.webScroll : undefined,
        ]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View>
          <BaselinePfmPeriodCarousel
            periods={timeline.periods}
            activePeriodKey={activePeriodKey}
            onPeriodChange={onPeriodChange}
            renderPeriod={period => {
              const value = timeline.summariesByPeriodKey[period.key];
              if (!value) return null;
              return (
                <>
                  <View style={styles.heroCopy}>
                    <Text
                      style={[styles.dataFor, { color: host.tokens.muted }]}
                    >
                      {host.t('runtime.analytics.dataFor', 'Data For')}
                    </Text>
                    <View style={styles.heroTitle}>
                      <Text style={[styles.h1, { color: host.tokens.text }]}>
                        {period.key.startsWith('year-')
                          ? host.t('runtime.analytics.yearTotal', 'Year total')
                          : value.periodLabel}
                      </Text>
                      <Text style={[styles.h1, { color: host.tokens.muted }]}>
                        {value.yearLabel}
                      </Text>
                    </View>
                  </View>
                  <BaselineCashFlowChart host={host} summary={value} />
                </>
              );
            }}
          />
          <BaselinePeriodIndicator
            host={host}
            activePeriodKey={activePeriodKey}
            periodKeys={indicatorKeys}
          />
        </View>
        <View style={styles.action}>
          <BaselineAccountActionBar
            align="end"
            dark={dark}
            style={styles.actionBar}
            items={[
              {
                id: 'card-transaction',
                iconName: 'add-money',
                iconColor: 'var(--uc-icon)',
                label: host
                  .t('runtime.actions.cardTransaction', 'Card Transaction')
                  .replace(' ', '\n'),
                onPress: host.onAddTransaction,
              },
            ]}
          />
        </View>
        <View style={{ backgroundColor: host.tokens.background }}>
          <MoneyCategorySection
            host={host}
            title={host.t('runtime.analytics.moneyOut', 'Money out')}
            categories={summary.moneyOutCategories}
            currency={summary.currency}
            direction="out"
            onCategoryClick={onCategoryClick}
          />
          <MoneyCategorySection
            host={host}
            title={host.t('runtime.analytics.moneyIn', 'Money in')}
            categories={summary.moneyInCategories}
            currency={summary.currency}
            direction="in"
            onCategoryClick={onCategoryClick}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  topSpacer: { height: 54, flexShrink: 0 },
  scroll: { flex: 1 },
  webScroll: { transform: 'none' } as unknown as ViewStyle,
  scrollContent: { paddingBottom: 80 },
  heroCopy: { paddingHorizontal: 24, overflow: 'hidden' },
  dataFor: { fontFamily: 'UniCredit-bold', fontSize: 16 },
  heroTitle: {
    width: 327,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 96,
  },
  h1: { fontFamily: 'UniCredit-bold', fontSize: 28, flexShrink: 0 },
  action: { paddingHorizontal: 24, paddingTop: 0, paddingBottom: 18 },
  actionBar: { paddingHorizontal: 0, paddingVertical: 0 },
  section: { paddingTop: 20 },
  sectionTitle: {
    paddingHorizontal: 24,
    fontFamily: 'UniCredit-bold',
    fontSize: 32,
    lineHeight: 48,
  },
  categories: { marginTop: 12, gap: 14, paddingHorizontal: 16 },
  category: {
    minHeight: 92,
    width: '100%',
    paddingLeft: 44,
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 0,
    top: '50%',
    // Source's inline-flex 32px mark participates in a 35px baseline line box.
    // The absolute wrapper centers that line box; its 32px child starts at the top.
    height: 35,
    transform: [{ translateY: -17.5 }],
  },
  categoryContent: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pill: {
    position: 'absolute',
    right: -18,
    top: '50%',
    transform: [{ translateY: -39 }],
    height: 78,
    borderRadius: 28,
  },
  categoryCopy: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 255,
    paddingVertical: 8,
  },
  categoryLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    letterSpacing: 0,
    textAlign: 'right',
  },
  amount: { fontFamily: 'UniCredit-bold', fontSize: 20, textAlign: 'right' },
  decimals: { fontFamily: 'UniCredit-regular', fontSize: 14 },
  empty: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
});
