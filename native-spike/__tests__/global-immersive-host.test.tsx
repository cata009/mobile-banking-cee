import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import GlobalNativeApp from '../src/app/GlobalNativeApp';
import GlobalDemoSelector from '../src/app/GlobalDemoSelector';
import NativeItalyApp from '../src/experiences/pi/it/NativeItalyApp';
import NativeCzechApp from '../src/experiences/pi/cz/evo-2027/NativeCzechApp';
import NativeKidsApp from '../src/experiences/kids-pi/NativeKidsApp';
import { Platform } from 'react-native';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaInsetsContext: require('react').createContext(null),
  useSafeAreaInsets: () => ({ top: 24, bottom: 24, left: 0, right: 0 }),
}));
jest.mock('../src/universal/ModalPortal', () => ({
  OverlayHost: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('../src/app/GlobalDemoSelector', () => () => null);
jest.mock('../src/experiences/pi/it/NativeItalyApp', () => {
  const React = require('react');
  const {
    PiWebAccessibilityContext,
  } = require('../src/platform/webAccessibility');
  return (props: Record<string, unknown>) =>
    React.createElement('ItalyA11yProbe', {
      ...props,
      adapterEnabled: React.useContext(PiWebAccessibilityContext),
    });
});
jest.mock('../src/experiences/kids-pi/NativeKidsApp', () => {
  const React = require('react');
  const {
    PiWebAccessibilityContext,
  } = require('../src/platform/webAccessibility');
  return (props: Record<string, unknown>) =>
    React.createElement('KidsA11yProbe', {
      ...props,
      adapterEnabled: React.useContext(PiWebAccessibilityContext),
    });
});
jest.mock('../src/experiences/pi/cz/evo-2027/NativeCzechApp', () => () => null);
jest.mock('../src/app/czechAdapters', () => ({
  CZECH_NATIVE_ADAPTERS: [{ id: 'home-proof', screens: { home: () => null } }],
}));

const italy = {
  product: 'PI',
  country: 'IT',
  designSystem: 'mobile-first',
  release: 'release-current',
  scenario: 'active',
} as const;

test('ordinary Italy entry has no technical toolbar and Home exit returns to launcher', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <GlobalNativeApp initialSelection={italy} startInDemo />,
    );
    await Promise.resolve();
  });
  expect(
    tree.root.findAll(
      node => node.props.accessibilityLabel === 'Demo selector',
    ),
  ).toHaveLength(0);
  const host = tree.root.findByType(NativeItalyApp);
  expect(host.props.onExit).toEqual(expect.any(Function));
  await act(() => host.props.onExit());
  expect(tree.root.findByType(GlobalDemoSelector)).toBeDefined();
  await act(() => tree.unmount());
});

test('Czech Search remains launchable without consuming a demo toolbar or losing safe insets', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<GlobalNativeApp initialSelection={{product:'PI',country:'CZ',designSystem:'current',release:'release-future-evo-2027',scenario:'active'}}/>);
    await Promise.resolve();
  });
  await act(() => tree.root.findByType(GlobalDemoSelector).props.onSearch());
  const host = tree.root.findByType(NativeCzechApp);
  expect(host.props.initialRoute).toEqual({ screen: 'search' });
  expect(host.props.screenTopInset).toBe(54);
  expect(host.props.bottomInset).toBe(24);
  expect(
    tree.root.findAll(
      node => node.props.accessibilityLabel === 'Demo selector',
    ),
  ).toHaveLength(0);
  await act(() => host.props.onExit());
  await act(() => tree.root.findByType(GlobalDemoSelector).props.onOpen());
  expect(
    tree.root.findByType(NativeCzechApp).props.initialRoute,
  ).toBeUndefined();
  await act(() => tree.unmount());
});

test('technical demo controls remain an explicit debug opt-in', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <GlobalNativeApp
        initialSelection={italy}
        startInDemo
        showSelectorControl
      />,
    );
    await Promise.resolve();
  });
  expect(
    tree.root.findAll(node => node.props.accessibilityLabel === 'Demo selector')
      .length,
  ).toBeGreaterThan(0);
  await act(() => tree.unmount());
});

test.each(['web', 'android'] as const)(
  'scopes Kids web state translation under %s when selected through the launcher',
  async platform => {
    const originalPlatform = Platform.OS;
    Platform.OS = platform;
    let tree!: Renderer.ReactTestRenderer;
    try {
      await act(async () => {
        tree = Renderer.create(
          <GlobalNativeApp initialSelection={italy} startInDemo />,
        );
      });
      const italyProbe = () => tree.root.findByType('ItalyA11yProbe' as never);
      expect(italyProbe().props.adapterEnabled).toBe(false);
      await act(() => tree.root.findByType(NativeItalyApp).props.onExit());
      await act(() =>
        tree.root
          .findByType(GlobalDemoSelector)
          .props.onChange({
            product: 'KIDS_PI',
            country: 'HU',
            designSystem: 'current',
            release: 'release-current',
            scenario: 'active',
          }),
      );
      await act(async () => {
        tree.root.findByType(GlobalDemoSelector).props.onOpen();
      });
      const kidsProbe = tree.root.findByType('KidsA11yProbe' as never);
      expect(kidsProbe.props.adapterEnabled).toBe(platform === 'web');
      expect(kidsProbe.props.country).toBe('HU');
      expect(kidsProbe.props.scenario).toBe('active');
      await act(() => tree.root.findByType(NativeKidsApp).props.onExit());
      await act(() =>
        tree.root.findByType(GlobalDemoSelector).props.onChange(italy),
      );
      await act(async () => {
        tree.root.findByType(GlobalDemoSelector).props.onOpen();
      });
      expect(italyProbe().props.adapterEnabled).toBe(false);
    } finally {
      if (tree) await act(() => tree.unmount());
      Platform.OS = originalPlatform;
    }
  },
);
