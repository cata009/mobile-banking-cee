import React, { Children } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, Text as NativeText } from 'react-native';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import { CURRENT_HOME_ADAPTER } from '../src/experiences/pi/current/adapter';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import {
  createCurrentProducts,
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type {
  CurrentAdapter,
  CurrentScreenProps,
} from '../src/experiences/pi/current/contracts';
import { BaselineL1Header } from '../src/universal/BaselineL1Header';
import { BaselineHomeBody } from '../src/experiences/pi/current/baseline/Body';
import {
  BaselineHeaderActionButton,
  BaselineHeaderActionRail,
} from '../src/universal/BaselineHeaderActions';
import { BaselineAmountVisibility } from '../src/universal/BaselineAmountVisibility';
import { BaselineBottomNavigation } from '../src/universal/BaselineBottomNavigation';
import { BaselineAccordion } from '../src/universal/BaselineAccordion';
import { BaselineProductsList } from '../src/universal/BaselineProductsList';
import { BaselineProductCard } from '../src/universal/BaselineProductCard';

const HomeRoute = CURRENT_HOME_ADAPTER.screens.home;
if (!HomeRoute) throw new Error('Actual current Homepage adapter must exist');
const trees = new Set<Renderer.ReactTestRenderer>();
function mounted(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  trees.add(tree);
  return tree;
}
afterEach(() => {
  for (const tree of trees) act(() => tree.unmount());
  trees.clear();
});
function host(overrides: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES },
    bankingScenario: 'retail-single-account',
    route: { screen: 'home' },
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
    ...overrides,
  };
}
function namedPressable(tree: Renderer.ReactTestRenderer, name: string) {
  const node = tree.root.findAll(
    control =>
      control.props.accessibilityRole === 'button' &&
      control.props.accessibilityLabel === name,
  )[0];
  if (!node) throw new Error(`Actual Pressable not found: ${name}`);
  return node;
}
function hasAncestor(node: Renderer.ReactTestInstance, type: unknown) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === type) return true;
  }
  return false;
}
function hiddenOwner(node: Renderer.ReactTestInstance) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (typeof parent.props.accessibilityElementsHidden === 'boolean')
      return parent;
  }
  throw new Error(
    'Secondary product requires an actual accessibility visibility owner',
  );
}

describe('actual PI/RO/current Homepage canonical integration', () => {
  it.each([false, true])(
    'maps fixed actions and scrolling title to shared L1 leaves dark=%s',
    dark => {
      const tree = mounted(
        <HomeRoute
          {...host({
            tokens: currentTokens(dark),
            mode: dark ? 'dark' : 'light',
          })}
        />,
      );
      const headers = tree.root
        .findAllByType(BaselineL1Header)
        .filter(node => node.props.variant === 'home');
      expect(headers).toHaveLength(2);
      const fixed = headers.find(node => node.props.showTitle === false);
      const title = headers.find(node => node.props.showActions === false);
      if (!fixed || !title)
        throw new Error(
          'Homepage must compose independent fixed-actions and scrolling-title leaves',
        );
      expect(hasAncestor(fixed, ScrollView)).toBe(false);
      expect(hasAncestor(title, ScrollView)).toBe(true);
      expect(tree.root.findAllByType(BaselineHeaderActionRail)).toHaveLength(1);
      expect(tree.root.findAllByType(BaselineAmountVisibility)).toHaveLength(1);
      expect(
        tree.root
          .findAllByType(BaselineHeaderActionButton)
          .map(node => node.props.icon),
      ).toEqual(['profile', 'messages']);
    },
  );

  it('keeps privacy controlled by the host and exposes the real pressed state', () => {
    const owner = host(),
      tree = mounted(<HomeRoute {...owner} />);
    expect(tree.root.findAllByType(BaselineAmountVisibility)).toHaveLength(1);
    const visible = namedPressable(tree, 'Hide amounts');
    expect(visible.props['aria-pressed']).toBe(false);
    act(() => visible.props.onPress());
    expect(owner.onAmountsToggle).toHaveBeenCalledTimes(1);
    expect(tree.root.findByType(BaselineAmountVisibility).props.hidden).toBe(
      false,
    );
    act(() => tree.update(<HomeRoute {...owner} amountsHidden />));
    expect(namedPressable(tree, 'Show amounts').props['aria-pressed']).toBe(
      true,
    );
  });

  it('preserves Prime/Messages navigation and leaves Profile enabled and inert', () => {
    const owner = host(),
      tree = mounted(<HomeRoute {...owner} />);
    const profile = namedPressable(tree, 'Profile');
    expect(profile.props.disabled).not.toBe(true);
    expect(profile.props.onPress).toBeUndefined();
    act(() => {
      namedPressable(tree, 'Prime').props.onPress();
      namedPressable(tree, 'Messages').props.onPress();
    });
    expect(owner.onNavigate).toHaveBeenCalledTimes(2);
    expect(owner.onNavigate).toHaveBeenNthCalledWith(1, { screen: 'prime' });
    expect(owner.onNavigate).toHaveBeenNthCalledWith(2, { screen: 'messages' });
    expect(owner.onProfile).not.toHaveBeenCalled();
  });

  it('retains authoritative product counts and real accordion visibility ownership', () => {
    const owner = host(),
      model = createCurrentProducts(owner),
      tree = mounted(<HomeRoute {...owner} />);
    const expected = model.categories.filter(
      category => category.products.length > 0,
    );
    const groups = tree.root.findAllByType(BaselineAccordion);
    expect(groups).toHaveLength(expected.length);
    const lists = tree.root.findAllByType(BaselineProductsList);
    expect(lists.map(node => Children.count(node.props.children))).toEqual(
      expected.map(category => category.products.length),
    );
    // ProductsList retains hidden descendants; test the controlling props and accessibility owner,
    // rather than treating every product node in the renderer tree as visible.
    const group = groups.find(
      node =>
        Children.count(node.findByType(BaselineProductsList).props.children) >
        1,
    );
    if (!group)
      throw new Error(
        'Authoritative default counts must expose a multi-product group',
      );
    const list = group.findByType(BaselineProductsList);
    expect(list.props.isOpen).toBe(false);
    const secondary = list.findAllByType(BaselineProductCard)[1];
    if (!secondary)
      throw new Error('Multi-product group must retain its secondary product');
    expect(hiddenOwner(secondary).props.accessibilityElementsHidden).toBe(true);
    const header = group
      .findAll(
        node =>
          node.props.accessibilityRole === 'button' &&
          typeof node.props.onPress === 'function',
      )
      .find(
        node =>
          node.findAll(child => child.props.children === group.props.title)
            .length > 0,
      );
    if (!header)
      throw new Error('Actual category heading control must own expansion');
    act(() => header.props.onPress());
    expect(group.findByType(BaselineProductsList).props.isOpen).toBe(true);
    const expandedSecondary = group
      .findByType(BaselineProductsList)
      .findAllByType(BaselineProductCard)[1];
    if (!expandedSecondary)
      throw new Error('Expansion must retain its secondary product');
    expect(
      hiddenOwner(expandedSecondary).props.accessibilityElementsHidden,
    ).toBe(false);
    act(() => header.props.onPress());
    expect(group.findByType(BaselineProductsList).props.isOpen).toBe(false);
  });

  it('uses the shared Homepage for the audited BA release preview', () => {
    const tree = mounted(
      <HomeRoute
        {...host({
          country: 'BA',
          release: 'release-v1',
          t: createCurrentTranslator('BA', 'en'),
        })}
      />,
    );
    expect(tree.root.findAllByType(BaselineL1Header)).toHaveLength(2);
    expect(tree.root.findAllByType(BaselineHeaderActionRail)).toHaveLength(1);
    expect(tree.root.findAllByType(BaselineAmountVisibility)).toHaveLength(1);
  });

  it('uses the redesigned Baseline Home for the newly audited RO/v2 context', () => {
    const tree = mounted(
      <HomeRoute
        {...host({
          country: 'RO',
          release: 'release-v2',
          t: createCurrentTranslator('RO', 'en'),
        })}
      />,
    );
    expect(tree.root.findAllByType(BaselineL1Header)).toHaveLength(2);
    expect(tree.root.findAllByType(BaselineHomeBody)).toHaveLength(1);
    expect(tree.root.findByType(BaselineHomeBody).props.redesigned).toBe(true);
    expect(tree.root.findAllByType(BaselineAmountVisibility)).toHaveLength(1);
  });

  it.each([
    { country: 'RS' as const, release: 'release-future-rs-my-banker' as const },
    { country: 'RO' as const, release: 'release-future-evo-2027' as const },
    {
      country: 'RO' as const,
      release: 'release-current' as const,
      scenario: 'inactive' as const,
    },
  ])('keeps the existing Home for $country/$release', context => {
    const tree = mounted(
      <HomeRoute
        {...host({
          ...context,
          t: createCurrentTranslator(context.country, 'en'),
        })}
      />,
    );
    expect(tree.root.findAllByType(BaselineL1Header)).toHaveLength(0);
    expect(tree.root.findAllByType(BaselineAmountVisibility)).toHaveLength(0);
  });
});

function Destination(props: CurrentScreenProps) {
  return <NativeText testID="actual-route">{props.route.screen}</NativeText>;
}
const navigationAdapters: readonly CurrentAdapter[] = [
  {
    id: 'baseline-home-integration',
    screens: {
      home: HomeRoute,
      pfm: Destination,
      payments: Destination,
      products: Destination,
      profile: Destination,
      investments: Destination,
      messages: Destination,
      prime: Destination,
    },
  },
];
describe('real NativeCurrentApp Homepage controller', () => {
  it.each([
    ['analytics', 'pfm'],
    ['payments', 'payments'],
    ['products', 'products'],
    ['more', 'profile'],
  ] as const)(
    'maps the controlled canonical %s tab to the existing %s route',
    (tab, route) => {
      const tree = mounted(
        <NativeCurrentApp
          country="RO"
          release="release-current"
          adapters={navigationAdapters}
        />,
      );
      const nav = tree.root.findAllByType(BaselineBottomNavigation);
      expect(nav).toHaveLength(1);
      expect(nav[0]?.props.activeTab).toBe('home');
      const label = nav[0]?.props.labels[tab];
      if (typeof label !== 'string')
        throw new Error(`Host must provide its canonical ${tab} translation`);
      act(() => namedPressable(tree, label).props.onPress());
      expect(tree.root.findByType(Destination).props.route.screen).toBe(route);
    },
  );

  it('updates the host privacy state through the actual owner callback', () => {
    const tree = mounted(
      <NativeCurrentApp
        country="RO"
        release="release-current"
        adapters={navigationAdapters}
      />,
    );
    expect(tree.root.findAllByType(BaselineAmountVisibility)).toHaveLength(1);
    expect(tree.root.findByType(BaselineAmountVisibility).props.hidden).toBe(
      false,
    );
    act(() => namedPressable(tree, 'Hide amounts').props.onPress());
    expect(tree.root.findByType(BaselineAmountVisibility).props.hidden).toBe(
      true,
    );
    expect(namedPressable(tree, 'Show amounts').props['aria-pressed']).toBe(
      true,
    );
  });
});
