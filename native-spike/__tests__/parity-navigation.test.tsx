import React, { useState } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Pressable, Text } from 'react-native';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
function Home(props: CurrentScreenProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <Text testID="source-home-expanded">{String(expanded)}</Text>
      <Pressable
        accessibilityLabel="Expand accounts"
        onPress={() => setExpanded(true)}
      />
      <Pressable
        accessibilityLabel="Open account"
        onPress={() => props.onNavigate({ screen: 'account' })}
      />
    </>
  );
}
function Account(props: CurrentScreenProps) {
  return <Pressable accessibilityLabel="Back" onPress={props.onBack} />;
}
test('Source top-level route replacement remounts Home on return and does not retain its accordion expansion', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <NativeCurrentApp
        country="RO"
        release="release-current"
        adapters={[
          {
            id: 'source-route-characterization',
            screens: { home: Home, account: Account },
          },
        ]}
      />,
    );
  });
  const press = async (label: string) => {
    await act(async () =>
      tree.root
        .findAll(
          n =>
            n.props.accessibilityLabel === label &&
            typeof n.props.onPress === 'function',
        )
        .at(-1)!
        .props.onPress(),
    );
  };
  await press('Expand accounts');
  await press('Open account');
  await press('Back');
  expect(
    tree.root.findAll(n => n.props.testID === 'source-home-expanded').at(-1)!
      .props.children,
  ).toBe('false');
  await act(async () => tree.unmount());
});
function SelectedAccount(props: CurrentScreenProps) {
  return (
    <Pressable
      accessibilityLabel="Open selected account info"
      onPress={() =>
        props.onNavigate({
          screen: 'account-info',
          params: { productId: 'acc-2', accountId: 'acc-2' },
        })
      }
    />
  );
}
test('Source RO info uses the carousel selection while Back restores the original account route', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <NativeCurrentApp
        country="RO"
        release="release-current"
        initialRoute={{ screen: 'account', params: { productId: 'acc-1' } }}
        adapters={[
          {
            id: 'source-product-selection',
            screens: { account: SelectedAccount, 'account-info': Account },
          },
        ]}
      />,
    );
  });
  const press = async (label: string) => {
    await act(async () =>
      tree.root
        .findAll(
          n =>
            n.props.accessibilityLabel === label &&
            typeof n.props.onPress === 'function',
        )
        .at(-1)!
        .props.onPress(),
    );
  };
  await press('Open selected account info');
  expect(tree.root.findByType(Account).props.route.params.productId).toBe(
    'acc-2',
  );
  await press('Back');
  expect(
    tree.root.findByType(SelectedAccount).props.route.params.productId,
  ).toBe('acc-1');
  await act(async () => tree.unmount());
});
