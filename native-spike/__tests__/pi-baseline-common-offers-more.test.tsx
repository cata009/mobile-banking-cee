import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import type { CountryId } from '@/app/state/demoTypes';
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig';
import { getProductCardSheetConfig } from '@/app/config/productsMenuConfig';
import { getTutorialsForCountry } from '@/app/config/tutorialsConfig';
import { getDocumentsCountForCountry } from '@/app/config/documentsConfig';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import More, {
  RoMoreCard,
} from '../src/experiences/pi/current/baseline/more/More';
import Tutorials from '../src/experiences/pi/current/baseline/more/Tutorials';
import Products from '../src/experiences/pi/current/baseline/offers/Products';
import ShopSmart from '../src/experiences/pi/current/baseline/offers/ShopSmart';
import ProductSheet from '../src/experiences/pi/current/baseline/offers/ProductSheet';
import { RoOfferCard } from '../src/experiences/pi/current/baseline/offers/Catalog';
import { BaselineProductMenuCard } from '../src/universal/BaselineProductMenuCard';
import { BaselineShopsmartOfferCard } from '../src/universal/BaselineShopsmartOfferCard';
import { BaselineHeaderActionButton } from '../src/universal/BaselineHeaderActions';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';

const countries = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const;

it('centers the original third-party phone at its fixed Source size before transforming it', () => {
  const tree = mount(
    <RoMoreCard
      card="third-party-consent"
      title="Third party consent"
      width={164}
      dark={false}
      onPress={jest.fn()}
    />,
  );
  try {
    const artwork = tree.root.findByProps({
      testID: 'ro-more-third-party-artwork',
    });
    expect(StyleSheet.flatten(artwork.props.style)).toMatchObject({
      width: 151,
      height: 158.373,
      flexShrink: 0,
      transform: [{ rotate: '-156deg' }, { scaleY: -1 }],
    });
  } finally {
    act(() => tree.unmount());
  }
});
function host(country: CountryId): CurrentScreenProps {
  return {
    country,
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
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 0,
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
function mount(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  return tree;
}

it.each([
  ['RO', ['contacts', 'documents', 'settings', 'gdpr-consent', 'tutorial']],
  [
    'HU',
    [
      'contacts',
      'documents',
      'settings',
      'third-party-consent',
      'tutorial',
      'my-requests',
    ],
  ],
  [
    'RS',
    [
      'contacts',
      'documents',
      'settings',
      'third-party-consent',
      'my-requests',
      'tutorial',
    ],
  ],
  [
    'SI',
    [
      'contacts',
      'documents',
      'settings',
      'third-party-consent',
      'my-requests',
      'tutorial',
    ],
  ],
  [
    'CZ',
    [
      'contacts',
      'documents',
      'settings',
      'third-party-consent',
      'digital-activities',
      'my-requests',
      'tutorial',
    ],
  ],
  [
    'SK',
    [
      'contacts',
      'documents',
      'settings',
      'third-party-consent',
      'digital-activities',
      'my-requests',
      'tutorial',
    ],
  ],
  ['BA', ['contacts', 'documents', 'settings', 'tutorial', 'my-requests']],
  ['BA_BL', ['contacts', 'documents', 'settings', 'tutorial', 'my-requests']],
] as const)(
  'renders Source %s More order and document count',
  (country, order) => {
    const tree = mount(<More {...host(country)} />);
    try {
      expect(
        tree.root.findAllByType(RoMoreCard).map(card => card.props.card),
      ).toEqual(order);
      expect(
        tree.root.findByProps({ testID: 'ro-more-documents-badge' }).props
          .children,
      ).toBe(getDocumentsCountForCountry(country));
    } finally {
      act(() => tree.unmount());
    }
  },
);

it.each(countries)(
  'uses Source %s servicing header composition in both shared screens',
  country => {
    for (const Screen of [More, Products]) {
      const h = host(country),
        tree = mount(<Screen {...h} />);
      try {
        const actions = tree.root.findAllByType(BaselineHeaderActionButton);
        const bosnia = country === 'BA' || country === 'BA_BL';
        expect(actions.map(action => action.props.icon)).toEqual(
          bosnia
            ? ['contact-phone', 'messages']
            : Screen === More
            ? ['profile', 'messages', 'logout']
            : ['profile', 'messages', 'help'],
        );
        if (bosnia) {
          act(() => actions[0].props.onPress());
          expect(h.onNavigate).toHaveBeenCalledWith({ screen: 'contacts' });
        }
        act(() => actions[1].props.onPress());
        expect(h.onNavigate).toHaveBeenLastCalledWith({ screen: 'messages' });
      } finally {
        act(() => tree.unmount());
      }
    }
  },
);

it.each(countries)(
  'keeps the Source %s tutorial content including the Romanian BNR override',
  country => {
    const tree = mount(<Tutorials host={host(country)} onClose={jest.fn()} />);
    try {
      const topics = [
        ...new Set(
          tree.root
            .findAll(node =>
              node.props.accessibilityLabel?.startsWith('Open tutorial:'),
            )
            .map(node => node.props.accessibilityLabel),
        ),
      ];
      expect(topics).toEqual(
        getTutorialsForCountry(country).map(
          topic => `Open tutorial: ${topic.title}`,
        ),
      );
      expect(topics.some(topic => topic.includes('BNR'))).toBe(
        country === 'RO',
      );
    } finally {
      act(() => tree.unmount());
    }
  },
);

it.each(countries)(
  'renders the canonical %s product catalog without copying the RO order',
  country => {
    const tree = mount(<Products {...host(country)} />),
      config = getProductsMenuForCountry(country);
    try {
      expect(
        tree.root.findAllByType(RoOfferCard).map(card => card.props.offer.id),
      ).toEqual(config.offers.map(offer => offer.id));
      expect(
        tree.root
          .findAllByType(BaselineProductMenuCard)
          .map(card => card.props.card.id),
      ).toEqual(
        [...config.products, ...config.otherSolutions].map(card => card.id),
      );
      expect(
        tree.root.findAll(
          node =>
            node.props.accessibilityRole === 'tab' &&
            typeof node.props.onPress === 'function',
        ).length > 0,
      ).toBe(config.hasShopSmartTab);
      if (country === 'BA' || country === 'BA_BL' || country === 'SI') {
        expect(tree.root.findAllByType(RoOfferCard)).toHaveLength(0);
        expect(
          tree.root
            .findAllByType(BaselineProductMenuCard)
            .map(card => card.props.card.id),
        ).not.toContain('insurance');
      }
      if (country === 'CZ' || country === 'SK') {
        expect(
          tree.root
            .findAllByType(BaselineProductMenuCard)
            .map(card => card.props.card.id),
        ).toContain('additional-services');
      }
    } finally {
      act(() => tree.unmount());
    }
  },
);

it.each(['RO', 'HU', 'CZ', 'SK'] as const)(
  'uses the %s ShopSmart summary and original offer data',
  country => {
    const tree = mount(<ShopSmart host={host(country)} />),
      config = getProductsMenuForCountry(country);
    try {
      expect(
        tree.root
          .findAllByType(BaselineShopsmartOfferCard)
          .map(card => card.props.merchant),
      ).toEqual(config.shopSmartOfferCards.map(offer => offer.merchant));
      expect(JSON.stringify(tree.toJSON())).toContain(
        config.shopSmartSummary.totalSavedAmount,
      );
    } finally {
      act(() => tree.unmount());
    }
  },
);

it.each(['RO', 'RS'] as const)(
  'keeps %s card-sheet options and routes the selected canonical option',
  country => {
    const h = host(country),
      card = getProductsMenuForCountry(country).products.find(
        item => item.id === 'cards',
      )!,
      onClose = jest.fn();
    const tree = mount(<ProductSheet host={h} card={card} onClose={onClose} />);
    try {
      const rows = tree.root.findAllByType(BaselineNavigationRow),
        options = getProductCardSheetConfig('cards', country).options;
      expect(rows.map(row => row.props.title)).toEqual(
        options.map(option => option.title),
      );
      expect(rows[1].props.title).toBe(
        country === 'RO'
          ? 'Credit card UniCredit Consumer Financing'
          : 'Credit card',
      );
      act(() => rows[1].props.onPress());
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(h.onNavigate).toHaveBeenCalledWith({
        screen: 'product-detail',
        params: {
          title: options[1].title,
          cardId: 'cards',
          optionId: options[1].id,
        },
      });
    } finally {
      act(() => tree.unmount());
    }
  },
);
