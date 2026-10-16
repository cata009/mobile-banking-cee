import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
  createCurrentProducts,
} from '../src/experiences/pi/current/context';
import {
  buildInvestmentSecurities,
  buildInvestmentSecurityCatalog,
  getInvestmentProducts,
} from '@/app/config/investmentsPortfolioConfig';
import { getRecommendedInvestmentBaskets } from '@/app/config/investmentBasketFundsConfig';
import {
  getInvestmentFundCollectionSecurities,
  INVESTMENT_FUND_COLLECTIONS,
} from '@/app/config/investmentFundCollections';
import { BaselineSearchBar } from '../src/universal/BaselineSearchBar';
import { BaselineMailboxTabs } from '../src/universal/BaselineMailboxTabs';
import { BaselineInvestmentFrame } from '../src/experiences/pi/current/investments/baseline/Frame';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { Logo } from '../src/experiences/pi/current/investments/baseline/catalog/shared';
import {
  BaselineInvestmentCatalog,
  BaselineInvestmentFunds,
  BaselineInvestmentBasket,
} from '../src/experiences/pi/current/investments/baseline/catalog';

function host(
  country: CurrentScreenProps['country'] = 'RO',
): CurrentScreenProps {
  return {
    country,
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    route: { screen: 'investments' },
    tokens: currentTokens(),
    productCounts: {
      accounts: 2,
      debitCards: 2,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
    amountsHidden: false,
    screenTopInset: 12,
    isActive: true,
    mode: 'light',
    t: createCurrentTranslator(country, 'en'),
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onBackHandlerChange: jest.fn(),
  };
}
function catalog(h = host()) {
  return buildInvestmentSecurityCatalog(
    buildInvestmentSecurities(
      getInvestmentProducts(createCurrentProducts(h).products),
      h.country,
    ),
    h.country,
  );
}
const trees: Renderer.ReactTestRenderer[] = [];
const bannerLabel = (
  collection: (typeof INVESTMENT_FUND_COLLECTIONS)[number],
) => `${collection.title} ${collection.subtitle} FIND OUT MORE`;
function mount(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  trees.push(tree);
  return tree;
}
function control(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0]!;
}
function press(tree: Renderer.ReactTestRenderer, label: string) {
  expect(control(tree, label)).toBeDefined();
  act(() => control(tree, label).props.onPress());
}
function rows(
  tree: Renderer.ReactTestRenderer,
  prefix = 'baseline-investment-catalog-row-',
) {
  return tree.root.findAll(
    n =>
      typeof n.props.onPress === 'function' &&
      n.props.testID?.startsWith(prefix),
  );
}
afterEach(() => act(() => trees.splice(0).forEach(t => t.unmount())));

it.each(['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const)(
  '%s catalog preserves Source input ordering including inactive securities',
  country => {
    const h = host(country),
      securities = catalog(h),
      onSelect = jest.fn(),
      tree = mount(
        <BaselineInvestmentCatalog
          host={h}
          securities={securities}
          onBack={jest.fn()}
          onSelect={onSelect}
          onSelectBasket={jest.fn()}
        />,
      );
    expect(rows(tree).map(row => row.props.testID)).toEqual(
      securities.map(s => 'baseline-investment-catalog-row-' + s.id),
    );
    expect(JSON.stringify(tree.toJSON())).toContain(
      country === 'CZ' ? 'Buy securities' : 'List of securities',
    );
    expect(tree.root.findAllByType(BaselineMailboxTabs)).toHaveLength(
      country === 'CZ' ? 1 : 0,
    );
    act(() => rows(tree)[0].props.onPress());
    expect(onSelect).toHaveBeenCalledWith(securities[0]);
  },
);

it('trims case-insensitive title/product-ID search and preserves exact Source empty state', () => {
  const h = host(),
    securities = catalog(h),
    tree = mount(
      <BaselineInvestmentCatalog
        host={h}
        securities={securities}
        onBack={jest.fn()}
        onSelect={jest.fn()}
        onSelectBasket={jest.fn()}
      />,
    ),
    search = () => tree.root.findByType(BaselineSearchBar);
  act(() =>
    search().props.onValueChange(
      '  ' + securities[0].productId.toLowerCase() + '  ',
    ),
  );
  expect(rows(tree).map(r => r.props.testID)).toEqual(
    securities
      .filter(s =>
        (s.title + ' ' + s.productId)
          .toLowerCase()
          .includes(securities[0].productId.toLowerCase()),
      )
      .map(s => 'baseline-investment-catalog-row-' + s.id),
  );
  act(() => search().props.onValueChange('unknown-security'));
  expect(rows(tree)).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toContain('No securities found');
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Try another keyword or remove filters.',
  );
});

it('applies Source owned/currency filters live, removes them, and consumes local Back before parent Back', () => {
  const h = host(),
    securities = catalog(h),
    onBack = jest.fn(),
    tree = mount(
      <BaselineInvestmentCatalog
        host={h}
        securities={securities}
        onBack={onBack}
        onSelect={jest.fn()}
        onSelectBasket={jest.fn()}
      />,
    );
  act(() => tree.root.findByType(BaselineSearchBar).props.onFilterClick());
  press(tree, 'Products I own');
  press(tree, 'EUR');
  press(tree, 'Show products');
  expect(rows(tree).map(r => r.props.testID)).toEqual(
    securities
      .filter(s => s.owned && s.instrumentCurrency === 'EUR')
      .map(s => 'baseline-investment-catalog-row-' + s.id),
  );
  act(() => tree.root.findByType(BaselineSearchBar).props.onRemoveFilters());
  expect(rows(tree)).toHaveLength(securities.length);
  act(() => tree.root.findByType(BaselineSearchBar).props.onFilterClick());
  const back = (h.onBackHandlerChange as jest.Mock).mock.calls.at(-1)![0];
  act(() => expect(back()).toBe(true));
  expect(onBack).not.toHaveBeenCalled();
  act(() => expect(back()).toBe(false));
});

it('CZ regular plan filters both securities and basket carousel while See all uses Source3+2 groups and retains local query on Back', () => {
  const h = host('CZ'),
    securities = catalog(h),
    tree = mount(
      <BaselineInvestmentCatalog
        host={h}
        securities={securities}
        onBack={jest.fn()}
        onSelect={jest.fn()}
        onSelectBasket={jest.fn()}
      />,
    );
  act(() =>
    tree.root.findByType(BaselineMailboxTabs).props.onChange('regular'),
  );
  expect(rows(tree).map(r => r.props.testID)).toEqual(
    securities
      .filter(s => s.contributionType === 'RECURRENT')
      .map(s => 'baseline-investment-catalog-row-' + s.id),
  );
  act(() =>
    tree.root
      .findByType(BaselineSearchBar)
      .props.onValueChange('no-such-basket'),
  );
  press(tree, 'See all basket funds');
  const baskets = getRecommendedInvestmentBaskets('moderate-v2'),
    expected = [
      ...baskets.filter(b => b.contributionType === 'ONE OFF').slice(0, 3),
      ...baskets.filter(b => b.contributionType === 'RECURRENT').slice(0, 2),
    ];
  expect(
    rows(tree, 'baseline-investment-basket-row-').map(r => r.props.testID),
  ).toEqual(expected.map(b => 'baseline-investment-basket-row-' + b.id));
  press(tree, 'Back');
  expect(tree.root.findByType(BaselineSearchBar).props.value).toBe(
    'no-such-basket',
  );
  expect(rows(tree)).toHaveLength(0);
});

it('fund collections use canonical active/deduplicated order and pass exact selected security', () => {
  const h = host(),
    securities = catalog(h),
    onSelect = jest.fn(),
    onBack = jest.fn(),
    tree = mount(
      <BaselineInvestmentFunds
        host={h}
        securities={securities}
        initialCollection="featured"
        onBack={onBack}
        onSelect={onSelect}
      />,
    ),
    selected = getInvestmentFundCollectionSecurities('featured', securities),
    expected = [
      ...selected.filter(s => s.contributionType === 'ONE OFF'),
      ...selected.filter(s => s.contributionType === 'RECURRENT'),
    ];
  expect(
    rows(tree, 'baseline-investment-fund-row-').map(r => r.props.testID),
  ).toEqual(expected.map(s => 'baseline-investment-fund-row-' + s.id));
  act(() => rows(tree, 'baseline-investment-fund-row-')[0].props.onPress());
  expect(onSelect).toHaveBeenCalledWith(expected[0]);
  press(tree, 'Back');
  expect(onBack).toHaveBeenCalledTimes(1);
});

it('fund selection retains all Source banners, routes Search funds and returns from collection to selection', () => {
  const h = host(),
    securities = catalog(h),
    onSearch = jest.fn(),
    onBack = jest.fn(),
    tree = mount(
      <BaselineInvestmentFunds
        host={h}
        securities={securities}
        onBack={onBack}
        onSelect={jest.fn()}
        onSearch={onSearch}
      />,
    );
  for (const c of INVESTMENT_FUND_COLLECTIONS)
    expect(control(tree, bannerLabel(c))).toBeDefined();
  press(tree, 'Search funds');
  expect(onSearch).toHaveBeenCalledTimes(1);
  press(tree, bannerLabel(INVESTMENT_FUND_COLLECTIONS[0]));
  press(tree, 'Back');
  expect(control(tree, 'Search funds')).toBeDefined();
  expect(onBack).not.toHaveBeenCalled();
});

it('fund selection retains the Source sticky toolbar and 96px collapsing threshold', () => {
  const h = host(),
    tree = mount(
      <BaselineInvestmentFunds
        host={h}
        securities={catalog(h)}
        onBack={jest.fn()}
        onSelect={jest.fn()}
      />,
    );
  const frame = () => tree.root.findByType(BaselineInvestmentFrame);
  act(() =>
    frame().props.onScroll({ nativeEvent: { contentOffset: { y: 48 } } }),
  );
  expect(frame().props.headerOptions.collapsedTitleProgress).toBe(0.5);
  expect(frame().props.headerOptions.showHelp).toBe(true);
  press(tree, bannerLabel(INVESTMENT_FUND_COLLECTIONS[0]));
  press(tree, 'Back');
  expect(frame().props.headerOptions.collapsedTitleProgress).toBe(0);
});

it('fund collection selection survives instrument unmount and Back while preserving selection-origin Back', () => {
  const h = host(),
    securities = catalog(h),
    onCollectionChange = jest.fn(),
    onSelect = jest.fn(),
    onBack = jest.fn(),
    first = INVESTMENT_FUND_COLLECTIONS[0];
  const tree = mount(
    <BaselineInvestmentFunds
      host={h}
      securities={securities}
      onBack={onBack}
      onSelect={onSelect}
      onCollectionChange={onCollectionChange}
      onSearch={jest.fn()}
    />,
  );
  press(tree, bannerLabel(first));
  expect(onCollectionChange).toHaveBeenLastCalledWith(first.id);
  const expected = getInvestmentFundCollectionSecurities(first.id, securities),
    selected = rows(tree, 'baseline-investment-fund-row-')[0];
  act(() => selected.props.onPress());
  expect(onSelect).toHaveBeenCalledWith(
    expected.find(s => selected.props.testID.endsWith(s.id)),
  );
  act(() => tree.update(<></>));
  act(() =>
    tree.update(
      <BaselineInvestmentFunds
        host={h}
        securities={securities}
        resumeCollection={first.id}
        onBack={onBack}
        onSelect={onSelect}
        onCollectionChange={onCollectionChange}
        onSearch={jest.fn()}
      />,
    ),
  );
  expect(rows(tree, 'baseline-investment-fund-row-')).toHaveLength(
    expected.length,
  );
  press(tree, 'Back');
  expect(onCollectionChange).toHaveBeenLastCalledWith(null);
  expect(onBack).not.toHaveBeenCalled();
  expect(control(tree, 'Search funds')).toBeDefined();
});

it('brand logo retains Source image role and canonical default or product label', () => {
  const tree = mount(<Logo />);
  expect(tree.toJSON()).toMatchObject({
    props: { accessibilityRole: 'image', accessibilityLabel: 'UniCredit' },
  });
  act(() => tree.update(<Logo label="Basket product" />));
  expect(tree.toJSON()).toMatchObject({
    props: { accessibilityRole: 'image', accessibilityLabel: 'Basket product' },
  });
});

it('basket detail uses canonical IDs/date/holdings and keeps Source Buy,Documents and holding actions inert', () => {
  const h = host('CZ'),
    securities = catalog(h),
    basket = getRecommendedInvestmentBaskets('moderate-v2')[0],
    onSelect = jest.fn(),
    onHistory = jest.fn(),
    tree = mount(
      <BaselineInvestmentBasket
        host={h}
        basket={basket}
        securities={securities}
        onBack={jest.fn()}
        onSelect={onSelect}
        onHistory={onHistory}
      />,
    ),
    text = JSON.stringify(tree.toJSON());
  expect(text).toContain(basket.marketInfo.basketId);
  expect(text).toContain(basket.marketInfo.basketIsin);
  expect(text).toContain(basket.marketInfo.lastUpdate);
  for (const holding of basket.holdings) expect(text).toContain(holding.title);
  press(tree, 'History');
  expect(onHistory).toHaveBeenCalledWith(basket.title);
  press(tree, 'Buy');
  press(tree, 'Documents');
  expect(onSelect).not.toHaveBeenCalled();
  expect(rows(tree, 'baseline-investment-holding-')).toHaveLength(0);
});

it.each(INVESTMENT_FUND_COLLECTIONS.map(collection => collection.id))(
  '%s collection preserves canonical securities and grouping for privacy-hidden CZ',
  collectionId => {
    const h = { ...host('CZ'), amountsHidden: true },
      securities = catalog(h),
      tree = mount(
        <BaselineInvestmentFunds
          host={h}
          securities={securities}
          initialCollection={collectionId}
          onBack={jest.fn()}
          onSelect={jest.fn()}
        />,
      ),
      selected = getInvestmentFundCollectionSecurities(
        collectionId,
        securities,
      );
    expect(
      rows(tree, 'baseline-investment-fund-row-').map(row => row.props.testID),
    ).toEqual(
      [
        ...selected.filter(s => s.contributionType === 'ONE OFF'),
        ...selected.filter(s => s.contributionType === 'RECURRENT'),
      ].map(s => 'baseline-investment-fund-row-' + s.id),
    );
    const text = JSON.stringify(tree.toJSON());
    for (const security of selected) {
      expect(text).toContain(
        formatInvestmentMoney(security.marketPrice, h.country, '', true),
      );
      expect(text).toContain(
        `${
          security.performancePercent > 0
            ? '+'
            : security.performancePercent < 0
            ? '-'
            : ''
        }${Math.abs(security.performancePercent)
          .toFixed(2)
          .replace('.', ',')}%`,
      );
    }
  },
);

it('empty fund collection retains both Source zero-count sections without an invented empty state', () => {
  const tree = mount(
      <BaselineInvestmentFunds
        host={host()}
        securities={[]}
        initialCollection="featured"
        onBack={jest.fn()}
        onSelect={jest.fn()}
      />,
    ),
    text = JSON.stringify(tree.toJSON());
  expect(rows(tree, 'baseline-investment-fund-row-')).toHaveLength(0);
  expect(text).toContain('One-off investment');
  expect(text).toContain('Regular investment');
  expect(text).not.toContain('No securities found');
});

it('ordinary basket has no JP sample hero and resolves missing update from matching canonical holding', () => {
  const h = host('CZ'),
    securities = catalog(h),
    canonical = getRecommendedInvestmentBaskets('moderate-v2')[1],
    security = securities[0],
    basket = {
      ...canonical,
      holdings: [{ title: security.title, productId: security.productId }],
      marketInfo: { ...canonical.marketInfo, lastUpdate: null },
    },
    tree = mount(
      <BaselineInvestmentBasket
        host={h}
        basket={basket}
        securities={securities}
        onBack={jest.fn()}
        onSelect={jest.fn()}
      />,
    ),
    text = JSON.stringify(tree.toJSON());
  expect(text).not.toContain('PERFORMANCE +0%');
  expect(text).not.toContain('Actual market price');
  expect(text).toContain(security.lastUpdate);
});
