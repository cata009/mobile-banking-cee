import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image, Platform } from 'react-native';
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineProductMenuCard } from '../src/universal/BaselineProductMenuCard';
import Products from '../src/experiences/pi/current/baseline/offers/Products';
import ShopSmart from '../src/experiences/pi/current/baseline/offers/ShopSmart';
import ProductSheet from '../src/experiences/pi/current/baseline/offers/ProductSheet';
import { RasterImage } from '../src/experiences/pi/current/baseline/offers/RasterImage';
import {
  RoOffersCatalog,
  RoOfferCard,
  offerSnapOffsets,
  localized,
} from '../src/experiences/pi/current/baseline/offers/Catalog';

function host(language: 'en' | 'ro' = 'en'): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language,
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
    t: createCurrentTranslator('RO', language),
    amountsHidden: false,
    screenTopInset: 12,
    isActive: true,
    mode: 'light',
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
  };
}

it('preserves Romanian banking order and complete card selection while offer taps stay on Offers', () => {
  const h = host(),
    select = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <RoOffersCatalog host={h} onProductCardPress={select} />,
    );
  });
  try {
    const cards = tree.root.findAllByType(BaselineProductMenuCard);
    expect(cards.map(card => card.props.card.id)).toEqual([
      'account',
      'cards',
      'mortgages-loans',
      'investments-savings',
      'insurance',
    ]);
    const expected = getProductsMenuForCountry('RO').products[3];
    act(() => cards[3].props.onPress());
    expect(select).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expected.id,
        background: expected.background,
        imageSrc: expected.imageSrc,
      }),
    );
    const offers = tree.root.findAllByType(RoOfferCard);
    expect(offers.map(offer => offer.props.offer.id)).toEqual([
      'ro-offer-1',
      'ro-offer-2',
      'ro-offer-3',
    ]);
    act(() => offers[1].props.onPress());
    expect(h.onNavigate).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});

it('uses Romanian title translations and the source fallback for missing keys', () => {
  const h = host('ro');
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <RoOffersCatalog host={h} onProductCardPress={() => {}} />,
    );
  });
  try {
    const cards = tree.root.findAllByType(BaselineProductMenuCard);
    expect(cards[0].props.card.title).toBe(
      h.t('runtime.productsMenu.cards.account', 'Account'),
    );
    expect(tree.root.findAllByType(RoOfferCard)[0].props.offer.title).toBe(
      h.t(
        'runtime.productsMenu.offers.ro-offer-1.title',
        'Premium current\naccount offer',
      ),
    );
    expect(localized({ ...h, t: key => key }, 'missing', 'Source label')).toBe(
      'Source label',
    );
  } finally {
    act(() => tree.unmount());
  }
});

it('uses source edge-clamped scroll targets at 375 and 393 widths', () => {
  expect(offerSnapOffsets(3, 375)).toEqual([0, 339, 678]);
  expect(offerSnapOffsets(3, 393)).toEqual([0, 330, 660]);
  expect(offerSnapOffsets(1, 375)).toEqual([0]);
  expect(offerSnapOffsets(0, 375)).toEqual([]);
  expect(offerSnapOffsets(3, 1200)).toEqual([0, 0, 0]);
});

it('switches to the source ShopSmart body without banners and handles sheet Back before navigating', () => {
  const h = { ...host(), onBackHandlerChange: jest.fn() };
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Products {...h} />);
  });
  try {
    const shopTab = tree.root
      .findAll(
        node =>
          node.props.accessibilityRole === 'tab' &&
          typeof node.props.onPress === 'function',
      )
      .find(node => node.props.accessibilityLabel === 'ShopSmart')!;
    act(() => shopTab.props.onPress());
    expect(tree.root.findAllByType(ShopSmart)).toHaveLength(1);
    expect(tree.root.findAllByType(RoOfferCard)).toHaveLength(0);
    const bankTab = tree.root
      .findAll(
        node =>
          node.props.accessibilityRole === 'tab' &&
          typeof node.props.onPress === 'function',
      )
      .find(node => node.props.accessibilityLabel === 'Banking')!;
    act(() => bankTab.props.onPress());
    act(() =>
      tree.root.findAllByType(BaselineProductMenuCard)[0].props.onPress(),
    );
    expect(tree.root.findByType(ProductSheet).props.card.id).toBe('account');
    const back = h.onBackHandlerChange.mock.calls.at(-1)![0];
    act(() => {
      expect(back()).toBe(true);
    });
    expect(tree.root.findAllByType(ProductSheet)).toHaveLength(0);
    expect(h.onNavigate).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});

it.each(['web', 'android'] as const)(
  'preserves source merchant asset identity and image labels on %s',
  platform => {
    const previousPlatform = Platform.OS;
    Platform.OS = platform;
    const offer = getProductsMenuForCountry('RO').shopSmartOfferCards[0];
    const source =
      typeof offer.imageSrc === 'number'
        ? offer.imageSrc
        : { uri: offer.imageSrc };
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <RasterImage source={source} accessibilityLabel={offer.merchant} />,
      );
    });
    try {
      if (platform === 'web') {
        const image = tree.root.findByType('img');
        const resolved =
          typeof source === 'number'
            ? Image.resolveAssetSource(source)
            : source;
        expect(resolved).toBeDefined();
        expect(image.props.src).toBe(resolved?.uri);
        expect(image.props.alt).toBe(offer.merchant);
      } else {
        const image = tree.root.findByType(Image);
        expect(image.props.source).toBe(source);
        expect(image.props.accessibilityLabel).toBe(offer.merchant);
      }
    } finally {
      act(() => tree.unmount());
      Platform.OS = previousPlatform;
    }
  },
);
