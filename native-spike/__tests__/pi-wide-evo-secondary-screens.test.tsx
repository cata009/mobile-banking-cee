import React, { type ComponentType } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import type {
  CzechNativeAdapter,
  CzechNativeRoute,
  CzechNativeScreen,
  CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { CZECH_HOME_ADAPTER } from '../src/experiences/pi/cz/evo-2027/home/adapter';
import { CZECH_PROFILE_ADAPTER } from '../src/experiences/pi/cz/evo-2027/profile/adapter';
import { czechPreferences } from '../src/experiences/pi/cz/evo-2027/profile/features/preferences';
import { rememberHomeTab } from '../src/experiences/pi/cz/evo-2027/home/model';
import { getTutorialsForCountry } from '@/app/config/tutorialsConfig';
import { ModalPanel } from '../src/universal/ModalPanel';
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig';
import { PRODUCT_SHELF_ENTRY_CARDS } from '@/app/config/productsShelfConfig';
import { createEvoTranslations } from '@/translations/evo';
import { shopsmartOfferCardWeb } from '@/app/components/contracts/marketingCardWeb';

const trees = new Set<Renderer.ReactTestRenderer>();
function registeredScreen(
  adapter: CzechNativeAdapter,
  screen: CzechNativeScreen,
): ComponentType<CzechNativeScreenProps> {
  const component = adapter.screens[screen];
  if (!component) throw new Error('Missing Czech screen: ' + screen);
  return component;
}
function host(
  route: CzechNativeRoute,
  overrides: Partial<CzechNativeScreenProps> = {},
): CzechNativeScreenProps {
  return {
    route,
    scenario: 'active',
    language: 'en',
    mode: 'light',
    homeTheme: 'standard',
    productCounts: { ...DEFAULT_CZECH_COUNTS },
    amountsHidden: false,
    screenTopInset: 0,
    isActive: true,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onSearch: jest.fn(),
    onProfile: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onHomeThemeChange: jest.fn(),
    ...overrides,
  };
}
function mounted(
  Screen: ComponentType<CzechNativeScreenProps>,
  props: CzechNativeScreenProps,
): Renderer.ReactTestRenderer {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Screen {...props} />);
  });
  trees.add(tree);
  return tree;
}
function pressable(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root
    .findAll(
      candidate =>
        candidate.props.accessibilityLabel === label &&
        typeof candidate.props.onPress === 'function',
    )
    .at(-1);
  if (!node) throw new Error('Missing pressable: ' + label);
  return node;
}
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () => pressable(tree, label).props.onPress());
}
function screenText(tree: Renderer.ReactTestRenderer) {
  return JSON.stringify(tree.toJSON());
}
beforeEach(() => {
  czechPreferences.reset();
  rememberHomeTab('accounts');
});
afterEach(async () => {
  await act(async () => trees.forEach(tree => tree.unmount()));
  trees.clear();
  czechPreferences.reset();
  rememberHomeTab('accounts');
});

it('keeps Settings language draft local and More Logout Cancel on the current screen', async () => {
  const MoreScreen = registeredScreen(CZECH_PROFILE_ADAPTER, 'profile');
  const SettingsScreen = registeredScreen(CZECH_PROFILE_ADAPTER, 'settings');
  const navigate = jest.fn();
  const moreProps = host({ screen: 'profile' }, { onNavigate: navigate });
  const moreTree = mounted(MoreScreen, moreProps);

  await press(moreTree, 'Settings');
  expect(navigate).toHaveBeenCalledWith({ screen: 'settings' });

  const settingsBack = jest.fn();
  const settingsLanguageChange = jest.fn();
  const settingsTree = mounted(
    SettingsScreen,
    host(
      { screen: 'settings' },
      { onBack: settingsBack, onLanguageChange: settingsLanguageChange },
    ),
  );
  await press(settingsTree, 'Language');
  await press(settingsTree, 'Čeština');
  await press(settingsTree, 'Back');
  expect(czechPreferences.getSnapshot().language).toBe('en');
  expect(settingsLanguageChange).not.toHaveBeenCalled();
  await press(settingsTree, 'Back');
  expect(settingsBack).toHaveBeenCalledTimes(1);

  navigate.mockClear();
  await press(moreTree, 'Logout');
  await press(moreTree, 'Cancel');
  expect(navigate).not.toHaveBeenCalled();
});

it('keeps Source Tutorials inside More as a local sheet and Back closes its detail', async () => {
  const MoreScreen = registeredScreen(CZECH_PROFILE_ADAPTER, 'profile');
  const navigate = jest.fn();
  const registerBack = jest.fn();
  const moreTree = mounted(
    MoreScreen,
    host(
      { screen: 'profile' },
      { onNavigate: navigate, onBackHandlerChange: registerBack },
    ),
  );
  const firstTutorial = getTutorialsForCountry('CZ')[0]!;

  await press(moreTree, 'Tutorials');
  expect(navigate).not.toHaveBeenCalled();
  expect(moreTree.root.findAllByType(ModalPanel)).toHaveLength(1);
  await press(moreTree, 'Open tutorial: ' + firstTutorial.title);
  expect(
    moreTree.root.findByProps({ testID: 'cz-tutorial-hero' }),
  ).toBeDefined();
  expect(navigate).not.toHaveBeenCalled();

  const back = registerBack.mock.calls.at(-1)?.[0] as (() => boolean) | null;
  if (!back) throw new Error('Tutorial sheet did not register local Back');
  let handled = false;
  await act(async () => {
    handled = back();
  });
  expect(handled).toBe(true);
  expect(navigate).not.toHaveBeenCalled();
  expect(moreTree.root.findAllByType(ModalPanel)).toHaveLength(0);
  expect(registerBack).toHaveBeenLastCalledWith(null);
});

it('applies PFM period and account scope sheets to visible Source-backed figures', async () => {
  const PfmScreen = registeredScreen(CZECH_HOME_ADAPTER, 'pfm');
  const tree = mounted(PfmScreen, host({ screen: 'pfm' }));
  const copy = createEvoTranslations('en').spending;

  const initialIncome = tree.root.findByProps({ testID: 'cz-pfm-income' }).props
    .amount;
  await press(tree, copy.changePeriod);
  expect(pressable(tree, copy.presetLast3Months)).toBeDefined();
  await press(tree, copy.presetLast3Months);
  expect(screenText(tree)).toContain(copy.presetLast3Months);
  const lastThreeMonthsIncome = tree.root.findByProps({
    testID: 'cz-pfm-income',
  }).props.amount;
  expect(lastThreeMonthsIncome).not.toBe(initialIncome);

  await press(tree, 'Choose accounts');
  expect(pressable(tree, 'Euro account')).toBeDefined();
  await press(tree, 'Euro account');
  expect(screenText(tree)).toContain('Euro account');
  expect(
    tree.root.findByProps({ testID: 'cz-pfm-income' }).props.amount,
  ).not.toBe(lastThreeMonthsIncome);
});

it('opens the Home ShopSmart offer into Products and filters canonical Czech offer data', async () => {
  const Home = registeredScreen(CZECH_HOME_ADAPTER, 'home');
  const ProductsScreen = registeredScreen(CZECH_HOME_ADAPTER, 'products');
  const menu = getProductsMenuForCountry('CZ');
  const homeOffer = menu.shopSmartOfferCards[0]!;
  const homeNavigate = jest.fn();
  const homeTree = mounted(
    Home,
    host(
      { screen: 'home', params: { tab: 'accounts' } },
      { onNavigate: homeNavigate },
    ),
  );

  await press(homeTree, homeOffer.title);
  expect(homeNavigate).toHaveBeenCalledWith({ screen: 'products' });

  const productsProps = host({ screen: 'products' });
  const productsTree = mounted(ProductsScreen, productsProps);
  const shopSmartEntry = PRODUCT_SHELF_ENTRY_CARDS.find(
    entry => entry.id === 'shopsmart',
  )!;
  await press(productsTree, shopSmartEntry.title);
  expect(screenText(productsTree)).toContain(
    menu.shopSmartSummary.totalSavedLabel,
  );

  const electronics = menu.shopSmartOfferCards
    .filter(offer => offer.categories.includes('electronics'))
    .map(offer => offer.merchant)
    .sort();
  expect(electronics).toEqual(['DATART', 'Lentiamo.ro']);
  await press(productsTree, 'Electronics');
  const filtered = screenText(productsTree);
  expect(filtered).toContain('DATART');
  expect(filtered).toContain('Lentiamo.ro');
  expect(filtered).not.toContain('Valentino.ro');
  expect(filtered).not.toContain('English home');
  expect(filtered).not.toContain('Booking.com');
  expect(filtered).not.toContain('IKEA');

  const search = productsTree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === 'Search offers');
  if (!search) throw new Error('ShopSmart Search offers field is missing');
  await act(async () => search.props.onChangeText('DATART'));
  expect(screenText(productsTree)).toContain('DATART');
  expect(screenText(productsTree)).not.toContain('Lentiamo.ro');
  expect(productsProps.onNavigate).not.toHaveBeenCalled();
});

it('preserves the Source ShopSmart offer button surface without inventing an action', async () => {
  const ProductsScreen = registeredScreen(CZECH_HOME_ADAPTER, 'products');
  const offer = getProductsMenuForCountry('CZ').shopSmartOfferCards.find(
    item => item.id === 'shopsmart-datart',
  )!;
  const sourceSurface = shopsmartOfferCardWeb({
    interactive: true,
    imageHeight: 130,
    variant: 'default',
    trailingIcon: offer.trailingIcon,
    pillTone: offer.pillTone,
  });
  expect(sourceSurface.rootTag).toBe('button');

  const productsProps = host({
    screen: 'products',
    params: { view: 'shopsmart' },
  });
  const tree = mounted(ProductsScreen, productsProps);
  const nativeOfferButtons = tree.root.findAll(
    node =>
      node.props.accessibilityRole === 'button' &&
      typeof node.props.onPress === 'function' &&
      node
        .findAllByType(Text)
        .some(text => text.props.children === offer.merchant),
  );
  expect(nativeOfferButtons).toHaveLength(1);
  await act(async () => nativeOfferButtons[0]!.props.onPress());
  expect(productsProps.onNavigate).not.toHaveBeenCalled();
});
