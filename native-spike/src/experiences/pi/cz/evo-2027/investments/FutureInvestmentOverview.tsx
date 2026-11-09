import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  buildInvestmentDistributionItems,
  INVESTMENT_SORT_OPTIONS,
  sortInvestmentSecurities,
  type InvestmentPortfolioTabId,
} from '@/app/config/investmentsPortfolioConfig';
import type { InvestmentBasketFund } from '@/app/config/investmentBasketFundsConfig';
import type { InvestmentFundCollectionId } from '@/app/config/investmentFundCollections';
import {
  buildFutureHistory,
  FUTURE_PERIODS,
  futurePerformance,
  futureRecommendations,
  selectFuturePeriod,
  type FuturePeriod,
} from '@/features/investments/future-overview/model';
import {
  futureCopy,
  futureAssetClass,
  futureSortLabel,
} from '@/features/investments/future-overview/copy';
import {
  readFutureProfile,
  subscribeFutureProfile,
} from '@/features/investments/future-overview/session';
import {
  formatInvestmentMoney,
  formatInvestmentAmountParts,
} from '@/app/utils/investmentAmountFormatting';
import { Amount } from '../../../current/investments/baseline/overview/ui';
import { BaselineInvestmentPeriodChips } from '../../../../../universal/BaselineInvestmentPeriodChips';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import type {
  BaselineInvestmentOverviewProps,
  BaselineInvestmentSnapshot,
} from '../../../current/investments/baseline/contracts';
import {
  investmentColor,
  investmentDark,
} from '../../../current/investments/baseline/Frame';
import { CzRoboSecurityRow } from '../../../current/investments/baseline/overview/CzRoboOverview';
import { BaselineInvestmentCatalog } from '../../../current/investments/baseline/catalog';
import { BaselineInvestmentHistory } from '../../../current/investments/baseline/flows/History';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { NavigationRow } from '../../../../../universal/NavigationRow';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';
import { Select } from '../../../../../universal/Select';
import { Text } from '../../../../../universal/Typography';
import { ModuleNavigation, type InvestmentSection } from './ModuleNavigation';
import { FuturePortfolioChart } from './FuturePortfolioChart';
import { FutureInvestmentExplore } from './FutureInvestmentExplore';
import { FutureInvestmentMore, type MorePage } from './FutureInvestmentMore';
import { FuturePortfolioSwitcher } from './FuturePortfolioSwitcher';
import { Chips } from './Primitives';
import { readCzRoboGoals, subscribeCzRoboGoals } from '../robo/session';
import { baselineCzRoboSession } from '../../../current/investments/RoboSession';

const EVO_PRODUCT_TYPE_CHIPS = [
  { id: 'all', label: 'All products' },
  { id: 'Fund', label: 'Funds' },
  { id: 'Stock', label: 'Stocks' },
  { id: 'Bond', label: 'Bonds' },
  { id: 'baskets', label: 'Basket funds' },
] as const;

export function FutureInvestmentOverview({
  host,
  snapshot,
  state,
  onStateChange,
  onOpenSecurity,
  onOpenDistribution,
  onOpenApprovals,
  section,
  onSectionChange,
  onSelectBasket,
  historyOptions,
}: Omit<BaselineInvestmentOverviewProps, 'snapshot'> & {
  snapshot: BaselineInvestmentSnapshot;
  section: InvestmentSection;
  onSectionChange(section: InvestmentSection): void;
  onSelectBasket(basket: InvestmentBasketFund): void;
  onOpenFundCollection?: (collection: InvestmentFundCollectionId) => void;
  historyOptions?: Partial<
    Omit<
      React.ComponentProps<typeof BaselineInvestmentHistory>,
      'host' | 'transactions' | 'orders'
    >
  >;
}) {
  const c = futureCopy(host.language),
    dark = investmentDark(host);
  const profile = useSyncExternalStore(
    subscribeFutureProfile,
    readFutureProfile,
  );
  const goals = useSyncExternalStore(
    host.release === 'release-future-evo-2027'
      ? subscribeCzRoboGoals
      : baselineCzRoboSession.subscribe,
    host.release === 'release-future-evo-2027'
      ? readCzRoboGoals
      : baselineCzRoboSession.readGoals,
  );
  const historyInitialTab = historyOptions?.initialTab ?? 'transactions';
  const [activityTab, setActivityTab] = useState(historyInitialTab);
  const [catalogAtRoot, setCatalogAtRoot] = useState(true);
  const [historyAtRoot, setHistoryAtRoot] = useState(true);
  useEffect(() => setActivityTab(historyInitialTab), [historyInitialTab]);
  const [morePage, setMorePage] = useState<MorePage>('menu');
  const [education, setEducation] = useState<'risk' | 'regular' | null>(null);
  const [breakdown, setBreakdown] = useState(false);
  const [breakdownBy, setBreakdownBy] =
    useState<Exclude<InvestmentPortfolioTabId, 'performance'>>('product-type');
  const period: FuturePeriod = FUTURE_PERIODS.includes(
    state.periodId as FuturePeriod,
  )
    ? (state.periodId as FuturePeriod)
    : 'max';
  const portfolio = 'portfolio';
  const filtered = snapshot.securities;
  const history = useMemo(() => buildFutureHistory(filtered), [filtered]);
  const points = useMemo(
    () => selectFuturePeriod(history, period),
    [history, period],
  );
  const performance = useMemo(() => futurePerformance(points), [points]);
  const recommendations = useMemo(
    () => futureRecommendations(snapshot.catalog, profile),
    [snapshot.catalog, profile],
  );
  const amount = (value: number, signed = false) =>
    formatInvestmentMoney(
      value,
      host.country,
      'CZK',
      host.amountsHidden,
      2,
      2,
      signed,
    );
  const text = {
    color: host.tokens.text,
    fontFamily: host.tokens.font,
    fontSize: 14,
    lineHeight: 20,
  };
  const heading = {
    ...text,
    fontFamily: host.tokens.strongFont,
    fontSize: 22,
    lineHeight: 28,
  };
  const accent = investmentColor(host, '--uc-action');
  const total = history.at(-1)?.value ?? 0;
  const profileEntry = () => {
    setMorePage('profile');
    onSectionChange('more');
  };
  const goBack = useCallback(() => {
    if (section === 'more' && morePage !== 'menu') setMorePage('menu');
    else if (section !== 'portfolio') onSectionChange('portfolio');
    else host.onBack();
  }, [section, morePage, onSectionChange, host.onBack]);
  useEffect(() => {
    if (section === 'catalog' || section === 'history') return;
    host.onBackHandlerChange?.(() => {
      if (section !== 'portfolio') {
        goBack();
        return true;
      }
      return false;
    });
    return () => host.onBackHandlerChange?.(null);
  }, [section, host.onBackHandlerChange, goBack]);
  const selectPortfolio = (value: string) => {
    if (value === 'goals' || value.startsWith('goal:')) {
      host.onNavigate({
        screen: 'investments',
        params: {
          view: 'goals',
          ...(value.startsWith('goal:')
            ? {
                goalId: value.slice(5),
                robo_view: 'detail',
                robo_goal: value.slice(5),
              }
            : { robo_view: 'goals' }),
        },
      });
    }
  };
  const titles: Record<InvestmentSection, string> = {
    portfolio: c.portfolio,
    explore: c.explore,
    catalog: c.invest,
    history: c.activity,
    more: c.more,
  };
  // A nested More page names itself in the header, so the page never repeats its title as a heading.
  const moreTitles: Record<MorePage, string> = {
    menu: c.more,
    profile: c.profile,
    questionnaire: c.questionnaire,
    report: c.report,
    statements: c.statements,
    help: c.help,
  };
  const showSectionHeader =
    section === 'catalog'
      ? catalogAtRoot
      : section === 'history'
        ? historyAtRoot
        : true;
  const morePageIsNested = section === 'more' && morePage !== 'menu';
  const embeddedHost = {
    ...host,
    screenTopInset: 0,
    onBackHandlerChange: (handler: (() => boolean) | null) =>
      host.onBackHandlerChange?.(
        handler
          ? () => {
              if (!handler()) onSectionChange('portfolio');
              return true;
            }
          : null,
      ),
  };
  const recommendation = (
    security: (typeof recommendations)[number],
    compact = false,
  ) => (
    <View
      key={security.id}
      style={[
        s.recommendation,
        { backgroundColor: investmentColor(host, '--uc-app-bg') },
      ]}
    >
      <NavigationRow
        tokens={host.tokens}
        title={security.title}
        titleContent={
          compact ? (
            <Text
              style={[text, { fontSize: 12, fontFamily: host.tokens.font }]}
            >
              {c.recommended}
              {'\n'}
              <Text
                style={{ fontFamily: host.tokens.strongFont, fontSize: 16 }}
              >
                {security.title}
              </Text>
            </Text>
          ) : undefined
        }
        subtitle={
          compact
            ? undefined
            : `${futureAssetClass(security.assetClass, host.language)} · ${security.instrumentCurrency}`
        }
        payload={security.id}
        onSelect={onOpenSecurity}
        borderWidth={0}
        containerStyle={{
          minHeight: 58,
          paddingHorizontal: 0,
          paddingVertical: 8,
        }}
        trailing={
          <SourceCustomIcon name="chevron-right" size={16} color={accent} />
        }
      />
    </View>
  );
  const performanceColor = investmentColor(
    host,
    performance.amount < 0
      ? '--uc-status-red'
      : performance.amount > 0
        ? '--uc-green-olive'
        : '--uc-text-muted',
  );
  return (
    <View
      testID="future-investment-home"
      style={[
        s.root,
        { backgroundColor: investmentColor(host, '--uc-app-bg') },
      ]}
    >
      {showSectionHeader && (
        <BaselinePageHeader
          title={section === 'more' ? moreTitles[morePage] : titles[section]}
          onBack={morePageIsNested ? goBack : host.onBack}
          backIconName={morePageIsNested ? 'back-heavy' : 'close-flow'}
          backLabel={morePageIsNested ? 'Back' : 'Close'}
          variant="gray"
          renderLargeTitle={false}
          collapsedTitleProgress={1}
          includeSafeArea
          safeAreaReserve={
            host.release === 'release-future-evo-2027' ? 0 : host.screenTopInset
          }
          dark={dark}
          onHelpPress={() => {
            setMorePage('help');
            onSectionChange('more');
          }}
          titleControl={
            section === 'portfolio' ? (
              <FuturePortfolioSwitcher
                tokens={host.tokens}
                language={host.language}
                value={portfolio}
                goals={goals}
                onChange={selectPortfolio}
              />
            ) : undefined
          }
        />
      )}
      <View
        style={[
          s.body,
          { backgroundColor: investmentColor(host, '--uc-surface') },
        ]}
      >
        {section === 'catalog' ? (
          <View style={s.embedded}>
            <BaselineInvestmentCatalog
              host={embeddedHost}
              securities={snapshot.catalog}
              showHeader={false}
              onRootChange={setCatalogAtRoot}
              renderProductTypeChips={
                host.release === 'release-future-evo-2027'
                  ? ({ value, onChange }) => (
                      <Chips
                        items={EVO_PRODUCT_TYPE_CHIPS}
                        value={value}
                        onChange={onChange}
                        testID="evo-investment-product-type-chips"
                      />
                    )
                  : undefined
              }
              onBack={() => onSectionChange('portfolio')}
              onSelect={security => onOpenSecurity(security.id)}
              onSelectBasket={onSelectBasket}
            />
          </View>
        ) : section === 'history' ? (
          <View style={s.embedded}>
            <BaselineInvestmentHistory
              {...historyOptions}
              host={embeddedHost}
              showHeader={!historyAtRoot}
              onRootChange={setHistoryAtRoot}
              transactions={snapshot.transactions}
              orders={snapshot.orders}
              initialTab={activityTab}
              onTabChange={tab => {
                setActivityTab(tab);
                historyOptions?.onTabChange?.(tab);
              }}
              titleOverride={historyOptions?.titleOverride ?? c.activity}
              approvalCount={
                historyOptions?.approvalCount ??
                snapshot.orders.filter(o => o.status === 'PENDING').length
              }
              onToApprove={historyOptions?.onToApprove ?? onOpenApprovals}
              onBack={
                historyOptions?.onBack ?? (() => onSectionChange('portfolio'))
              }
            />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.scroll}
          >
            {section === 'portfolio' && (
              <>
                <View style={s.summary}>
                  <Text style={[text, { fontFamily: host.tokens.strongFont }]}>
                    {host.t('runtime.investments.totalValue', 'Total value')}:
                  </Text>
                  <Amount
                    host={host}
                    parts={formatInvestmentAmountParts(
                      total,
                      host.country,
                      'CZK',
                      host.amountsHidden,
                    )}
                    integerSize={26}
                    minorSize={16}
                    integerLine={30}
                    minorLine={20}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Amount
                      host={host}
                      parts={formatInvestmentAmountParts(
                        performance.amount,
                        host.country,
                        'CZK',
                        host.amountsHidden,
                        true,
                      )}
                      integerSize={14}
                      minorSize={14}
                      integerLine={18}
                      minorLine={18}
                    />
                    <Text
                      style={[
                        text,
                        {
                          color: performanceColor,
                          fontFamily: host.tokens.strongFont,
                        },
                      ]}
                    >
                      {performance.amount < 0 ? '↘' : '↗'}{' '}
                      {host.amountsHidden
                        ? '••%'
                        : performance.percent === null
                          ? '—'
                          : `${performance.percent > 0 ? '+' : ''}${new Intl.NumberFormat(host.language === 'cs' ? 'cs-CZ' : 'en-GB', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(performance.percent)}%`}
                    </Text>
                  </View>
                </View>
                {!!points.length && (
                  <View style={s.chart}>
                    <FuturePortfolioChart
                      key={`${portfolio}-${period}`}
                      host={host}
                      points={points}
                      copy={c}
                      currency="CZK"
                    />
                    <BaselineInvestmentPeriodChips
                      periods={FUTURE_PERIODS.map(id => ({
                        id,
                        label: id.toUpperCase(),
                      }))}
                      selectedPeriodId={period}
                      onChange={periodId => onStateChange({ periodId })}
                      ariaLabel={c.period}
                      comfortableTouchTargets
                      softUnselected
                      dark={dark}
                      targetStyle={{ flex: 1 }}
                      style={{ paddingHorizontal: 20 }}
                    />
                  </View>
                )}
                {!!recommendations.length && (
                  <View style={s.section}>
                    {recommendation(recommendations[0]!, true)}
                  </View>
                )}
                <View style={[s.section, { paddingVertical: 0 }]}>
                  <View style={s.row}>
                    <Text
                      accessibilityRole="header"
                      style={[text, { fontFamily: host.tokens.strongFont }]}
                    >
                      {c.holdings.toUpperCase()} (
                      {filtered.filter(s => s.status === 'active').length})
                    </Text>
                    <Select
                      tokens={host.tokens}
                      label={c.sort}
                      value={state.sortId}
                      items={INVESTMENT_SORT_OPTIONS.map(o => ({
                        value: o.id,
                        label: futureSortLabel(o.id, o.label, host.language),
                      }))}
                      onChange={sortId => onStateChange({ sortId })}
                      closeLabel={c.close}
                      renderTrigger={({ open, expanded, label }) => (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={c.sort}
                          accessibilityState={{ expanded }}
                          onPress={open}
                          style={[s.row, { minHeight: 40 }]}
                        >
                          <Text
                            style={[
                              text,
                              {
                                fontFamily: host.tokens.strongFont,
                                color: accent,
                              },
                            ]}
                          >
                            {label}
                          </Text>
                          <SourceCustomIcon
                            name="chevron-down"
                            size={12}
                            color={accent}
                          />
                        </Pressable>
                      )}
                      renderPanel={({ visible, onClose, children }) =>
                        visible ? (
                          <SourceBottomSheet
                            title={c.sort}
                            onClose={onClose}
                            dark={dark}
                          >
                            {children}
                          </SourceBottomSheet>
                        ) : null
                      }
                    />
                  </View>
                </View>
                {sortInvestmentSecurities(filtered, state.sortId)
                  .filter(s => s.status === 'active')
                  .map(security => (
                    <CzRoboSecurityRow
                      key={security.id}
                      host={host}
                      security={security}
                      onPress={() => onOpenSecurity(security.id)}
                    />
                  ))}
                <View style={s.section}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={c.breakdown}
                    onPress={() => setBreakdown(true)}
                    style={s.link}
                  >
                    <Text style={[text, { color: accent }]}>
                      {c.breakdown} ↗
                    </Text>
                  </Pressable>
                </View>
                {!filtered.length && (
                  <Text style={[text, s.section]}>{c.noHoldings}</Text>
                )}
              </>
            )}
            {section === 'explore' && (
              <FutureInvestmentExplore
                host={host}
                copy={c}
                recommendations={recommendations}
                onOpenSecurity={onOpenSecurity}
                onOpenProfile={profileEntry}
                onEducation={setEducation}
                onOpenCatalog={() => onSectionChange('catalog')}
              />
            )}
            {section === 'more' && (
              <FutureInvestmentMore
                host={host}
                snapshot={snapshot}
                copy={c}
                profile={profile}
                page={morePage}
                onPage={setMorePage}
              />
            )}
          </ScrollView>
        )}
      </View>
      <View style={s.dock}>
        <ModuleNavigation
          value={section}
          variant="evo-2027"
          primaryInvest
          bottomInset={0}
          language={host.language === 'cs' ? 'cs' : 'en'}
          dark={dark}
          onChange={next => {
            if (next === 'more') setMorePage('menu');
            onSectionChange(next);
          }}
        />
      </View>
      {education && (
        <SourceBottomSheet
          title={education === 'risk' ? c.learnRisk : c.learnRecurring}
          onClose={() => setEducation(null)}
          dark={dark}
        >
          <Text style={[text, s.section]}>
            {education === 'risk' ? c.riskBody : c.recurringBody}
          </Text>
        </SourceBottomSheet>
      )}
      {breakdown && (
        <SourceBottomSheet
          title={c.breakdown}
          onClose={() => setBreakdown(false)}
          dark={dark}
        >
          <View style={s.section}>
            <Select
              tokens={host.tokens}
              label={c.breakdown}
              value={breakdownBy}
              items={[
                { value: 'product-type', label: c.products },
                { value: 'currency', label: c.currency },
                { value: 'asset-class', label: c.assets },
                { value: 'account-list', label: c.accounts },
              ]}
              onChange={setBreakdownBy}
              closeLabel={c.close}
            />
            {buildInvestmentDistributionItems(filtered, breakdownBy).map(
              item => (
                <NavigationRow
                  key={item.id}
                  tokens={host.tokens}
                  title={item.label}
                  subtitle={`${amount(item.value)} · ${host.amountsHidden ? '••' : item.percent}%`}
                  payload={item}
                  onSelect={value => {
                    setBreakdown(false);
                    onOpenDistribution(breakdownBy, value);
                  }}
                />
              ),
            )}
          </View>
        </SourceBottomSheet>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  body: {
    flex: 1,
    minHeight: 0,
    marginTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scroll: { paddingBottom: 105 },
  summary: { padding: 16, gap: 2 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  chart: { paddingHorizontal: 16, paddingTop: 14 },
  section: { padding: 16, gap: 8 },
  recommendation: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  link: { minHeight: 40, justifyContent: 'center' },
  dock: { position: 'absolute', bottom: 8, left: 0, right: 0 },
  embedded: { flex: 1, paddingBottom: 84 },
});
