import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import ShopSmart from '../src/experiences/pi/current/baseline/offers/ShopSmart';
import { BaselineShopsmartOfferCard } from '../src/universal/BaselineShopsmartOfferCard';
import { BaselineSearchBar } from '../src/universal/BaselineSearchBar';
import { RasterImage } from '../src/experiences/pi/current/baseline/offers/RasterImage';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

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
    route: { screen: 'products' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: true,
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
  };
}
function mount(h = host()) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<ShopSmart host={h} />);
  });
  return tree;
}
const merchants = (tree: Renderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(BaselineShopsmartOfferCard)
    .map(card => card.props.merchant);

it('renders the canonical RO offer order and summary even with amount privacy enabled', () => {
  const tree = mount();
  try {
    expect(merchants(tree)).toEqual([
      'Valentino.ro',
      'Lentiamo.ro',
      'English home',
      'DATART',
      'Booking.com',
      'IKEA',
    ]);
    const content = JSON.stringify(tree.toJSON());
    expect(content).toContain('ACTIVATED OFFERS:');
    expect(content).toContain('Total saved');
    expect(content).toContain('0,00 RON');
    expect(content).not.toContain('***');
    const cards = tree.root.findAllByType(BaselineShopsmartOfferCard);
    expect(cards[0].props.title).toBe('Up to 10% cashback peste\n500 de Lei');
    expect(cards[0].props.pillLabel).toBe('Active');
    expect(cards[2].props.pillLabel).toBe('Activate');
    expect(cards[2].props.distance).toBe('2,69 km');
    expect(cards[3].props.title).toBe('15% cashback on tech\nabove 2,000 CZK');
    expect(cards[0].props.imageHeight).toBe(130);
    expect(
      StyleSheet.flatten(
        tree.root.findAllByProps({ testID: 'ro-offers-shopsmart-content' })[0]
          .props.style,
      ),
    ).toMatchObject({ paddingTop: 16, gap: 16 });
  } finally {
    act(() => tree.unmount());
  }
});

it('renders each original offer photo through the Source raster image layer at the card crop', () => {
  const tree = mount();
  try {
    const cards = tree.root.findAllByType(BaselineShopsmartOfferCard);
    const photos = tree.root.findAllByType(RasterImage);
    expect(photos).toHaveLength(6);
    photos.forEach((photo, index) => {
      expect(photo.props.accessibilityLabel).toBe(cards[index].props.merchant);
      expect(photo.props.source).toEqual(
        typeof cards[index].props.imageSrc === 'number'
          ? cards[index].props.imageSrc
          : { uri: cards[index].props.imageSrc },
      );
      expect(photo.props.resizeMode).toBe('cover');
      expect(StyleSheet.flatten(photo.props.style)).toMatchObject({
        width: '100%',
        height: '100%',
      });
    });
  } finally {
    act(() => tree.unmount());
  }
});

it('searches hidden partner tags and distances, trims case, and clears an empty result', () => {
  const tree = mount();
  try {
    const search = () => tree.root.findByType(BaselineSearchBar);
    act(() => search().props.onValueChange('  vALENTINO  '));
    expect(merchants(tree)).toEqual(['Valentino.ro']);
    act(() => search().props.onValueChange('15% OFF'));
    expect(merchants(tree)).toEqual(['DATART']);
    act(() => search().props.onValueChange('2,69'));
    expect(merchants(tree)).toEqual(['English home']);
    act(() => search().props.onValueChange('no-such-merchant'));
    expect(merchants(tree)).toEqual([]);
    expect(JSON.stringify(tree.toJSON())).toContain('No offers found');
    const clear = tree.root.findAll(
      node =>
        typeof node.props.onPress === 'function' &&
        node.props.accessibilityLabel === 'Clear search results',
    )[0];
    act(() => clear.props.onPress());
    expect(merchants(tree)).toHaveLength(6);
    expect(search().props.value).toBe('');
  } finally {
    act(() => tree.unmount());
  }
});

it('keeps the Source summary, filter and offers inert and uses localized search labels', () => {
  const h = host();
  h.t = (key, fallback) =>
    ({
      'runtime.productsMenu.allOffers': 'TOATE OFERTELE',
      'runtime.actions.search': 'Caută',
      'runtime.actions.filters': 'Filtre',
    }[key] ??
    fallback ??
    key);
  const tree = mount(h);
  try {
    const summary = tree.root.findAllByProps({
      testID: 'ro-offers-shopsmart-summary',
    })[0];
    act(() => summary.props.onPress());
    act(() => tree.root.findByType(BaselineSearchBar).props.onFilterClick());
    tree.root
      .findAllByType(BaselineShopsmartOfferCard)
      .forEach(card => act(() => card.props.onPress()));
    expect(h.onNavigate).not.toHaveBeenCalled();
    expect(h.onChanged).not.toHaveBeenCalled();
    expect(h.onAmountsToggle).not.toHaveBeenCalled();
    expect(merchants(tree)).toHaveLength(6);
    expect(tree.root.findByType(BaselineSearchBar).props.placeholder).toBe(
      'Caută',
    );
    expect(tree.root.findByType(BaselineSearchBar).props.trailingLabel).toBe(
      'Filtre',
    );
    expect(JSON.stringify(tree.toJSON())).toContain('TOATE OFERTELE');
  } finally {
    act(() => tree.unmount());
  }
});
