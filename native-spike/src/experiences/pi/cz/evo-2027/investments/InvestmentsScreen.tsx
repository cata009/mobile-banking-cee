import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useInvestmentBack } from './Runtime';
import { PendingOrders } from './PendingOrders';
import { InvestmentBulkApprovalPreview } from './BulkApproval';
import {
  buildInvestmentChartPoints,
  buildInvestmentDistributionItems,
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
import {
  INVESTMENT_FUND_COLLECTIONS,
  type InvestmentFundCollectionId,
} from '@/app/config/investmentFundCollections';
import type { InvestmentBasketFund } from '@/app/config/investmentBasketFundsConfig';
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';
import type { RoboExistingGoal } from '@/features/investments/robo/types';
import {
  getValidatedInitialDraft,
  type CoAppingInvestmentBuyDraft,
} from '@/features/investments/orders/buyOrder';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { shareDemoFile } from '../../../../../platform/nativeFiles';
import { CzRoboFlow, CzGoalsScreen } from '../robo';
import {
  Button,
  Chips,
  Copy,
  Loading,
  Notice,
  Page,
  Row,
  investmentColors,
  ui,
} from './Primitives';
import { PerformanceChart } from './Charts';
import {
  BasketDetail,
  FundBanner,
  FundsScreen,
  InvestmentCatalog,
} from './Catalog';
import { InvestmentInstrument } from './Instrument';
import { SellOrder } from './SellOrder';
import { BuyOrder } from './BuyOrder';
import { InvestmentHistory } from './History';
import type { CzInvestmentSnapshot } from './model';
import { ModuleNavigation, type InvestmentSection } from './ModuleNavigation';
import { PeriodChips } from './PeriodChips';
import { Amount } from './Amount';
import { ProductRow } from './ProductRow';
import { Select } from '../../../../../universal/Select';
import { czInvestmentTokens } from './Primitives';
import type { CzechNativeScreenProps } from '../contracts';
import { ClassicPortfolio } from './ClassicPortfolio';

type ViewRoute =
  | {
      kind:
        | 'portfolio'
        | 'catalog'
        | 'goals'
        | 'create'
        | 'history'
        | 'funds'
        | 'explore'
        | 'more'
        | 'approvals'
        | 'bulk-approval';
      securityId?: string;
      filterByTitle?: string;
    }
  | { kind: 'goal'; goalId: string }
  | {
      kind: 'instrument' | 'buy' | 'sell';
      security: InvestmentCatalogSecurity;
      hideBuy?: boolean;
      initialDraft?: CoAppingInvestmentBuyDraft | null;
    }
  | { kind: 'basket'; basket: InvestmentBasketFund }
  | { kind: 'collection'; collection: InvestmentFundCollectionId }
  | {
      kind: 'distribution';
      tab: InvestmentPortfolioTabId;
      id: string;
      label: string;
    };

export interface CzInvestmentsScreenProps {
  snapshot: CzInvestmentSnapshot;
  /** Source host from the Czech adapter for the classic PI investment routes. */
  classicHost?: CzechNativeScreenProps;
  onBack: () => void;
  amountsHidden?: boolean;
  initialView?:
    | 'portfolio'
    | 'goals'
    | 'history'
    | 'create'
    | 'approvals'
    | 'bulk-approval'
    | 'catalog'
    | 'funds'
    | 'buy';
  initialGoal?: RoboExistingGoal;
  initialSecurityId?: string;
  initialBuyDraft?: CoAppingInvestmentBuyDraft | null;
  initialCollection?: InvestmentFundCollectionId;
  goals?: readonly RoboExistingGoal[];
  onGoalUpdated?: (goal: RoboExistingGoal) => void;
  onRoboResumeStateChange?: CzechNativeScreenProps['onRoboResumeStateChange'];
  state?: 'ready' | 'loading' | 'error';
  onRetry?: () => void;
  persistenceMessage?: string;
}
export function CzInvestmentsScreen(props: CzInvestmentsScreenProps) {
  const keepRoboComposition =
    props.classicHost?.route.screen === 'robo' ||
    Boolean(props.initialGoal) ||
    props.initialView === 'goals' ||
    props.initialView === 'create' ||
    props.initialView === 'bulk-approval';
  if (
    props.classicHost &&
    !keepRoboComposition &&
    (props.state ?? 'ready') === 'ready'
  ) {
    return (
      <ClassicPortfolio
        host={props.classicHost}
        initialDraft={props.initialBuyDraft}
      />
    );
  }
  return <CzInvestmentsComposition {...props} />;
}

function CzInvestmentsComposition({
  snapshot,
  onBack,
  amountsHidden = false,
  initialView = 'portfolio',
  initialGoal,
  initialSecurityId,
  initialBuyDraft,
  initialCollection,
  goals: suppliedGoals,
  onGoalUpdated,
  onRoboResumeStateChange,
  state = 'ready',
  onRetry,
  persistenceMessage,
}: CzInvestmentsScreenProps) {
  const [goals, setGoals] = useState<readonly RoboExistingGoal[]>(
    () => suppliedGoals ?? INITIAL_CZ_ROBO_GOALS,
  );
  const initialSecurity = snapshot.catalog.find(
    security => security.id === initialSecurityId,
  );
  const [stack, setStack] = useState<ViewRoute[]>(() => [
    initialGoal
      ? { kind: 'goal', goalId: initialGoal.id }
      : initialView === 'funds'
      ? initialCollection
        ? { kind: 'collection', collection: initialCollection }
        : { kind: 'funds' }
      : initialSecurity
      ? {
          kind: initialView === 'buy' ? 'buy' : 'instrument',
          security: initialSecurity,
          initialDraft: getValidatedInitialDraft(
            initialBuyDraft,
            initialSecurity,
            snapshot.accounts,
          ),
        }
      : { kind: initialView === 'buy' ? 'portfolio' : initialView },
  ]);
  const [tab, setTab] = useState<InvestmentPortfolioTabId>('performance'),
    [period, setPeriod] = useState<InvestmentPeriodId>('3y'),
    [sort, setSort] = useState<InvestmentSortId>('max-value');
  const [message, setMessage] = useState(''),
    [reportBusy, setReportBusy] = useState(false);
  const route = stack.at(-1)!;
  const lastRoboResumeKey = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const roboRoute = [...stack]
      .reverse()
      .find(item => item.kind === 'goal' || item.kind === 'goals' || item.kind === 'create');
    const resumeState =
      roboRoute?.kind === 'goal'
        ? { view: 'detail' as const, goalId: roboRoute.goalId }
        : roboRoute
          ? { view: 'goals' as const }
          : null;
    const resumeKey = resumeState
      ? resumeState.view === 'detail'
        ? `detail:${resumeState.goalId}`
        : 'goals'
      : null;
    if (lastRoboResumeKey.current === resumeKey) return;
    lastRoboResumeKey.current = resumeKey;
    onRoboResumeStateChange?.(resumeState);
  }, [onRoboResumeStateChange, stack]);
  useEffect(() => {
    if (suppliedGoals) setGoals(suppliedGoals);
  }, [suppliedGoals]);
  useInvestmentBack(() => {
    if (
      route.kind === 'create' ||
      route.kind === 'goal' ||
      route.kind === 'buy' ||
      route.kind === 'sell' ||
      route.kind === 'history' ||
      route.kind === 'approvals' ||
      route.kind === 'bulk-approval' ||
      route.kind === 'funds' ||
      route.kind === 'collection'
    )
      return false;
    if (stack.length <= 1) return false;
    setStack(previous => previous.slice(0, -1));
    return true;
  });
  const push = (next: ViewRoute) => setStack(previous => [...previous, next]);
  const back = () => {
    if (stack.length > 1) setStack(previous => previous.slice(0, -1));
    else {
      lastRoboResumeKey.current = null;
      onRoboResumeStateChange?.(null);
      onBack();
    }
  };
  const home = () => setStack([{ kind: 'portfolio' }]);
  const showGoals = () =>
    setStack(previous => {
      const index = previous.map(item => item.kind).lastIndexOf('goals');
      return index >= 0
        ? previous.slice(0, index + 1)
        : initialView === 'portfolio' && !initialGoal
        ? [{ kind: 'portfolio' }, { kind: 'goals' }]
        : [{ kind: 'goals' }];
    });
  const updateGoal = (goal: RoboExistingGoal) => {
    setGoals(previous =>
      previous.some(item => item.id === goal.id)
        ? previous.map(item => (item.id === goal.id ? goal : item))
        : [goal, ...previous],
    );
    onGoalUpdated?.(goal);
  };
  const openSecurity = (security: InvestmentCatalogSecurity) =>
    push({ kind: 'instrument', security });
  const navigationFor = (value: InvestmentSection) => (
    <ModuleNavigation value={value} onChange={kind => setStack([{ kind }])} />
  );
  const money = (value: number, currency = 'CZK') =>
    formatInvestmentMoney(value, 'CZ', currency, amountsHidden);
  if (state === 'loading')
    return (
      <Page kind="investment-loading" title="Investments" onBack={onBack}>
        <Loading text="Loading investments" />
      </Page>
    );
  if (state === 'error')
    return (
      <Page
        kind="investment-error"
        title="Investments"
        onBack={onBack}
        footer={
          onRetry ? <Button label="Try again" onPress={onRetry} /> : undefined
        }
      >
        <Notice text="Investments could not be loaded." error />
      </Page>
    );
  if (route.kind === 'goals')
    return (
      <CzGoalsScreen
        goals={goals}
        onBack={back}
        onCreateGoal={() => push({ kind: 'create' })}
        onOpenGoal={goal => push({ kind: 'goal', goalId: goal.id })}
        amountsHidden={amountsHidden}
      />
    );
  if (route.kind === 'create' || route.kind === 'goal')
    return (
      <CzRoboFlow
        key={route.kind === 'goal' ? route.goalId : 'create'}
        onBack={showGoals}
        onExit={showGoals}
        initialGoal={
          route.kind === 'goal'
            ? goals.find(goal => goal.id === route.goalId) ?? initialGoal
            : undefined
        }
        onGoalUpdated={updateGoal}
        currentAccounts={snapshot.accounts}
        securityCatalog={snapshot.catalog}
        amountsHidden={amountsHidden}
        onOpenSecurity={security =>
          push({ kind: 'instrument', security, hideBuy: true })
        }
      />
    );
  if (route.kind === 'catalog')
    return (
      <InvestmentCatalog
        securities={snapshot.catalog}
        onBack={back}
        footer={navigationFor('catalog')}
        onSelect={openSecurity}
        onSelectBasket={basket => push({ kind: 'basket', basket })}
        hidden={amountsHidden}
      />
    );
  if (route.kind === 'funds' || route.kind === 'collection')
    return (
      <FundsScreen
        securities={snapshot.catalog}
        onBack={back}
        onSelect={openSecurity}
        hidden={amountsHidden}
        initialCollection={
          route.kind === 'collection' ? route.collection : undefined
        }
      />
    );
  if (route.kind === 'basket')
    return (
      <BasketDetail
        basket={route.basket}
        onBack={back}
        securities={snapshot.catalog}
        onSelect={openSecurity}
        hidden={amountsHidden}
        onInvest={() => push({ kind: 'create' })}
      />
    );
  if (route.kind === 'instrument')
    return (
      <InvestmentInstrument
        security={route.security}
        onBack={back}
        onBuy={() => push({ kind: 'buy', security: route.security })}
        hideBuy={route.hideBuy}
        onSell={() => push({ kind: 'sell', security: route.security })}
        onHistory={() =>
          push({ kind: 'history', securityId: route.security.id })
        }
        hidden={amountsHidden}
        transactions={snapshot.transactions}
      />
    );
  if (route.kind === 'buy')
    return (
      <BuyOrder
        security={route.security}
        initialDraft={route.initialDraft}
        accounts={snapshot.accounts}
        onBack={back}
        onComplete={home}
        amountsHidden={amountsHidden}
      />
    );
  if (route.kind === 'approvals')
    return (
      <PendingOrders
        catalog={snapshot.approvalCatalog}
        account={snapshot.accounts[0]}
        onBack={back}
        hidden={amountsHidden}
      />
    );
  if (route.kind === 'bulk-approval')
    return <InvestmentBulkApprovalPreview onBack={back} />;
  if (route.kind === 'sell')
    return (
      <SellOrder
        security={route.security}
        accounts={snapshot.accounts}
        onBack={back}
        onComplete={home}
        hidden={amountsHidden}
      />
    );
  if (route.kind === 'history')
    return (
      <InvestmentHistory
        onBack={back}
        transactions={snapshot.transactions}
        orders={snapshot.orders}
        amountsHidden={amountsHidden}
        allDatesByDefault
        securityId={route.securityId}
        filterByTitle={route.filterByTitle}
        onToApprove={() => push({ kind: 'approvals' })}
        footer={navigationFor('history')}
      />
    );
  if (route.kind === 'distribution')
    return (
      <Page
        kind="distribution-detail"
        title={route.label}
        onBack={back}
        gutter={16}
        gray
        contentTop={16}
      >
        {snapshot.securities
          .filter(
            security =>
              security.status === 'active' &&
              getInvestmentDistributionGroupKey(security, route.tab) ===
                route.id,
          )
          .map(security => (
            <Row
              key={security.id}
              title={security.title}
              value={money(security.localValue)}
              onPress={() => {
                const catalogSecurity = snapshot.catalog.find(
                  candidate => candidate.id === security.id,
                );
                if (catalogSecurity) openSecurity(catalogSecurity);
              }}
            />
          ))}
      </Page>
    );
  if (route.kind === 'explore')
    return (
      <Page
        kind="explore"
        footer={navigationFor('explore')}
        footerTop={0}
        footerBottom={0}
        footerGutter={0}
        title="Explore"
        description="Discover investment ideas, browse funds and learn how they work."
        onBack={back}
        gutter={16}
      >
        <Copy strong style={ui.section}>
          A good place to start
        </Copy>
        {INVESTMENT_FUND_COLLECTIONS.map(collection => (
          <FundBanner
            key={collection.id}
            id={collection.id}
            onPress={() =>
              push({ kind: 'collection', collection: collection.id })
            }
          />
        ))}
      </Page>
    );
  const download = async () => {
    if (reportBusy) return;
    setReportBusy(true);
    setMessage('');
    try {
      const rows: (string | number)[][] = [
        [
          'Product',
          'Product ID',
          'Product type',
          'Asset class',
          'Quantity',
          'Market value',
          'Currency',
          'Local value',
          'Local currency',
          'Performance amount',
          'Performance percent',
        ],
        ...snapshot.catalog
          .filter(security => security.owned)
          .map(security => [
            security.title,
            security.productId,
            security.productType,
            security.assetClass,
            security.quantity,
            security.value,
            security.instrumentCurrency,
            security.localValue,
            security.localCurrency,
            security.performanceAmount,
            security.performancePercent,
          ]),
      ];
      const csv =
        '\uFEFF' +
        rows
          .map(row =>
            row
              .map(value => `"${String(value).replace(/"/g, '""')}"`)
              .join(','),
          )
          .join('\r\n');
      await shareDemoFile(
        `investment-consolidated-report-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`,
        'text/csv',
        new TextEncoder().encode(csv),
      );
      setMessage('Consolidated report is ready to share.');
    } catch {
      setMessage('Could not share the consolidated report. Try again.');
    } finally {
      setReportBusy(false);
    }
  };
  if (route.kind === 'more')
    return (
      <Page
        kind="investment-more"
        title="More"
        onBack={back}
        footer={navigationFor('more')}
        footerTop={0}
        footerBottom={0}
        footerGutter={0}
      >
        <Copy strong style={ui.section}>
          REPORTS
        </Copy>
        <Row
          title="Consolidated report"
          subtitle="Download your current holdings and performance."
          label="Download consolidated investment report as CSV"
          onPress={download}
        />
        {message ? <Notice text={message} /> : null}
      </Page>
    );
  const distribution =
    tab === 'performance'
      ? []
      : buildInvestmentDistributionItems(
          snapshot.securities.filter(
            security => security.status === 'active' && security.localValue > 0,
          ),
          tab,
        );
  const securities = sortInvestmentSecurities(snapshot.securities, sort).filter(
    security => security.status === 'active',
  );
  const section = (value: InvestmentSection) => setStack([{ kind: value }]);
  return (
    <Page
      kind="investment-portfolio"
      title="Portfolio details"
      onBack={onBack}
      onHelp={() => undefined}
      gray
      raised
      backGlyph="close-flow"
      gutter={16}
      contentTop={16}
      footerGutter={0}
      footerTop={0}
      footerBottom={0}
      footer={<ModuleNavigation value="portfolio" onChange={section} />}
    >
      {persistenceMessage ? <Notice text={persistenceMessage} error /> : null}
      <Copy strong style={styles.totalLabel}>
        Total value:
      </Copy>
      <Amount
        value={snapshot.performance.totalValue}
        currency="CZK"
        hidden={amountsHidden}
        scale="portfolio"
      />
      <View style={styles.performance}>
        <Amount
          value={snapshot.performance.performanceAmount}
          currency="CZK"
          hidden={amountsHidden}
          scale="transaction"
          signed
        />
        <Copy
          strong
          style={[
            styles.percent,
            {
              color:
                snapshot.performance.performancePercent < 0
                  ? investmentColors.negative
                  : investmentColors.positive,
            },
          ]}
        >
          {amountsHidden
            ? '••%'
            : (snapshot.performance.performancePercent > 0 ? '+' : '') +
              snapshot.performance.performancePercent
                .toFixed(2)
                .replace('.', ',') +
              '%'}
        </Copy>
      </View>
      <PerformanceChart
        points={buildInvestmentChartPoints(
          snapshot.performance.totalValue,
          period,
        )}
        hidden={amountsHidden}
      />
      <PeriodChips
        items={INVESTMENT_PERIODS}
        value={period}
        onChange={setPeriod}
        comfortable
      />
      <Copy strong style={styles.allocationTitle}>
        Investments allocation by
      </Copy>
      <Chips items={INVESTMENT_PORTFOLIO_TABS} value={tab} onChange={setTab} />
      {tab !== 'performance' ? (
        distribution.map(item => (
          <Row
            key={item.id}
            title={item.label}
            subtitle={money(item.value, item.currency)}
            value={amountsHidden ? '••%' : item.percent + '%'}
            onPress={() =>
              push({
                kind: 'distribution',
                tab,
                id: item.id,
                label: item.label,
              })
            }
          />
        ))
      ) : (
        <>
          {!snapshot.securities.length ? (
            <>
              <Copy strong>Your portfolio is still empty</Copy>
              <Notice text="Explore investment opportunities and choose what fits your goals." />
            </>
          ) : null}
          <View style={styles.securityHeading}>
            <Copy strong>ACTIVE SECURITIES ({securities.length})</Copy>
            <Select
              tokens={czInvestmentTokens}
              label="Sort securities"
              value={sort}
              items={INVESTMENT_SORT_OPTIONS.map(item => ({
                value: item.id,
                label: item.label,
              }))}
              onChange={setSort}
              closeLabel="Close sorting"
            />
          </View>
          {securities.map(security => {
            const item = snapshot.catalog.find(
              candidate => candidate.id === security.id,
            );
            return item ? (
              <ProductRow
                key={security.id}
                security={item}
                hidden={amountsHidden}
                onPress={() => openSecurity(item)}
              />
            ) : null;
          })}
        </>
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  totalLabel: { fontSize: 14, lineHeight: 15.5 },
  performance: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  percent: { fontSize: 14, lineHeight: 15.5 },
  allocationTitle: {
    fontSize: 20,
    lineHeight: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  securityHeading: {
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  performanceLabel: { marginTop: 8 },
  funds: { gap: 16 },
  fund: { width: 299 },
});
