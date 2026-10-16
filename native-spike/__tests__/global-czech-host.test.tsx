import React, { useEffect, useState } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BackHandler, Pressable, Text, View, StyleSheet } from 'react-native';
import CzechPrimaryNavigation from '../src/app/CzechPrimaryNavigation';
import NativeCzechApp from '../src/experiences/pi/cz/evo-2027/NativeCzechApp';
import {
  readHomeTab,
  rememberHomeTab,
} from '../src/experiences/pi/cz/evo-2027/home/model';
import type {
  CzechNativeScreenProps,
  CzechNativeAdapter,
} from '../src/experiences/pi/cz/evo-2027/contracts';
const homeMounted = jest.fn();
const homeUnmounted = jest.fn();
beforeEach(() => {
  rememberHomeTab('accounts');
  homeMounted.mockClear();
  homeUnmounted.mockClear();
});
afterEach(() => rememberHomeTab('accounts'));
function Home(props: CzechNativeScreenProps) {
  // Source remounts Home; the feature owns the remembered tab rather than the shell.
  const [tab, setTab] = useState(() => readHomeTab());
  useEffect(() => {
    rememberHomeTab(tab);
  }, [tab]);
  useEffect(() => {
    homeMounted();
    return () => homeUnmounted();
  }, []);
  return (
    <>
      <Text testID="selected-tab">{tab}</Text>
      <Pressable
        accessibilityLabel="Choose savings"
        onPress={() => setTab('savings')}
      />
      <Pressable
        accessibilityLabel="Open settings"
        onPress={() => props.onNavigate({ screen: 'settings' })}
      />
      <Pressable
        accessibilityLabel="Missing screen"
        onPress={() => props.onNavigate({ screen: 'robo' })}
      />
    </>
  );
}
function Settings(props: CzechNativeScreenProps) {
  return <Pressable accessibilityLabel="Return home" onPress={props.onBack} />;
}
const adapters: CzechNativeAdapter[] = [
  { id: 'host-test', screens: { home: Home, settings: Settings } },
];

test('Source primary navigation remounts Home and restores its feature-owned tab after More', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeCzechApp
        initialRoute={{ screen: 'home', params: {} }}
        adapters={[
          { id: 'primary-test', screens: { home: Home, profile: Settings } },
        ]}
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
  await press('Choose savings');
  await press('More');
  expect(tree.root.findAllByType(Home)).toHaveLength(0);
  expect(homeUnmounted).toHaveBeenCalledTimes(1);
  expect(readHomeTab()).toBe('savings');
  expect(tree.root.findByType(Settings).props.isActive).toBe(true);
  await press('Home');
  expect(tree.root.findByType(Home).props.isActive).toBe(true);
  expect(
    tree.root.findAll(node => node.props.testID === 'selected-tab')[0].props
      .children,
  ).toBe('savings');
  expect(tree.root.findAllByType(Home)).toHaveLength(1);
  expect(tree.root.findAllByType(Settings)).toHaveLength(0);
  expect(homeMounted).toHaveBeenCalledTimes(2);
  await act(() => tree.unmount());
});

test('primary navigation clears the device bottom safe area', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeCzechApp adapters={adapters} bottomInset={24} />,
    );
  });
  const dock = tree.root.findByType(CzechPrimaryNavigation);
  expect(
    dock
      .findAllByType(View)
      .some(node => StyleSheet.flatten(node.props.style)?.bottom === 32),
  ).toBe(true);
  await act(() => tree.unmount());
});
test('a page-local hardware Back handler runs before the shell fallback', async () => {
  const handlers: (() => boolean)[] = [];
  const subscription = jest
    .spyOn(BackHandler, 'addEventListener')
    .mockImplementation((_event, handler) => {
      handlers.push(handler as () => boolean);
      return {
        remove: () => {
          const index = handlers.indexOf(handler as () => boolean);
          if (index >= 0) handlers.splice(index, 1);
        },
      };
    });
  const localBack = jest.fn();
  const exit = jest.fn();
  function Page() {
    useEffect(() => {
      const listener = BackHandler.addEventListener('hardwareBackPress', () => {
        localBack();
        return true;
      });
      return () => listener.remove();
    }, []);
    return <Text>Local detail</Text>;
  }
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeCzechApp
        adapters={[{ id: 'back-test', screens: { home: Page } }]}
        onExit={exit}
      />,
    );
  });
  await act(() => {
    for (const handler of [...handlers].reverse()) if (handler()) break;
  });
  expect(localBack).toHaveBeenCalledTimes(1);
  expect(exit).not.toHaveBeenCalled();
  await act(() => tree.unmount());
  subscription.mockRestore();
});
test('Back remounts Home with remembered selection while an unsupported destination leaves the active instance intact', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<NativeCzechApp adapters={adapters} />);
  });
  expect(tree.root.findAllByType(Home)).toHaveLength(1);
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
  await press('Choose savings');
  await press('Open settings');
  expect(tree.root.findAllByType(Home)).toHaveLength(0);
  expect(homeUnmounted).toHaveBeenCalledTimes(1);
  await press('Return home');
  expect(
    tree.root.findAll(node => node.props.testID === 'selected-tab')[0].props
      .children,
  ).toBe('savings');
  expect(homeMounted).toHaveBeenCalledTimes(2);
  await press('Missing screen');
  expect(tree.root.findAllByType(Home)).toHaveLength(1);
  expect(tree.root.findAllByType(Home)[0].props.isActive).toBe(true);
  expect(
    tree.root.findAll(node => node.props.testID === 'selected-tab')[0].props
      .children,
  ).toBe('savings');
  expect(homeMounted).toHaveBeenCalledTimes(2);
  expect(homeUnmounted).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});
test('late callbacks from an unmounted page cannot change the active stack', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<NativeCzechApp adapters={adapters} />);
  });
  const home = tree.root.findByType(Home).props as CzechNativeScreenProps;
  await act(() => home.onNavigate({ screen: 'settings' }));
  expect(tree.root.findAllByType(Home)).toHaveLength(0);
  await act(() => home.onBack());
  expect(tree.root.findAllByType(Settings)[0]?.props.isActive).toBe(true);
  await act(() => home.onNavigate({ screen: 'home' }));
  expect(tree.root.findAllByType(Settings)[0]?.props.isActive).toBe(true);
  await act(() => tree.unmount());
});

test('global search unmounts Home and Back remounts it with feature-owned selection', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeCzechApp adapters={adapters} searchRequest={0} />,
    );
  });
  await act(() =>
    tree.root
      .findAll(
        node =>
          node.props.accessibilityLabel === 'Choose savings' &&
          typeof node.props.onPress === 'function',
      )[0]
      .props.onPress(),
  );
  await act(() => {
    tree.update(<NativeCzechApp adapters={adapters} searchRequest={1} />);
  });
  expect(tree.root.findAllByType(Home)).toHaveLength(0);
  expect(homeUnmounted).toHaveBeenCalledTimes(1);
  expect(readHomeTab()).toBe('savings');
  await act(() =>
    tree.root
      .findAll(
        node =>
          node.props.accessibilityLabel === 'Back' &&
          typeof node.props.onPress === 'function',
      )[0]
      .props.onPress(),
  );
  expect(tree.root.findByType(Home).props.isActive).toBe(true);
  expect(
    tree.root.findAll(node => node.props.testID === 'selected-tab')[0].props
      .children,
  ).toBe('savings');
  expect(homeMounted).toHaveBeenCalledTimes(2);
  await act(() => tree.unmount());
});

function InvestmentPresentation(props: CzechNativeScreenProps) {
  return (
    <Text testID="investment-presentation">
      {String(props.investmentPresentation?.showBottomNavigation)}
    </Text>
  );
}

test('Native Czech defaults Evo investment presentation from the shared feature policy', async () => {
  const investments: CzechNativeAdapter[] = [
    {
      id: 'investment-presentation',
      screens: { investments: InvestmentPresentation },
    },
  ];
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeCzechApp
        initialRoute={{ screen: 'investments' }}
        adapters={investments}
      />,
    );
  });
  expect(
    tree.root.findByType(InvestmentPresentation).props.investmentPresentation,
  ).toMatchObject({ roboAdvisorEnabled: true, showBottomNavigation: true });
  await act(() => tree.unmount());
});
