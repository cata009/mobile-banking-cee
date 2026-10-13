import React, { useEffect, useState } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BackHandler, Pressable, Text, View, StyleSheet } from 'react-native';
import CzechPrimaryNavigation from '../src/app/CzechPrimaryNavigation';
import NativeCzechApp from '../src/experiences/pi/cz/evo-2027/NativeCzechApp';
import type {
  CzechNativeScreenProps,
  CzechNativeAdapter,
} from '../src/experiences/pi/cz/evo-2027/contracts';
function Home(props: CzechNativeScreenProps) {
  const [tab, setTab] = useState('accounts');
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

test('Source primary navigation reaches More and restores the mounted Home tab state', async () => {
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
  expect(tree.root.findByType(Settings).props.isActive).toBe(true);
  await press('Home');
  expect(tree.root.findByType(Home).props.isActive).toBe(true);
  expect(
    tree.root.findAll(node => node.props.testID === 'selected-tab')[0].props
      .children,
  ).toBe('savings');
  expect(tree.root.findAllByType(Home)).toHaveLength(1);
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
test('back navigation preserves Home selection while unsupported destinations leave Home mounted', async () => {
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
  await press('Return home');
  expect(
    tree.root.findAll(node => node.props.testID === 'selected-tab')[0].props
      .children,
  ).toBe('savings');
  await press('Missing screen');
  expect(tree.root.findAllByType(Home)).toHaveLength(1);
  expect(tree.root.findAllByType(Home)[0].props.isActive).toBe(true);
  await act(() => tree.unmount());
});
test('late callbacks from a mounted inactive page cannot change the active stack', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<NativeCzechApp adapters={adapters} />);
  });
  const home = tree.root.findByType(Home).props as CzechNativeScreenProps;
  await act(() => home.onNavigate({ screen: 'settings' }));
  await act(() => home.onBack());
  expect(tree.root.findAllByType(Settings)[0]?.props.isActive).toBe(true);
  await act(() => home.onNavigate({ screen: 'home' }));
  expect(tree.root.findAllByType(Settings)[0]?.props.isActive).toBe(true);
  await act(() => tree.unmount());
});

test('global search requests open registered destinations and Back restores Home', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeCzechApp adapters={adapters} searchRequest={0} />,
    );
  });
  await act(() => {
    tree.update(<NativeCzechApp adapters={adapters} searchRequest={1} />);
  });
  expect(tree.root.findByType(Home).props.isActive).toBe(false);
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
  await act(() => tree.unmount());
});
