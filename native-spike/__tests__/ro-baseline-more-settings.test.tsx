import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform, ScrollView } from 'react-native';
import { SETTINGS_SECTIONS } from '@/app/config/settingsConfig';
import { APP_2027_THEMES } from '@/features/products/evoAppearance';
import Settings from '../src/experiences/pi/current/baseline/more/Settings';
import Language from '../src/experiences/pi/current/baseline/more/Language';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

const mounted: Renderer.ReactTestRenderer[] = [];
let storage: Map<string, string>;
beforeEach(() => {
  storage = new Map();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
});
afterEach(() => {
  act(() => mounted.splice(0).forEach(tree => tree.unmount()));
});
function host(): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
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
    route: { screen: 'settings' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 0,
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
    onPrimaryNavigationChange: jest.fn(),
    onBackHandlerChange: jest.fn(),
  };
}
function mount(h: CurrentScreenProps, standalone = false) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      standalone ? <Language {...h} /> : <Settings {...h} />,
    );
  });
  mounted.push(tree);
  return tree;
}
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const target = tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0];
  expect(target).toBeDefined();
  act(() => target.props.onPress());
}
function back(tree: Renderer.ReactTestRenderer) {
  act(() => tree.root.findByType(BaselinePageHeader).props.onBack());
}
function localBack(h: CurrentScreenProps) {
  const callback = (h.onBackHandlerChange as jest.Mock).mock.calls.at(-1)?.[0];
  expect(typeof callback).toBe('function');
  act(() => expect(callback()).toBe(true));
}

it('preserves Source Settings sections, row order and inert rows', () => {
  const h = host(),
    tree = mount(h),
    rows = tree.root.findAllByType(BaselineNavigationRow);
  expect(rows.map(row => row.props.title)).toEqual(
    SETTINGS_SECTIONS.flatMap(section => section.items.map(item => item.title)),
  );
  expect(rows.map(row => row.props.description)).toEqual(
    SETTINGS_SECTIONS.flatMap(section =>
      section.items.map(item => item.description),
    ),
  );
  expect(
    rows
      .filter(row => typeof row.props.onPress === 'function')
      .map(row => row.props.title),
  ).toEqual(['Appearance', 'Language']);
  expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(false);
  back(tree);
  expect(h.onBack).toHaveBeenCalledTimes(1);
});
it('previews Romanian locally, cancels on host Back, then saves through the language host', () => {
  const h = host(),
    tree = mount(h);
  press(tree, 'Language');
  expect(
    tree.root
      .findAll(
        node =>
          typeof node.props.onPress === 'function' &&
          node.props.accessibilityRole === 'radio',
      )
      .map(node => node.props.accessibilityLabel),
  ).toEqual(['Română', 'English']);
  press(tree, 'Română');
  expect(tree.root.findByType(BaselinePageHeader).props.title).toBe(
    'Selectați limba',
  );
  expect(h.onLanguageChange).not.toHaveBeenCalled();
  localBack(h);
  expect(h.onBack).not.toHaveBeenCalled();
  expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(false);
  press(tree, 'Language');
  expect(tree.root.findByType(BaselinePageHeader).props.title).toBe(
    'Select language',
  );
  press(tree, 'Română');
  press(tree, 'Salvează');
  expect(h.onLanguageChange).toHaveBeenCalledWith('ro');
  expect(tree.root.findAllByType(BaselineNavigationRow)).toHaveLength(8);
});
it('uses the country-aware Source language options on a standalone language route', () => {
  const h = { ...host(), country: 'CZ' as const, language: 'cs' as const },
    tree = mount(h, true);
  expect(
    tree.root
      .findAll(
        node =>
          typeof node.props.onPress === 'function' &&
          node.props.accessibilityRole === 'radio',
      )
      .map(node => node.props.accessibilityLabel),
  ).toEqual(['Čeština', 'English']);
  press(tree, 'English');
  press(tree, 'Save');
  expect(h.onLanguageChange).toHaveBeenCalledWith('en');
  expect(h.onBack).toHaveBeenCalledTimes(1);
});
it('keeps theme draft separate, cancels locally, applies and reopens the persisted Source theme', () => {
  storage.set('app-2027-home-theme', 'porcelain');
  const h = host(),
    tree = mount(h);
  press(tree, 'Appearance');
  expect(
    tree.root
      .findAll(
        node =>
          typeof node.props.onPress === 'function' &&
          String(node.props.accessibilityLabel).startsWith('Select '),
      )
      .map(node => node.props.accessibilityLabel),
  ).toEqual(APP_2027_THEMES.map(theme => `Select ${theme.name} theme`));
  expect(JSON.stringify(tree.toJSON())).toContain('59 902.86 CZK');
  press(tree, 'Select Aurora theme');
  expect(storage.get('app-2027-home-theme')).toBe('porcelain');
  localBack(h);
  press(tree, 'Appearance');
  press(tree, 'Apply current theme');
  expect(storage.get('app-2027-home-theme')).toBe('porcelain');
  press(tree, 'Appearance');
  press(tree, 'Select Aurora theme');
  press(tree, 'Apply Aurora');
  expect(storage.get('app-2027-home-theme')).toBe('aurora');
  expect(h.onChanged).toHaveBeenCalled();
  press(tree, 'Appearance');
  press(tree, 'Select Classic UniCredit theme');
  press(tree, 'Apply without theme');
  expect(storage.get('app-2027-home-theme')).toBe('standard');
  const reopened = mount(host());
  press(reopened, 'Appearance');
  expect(
    reopened.root.findAllByProps({
      testID: 'ro-appearance-classic-background',
    }),
  ).not.toHaveLength(0);
  expect(
    reopened.root.findAllByProps({
      accessibilityLabel: 'Select Classic UniCredit theme',
    })[0].props.accessibilityState.selected,
  ).toBe(true);
});
it('falls back to Classic for an invalid persisted theme and initializes saved system appearance only when it matches the host', () => {
  storage.set('app-2027-home-theme', 'unrecognized');
  storage.set('app-2027-appearance-mode', 'system');
  const h = host(),
    tree = mount(h);
  press(tree, 'Appearance');
  expect(
    tree.root.findAllByProps({
      accessibilityLabel: 'Select Classic UniCredit theme',
    })[0].props.accessibilityState.selected,
  ).toBe(true);
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'system' })[0].props
      .accessibilityState.selected,
  ).toBe(true);
  const next = { ...h, mode: 'dark' as const, tokens: currentTokens(true) };
  act(() => tree.update(<Settings {...next} />));
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'dark' })[0].props
      .accessibilityState.selected,
  ).toBe(true);
  expect(storage.get('app-2027-appearance-mode')).toBe('dark');
});
it('changes appearance mode immediately and retains it when the theme draft is cancelled', () => {
  const h = host(),
    tree = mount(h);
  press(tree, 'Appearance');
  press(tree, 'dark');
  expect(h.onModeChange).toHaveBeenCalledWith('dark');
  expect(storage.get('app-2027-appearance-mode')).toBe('dark');
  press(tree, 'Select Aurora theme');
  press(tree, 'Back to Home');
  expect(storage.get('app-2027-home-theme')).toBeUndefined();
  expect(h.onBack).not.toHaveBeenCalled();
  expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(false);
});
it('centres middle theme choices in the actual carousel viewport', () => {
  const tree = mount(host());
  press(tree, 'Appearance');
  const carousel = tree.root
    .findAllByType(ScrollView)
    .find(node => node.props.horizontal)!;
  const scroll = jest.spyOn(carousel.instance, 'scrollTo');
  act(() =>
    carousel.props.onLayout({ nativeEvent: { layout: { width: 339 } } }),
  );
  press(tree, 'Select Porcelain theme');
  expect(scroll).toHaveBeenLastCalledWith({ x: 68.5, animated: true });
  scroll.mockRestore();
});
it('preserves Source mouse dragging and ends a drag when the pointer leaves the theme carousel', () => {
  const platform = jest.replaceProperty(Platform, 'OS', 'web');
  try {
    const tree = mount(host());
    press(tree, 'Appearance');
    const carousel = tree.root
      .findAllByType(ScrollView)
      .find(node => node.props.horizontal)!;
    const viewport = { scrollLeft: 100 };
    const node = jest
      .spyOn(carousel.instance, 'getScrollableNode')
      .mockReturnValue(viewport);
    expect(typeof carousel.props.onPointerDown).toBe('function');
    act(() =>
      carousel.props.onPointerDown({
        nativeEvent: { pointerType: 'mouse', button: 0, clientX: 200 },
      }),
    );
    act(() => carousel.props.onPointerMove({ nativeEvent: { clientX: 150 } }));
    expect(viewport.scrollLeft).toBe(150);
    act(() => carousel.props.onPointerLeave());
    act(() => carousel.props.onPointerMove({ nativeEvent: { clientX: 100 } }));
    expect(viewport.scrollLeft).toBe(150);
    node.mockRestore();
  } finally {
    platform.restore();
  }
});
