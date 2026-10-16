import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  InvestmentCatalogSecurity,
  InvestmentDistributionItem,
  InvestmentPortfolioTabId,
} from '@/app/config/investmentsPortfolioConfig';
import { buildInvestmentHistoryTransactions } from '@/app/config/investmentsPortfolioConfig';
import type { InvestmentBasketFund } from '@/app/config/investmentBasketFundsConfig';
import type { InvestmentFundCollectionId } from '@/app/config/investmentFundCollections';
import type { CoAppingInvestmentBuyDraft } from '@/features/investments/orders/buyOrder';
import type { FutureGainFundSimulatorState } from '@/features/investments/future-gain/smartInvestment';
import { getCountryCurrency } from '@/data/exchangeRates';
import { getUnavailableProductRouteFallback } from '@/app/navigation/productRouteAvailability';
import { isInvestmentsPortfolioAvailable } from '@/app/utils/investmentsAvailability';
import type { CurrentScreenProps } from '../../contracts';
import { createCurrentInvestmentSnapshot } from '../model';
import type { BaselineInvestmentOverviewState } from './contracts';
import type { InvestmentSection } from '../../../cz/evo-2027/investments/ModuleNavigation';
import {
  BaselineInvestmentOverview,
  BaselineInvestmentDistributionDetail,
} from './overview';
import { CzRoboOverview } from './overview/CzRoboOverview';
import {
  BaselineInvestmentCatalog,
  BaselineInvestmentFunds,
  BaselineInvestmentBasket,
} from './catalog';
import { BaselineInvestmentInstrument } from './flows/Instrument';
import { BaselineInvestmentBuyOrder } from './flows/BuyOrder';
import { BaselineInvestmentSellOrder } from './flows/SellOrder';
import { BaselineInvestmentHistory } from './flows/History';
import { BaselineInvestmentPendingOrders } from './flows/PendingOrders';

type View =
  | { view: 'portfolio' | 'catalog' }
  | {
      view: 'funds';
      collection?: InvestmentFundCollectionId;
      resumeCollection?: InvestmentFundCollectionId | null;
      requestKey?: number;
    }
  | { view: 'basket'; basket: InvestmentBasketFund }
  | {
      view: 'instrument' | 'buy' | 'sell';
      security: InvestmentCatalogSecurity;
      initialDraft?: CoAppingInvestmentBuyDraft | null;
      returnState?: FutureGainFundSimulatorState;
    }
  | {
      view: 'distribution';
      item: InvestmentDistributionItem;
      tab: Exclude<InvestmentPortfolioTabId, 'performance'>;
    };

export default function BaselineInvestmentsController({
  host,
  initialDraft,
}: {
  host: CurrentScreenProps;
  initialDraft?: CoAppingInvestmentBuyDraft | null;
}) {
  const snapshot = useMemo(
    () =>
      createCurrentInvestmentSnapshot(
        {
          country: host.country,
          release: host.release,
          productCounts: host.productCounts,
          bankingScenario: host.bankingScenario,
        },
        host.investmentPresentation,
      ),
    [
      host.country,
      host.release,
      host.productCounts,
      host.bankingScenario,
      host.investmentPresentation,
    ],
  );
  const params = host.route.params;
  const entry =
    params?.entry ??
    (params?.view === 'history' || params?.view === 'approvals'
      ? params.view
      : 'portfolio');
  const [returnToRoboOrders, setReturnToRoboOrders] = useState(false);
  const previousEntry = useRef(entry);
  useEffect(() => {
    const returnedFromApprovals =
      previousEntry.current === 'approvals' && entry === 'history';
    previousEntry.current = entry;
    if (returnedFromApprovals) setReturnToRoboOrders(false);
  }, [entry]);
  const [overview, setOverview] = useState<BaselineInvestmentOverviewState>({
    tabId: 'performance',
    periodId: 'max',
    sortId: 'max-value',
  });
  const [stack, setStack] = useState<View[]>(() => {
    const security = snapshot.catalog.find(
      item => item.id === params?.securityId,
    );
    if (security)
      return [
        { view: 'portfolio' },
        { view: 'instrument', security },
        ...(params?.view === 'buy'
          ? [{ view: 'buy' as const, security, initialDraft }]
          : []),
      ];
    if (params?.view === 'funds' || params?.collection || params?.collectionId)
      return [
        { view: 'portfolio' },
        {
          view: 'funds',
          collection: (params?.collection ?? params?.collectionId) as
            | InvestmentFundCollectionId
            | undefined,
        },
      ];
    if (params?.view === 'catalog')
      return [{ view: 'portfolio' }, { view: 'catalog' }];
    return [{ view: 'portfolio' }];
  });
  const route = stack[stack.length - 1];
  const current = useRef({ host, stack });
  current.current = { host, stack };
  const localBack = useRef<(() => boolean) | null>(null);
  const registerLocalBack = useCallback((handler: (() => boolean) | null) => {
    localBack.current = handler;
  }, []);
  const consumeBack = useCallback(() => {
    if (localBack.current?.()) return true;
    if (current.current.stack.length > 1) {
      setStack(old => old.slice(0, -1));
      return true;
    }
    return false;
  }, []);
  const requestBack = useCallback(() => {
    if (!consumeBack()) current.current.host.onBack();
  }, [consumeBack]);
  const onBackHandlerChange = host.onBackHandlerChange;
  const isActive = host.isActive;
  useEffect(() => {
    if (!isActive) return;
    onBackHandlerChange?.(consumeBack);
    return () => onBackHandlerChange?.(null);
  }, [onBackHandlerChange, isActive, consumeBack]);
  useEffect(() => {
    const fallback = getUnavailableProductRouteFallback(
      { screen: 'investments' },
      new Set(snapshot.products.map(product => product.id)),
      isInvestmentsPortfolioAvailable('PI', host.country),
    );
    if (fallback === 'homepage')
      current.current.host.onNavigate({ screen: 'home' });
  }, [host.country, snapshot.products]);
  const childHost: CurrentScreenProps = {
    ...host,
    onBack: requestBack,
    onBackHandlerChange: registerLocalBack,
  };
  const push = (next: View) => setStack(old => [...old, next]);
  const pop = () => setStack(old => (old.length > 1 ? old.slice(0, -1) : old));
  const finish = () =>
    setStack(old =>
      old.filter(
        item =>
          item.view !== 'buy' &&
          item.view !== 'sell' &&
          item.view !== 'instrument' &&
          item.view !== 'catalog',
      ),
    );
  const openHistory = (title?: string) =>
    host.onNavigate({
      screen: 'investments',
      params: {
        entry: 'history',
        ...(title !== undefined ? { filterByTitle: title } : {}),
      },
    });
  const selected = 'security' in route ? route.security : null;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  useEffect(() => {
    current.current.host.onInvestmentSecuritySelected?.(selectedRef.current);
  }, [selected]);
  const consumed = useRef<{ funds?: number; detail?: number; buy?: number }>(
    {},
  );
  const requests = host.investmentRequests;
  useEffect(() => {
    if (
      entry !== 'portfolio' ||
      !requests?.funds ||
      consumed.current.funds === requests.funds.requestId
    )
      return;
    consumed.current.funds = requests.funds.requestId;
    setStack([
      { view: 'portfolio' },
      {
        view: 'funds',
        collection: requests.funds.collectionId,
        requestKey: requests.funds.requestId,
      },
    ]);
  }, [entry, requests?.funds]);
  useEffect(() => {
    if (
      entry !== 'portfolio' ||
      !requests?.detail ||
      consumed.current.detail === requests.detail.requestId
    )
      return;
    consumed.current.detail = requests.detail.requestId;
    const security = snapshot.catalog.find(
      item => item.id === requests.detail!.securityId,
    );
    if (security)
      setStack([
        { view: 'portfolio' },
        {
          view: 'instrument',
          security,
          returnState: requests.detail.futureGainSimulatorState,
        },
      ]);
  }, [entry, requests?.detail, snapshot.catalog]);
  useEffect(() => {
    if (
      entry !== 'portfolio' ||
      !requests?.buy ||
      consumed.current.buy === requests.buy.requestId
    )
      return;
    const request = requests.buy;
    consumed.current.buy = request.requestId;
    const security = snapshot.catalog.find(
      item => item.id === request.securityId,
    );
    if (security)
      setStack(old => [
        ...old.filter(
          item =>
            item.view !== 'buy' &&
            item.view !== 'sell' &&
            item.view !== 'instrument',
        ),
        { view: 'instrument', security },
        { view: 'buy', security, initialDraft: request.draft },
      ]);
    current.current.host.onInvestmentBuyRequestConsumed?.(request.requestId);
  }, [entry, requests?.buy, snapshot.catalog]);
  const currencies = [
    ...new Set([
      getCountryCurrency(host.country),
      ...snapshot.securities.map(item => item.instrumentCurrency),
    ]),
  ];
  const historyOverrides = host.investmentHistoryOverrides;
  const showRoboActivity =
    host.investmentPresentation?.showBottomNavigation === true;
  const includeRoboHistory =
    historyOverrides?.includeCzRoboHistoricalTransactions ?? showRoboActivity;
  const historyTransactions =
    historyOverrides?.transactions ??
    buildInvestmentHistoryTransactions(snapshot.securities, host.country, {
      includeCzRoboHistoricalTransactions: includeRoboHistory,
    });
  const historyOrders = historyOverrides?.orders ?? snapshot.orders;
  const historyCurrencies =
    historyOverrides?.transactions !== undefined ||
    historyOverrides?.orders !== undefined ||
    includeRoboHistory
      ? [
          ...new Set([
            getCountryCurrency(host.country),
            ...historyTransactions.map(item => item.currency),
            ...historyOrders.map(item => item.currency),
          ]),
        ]
      : currencies;
  if (entry === 'history')
    return (
      <BaselineInvestmentHistory
        host={childHost}
        transactions={historyTransactions}
        orders={historyOrders}
        currencies={historyCurrencies}
        initialTab={
          returnToRoboOrders
            ? 'orders'
            : historyOverrides?.initialTab ??
              (params?.tab === 'orders' ? 'orders' : 'transactions')
        }
        filterByTitle={
          historyOverrides?.historyFilterByTitle ?? params?.filterByTitle
        }
        filterBySecurityId={
          historyOverrides?.historyFilterBySecurityId ??
          params?.filterBySecurityId
        }
        hideAllTimeDateOption={historyOverrides?.hideAllTimeDateOption ?? false}
        hideCurrencyFilter={historyOverrides?.hideCurrencyFilter ?? false}
        allDatesByDefault={
          historyOverrides?.allDatesByDefault ??
          params?.allDatesByDefault === 'true'
        }
        titleOverride={
          historyOverrides?.titleOverride ??
          params?.titleOverride ??
          (showRoboActivity ? 'Activity' : undefined)
        }
        closeModuleButton={
          historyOverrides?.closeModuleButton ??
          (params?.closeModuleButton !== undefined
            ? params.closeModuleButton === 'true'
            : showRoboActivity)
        }
        approvalCount={
          historyOverrides?.approvalCount ?? (showRoboActivity ? 20 : undefined)
        }
        onTabChange={host.onInvestmentHistoryTabChange}
        onToApprove={() => {
          if (showRoboActivity) setReturnToRoboOrders(true);
          if (host.onInvestmentHistoryToApprove)
            host.onInvestmentHistoryToApprove();
          else
            host.onNavigate({
              screen: 'investments',
              params: { entry: 'approvals' },
            });
        }}
        onBack={host.onBack}
      />
    );
  if (entry === 'approvals')
    return (
      <BaselineInvestmentPendingOrders
        host={childHost}
        catalog={snapshot.catalog}
        account={snapshot.accounts[0]}
        onBack={host.onBack}
      />
    );
  if (route.view === 'catalog')
    return (
      <BaselineInvestmentCatalog
        host={childHost}
        securities={snapshot.catalog}
        onBack={pop}
        onSelect={security => push({ view: 'instrument', security })}
        onSelectBasket={basket => push({ view: 'basket', basket })}
      />
    );
  if (route.view === 'funds')
    return (
      <BaselineInvestmentFunds
        key={route.requestKey ?? 'funds'}
        host={childHost}
        securities={snapshot.catalog}
        initialCollection={route.collection}
        resumeCollection={route.resumeCollection}
        onCollectionChange={resumeCollection =>
          setStack(old =>
            old.map(item =>
              item === route ? { ...route, resumeCollection } : item,
            ),
          )
        }
        onBack={pop}
        onSearch={() => push({ view: 'catalog' })}
        onSelect={security => push({ view: 'instrument', security })}
      />
    );
  if (route.view === 'basket')
    return (
      <BaselineInvestmentBasket
        host={childHost}
        basket={route.basket}
        securities={snapshot.catalog}
        onBack={pop}
        onSelect={security => push({ view: 'instrument', security })}
        onHistory={openHistory}
      />
    );
  if (route.view === 'instrument')
    return (
      <BaselineInvestmentInstrument
        host={childHost}
        security={route.security}
        onBack={() => {
          pop();
          if (route.returnState)
            host.onInvestmentReturnToSimulator?.(route.returnState);
        }}
        onHistory={openHistory}
        onBuy={() => push({ view: 'buy', security: route.security })}
        onSell={() => push({ view: 'sell', security: route.security })}
      />
    );
  if (route.view === 'buy')
    return (
      <BaselineInvestmentBuyOrder
        host={childHost}
        security={route.security}
        accounts={snapshot.accounts}
        securityAccounts={snapshot.securityAccounts}
        initialDraft={route.initialDraft}
        onBack={pop}
        onComplete={finish}
      />
    );
  if (route.view === 'sell')
    return (
      <BaselineInvestmentSellOrder
        host={childHost}
        security={route.security}
        accounts={snapshot.accounts}
        onBack={pop}
        onComplete={finish}
      />
    );
  if (route.view === 'distribution')
    return (
      <BaselineInvestmentDistributionDetail
        host={childHost}
        item={route.item}
        tab={route.tab}
        securities={snapshot.securities.filter(
          item => item.status === 'active' && item.localValue > 0,
        )}
        onBack={pop}
      />
    );
  const onOpenSecurity = (id: string) => {
    const security = snapshot.catalog.find(item => item.id === id);
    if (security) push({ view: 'instrument', security });
  };
  const onOpenDistribution = (
    tab: Exclude<InvestmentPortfolioTabId, 'performance'>,
    item: InvestmentDistributionItem,
  ) => push({ view: 'distribution', tab, item });
  const onOpenCatalog = () => push({ view: 'catalog' });
  const onOpenHistory = () => openHistory();
  const onOpenApprovals = () =>
    host.onNavigate({
      screen: 'investments',
      params: { entry: 'approvals' },
    });
  if (showRoboActivity)
    return (
      <CzRoboOverview
        host={childHost}
        snapshot={snapshot}
        state={overview}
        onStateChange={patch => setOverview(old => ({ ...old, ...patch }))}
        onOpenSecurity={onOpenSecurity}
        onOpenDistribution={onOpenDistribution}
        onOpenCatalog={onOpenCatalog}
        onOpenHistory={onOpenHistory}
        onOpenApprovals={onOpenApprovals}
        onModuleSelect={(section: InvestmentSection) => {
          switch (section) {
            case 'portfolio':
              setStack([{ view: 'portfolio' }]);
              break;
            case 'explore':
              push({ view: 'funds' });
              break;
            case 'catalog':
              onOpenCatalog();
              break;
            case 'history':
              onOpenHistory();
              break;
            case 'more':
              host.onNavigate({ screen: 'profile' });
              break;
          }
        }}
      />
    );
  return (
    <BaselineInvestmentOverview
      host={childHost}
      snapshot={snapshot}
      state={overview}
      onStateChange={patch => setOverview(old => ({ ...old, ...patch }))}
      onOpenSecurity={onOpenSecurity}
      onOpenDistribution={onOpenDistribution}
      onOpenCatalog={onOpenCatalog}
      onOpenHistory={onOpenHistory}
      onOpenApprovals={onOpenApprovals}
    />
  );
}
