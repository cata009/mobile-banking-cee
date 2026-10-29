import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import { CURRENT_NATIVE_ADAPTERS } from '../src/app/currentAdapters';
import {
  DuoContentViewport,
  DuoPreviewProvider,
} from '../src/universal/DuoPreview';
import { BaselineCardArtwork } from '../src/universal/BaselineCardArtwork';
import { BaselinePaymentHero } from '../src/universal/BaselinePaymentHero';
import type { CurrentScreen } from '../src/experiences/pi/current/contracts';
import { Text } from '../src/universal/Typography';
import { BaselineBottomNavigation } from '../src/universal/BaselineBottomNavigation';
import { PaymentsSheet } from '../src/experiences/pi/current/baseline/payments/hub/Sheet';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import { BaselineAccordion } from '../src/universal/BaselineAccordion';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import { RoBaselinePaymentsScreen } from '../src/experiences/pi/current/baseline/payments/hub/Payments';
import Products from '../src/experiences/pi/current/baseline/offers/Products';
import More from '../src/experiences/pi/current/baseline/more/More';
import { BaselineL1Header } from '../src/universal/BaselineL1Header';

const viewport = {
  width: 951,
  height: 669,
  rightInset: 84,
  referenceWidth: 375,
};
const trees: Renderer.ReactTestRenderer[] = [];
function mount(
  screen: CurrentScreen,
  country: 'RO' | 'CZ' | 'SK' | 'HU' | 'RS' | 'SI' | 'BA' | 'BA_BL' = 'RO',
  geometry = viewport,
) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DuoPreviewProvider value={geometry}>
        <NativeCurrentApp
          country={country}
          release="release-current"
          scenario="active"
          screenTopInset={12}
          adapters={CURRENT_NATIVE_ADAPTERS}
          initialRoute={{ screen }}
        />
      </DuoPreviewProvider>,
    );
  });
  trees.push(tree);
  return tree;
}
afterEach(() => {
  for (const tree of trees) act(() => tree.unmount());
  trees.length = 0;
});

it.each([
  [{ width: 951, height: 669, rightInset: 84, referenceWidth: 375 }, 153.5],
  [{ width: 669, height: 951, rightInset: 0, referenceWidth: 375 }, 54.5],
] as const)(
  'aligns the bottom navigation background to the content in each open orientation',
  (geometry, left) => {
    const tree = mount('home', 'RO', geometry);
    const navigation = tree.root.findByType(BaselineBottomNavigation);
    expect(navigation.props.width).toBe(560);
    expect(StyleSheet.flatten(navigation.parent!.props.style)).toMatchObject({
      left,
      width: 560,
    });
  },
);

const baselineScreens = [
  'home',
  'account',
  'account-info',
  'account-options',
  'card',
  'card-info',
  'card-options',
  'transactions',
  'payments',
  'payment-create',
  'products',
  'product-detail',
  'pfm',
  'investments',
  'profile',
  'settings',
  'language',
  'documents',
  'messages',
  'contacts',
  'support',
  'appointments',
  'call-request',
  'prime',
  'prelogin',
  'login',
  'search',
] as const;
it.each(baselineScreens)(
  'contains the real %s screen in shared Duo geometry',
  screen => {
    const tree = mount(screen);
    expect(tree.root.findAllByType(DuoContentViewport).length).toBeGreaterThan(
      0,
    );
    const frames = tree.root
      .findAllByType(View)
      .filter(node => node.props.testID === 'duo-content-viewport');
    expect(frames.length).toBeGreaterThan(0);
    const frame = frames[0]!;
    const style = StyleSheet.flatten(frame.props.style);
    if (screen === 'pfm') {
      expect(style).toMatchObject({ left: 0, right: 0 });
    } else if (screen !== 'prelogin' && screen !== 'login') {
      expect(style).toMatchObject({ width: 560, height: 669 });
      expect(style.left + style.width).toBeLessThanOrEqual(867);
    }
    expect(
      tree.root
        .findAllByType(Text)
        .some(node => node.props.children === 'This screen is not migrated.'),
    ).toBe(false);
  },
);
it.each(baselineScreens)(
  'keeps %s within the open portrait viewport',
  screen => {
    const tree = mount(screen, 'RO', {
      width: 669,
      height: 951,
      rightInset: 0,
      referenceWidth: 375,
    });
    const frame = tree.root
      .findAllByType(View)
      .find(node => node.props.testID === 'duo-content-viewport');
    expect(frame).toBeDefined();
    const style = StyleSheet.flatten(frame!.props.style);
    if (screen === 'pfm') expect(style).toMatchObject({ left: 0, right: 0 });
    else if (screen !== 'prelogin' && screen !== 'login')
      expect(style).toMatchObject({ width: 560, height: 951, left: 54.5 });
    expect(
      tree.root
        .findAllByType(Text)
        .some(node => node.props.children === 'This screen is not migrated.'),
    ).toBe(false);
  },
);
it.each(['RO', 'CZ', 'SK', 'HU', 'RS', 'SI', 'BA', 'BA_BL'] as const)(
  'keeps country %s on its actual baseline composition',
  country => {
    const tree = mount('payments', country);
    expect(tree.root.findAllByType(BaselinePaymentHero).length).toBeGreaterThan(
      0,
    );
    expect(tree.root.findAllByType(BaselineBottomNavigation)).toHaveLength(1);
  },
);
it('retains real bounded card artwork rather than enlarging it to the glass', () => {
  const tree = mount('card');
  expect(tree.root.findAllByType(BaselineCardArtwork).length).toBeGreaterThan(
    0,
  );
});
it('keeps expandable Home groups in their linear source order', () => {
  const tree = mount('home');
  const columns = tree.root
    .findAllByType(View)
    .filter(node => node.props.testID === 'duo-columns');
  expect(
    columns.every(
      node => StyleSheet.flatten(node.props.style).flexDirection === 'column',
    ),
  ).toBe(true);
  const panes = tree.root
    .findAllByType(View)
    .filter(node => node.props.testID === 'duo-pane');
  expect(panes).toHaveLength(0);
  expect(
    tree.root
      .findAllByType(BaselineAccordion)
      .map(node => node.props.title)
      .slice(0, 2),
  ).toEqual(['Accounts', 'Cards']);
});
it('retains the actual signing step and PIN when moving from ordinary iPhone to Duo', () => {
  const app = (duo: boolean) => (
    <DuoPreviewProvider value={duo ? viewport : undefined}>
      <NativeCurrentApp
        country="RO"
        release="release-current"
        scenario="active"
        screenTopInset={duo ? 12 : 54}
        adapters={CURRENT_NATIVE_ADAPTERS}
        initialRoute={{ screen: 'product-detail' }}
      />
    </DuoPreviewProvider>
  );
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(app(false));
  });
  trees.push(tree);
  act(() => tree.root.findAllByType(PrimaryButton)[0]!.props.onPress());
  act(() => tree.root.findByType(BaselineTextField).props.onChange('7411'));
  act(() => tree.update(app(true)));
  expect(tree.root.findByType(BaselineTextField).props.value).toBe('7411');
  const signing = tree.root
    .findAllByType(View)
    .find(node => node.props.testID === 'ro-product-sign')!;
  expect(StyleSheet.flatten(signing.props.style)).toMatchObject({
    maxWidth: 560,
    alignSelf: 'center',
  });
  act(() => tree.root.findAllByType(PrimaryButton)[0]!.props.onPress());
  act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
  const success = tree.root
    .findAllByType(View)
    .find(node => node.props.testID === 'ro-product-success')!;
  expect(StyleSheet.flatten(success.props.style)).toMatchObject({
    maxWidth: 560,
    alignSelf: 'center',
  });
});
it('paints Spending full-width gray above Card Transactions and white below', () => {
  const tree = mount('pfm');
  const sections = tree.root
    .findAllByType(View)
    .filter(node => node.props.testID === 'duo-full-width-section');
  expect(sections.length).toBeGreaterThanOrEqual(3);
  const styles = sections
    .slice(0, 3)
    .map(node => StyleSheet.flatten(node.props.style));
  expect(styles[0]!.backgroundColor).toBe(styles[1]!.backgroundColor);
  expect(styles[0]!.backgroundColor).toBe('#F5F5F5');
  expect(styles[2]!.backgroundColor).toBe('#FFFFFF');
  expect(styles[2]).toMatchObject({ paddingLeft: 153.5, paddingRight: 237.5 });
});
it.each([false, true])(
  'keeps LVL1 Payments, Offers and More white with Duo=%s',
  duo => {
    for (const [screen, Component] of [
      ['payments', RoBaselinePaymentsScreen],
      ['products', Products],
      ['profile', More],
    ] as const) {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <DuoPreviewProvider value={duo ? viewport : undefined}>
            <NativeCurrentApp
              country="RO"
              release="release-current"
              scenario="active"
              initialMode="light"
              screenTopInset={54}
              adapters={CURRENT_NATIVE_ADAPTERS}
              initialRoute={{ screen }}
            />
          </DuoPreviewProvider>,
        );
      });
      trees.push(tree);
      const actual = tree.root.findByType(Component);
      const page = actual.findAllByType(View)[0]!;
      expect(StyleSheet.flatten(page.props.style).backgroundColor).toBe(
        '#FFFFFF',
      );
      const header = actual.findAllByType(BaselineL1Header)[0]!;
      expect(header.props.backgroundColor ?? '#FFFFFF').toBe('#FFFFFF');
    }
  },
);
it('keeps Payments banners in their baseline vertical order', () => {
  const tree = mount('payments');
  const tiles = tree.root
    .findAllByType(View)
    .filter(node => node.props.testID === 'duo-payment-tile');
  expect(tiles.length).toBeGreaterThan(1);
  expect(
    tiles.every(node => StyleSheet.flatten(node.props.style).width === '100%'),
  ).toBe(true);
});
it('sizes a payment sheet independently of its wide parent screen', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DuoPreviewProvider value={viewport}>
        <DuoContentViewport screen="payments">
          <PaymentsSheet title="Payment" dark={false} onClose={jest.fn()}>
            <Text>Payment choices</Text>
          </PaymentsSheet>
        </DuoContentViewport>
      </DuoPreviewProvider>,
    );
  });
  trees.push(tree);
  expect(tree.root.findByType(BaselineBottomSheet).props.width).toBe(560);
  expect(tree.root.findByType(BaselineBottomSheet).props.height).toBe(669);
});
it('keeps the selected real card when closing the device', () => {
  const counts = {
    accounts: 2,
    debitCards: 2,
    creditCards: 1,
    mealCards: 0,
    deposits: 1,
    savingsAccounts: 1,
    loans: 1,
    mortgages: 1,
    investments: 1,
  };
  const app = (closed: boolean) => (
    <DuoPreviewProvider
      value={closed ? { ...viewport, width: 466, height: 678 } : viewport}
    >
      <NativeCurrentApp
        country="RO"
        release="release-current"
        scenario="active"
        screenTopInset={12}
        bankingScenario="retail-multi-account-card"
        productCounts={counts}
        adapters={CURRENT_NATIVE_ADAPTERS}
        initialRoute={{ screen: 'card' }}
      />
    </DuoPreviewProvider>
  );
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(app(false));
  });
  trees.push(tree);
  const cards = tree.root.findAll(
    node =>
      node.props.testID?.startsWith('ro-card-carousel-') &&
      typeof node.props.onPress === 'function',
  );
  expect(cards.length).toBeGreaterThan(1);
  const id = cards[1]!.props.testID;
  const selected = () =>
    tree.root.findAll(
      node =>
        node.props.testID === id && typeof node.props.onPress === 'function',
    )[0];
  act(() => selected()!.props.onPress());
  expect(selected()!.props.accessibilityState.selected).toBe(true);
  act(() => tree.update(app(true)));
  expect(selected()!.props.accessibilityState.selected).toBe(true);
});
