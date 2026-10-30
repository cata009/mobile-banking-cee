import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import CzechPrimaryNavigation from '../src/app/CzechPrimaryNavigation';
import NativeCzechApp from '../src/experiences/pi/cz/evo-2027/NativeCzechApp';
import {
  DuoPreviewProvider,
  useDuoLocalViewport,
} from '../src/universal/DuoPreview';
import { Header } from '../src/universal/Header';
import { mobileFirstTokens } from '../src/universal/tokens';
import { nativeModalVisibility } from '../src/platform/nativeModalVisibility';

it.each([0, 1, 2])(
  'places the cover navigation below system chrome and %i page actions',
  actionCount => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <CzechPrimaryNavigation
          screen="home"
          language="en"
          mode="light"
          bottomInset={0}
          onSelect={() => {}}
          vertical
          verticalTop={152}
          verticalActionCount={actionCount}
        />,
      );
    });
    const bar = tree.root
      .findAllByType(View)
      .find(n => n.props.accessibilityLabel === 'Primary navigation')!;
    expect(StyleSheet.flatten(bar.parent!.props.style).top).toBe(
      152 + actionCount * 60,
    );
    expect(152 + actionCount * 60 + 268).toBeLessThanOrEqual(678 - 12);
    act(() => tree.unmount());
  },
);

it('uses the active page back action in the Duo rail and hides it while a modal is open', () => {
  const back = jest.fn();
  const Screen = () => (
    <Header tokens={mobileFirstTokens} title="Details" onBack={back} />
  );
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DuoPreviewProvider
        value={{ width: 951, height: 669, rightInset: 84, referenceWidth: 375 }}
      >
        <NativeCzechApp
          initialRoute={{ screen: 'account', params: {} }}
          adapters={[{ id: 'test', screens: { account: Screen } }]}
        />
      </DuoPreviewProvider>,
    );
  });
  const rail = tree.root.findByProps({ testID: 'evo-duo-back' });
  act(() => rail.props.onPress());
  expect(back).toHaveBeenCalledTimes(1);
  let closeModal!: () => void;
  act(() => {
    closeModal = nativeModalVisibility.open();
  });
  expect(tree.root.findAllByProps({ testID: 'evo-duo-back' })).toHaveLength(0);
  act(() => closeModal());
  expect(
    tree.root.findAllByProps({ testID: 'evo-duo-back' }).length,
  ).toBeGreaterThan(0);
  act(() => tree.unmount());
});

it.each([true, false])(
  'retains all five executable destinations with vertical=%s',
  vertical => {
    const onSelect = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <CzechPrimaryNavigation
          screen="home"
          language="en"
          mode="light"
          bottomInset={0}
          onSelect={onSelect}
          vertical={vertical}
        />,
      );
    });

    const rail = tree.root
      .findAllByType(View)
      .find(n => n.props.accessibilityLabel === 'Primary navigation')!;
    expect(StyleSheet.flatten(rail.props.style).flexDirection).toBe(
      vertical ? 'column' : 'row',
    );
    const tabs = tree.root.findAll(
      n => n.props.accessibilityLabel && typeof n.props.onPress === 'function',
    );
    for (const label of ['Home', 'Spending', 'Payments', 'Offers', 'More'])
      expect(tabs.some(n => n.props.accessibilityLabel === label)).toBe(true);
    act(() =>
      tabs
        .find(n => n.props.accessibilityLabel === 'Payments')!
        .props.onPress(),
    );
    expect(onSelect).toHaveBeenCalledWith('payments');
    act(() => tree.unmount());
  },
);

it.each(['prelogin', 'login'] as const)(
  '%s extends the background across Duo while retaining safe foreground bounds',
  screen => {
    let observed: ReturnType<typeof useDuoLocalViewport>;
    const Screen = () => {
      observed = useDuoLocalViewport();
      return <View />;
    };
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <DuoPreviewProvider
          value={{
            width: 951,
            height: 669,
            rightInset: 84,
            referenceWidth: 375,
          }}
        >
          <NativeCzechApp
            initialRoute={{ screen, params: {} }}
            adapters={[{ id: 'test', screens: { [screen]: Screen } }]}
          />
        </DuoPreviewProvider>,
      );
    });
    expect(
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'evo-duo-screen' }).props.style,
      ).right,
    ).toBe(0);
    expect(observed!).toMatchObject({ width: 867, height: 669 });
    act(() => tree.unmount());
  },
);

it.each([
  [{ width: 951, height: 669, rightInset: 84, referenceWidth: 375 }, true, 867],
  [{ width: 466, height: 678, rightInset: 84, referenceWidth: 375 }, true, 382],
  [{ width: 669, height: 951, rightInset: 0, referenceWidth: 375 }, false, 669],
] as const)(
  'reserves the system rail and reports actual content dimensions',
  (geometry, vertical, width) => {
    let observed: ReturnType<typeof useDuoLocalViewport>;
    const Screen = () => {
      observed = useDuoLocalViewport();
      return <View />;
    };
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <DuoPreviewProvider value={geometry}>
          <NativeCzechApp
            initialRoute={{ screen: 'home', params: {} }}
            adapters={[{ id: 'test', screens: { home: Screen } }]}
          />
        </DuoPreviewProvider>,
      );
    });
    expect(observed!).toMatchObject({
      width,
      height: geometry.height,
      left: 0,
      top: 0,
    });
    const page = tree.root.findByProps({ testID: 'evo-duo-screen' });
    expect(StyleSheet.flatten(page.props.style).right).toBe(
      geometry.rightInset,
    );
    expect(tree.root.findByType(CzechPrimaryNavigation).props.vertical).toBe(
      vertical,
    );
    act(() => tree.unmount());
  },
);
