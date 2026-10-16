import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import Investments from '../src/experiences/pi/current/investments/Investments';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import { BaselineInvestmentOverview } from '../src/experiences/pi/current/investments/baseline/overview';
import { BaselineInvestmentCatalog } from '../src/experiences/pi/current/investments/baseline/catalog';
import { BaselineInvestmentInstrument } from '../src/experiences/pi/current/investments/baseline/flows/Instrument';
import { BaselineInvestmentBuyOrder } from '../src/experiences/pi/current/investments/baseline/flows/BuyOrder';
import { BaselineInvestmentHistory } from '../src/experiences/pi/current/investments/baseline/flows/History';
import { BaselineInvestmentFunds } from '../src/experiences/pi/current/investments/baseline/catalog';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

const trees = new Set<Renderer.ReactTestRenderer>();
afterEach(() => {
  for (const tree of trees) act(() => tree.unmount());
  trees.clear();
});
function host(extra: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES },
    route: { screen: 'investments' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
    ...extra,
  };
}
function mount(props: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Investments {...props} />);
  });
  trees.add(tree);
  return tree;
}

it.each(['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const)(
  'uses the Source Baseline overview and ALL default in %s',
  country => {
    const tree = mount(
      host({ country, t: createCurrentTranslator(country, 'en') }),
    );
    const overview = tree.root.findAllByType(BaselineInvestmentOverview);
    expect(overview).toHaveLength(1);
    expect(overview[0].props.state).toEqual({
      tabId: 'performance',
      periodId: 'max',
      sortId: 'max-value',
    });
  },
);

it('preserves overview selections across local detail Back but pushes the standalone history route', () => {
  const props = host(),
    tree = mount(props),
    snapshot = createCurrentInvestmentSnapshot(props);
  let overview = tree.root.findByType(BaselineInvestmentOverview);
  act(() => overview.props.onStateChange({ periodId: '1m' }));
  overview = tree.root.findByType(BaselineInvestmentOverview);
  act(() => overview.props.onOpenSecurity(snapshot.securities[0].id));
  const instrument = tree.root.findByType(BaselineInvestmentInstrument);
  act(() => instrument.props.onBack());
  overview = tree.root.findByType(BaselineInvestmentOverview);
  expect(overview.props.state.periodId).toBe('1m');
  act(() => overview.props.onOpenHistory());
  expect(props.onNavigate).toHaveBeenCalledWith({
    screen: 'investments',
    params: { entry: 'history' },
  });
});

it('passes a filtered standalone history entry through without rendering portfolio', () => {
  const tree = mount(
    host({
      route: {
        screen: 'investments',
        params: { entry: 'history', filterByTitle: 'Exact fund' },
      },
    }),
  );
  expect(tree.root.findAllByType(BaselineInvestmentOverview)).toHaveLength(0);
  expect(
    tree.root.findByType(BaselineInvestmentHistory).props.filterByTitle,
  ).toBe('Exact fund');
});

it('consumes valid and unknown buy request IDs once while retaining the open order after clearing the DTO', () => {
  const props = host({ onInvestmentBuyRequestConsumed: jest.fn() }),
    snapshot = createCurrentInvestmentSnapshot(props);
  const security = snapshot.catalog.find(item => item.status === 'active')!;
  props.investmentRequests = { buy: { requestId: 7, securityId: security.id } };
  const tree = mount(props);
  expect(props.onInvestmentBuyRequestConsumed).toHaveBeenCalledWith(7);
  expect(
    tree.root.findByType(BaselineInvestmentBuyOrder).props.security.id,
  ).toBe(security.id);
  act(() =>
    tree.update(<Investments {...props} investmentRequests={{ buy: null }} />),
  );
  expect(tree.root.findAllByType(BaselineInvestmentBuyOrder)).toHaveLength(1);
  act(() =>
    tree.update(
      <Investments
        {...props}
        investmentRequests={{ buy: { requestId: 8, securityId: 'unknown' } }}
      />,
    ),
  );
  expect(props.onInvestmentBuyRequestConsumed).toHaveBeenCalledTimes(2);
  expect(props.onInvestmentBuyRequestConsumed).toHaveBeenLastCalledWith(8);
});

it('lets a child consume host Back before the controller returns to portfolio', () => {
  let handler: (() => boolean) | null = null;
  const tree = mount(
    host({
      onBackHandlerChange: next => {
        handler = next;
      },
    }),
  );
  act(() =>
    tree.root.findByType(BaselineInvestmentOverview).props.onOpenCatalog(),
  );
  const catalog = tree.root.findByType(BaselineInvestmentCatalog),
    local = jest.fn(() => true);
  act(() => catalog.props.host.onBackHandlerChange(local));
  act(() => {
    expect(handler?.()).toBe(true);
  });
  expect(local).toHaveBeenCalledTimes(1);
  expect(tree.root.findAllByType(BaselineInvestmentCatalog)).toHaveLength(1);
  act(() => catalog.props.host.onBackHandlerChange(null));
  act(() => {
    expect(handler?.()).toBe(true);
  });
  expect(tree.root.findAllByType(BaselineInvestmentOverview)).toHaveLength(1);
});

it('restores the locally selected fund collection after instrument Back without changing its direct-entry origin', () => {
  const props = host({
      route: { screen: 'investments', params: { view: 'funds' } },
    }),
    tree = mount(props);
  let funds = tree.root.findByType(BaselineInvestmentFunds);
  act(() => funds.props.onCollectionChange('balanced'));
  funds = tree.root.findByType(BaselineInvestmentFunds);
  const security = createCurrentInvestmentSnapshot(props).catalog[0];
  act(() => funds.props.onSelect(security));
  act(() => tree.root.findByType(BaselineInvestmentInstrument).props.onBack());
  funds = tree.root.findByType(BaselineInvestmentFunds);
  expect(funds.props.resumeCollection).toBe('balanced');
  expect(funds.props.initialCollection).toBeUndefined();
});

it('keeps the Source empty portfolio and catalogue available and relinquishes inactive Back', () => {
  let handler: (() => boolean) | null = null;
  const props = host({
    productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES, investments: 0 },
    onBackHandlerChange: next => {
      handler = next;
    },
  });
  const tree = mount(props);
  expect(props.onNavigate).not.toHaveBeenCalledWith({ screen: 'home' });
  const overview = tree.root.findByType(BaselineInvestmentOverview);
  expect(overview.props.snapshot.securities).toHaveLength(0);
  act(() => overview.props.onOpenCatalog());
  expect(tree.root.findAllByType(BaselineInvestmentCatalog)).toHaveLength(1);
  act(() => tree.update(<Investments {...props} isActive={false} />));
  expect(handler).toBeNull();
});
