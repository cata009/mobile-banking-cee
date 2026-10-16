import React, { useState } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Pressable, Text } from 'react-native';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import type {
  CurrentAdapter,
  CurrentScreenProps,
} from '../src/experiences/pi/current/contracts';
function Home(host: CurrentScreenProps) {
  const [value, setValue] = useState(0);
  return (
    <>
      <Text testID="retained">{value}</Text>
      <Pressable
        accessibilityLabel="Change draft"
        onPress={() => setValue(7)}
      />
      <Pressable
        accessibilityLabel="Open account"
        onPress={() =>
          host.onNavigate({ screen: 'account', params: { productId: 'acc-1' } })
        }
      />
      <Pressable accessibilityLabel="Search" onPress={host.onSearch} />
    </>
  );
}
function Account(host: CurrentScreenProps) {
  return (
    <>
      <Text testID="country">{host.country}</Text>
      <Pressable accessibilityLabel="Back" onPress={host.onBack} />
    </>
  );
}
function InvestmentPresentation(host: CurrentScreenProps) {
  return (
    <Text testID="investment-presentation">
      {String(host.investmentPresentation?.showBottomNavigation)}
    </Text>
  );
}
const adapters: CurrentAdapter[] = [
  {
    id: 'test',
    screens: { home: Home, account: Account },
    searchEntries: () => [
      {
        id: 'acc-1',
        label: 'Primary account',
        keywords: ['iban'],
        target: { screen: 'account', params: { productId: 'acc-1' } },
      },
    ],
  },
];
test('baseline navigation replaces the mounted screen like Source and preserves the selected country', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeCurrentApp
        country="RO"
        release="release-current"
        adapters={adapters}
      />,
    );
  });
  const press = async (label: string) => {
    await act(() =>
      tree.root
        .findAll(
          node =>
            node.props.accessibilityLabel === label &&
            typeof node.props.onPress === 'function',
        )[0]
        .props.onPress(),
    );
  };
  await press('Change draft');
  await press('Open account');
  expect(tree.root.findByType(Account).props.country).toBe('RO');
  expect(tree.root.findAllByType(Home)).toHaveLength(0);
  await press('Back');
  expect(tree.root.findByType(Home).props.isActive).toBe(true);
  expect(
    tree.root.findAll(node => node.props.testID === 'retained')[0].props
      .children,
  ).toBe(0);
  await act(() => tree.unmount());
});
test('duplicate registrations fail instead of replacing another domain implementation', () => {
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);
  expect(() => {
    act(() => {
      Renderer.create(
        <NativeCurrentApp
          country="RO"
          release="release-current"
          adapters={[
            ...adapters,
            { id: 'collision', screens: { home: Account } },
          ]}
        />,
      );
    });
  }).toThrow(/Duplicate/);
  consoleError.mockRestore();
});
test('retained inactive callbacks cannot change the active route after a delayed completion', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeCurrentApp
        country="RO"
        release="release-current"
        adapters={adapters}
      />,
    );
  });
  const stale = tree.root.findByType(Home).props as CurrentScreenProps;
  await act(() =>
    stale.onNavigate({ screen: 'account', params: { productId: 'acc-1' } }),
  );
  await act(() => stale.onBack());
  expect(tree.root.findByType(Account).props.isActive).toBe(true);
  await act(() => stale.onNavigate({ screen: 'home' }));
  expect(tree.root.findByType(Account).props.isActive).toBe(true);
  await act(() => tree.unmount());
});

test('Native Current defaults CZ Robo presentation and respects explicit false overrides', async () => {
  const investments: CurrentAdapter[] = [
    {
      id: 'investment-presentation',
      screens: { investments: InvestmentPresentation },
    },
  ];
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeCurrentApp
        country="CZ"
        release="release-future-cz-robo"
        initialRoute={{ screen: 'investments' }}
        adapters={investments}
      />,
    );
  });
  expect(
    tree.root.findByType(InvestmentPresentation).props.investmentPresentation,
  ).toMatchObject({
    roboAdvisorEnabled: true,
    showBottomNavigation: true,
  });
  await act(() => tree.unmount());

  const control = {
    route: { screen: 'investments' },
    language: 'en',
    mode: 'light',
    amountsHidden: false,
    activeFeatures: ['fx_czRoboAdvisor'],
    investmentPresentation: {
      roboAdvisorEnabled: false,
      showBottomNavigation: false,
    },
    events: {
      onRouteChange: jest.fn(),
      onLanguageChange: jest.fn(),
      onModeChange: jest.fn(),
      onAmountsHiddenChange: jest.fn(),
      onExit: jest.fn(),
    },
  } as never;
  await act(() => {
    tree = Renderer.create(
      <NativeCurrentApp
        country="CZ"
        release="release-future-cz-robo"
        adapters={investments}
        control={control}
      />,
    );
  });
  expect(
    tree.root.findByType(InvestmentPresentation).props.investmentPresentation,
  ).toMatchObject({
    roboAdvisorEnabled: false,
    showBottomNavigation: false,
  });
  await act(() => tree.unmount());
});
