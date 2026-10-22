import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Pressable, Text } from 'react-native';
import type { NativeDemoControl } from '@/features/demo-native/contracts';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import type {
  CurrentAdapter,
  CurrentScreenProps,
} from '../src/experiences/pi/current/contracts';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import { CURRENT_BANKING_ADAPTER } from '../src/experiences/pi/current/banking/adapter';
import { BaselineAccountBalanceCard } from '../src/universal/BaselineAccountBalanceCard';
import { BaselineBottomNavigation } from '../src/universal/BaselineBottomNavigation';
import { BaselineDetailToolbar } from '../src/universal/BaselineDetailToolbar';
import GlobalDemoSelector from '../src/app/GlobalDemoSelector';
import GlobalNativeApp from '../src/app/GlobalNativeApp';
import { NATIVE_DEMO_CHOICES } from '../src/app/registry';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaInsetsContext: require('react').createContext(null),
  useSafeAreaInsets: () => ({ top: 24, bottom: 24, left: 0, right: 0 }),
}));
jest.mock('../src/universal/ModalPortal', () => ({
  OverlayHost: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('../src/universal/Select', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Select: ({ label, value }: { label: string; value: string }) =>
      React.createElement(Text, { testID: 'global-selector-' + label }, value),
  };
});
jest.mock('../src/app/CurrentApplication', () => {
  const React = require('react');
  const { Text } = require('react-native');
  let nextInstance = 0;
  function CurrentApplicationProbe(props: {
    country: string;
    release: string;
    initialRoute?: { screen: string; params?: { productId?: string } };
  }) {
    const [instance] = React.useState(() => ++nextInstance);
    const productId = props.initialRoute?.params?.productId ?? 'none';
    return React.createElement(
      Text,
      { testID: 'current-host-probe' },
      props.country +
        '|' +
        props.release +
        '|' +
        (props.initialRoute?.screen ?? 'home') +
        '|' +
        productId +
        '|' +
        instance,
    );
  }
  return { __esModule: true, default: CurrentApplicationProbe };
});

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
function pressByLabel(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll(
    candidate =>
      candidate.props.accessibilityLabel === label &&
      typeof candidate.props.onPress === 'function',
  )[0];
  if (!node) throw new Error('Pressable not found: ' + label);
  act(() => node.props.onPress());
  return node;
}
function ProductRoute(props: CurrentScreenProps) {
  const screen = props.route.screen;
  const productId =
    typeof props.route.params?.productId === 'string'
      ? props.route.params.productId
      : 'missing';
  return (
    <>
      <Text testID="selected-product-route">{screen + ':' + productId}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'Select next ' + screen}
        onPress={() =>
          props.onNavigate({
            screen,
            params: { productId: screen + '-2' },
          })
        }
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'Open profile from ' + screen}
        onPress={props.onProfile}
      />
    </>
  );
}
function ProfileRoute(props: CurrentScreenProps) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open settings"
        onPress={() => props.onNavigate({ screen: 'settings' })}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back from profile"
        onPress={props.onBack}
      />
    </>
  );
}
function SettingsRoute(props: CurrentScreenProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={props.onBack}
    />
  );
}

it.each(['account', 'card'] as const)(
  'returns from Profile and Settings to the selected %s route and rejects retired callbacks',
  route => {
    const Home = (props: CurrentScreenProps) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'Open ' + route}
        onPress={() =>
          props.onNavigate({
            screen: route,
            params: { productId: route + '-1' },
          })
        }
      />
    );
    const adapters: readonly CurrentAdapter[] = [
      {
        id: 'global-navigation-parity-' + route,
        screens: {
          home: Home,
          account: ProductRoute,
          card: ProductRoute,
          profile: ProfileRoute,
          settings: SettingsRoute,
        },
      },
    ];
    const tree = mounted(
      <NativeCurrentApp
        country="RO"
        release="release-current"
        adapters={adapters}
      />,
    );
    pressByLabel(tree, 'Open ' + route);
    const firstProductRoute = tree.root.findByType(ProductRoute)
      .props as CurrentScreenProps;
    expect(firstProductRoute.route).toEqual({
      screen: route,
      params: { productId: route + '-1' },
    });

    pressByLabel(tree, 'Select next ' + route);
    expect(
      tree.root.findByType(ProductRoute).props.route.params?.productId,
    ).toBe(route + '-2');
    act(() => firstProductRoute.onNavigate({ screen: 'profile' }));
    expect(
      tree.root.findByType(ProductRoute).props.route.params?.productId,
    ).toBe(route + '-2');

    pressByLabel(tree, 'Open profile from ' + route);
    expect(tree.root.findByType(ProfileRoute).props.route.screen).toBe(
      'profile',
    );
    pressByLabel(tree, 'Open settings');
    expect(tree.root.findByType(SettingsRoute).props.route.screen).toBe(
      'settings',
    );
    pressByLabel(tree, 'Back');
    expect(tree.root.findByType(ProfileRoute).props.route.screen).toBe(
      'profile',
    );
    pressByLabel(tree, 'Back from profile');
    expect(tree.root.findByType(ProductRoute).props.route).toEqual({
      screen: route,
      params: { productId: route + '-2' },
    });
  },
);

it('synchronizes host controls and country/release props without echoing externally supplied routes', () => {
  let active!: CurrentScreenProps;
  function Screen(props: CurrentScreenProps) {
    active = props;
    return (
      <Text testID="active-current-route">
        {props.country +
          '|' +
          props.release +
          '|' +
          props.language +
          '|' +
          props.mode +
          '|' +
          props.amountsHidden +
          '|' +
          props.route.screen}
      </Text>
    );
  }
  const events = {
    onRouteChange: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onAmountsHiddenChange: jest.fn(),
    onExit: jest.fn(),
  };
  const control: NativeDemoControl = {
    route: { screen: 'home' },
    language: 'en',
    mode: 'light',
    amountsHidden: false,
    events,
  };
  const adapters: readonly CurrentAdapter[] = [
    { id: 'global-control-parity', screens: { home: Screen, account: Screen } },
  ];
  const tree = mounted(
    <NativeCurrentApp
      country="RO"
      release="release-current"
      adapters={adapters}
      control={control}
    />,
  );

  act(() =>
    tree.update(
      <NativeCurrentApp
        country="RO"
        release="release-current"
        adapters={adapters}
        control={{
          ...control,
          route: { screen: 'account', params: { productId: 'acc-2' } },
          language: 'ro',
          mode: 'dark',
          amountsHidden: true,
        }}
      />,
    ),
  );
  expect(active.route).toEqual({
    screen: 'account',
    params: { productId: 'acc-2' },
  });
  expect(active).toMatchObject({
    country: 'RO',
    release: 'release-current',
    language: 'ro',
    mode: 'dark',
    amountsHidden: true,
  });
  expect(events.onRouteChange).not.toHaveBeenCalled();
  act(() => active.onAmountsToggle());
  act(() => active.onLanguageChange('en'));
  act(() => active.onModeChange('system'));
  expect(active.amountsHidden).toBe(false);
  expect(events.onAmountsHiddenChange).toHaveBeenLastCalledWith(false);
  expect(events.onLanguageChange).toHaveBeenLastCalledWith('en');
  expect(events.onModeChange).toHaveBeenLastCalledWith('system');

  act(() =>
    tree.update(
      <NativeCurrentApp
        country="HU"
        release="release-v2"
        adapters={adapters}
        control={{
          ...control,
          route: { screen: 'account', params: { productId: 'acc-2' } },
          language: 'en',
          mode: 'light',
          amountsHidden: false,
        }}
      />,
    ),
  );
  expect(active).toMatchObject({
    country: 'HU',
    release: 'release-v2',
    route: { screen: 'account', params: { productId: 'acc-2' } },
  });
  expect(events.onRouteChange).not.toHaveBeenCalled();
});

it('keeps the account Back path available when the configured country has no visible accounts', () => {
  const noProducts = {
    ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
    accounts: 0,
    debitCards: 0,
    creditCards: 0,
    mealCards: 0,
    deposits: 0,
    savingsAccounts: 0,
    loans: 0,
    mortgages: 0,
    investments: 0,
  };
  const EmptyHome = (props: CurrentScreenProps) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open empty account"
      onPress={() => props.onNavigate({ screen: 'account' })}
    />
  );
  const tree = mounted(
    <NativeCurrentApp
      country="RO"
      release="release-current"
      productCounts={noProducts}
      adapters={[
        { id: 'empty-product-home', screens: { home: EmptyHome } },
        CURRENT_BANKING_ADAPTER,
      ]}
    />,
  );
  pressByLabel(tree, 'Open empty account');
  expect(tree.root.findAllByType(BaselineAccountBalanceCard)).toHaveLength(0);
  expect(tree.root.findAllByType(BaselineDetailToolbar)).toHaveLength(1);
  pressByLabel(tree, 'Back');
  expect(tree.root.findAllByType(BaselineBottomNavigation)).toHaveLength(1);
  expect(tree.root.findByType(BaselineBottomNavigation).props.activeTab).toBe(
    'home',
  );
});

it('switches the global launcher country and release while remounting the current host with its launch route', async () => {
  const targetChoice = NATIVE_DEMO_CHOICES.find(
    choice =>
      choice.selection.product === 'PI' &&
      choice.selection.country === 'HU' &&
      choice.selection.designSystem === 'current' &&
      choice.releases.some(release => release !== choice.selection.release),
  );
  if (!targetChoice)
    throw new Error('Expected HU current to offer a second baseline release');
  const targetRelease = targetChoice.releases.find(
    release => release !== targetChoice.selection.release,
  );
  if (!targetRelease) throw new Error('Expected an alternate HU release');
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <GlobalNativeApp
        initialSelection={{
          product: 'PI',
          country: 'RO',
          designSystem: 'current',
          release: 'release-current',
          scenario: 'active',
        }}
        initialRoute={{ screen: 'account', params: { productId: 'acc-1' } }}
        startInDemo
        showSelectorControl
      />,
    );
    await Promise.resolve();
  });
  trees.add(tree);
  const probe = () => tree.root.findByProps({ testID: 'current-host-probe' });
  expect(probe().props.children).toContain('RO|release-current|account|acc-1|');
  pressByLabel(tree, 'Demo selector');
  const selector = tree.root.findByType(GlobalDemoSelector);
  act(() =>
    selector.props.onChange({
      ...targetChoice.selection,
      release: targetRelease,
      scenario: 'active',
    }),
  );
  pressByLabel(tree, 'Deschide demo');
  await act(async () => {
    await Promise.resolve();
  });
  expect(probe().props.children).toContain(
    'HU|' + targetRelease + '|account|acc-1|',
  );
  expect(probe().props.children).toMatch(/\|2$/);
});
