import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  buildInvestmentChartPoints,
  buildInvestmentDistributionItems,
  buildInvestmentSecurityCatalog,
  getInvestmentDistributionGroupKey,
  INVESTMENT_PERIODS,
  INVESTMENT_PORTFOLIO_TABS,
  INVESTMENT_SORT_OPTIONS,
  sortInvestmentSecurities,
  type InvestmentCatalogSecurity,
  type InvestmentPeriodId,
  type InvestmentPortfolioTabId,
  type InvestmentSortId,
} from '@/app/config/investmentsPortfolioConfig';
import type { InvestmentBasketFund } from '@/app/config/investmentBasketFundsConfig';
import {
  INVESTMENT_FUND_COLLECTIONS,
  type InvestmentFundCollectionId,
} from '@/app/config/investmentFundCollections';
import {
  getValidatedInitialDraft,
  parseInvestmentOrderQuantity,
  type CoAppingInvestmentBuyDraft,
} from '@/features/investments/orders/buyOrder';
import {
  FUND_OPTIONS,
  INVESTMENT_CURRENCIES,
} from '@/features/investments/future-gain/smartInvestment';
import { futureGainEnabled } from '../future-gain/model';
import { getCountryCurrency } from '@/data/exchangeRates';
import { Select, NavigationRow, Tabs } from '../../../../universal/controls';
import { Page, Heading, Body, Money } from '../Primitives';
import { currentFeature } from '../context';
import { InvestmentMarket } from './Market';
import { createCurrentInvestmentSnapshot } from './model';
import { PerformanceChart } from '../../cz/evo-2027/investments/PerformanceChart';
import { DistributionChart } from '../../cz/evo-2027/investments/DistributionChart';
import {
  InvestmentCatalog,
  FundsScreen,
  BasketDetail,
} from '../../cz/evo-2027/investments/Catalog';
import { InvestmentInstrument } from '../../cz/evo-2027/investments/Instrument';
import { BuyOrder } from '../../cz/evo-2027/investments/BuyOrder';
import { SellOrder } from '../../cz/evo-2027/investments/SellOrder';
import { InvestmentHistory } from '../../cz/evo-2027/investments/History';
import { PendingOrders } from '../../cz/evo-2027/investments/PendingOrders';
import {
  InvestmentRuntime,
  useInvestmentBack,
} from '../../cz/evo-2027/investments/Runtime';
import { CzInvestmentsScreen } from '../../cz/evo-2027/investments/InvestmentsScreen';
import { ClassicPortfolio } from '../../cz/evo-2027/investments/ClassicPortfolio';
import { createCzechInvestmentHost } from '../../cz/evo-2027/investments/hostAdapter';
import { baselineCzRoboSession } from './RoboSession';
import BaselineInvestmentsController from './baseline/Controller';
import { isPiBaselineInvestmentContext } from './baseline/policy';
import type { CurrentAdapter, CurrentScreenProps } from '../contracts';
import type { NativeRoboResumeState } from '@/features/demo-native/contracts';
type Route =
  | {
      view: 'portfolio' | 'catalog' | 'funds' | 'history' | 'approvals';
      collection?: InvestmentFundCollectionId;
    }
  | {
      view: 'instrument' | 'buy' | 'sell';
      security: InvestmentCatalogSecurity;
      initialDraft?: CoAppingInvestmentBuyDraft | null;
    }
  | { view: 'basket'; basket: InvestmentBasketFund }
  | {
      view: 'distribution';
      tab: InvestmentPortfolioTabId;
      id: string;
      label: string;
    };
function readBuyDraft(
  host: CurrentScreenProps,
): CoAppingInvestmentBuyDraft | null {
  const params = host.route.params;
  const quantity = parseInvestmentOrderQuantity(params?.quantity ?? '');
  if (
    !quantity ||
    !params?.accountId ||
    params.frequency !== 'one-off' ||
    (params.executionTiming !== 'today' &&
      params.executionTiming !== 'next-business-day')
  )
    return null;
  return {
    quantity,
    accountId: params.accountId,
    frequency: params.frequency,
    executionTiming: params.executionTiming,
  };
}
function readCollection(host: CurrentScreenProps) {
  return INVESTMENT_FUND_COLLECTIONS.find(
    item =>
      item.id ===
      (host.route.params?.collection ?? host.route.params?.collectionId),
  )?.id;
}
function Composition(host: CurrentScreenProps) {
  const { country, release, productCounts } = host;
  const snapshot = useMemo(
    () => createCurrentInvestmentSnapshot({ country, release, productCounts }),
    [country, release, productCounts],
  );
  const initialSecurity = snapshot.catalog.find(
    security => security.id === host.route.params?.securityId,
  );
  const params = host.route.params;
  const futureGainReturn =
    futureGainEnabled(host) &&
    params?.futureGainReturn === 'smart-investment' &&
    INVESTMENT_CURRENCIES.some(
      currency => currency === params.futureGainCurrency,
    ) &&
    FUND_OPTIONS.some(option => option.id === params.securityId) &&
    initialSecurity?.productType === 'Fund';
  const [stack, setStack] = useState<Route[]>(() => [
    futureGainReturn
      ? { view: 'catalog' }
      : params?.collection || params?.collectionId || params?.view === 'funds'
        ? { view: 'funds', collection: readCollection(host) }
        : initialSecurity
          ? {
              view: params?.view === 'buy' ? 'buy' : 'instrument',
              security: initialSecurity,
              initialDraft: getValidatedInitialDraft(
                readBuyDraft(host),
                initialSecurity,
                snapshot.accounts,
              ),
            }
          : {
              view:
                params?.view === 'history'
                  ? 'history'
                  : params?.view === 'catalog'
                    ? 'catalog'
                    : 'portfolio',
            },
  ]);
  const [tab, setTab] = useState<InvestmentPortfolioTabId>('performance');
  const [period, setPeriod] = useState<InvestmentPeriodId>('3y');
  const [sort, setSort] = useState<InvestmentSortId>('max-value');
  const route = stack[stack.length - 1];
  const push = (next: Route) => setStack(old => [...old, next]);
  const back = () => {
    if (stack.length > 1) setStack(old => old.slice(0, -1));
    else host.onBack();
  };
  const home = () => setStack([{ view: 'portfolio' }]);
  useInvestmentBack(() => {
    if (
      route.view === 'buy' ||
      route.view === 'sell' ||
      route.view === 'history' ||
      route.view === 'approvals' ||
      route.view === 'funds'
    )
      return false;
    back();
    return true;
  });
  const select = (security: InvestmentCatalogSecurity) => {
    if (futureGainReturn) {
      if (
        security.status === 'active' &&
        security.productType === 'Fund' &&
        FUND_OPTIONS.some(option => option.id === security.id) &&
        INVESTMENT_CURRENCIES.some(
          currency => currency === security.instrumentCurrency,
        )
      )
        host.onNavigate({
          screen: 'smart-investment',
          params: {
            securityId: security.id,
            amountInput: params?.futureGainAmountInput ?? '',
            currency: params!.futureGainCurrency,
            view: 'fund',
          },
        });
      return;
    }
    push({ view: 'instrument', security });
  };
  if (route.view === 'catalog')
    return (
      <InvestmentCatalog
        securities={
          futureGainReturn
            ? snapshot.catalog.filter(
                security =>
                  security.productType === 'Fund' &&
                  FUND_OPTIONS.some(option => option.id === security.id) &&
                  INVESTMENT_CURRENCIES.some(
                    currency => currency === security.instrumentCurrency,
                  ),
              )
            : snapshot.catalog
        }
        initialProductType={futureGainReturn ? 'Fund' : 'all'}
        onBack={back}
        onSelect={select}
        onSelectBasket={basket => push({ view: 'basket', basket })}
        hidden={host.amountsHidden}
      />
    );
  if (route.view === 'funds')
    return (
      <FundsScreen
        securities={snapshot.catalog}
        initialCollection={route.collection}
        onBack={back}
        onSelect={select}
        hidden={host.amountsHidden}
      />
    );
  if (route.view === 'basket')
    return (
      <BasketDetail
        basket={route.basket}
        securities={snapshot.catalog}
        onBack={back}
        onSelect={select}
        hidden={host.amountsHidden}
      />
    );
  if (route.view === 'instrument')
    return (
      <InvestmentInstrument
        security={route.security}
        onBack={back}
        onBuy={() => push({ view: 'buy', security: route.security })}
        onSell={() => push({ view: 'sell', security: route.security })}
        onHistory={() => push({ view: 'history' })}
        hidden={host.amountsHidden}
        transactions={snapshot.transactions}
      />
    );
  if (route.view === 'buy')
    return (
      <BuyOrder
        security={route.security}
        initialDraft={route.initialDraft}
        accounts={snapshot.accounts}
        onBack={back}
        onComplete={home}
        amountsHidden={host.amountsHidden}
      />
    );
  if (route.view === 'sell')
    return (
      <SellOrder
        security={route.security}
        accounts={snapshot.accounts}
        onBack={back}
        onComplete={home}
        hidden={host.amountsHidden}
      />
    );
  if (route.view === 'history')
    return (
      <InvestmentHistory
        transactions={snapshot.transactions}
        orders={snapshot.orders}
        onBack={back}
        amountsHidden={host.amountsHidden}
        onToApprove={() => push({ view: 'approvals' })}
      />
    );
  if (route.view === 'approvals')
    return (
      <PendingOrders
        catalog={snapshot.catalog}
        account={snapshot.accounts[0]}
        onBack={back}
        hidden={host.amountsHidden}
      />
    );
  const currency = getCountryCurrency(host.country);
  const securities = sortInvestmentSecurities(snapshot.securities, sort).filter(
    security => security.status === 'active',
  );
  const distribution =
    tab === 'performance'
      ? []
      : buildInvestmentDistributionItems(securities, tab);
  if (route.view === 'distribution')
    return (
      <Page
        host={{ ...host, screenTopInset: 0, onBack: back }}
        title={route.label}
      >
        {securities
          .filter(
            security =>
              getInvestmentDistributionGroupKey(security, route.tab) ===
              route.id,
          )
          .map(security => (
            <NavigationRow
              key={security.id}
              tokens={host.tokens}
              title={security.title}
              payload={security.id}
              onSelect={() =>
                select(snapshot.catalog.find(item => item.id === security.id)!)
              }
              trailing={
                <Money
                  host={host}
                  amount={security.localValue}
                  currency={currency}
                  size={20}
                />
              }
            />
          ))}
      </Page>
    );
  return (
    <Page host={{ ...host, screenTopInset: 0 }} title="Investments">
      <Heading host={host}>Total value</Heading>
      <Money
        host={host}
        amount={snapshot.performance.totalValue}
        currency={currency}
        size={32}
      />
      <Money
        host={host}
        amount={snapshot.performance.performanceAmount}
        currency={currency}
        size={16}
      />
      <Body host={host}>
        {host.amountsHidden
          ? '•••'
          : `${snapshot.performance.performancePercent.toFixed(2)}%`}
      </Body>
      <Tabs
        tokens={host.tokens}
        value={tab}
        items={INVESTMENT_PORTFOLIO_TABS.map(item => ({
          value: item.id,
          label: item.label,
        }))}
        onChange={setTab}
      />
      {tab === 'performance' ? (
        <>
          <Tabs
            tokens={host.tokens}
            value={period}
            items={INVESTMENT_PERIODS.map(item => ({
              value: item.id,
              label: item.label,
            }))}
            onChange={setPeriod}
          />
          <PerformanceChart
            points={buildInvestmentChartPoints(
              snapshot.performance.totalValue,
              period,
            )}
            currency={currency}
            hidden={host.amountsHidden}
          />
        </>
      ) : (
        <DistributionChart
          items={distribution}
          hidden={host.amountsHidden}
          onSelect={id => {
            const item = distribution.find(candidate => candidate.id === id);
            if (item)
              push({ view: 'distribution', tab, id, label: item.label });
          }}
        />
      )}
      <View style={styles.actions}>
        {[
          { label: 'New investment', view: 'catalog' },
          { label: 'History', view: 'history' },
          { label: 'Orders to approve', view: 'approvals' },
          { label: 'Investment funds', view: 'funds' },
        ].map(item => (
          <NavigationRow
            key={item.view}
            tokens={host.tokens}
            title={item.label}
            payload={item.view}
            onSelect={() =>
              push({
                view: item.view as
                  'catalog' | 'history' | 'approvals' | 'funds',
              })
            }
          />
        ))}
      </View>
      <Select
        tokens={host.tokens}
        label="Sort products"
        value={sort}
        items={INVESTMENT_SORT_OPTIONS.map(item => ({
          value: item.id,
          label: item.label,
        }))}
        onChange={setSort}
      />
      {securities.map(security => (
        <NavigationRow
          key={security.id}
          tokens={host.tokens}
          title={security.title}
          subtitle={`${security.contributionType} · ${security.instrumentCurrency}`}
          payload={security.id}
          onSelect={() =>
            select(snapshot.catalog.find(item => item.id === security.id)!)
          }
          trailing={
            <Money
              host={host}
              amount={security.localValue}
              currency={currency}
              size={20}
            />
          }
        />
      ))}
      {!securities.length && <Body host={host}>No investment holdings.</Body>}
    </Page>
  );
}
function readRoboResumeState(
  params: CurrentScreenProps['route']['params'],
  goals: readonly ReturnType<typeof baselineCzRoboSession.readGoals>[number][],
): NativeRoboResumeState | null {
  if (params?.robo_view !== undefined || params?.robo_goal !== undefined) {
    if (params.robo_view === 'goals') return { view: 'goals' };
    const sourceGoalId = params.robo_goal;
    if (
      params.robo_view === 'detail' &&
      sourceGoalId &&
      goals.some(goal => goal.id === sourceGoalId)
    )
      return { view: 'detail', goalId: sourceGoalId };
    return null;
  }

  const view = params?.view;
  const goalId = params?.goalId;
  if (view === 'goals' && goalId && goals.some(goal => goal.id === goalId))
    return { view: 'detail', goalId };
  if (view === 'goals' || view === 'create') return { view: 'goals' };
  if (
    (view === 'detail' || view === 'goal') &&
    goalId &&
    goals.some(goal => goal.id === goalId)
  )
    return { view: 'detail', goalId };
  return null;
}

function RoboComposition(host: CurrentScreenProps) {
  const { country, release, productCounts } = host;
  const snapshot = useMemo(
    () => createCurrentInvestmentSnapshot({ country, release, productCounts }),
    [country, release, productCounts],
  );
  const goals = useSyncExternalStore(
    baselineCzRoboSession.subscribe,
    baselineCzRoboSession.readGoals,
  );
  const params = host.route.params;
  const resumeState = readRoboResumeState(params, goals);
  const view = params?.view;
  const classicEntry =
    params?.entry === 'history' ||
    params?.entry === 'approvals' ||
    view === 'history' ||
    view === 'approvals' ||
    view === 'catalog' ||
    view === 'funds' ||
    view === 'buy' ||
    Boolean(params?.securityId || params?.collection || params?.collectionId);
  const roboRoute =
    !classicEntry &&
    (resumeState !== null || view === 'create' || view === 'bulk-approval');
  const czechRoute = {
    screen: roboRoute
      ? ('robo' as const)
      : params?.entry === 'history' ||
          params?.entry === 'approvals' ||
          view === 'history' ||
          view === 'approvals'
        ? ('investment-history' as const)
        : params?.securityId
          ? ('investment-detail' as const)
          : ('investments' as const),
    params,
  };
  const czechHost = createCzechInvestmentHost(host, czechRoute);
  if (!roboRoute)
    return <ClassicPortfolio host={czechHost} release={host.release} />;

  const catalog = buildInvestmentSecurityCatalog(
    snapshot.securities,
    host.country,
    { includeRoboGoals: true },
  );
  const initialView =
    params?.collection || params?.collectionId || view === 'funds'
      ? 'funds'
      : view === 'create'
        ? 'create'
        : view === 'bulk-approval'
          ? 'bulk-approval'
          : params?.entry === 'approvals' || view === 'approvals'
            ? 'approvals'
            : params?.entry === 'history' || view === 'history'
              ? 'history'
              : view === 'catalog'
                ? 'catalog'
                : view === 'buy'
                  ? 'buy'
                  : resumeState !== null
                    ? 'goals'
                    : 'portfolio';
  return (
    <InvestmentMarket country={host.country}>
      <InvestmentRuntime active={host.isActive}>
        <View style={[styles.root, { paddingTop: host.screenTopInset }]}>
          <CzInvestmentsScreen
            snapshot={{
              ...snapshot,
              catalog,
              approvalCatalog: snapshot.catalog,
              chart: buildInvestmentChartPoints(
                snapshot.performance.totalValue,
                '3y',
              ),
            }}
            goals={goals}
            persistenceMessage={baselineCzRoboSession.getPersistenceError()}
            classicHost={czechHost}
            onRoboResumeStateChange={host.onRoboResumeStateChange}
            initialGoal={
              resumeState?.view === 'detail'
                ? goals.find(goal => goal.id === resumeState.goalId)
                : undefined
            }
            initialView={initialView}
            initialSecurityId={params?.securityId}
            initialBuyDraft={readBuyDraft(host)}
            initialCollection={readCollection(host)}
            amountsHidden={host.amountsHidden}
            onBack={host.onBack}
            onGoalUpdated={goal => {
              baselineCzRoboSession.saveGoal(goal);
              host.onChanged();
            }}
          />
        </View>
      </InvestmentRuntime>
    </InvestmentMarket>
  );
}
export default function Investments(host: CurrentScreenProps) {
  if (host.country === 'CZ' && currentFeature(host, 'fx_czRoboAdvisor'))
    return <RoboComposition {...host} />;
  if (isPiBaselineInvestmentContext(host))
    return (
      <InvestmentMarket country={host.country}>
        <InvestmentRuntime active={host.isActive}>
          <BaselineInvestmentsController
            host={host}
            initialDraft={readBuyDraft(host)}
          />
        </InvestmentRuntime>
      </InvestmentMarket>
    );
  return (
    <InvestmentMarket country={host.country}>
      <InvestmentRuntime active={host.isActive}>
        <View style={[styles.root, { paddingTop: host.screenTopInset }]}>
          {currentFeature(host, 'fx_czRoboAdvisor') ? (
            <RoboComposition {...host} />
          ) : (
            <Composition {...host} />
          )}
        </View>
      </InvestmentRuntime>
    </InvestmentMarket>
  );
}
const styles = StyleSheet.create({ root: { flex: 1 }, actions: { gap: 8 } });
export const currentInvestmentSearch: NonNullable<
  CurrentAdapter['searchEntries']
> = context => [
  {
    id: 'current-investments',
    label: 'Investments',
    keywords: ['portfolio', 'funds', 'stocks'],
    target: { screen: 'investments' },
  },
  ...createCurrentInvestmentSnapshot(context).catalog.map(security => ({
    id: `current-investment-${security.id}`,
    label: security.title,
    subtitle: security.productId,
    keywords: [
      security.productType,
      security.assetClass,
      security.instrumentCurrency,
    ],
    target: {
      screen: 'investments' as const,
      params: { securityId: security.id },
    },
  })),
];
