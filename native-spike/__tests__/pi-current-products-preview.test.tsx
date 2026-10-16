import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import Products from '../src/experiences/pi/current/baseline/offers/Products';
import type {
  NativeProductsPreview,
  NativeProductsPreviewAction,
} from '../../src/features/demo-native/productsPreviewContracts';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { NATIVE_PRODUCTS_PREVIEW_ADAPTER } from '../src/experiences/pi/current/baseline/offers/NativeProductPreviewAdapter';
import { BaselineProductMenuCard } from '../src/universal/BaselineProductMenuCard';
import { BaselineSearchBar } from '../src/universal/BaselineSearchBar';
import { BaselineShopsmartOfferCard } from '../src/universal/BaselineShopsmartOfferCard';

type PreviewHost = CurrentScreenProps & {
  productsPreview: NativeProductsPreview;
  onProductsPreviewAction: (action: NativeProductsPreviewAction) => void;
};

function host(
  productsPreview: NativeProductsPreview,
  onProductsPreviewAction = jest.fn(),
  country: CurrentScreenProps['country'] = 'RO',
  extra: Partial<PreviewHost> = {},
): PreviewHost {
  return {
    country,
    release: 'release-current',
    scenario: 'active',
    bankingScenario: 'retail-single-account',
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
    route: { screen: 'products' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
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
    productsPreview,
    onProductsPreviewAction,
    ...extra,
  } as PreviewHost;
}

function mount(productsPreview: NativeProductsPreview, onAction = jest.fn()) {
  const screen = NATIVE_PRODUCTS_PREVIEW_ADAPTER.screens.products!;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      React.createElement(screen, host(productsPreview, onAction)),
    );
  });
  return { tree, onAction };
}

it('renders only the Native products header region and forwards its message action', () => {
  const { tree, onAction } = mount({
    region: 'products-header',
    title: 'Native Products',
  });
  try {
    const output = JSON.stringify(tree.toJSON());
    expect(output).toContain('Native Products');
    expect(output).not.toContain('ro-offers-top-reserve');
    expect(output).not.toContain('ro-offers-content');
    expect(output).not.toContain('nav-home');

    const message = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Messages' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    act(() => message.props.onPress());
    expect(onAction).toHaveBeenCalledWith({
      type: 'header-action',
      action: 'messages',
    });
  } finally {
    act(() => tree.unmount());
  }
});

it('renders Native products tabs as a controlled region and emits the selected tab', () => {
  const { tree, onAction } = mount({
    region: 'products-tabs',
    activeTab: 'banking',
    bankingLabel: 'Banking from Source',
    shopSmartLabel: 'ShopSmart from Source',
  });
  try {
    expect(JSON.stringify(tree.toJSON())).toContain('Banking from Source');
    expect(JSON.stringify(tree.toJSON())).toContain('ShopSmart from Source');
    const shopSmart = tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'tab' &&
        node.props.accessibilityLabel === 'ShopSmart from Source',
    )[0]!;
    act(() => shopSmart.props.onPress());
    expect(onAction).toHaveBeenCalledWith({
      type: 'tab-change',
      tab: 'shopsmart',
    });
  } finally {
    act(() => tree.unmount());
  }
});

it('renders injected banking section data through the Native catalog and emits product-card IDs', () => {
  const { tree, onAction } = mount({
    region: 'products-banking',
    offersTitle: 'Offers from Source',
    offers: [],
    productsTitle: 'Products from Source',
    products: [
      {
        id: 'account',
        title: 'Account card from Source',
        background: 'var(--uc-product-blue-deep)',
        illustration: 'arrow',
      },
    ],
    otherSolutionsTitle: 'Other solutions from Source',
    otherSolutions: [],
  });
  try {
    const output = JSON.stringify(tree.toJSON());
    expect(output).toContain('Products from Source');
    expect(output).toContain('Account card from Source');
    expect(output).not.toContain('ro-offers-top-reserve');
    expect(output).not.toContain('ro-offers-content');

    act(() => tree.root.findByType(BaselineProductMenuCard).props.onPress());
    expect(onAction).toHaveBeenCalledWith({
      type: 'product-card-open',
      cardId: 'account',
    });
  } finally {
    act(() => tree.unmount());
  }
});

it('renders injected ShopSmart data through Native search and offer-card components', () => {
  const { tree, onAction } = mount({
    region: 'products-shopsmart',
    summary: {
      activatedOffers: 2,
      totalSavedLabel: 'Saved from Source',
      totalSavedAmount: '42,00 RON',
    },
    offerCards: [
      {
        id: 'preview-merchant',
        categories: ['travel'],
        merchant: 'Preview Merchant',
        title: 'Preview offer title',
        statusText: 'Until tomorrow',
        imageSrc: '/preview-merchant.png',
        pillLabel: 'Activate',
        pillTone: 'teal',
      },
    ],
  });
  try {
    const output = JSON.stringify(tree.toJSON());
    expect(output).toContain('Saved from Source');
    expect(output).toContain('42,00 RON');
    expect(output).toContain('Preview Merchant');
    expect(tree.root.findAllByType(BaselineShopsmartOfferCard)).toHaveLength(1);

    act(() =>
      tree.root
        .findByType(BaselineSearchBar)
        .props.onValueChange('nothing matches'),
    );
    expect(tree.root.findAllByType(BaselineShopsmartOfferCard)).toHaveLength(0);
    expect(onAction).toHaveBeenCalledWith({
      type: 'search-change',
      query: 'nothing matches',
    });
  } finally {
    act(() => tree.unmount());
  }
});

it('uses the canonical focus request to open the matching card and notify the host', () => {
  const onProductsShelfFocusHandled = jest.fn();
  const input = host(
    { region: 'products-header', title: 'unused in the standard route' },
    jest.fn(),
    'RO',
    {
      route: { screen: 'products' },
      productsShelfFocusRequest: { requestId: 17, cardId: 'account' },
      onProductsShelfFocusHandled,
    },
  );
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(React.createElement(Products, input));
  });
  try {
    expect(onProductsShelfFocusHandled).toHaveBeenCalledTimes(1);
    expect(
      tree.root.findByProps({ testID: 'ro-products-card-sheet' }),
    ).toBeDefined();
  } finally {
    act(() => tree.unmount());
  }
});
