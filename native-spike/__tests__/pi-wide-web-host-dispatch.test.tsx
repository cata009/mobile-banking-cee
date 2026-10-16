import React from 'react';
import Renderer, { act } from 'react-test-renderer';
jest.mock('../src/experiences/pi/current/NativeCurrentApp', () => ({
  __esModule: true,
  default: () => {
    const runtimeReact = require('react');
    const { PiWebAccessibilityContext } = require('../src/platform/webAccessibility');
    const { Text } = require('react-native');
    return runtimeReact.createElement(PiWebAccessibilityContext.Consumer, null, (enabled: boolean) =>
      runtimeReact.createElement(Text, { testID: 'pi-web-accessibility-context' }, String(enabled)),
    );
  },
}));
jest.mock('../src/experiences/pi/cz/evo-2027/NativeCzechApp', () => ({
  __esModule: true,
  default: () => {
    const runtimeReact = require('react');
    const { PiWebAccessibilityContext } = require('../src/platform/webAccessibility');
    const { Text } = require('react-native');
    return runtimeReact.createElement(PiWebAccessibilityContext.Consumer, null, (enabled: boolean) =>
      runtimeReact.createElement(Text, { testID: 'pi-web-accessibility-context' }, String(enabled)),
    );
  },
}));
jest.mock('../src/app/currentAdapters', () => ({
  CURRENT_NATIVE_ADAPTERS: [],
}));
import CurrentApplication from '../src/app/CurrentApplication';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import NativeCzechApp from '../src/experiences/pi/cz/evo-2027/NativeCzechApp';
import { NATIVE_PRODUCTS_PREVIEW_ADAPTER } from '../src/experiences/pi/current/baseline/offers/NativeProductPreviewAdapter';

const mounted: Renderer.ReactTestRenderer[] = [];

function renderCurrentApplication(props: React.ComponentProps<typeof CurrentApplication>) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<CurrentApplication {...props} />);
  });
  mounted.push(tree);
  return tree;
}

function accessibilityValue(tree: Renderer.ReactTestRenderer) {
  const probe = tree.root.findByProps({ testID: 'pi-web-accessibility-context' });
  const textContent = (node: Renderer.ReactTestInstance): string =>
    node.children
      .map(child =>
        typeof child === 'string' || typeof child === 'number'
          ? String(child)
          : textContent(child),
      )
      .join('');
  return textContent(probe);
}

afterEach(() => {
  for (const tree of mounted.splice(0)) act(() => tree.unmount());
});

test('an Evo template region dispatches through the shared Native region adapter and PI Web accessibility context', () => {
  const tree = renderCurrentApplication({
    country: 'CZ',
    release: 'release-future-evo-2027',
    control: {
      productsPreview: { region: 'products-header', title: 'Products' },
    } as React.ComponentProps<typeof NativeCurrentApp>['control'],
  });
  const current = tree.root.findByType(NativeCurrentApp);
  expect(current.props.adapters).toEqual([NATIVE_PRODUCTS_PREVIEW_ADAPTER]);
  expect(current.props.control).toMatchObject({
    productsPreview: { region: 'products-header', title: 'Products' },
  });
  expect(accessibilityValue(tree)).toBe('true');
});

test('the shared Web entry preserves the Evo route and language on the Native Czech child', () => {
  const tree = renderCurrentApplication({
    country: 'CZ',
    release: 'release-future-evo-2027',
    initialLanguage: 'cs',
    initialRoute: { screen: 'investments', params: { entry: 'history' } },
  });
  const czech = tree.root.findByType(NativeCzechApp);
  expect(czech.props.initialLanguage).toBe('cs');
  expect(czech.props.initialRoute).toMatchObject({
    screen: 'investment-history',
  });
  expect(accessibilityValue(tree)).toBe('true');
});

test.each([
  'release-current',
  'release-future-cz-coapping',
  'release-future-cz-robo',
] as const)(
  'the common current Native child retains its release identity and PI accessibility context: %s',
  release => {
    const tree = renderCurrentApplication({ country: 'CZ', release });
    const current = tree.root.findByType(NativeCurrentApp);
    expect(current.props.release).toBe(release);
    expect(accessibilityValue(tree)).toBe('true');
  },
);

test('Italy stays outside the PI web accessibility context', () => {
  const tree = renderCurrentApplication({ country: 'IT', release: 'release-current' });
  expect(tree.root.findByType(NativeCurrentApp).props.country).toBe('IT');
  expect(accessibilityValue(tree)).toBe('false');
});
