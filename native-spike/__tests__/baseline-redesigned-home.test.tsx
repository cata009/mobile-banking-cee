import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import { getCurrencySymbol } from '@/app/registry/countryConfig';
import { isAccountDetailProduct } from '@/data/products';
import {
  createCurrentProducts,
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineAmountVisibility } from '../src/universal/BaselineAmountVisibility';
import { BaselineHomeBody } from '../src/experiences/pi/current/baseline/Body';
import { BaselineProductCard } from '../src/universal/BaselineProductCard';
import RedesignedBaselineHome from '../src/experiences/pi/current/baseline/redesigned-home';

const contexts = [
  { country: 'RO', release: 'release-v2' },
  { country: 'RO', release: 'release-v3' },
  { country: 'RO', release: 'release-v4' },
  { country: 'CZ', release: 'release-v2' },
  { country: 'CZ', release: 'release-v3' },
  { country: 'CZ', release: 'release-v4' },
] as const;

function host(
  context: (typeof contexts)[number],
  overrides: Partial<CurrentScreenProps> = {},
): CurrentScreenProps {
  return {
    ...context,
    scenario: 'active',
    language: 'en',
    productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES },
    route: { screen: 'home' },
    tokens: currentTokens(),
    t: createCurrentTranslator(context.country, 'en'),
    amountsHidden: false,
    screenTopInset: 54,
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
    ...overrides,
  };
}

const mounted = new Set<Renderer.ReactTestRenderer>();
function render(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  mounted.add(tree);
  return tree;
}

afterEach(() => {
  for (const tree of mounted) act(() => tree.unmount());
  mounted.clear();
});

function collectText(
  node:
    | Renderer.ReactTestRendererJSON
    | Renderer.ReactTestRendererJSON[]
    | string
    | null,
): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(collectText).join('');
  return node ? (node.children ?? []).map(collectText).join('') : '';
}

const treeText = (tree: Renderer.ReactTestRenderer) =>
  collectText(tree.toJSON());

function button(tree: Renderer.ReactTestRenderer, label: string) {
  const found = tree.root.findAll(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === label,
  )[0];
  if (!found) throw new Error(`Expected Source button: ${label}`);
  return found;
}

describe.each(contexts)(
  'redesigned baseline Home for $country/$release',
  context => {
    it('matches the Source transparent background beneath the redesign gradient', () => {
      const tree = render(<BaselineHomeBody host={host(context)} redesigned />);
      const summary = tree.root
        .findAllByType(View)
        .map(node => StyleSheet.flatten(node.props.style))
        .find(style => style?.backgroundImage?.startsWith('linear-gradient('));
      expect(summary?.backgroundColor).toBe('transparent');
    });
    it('keeps the Source summary and authoritative product data for its release', () => {
      const value = host(context, {
          t: key =>
            key === 'home.totalBalance'
              ? 'Total Balance'
              : key === 'home.totalAvailable'
              ? 'Total Available'
              : key,
        }),
        model = createCurrentProducts(value),
        tree = render(<RedesignedBaselineHome host={value} />),
        body = tree.root.findByType(BaselineHomeBody),
        cards = tree.root.findAllByType(BaselineProductCard),
        content = treeText(tree);

      expect(body.props.host).toBe(value);
      expect(body.props.redesigned).toBe(true);
      expect(content).toContain('Total Balance');
      expect(content).toContain('Redesigned card layout');
      expect(content).not.toContain('Quick actions');
      expect(cards.map(card => card.props.title)).toEqual(
        model.products.map(product => product.name),
      );
      expect(cards.map(card => card.props.currency)).toEqual(
        model.products.map(
          product => model.formatProductAmount(product).currency,
        ),
      );
      expect(content).toContain(
        `${model.calculateTotalAvailable().decimals} ${getCurrencySymbol(
          value.country,
        )}`,
      );
      expect(content).toContain(model.calculateTotalAvailable().integer);
      expect(content).toContain(model.calculateTotalOwed().integer);
    });

    it('preserves card, account, and investment navigation and inert meal cards', () => {
      const value = host(context),
        model = createCurrentProducts(value),
        tree = render(<RedesignedBaselineHome host={value} />),
        cards = tree.root.findAllByType(BaselineProductCard);

      for (const [index, product] of model.products.entries()) {
        const card = cards[index]!;
        if (product.type === 'meal_card') {
          expect(card.props.onPress).toBeUndefined();
          continue;
        }
        expect(typeof card.props.onPress).toBe('function');
        act(() => card.props.onPress());
        expect(value.onNavigate).toHaveBeenLastCalledWith(
          product.type === 'investment_account'
            ? { screen: 'investments' }
            : product.type === 'debit_card' || product.type === 'credit_card'
            ? {
                screen: 'card',
                params: { productId: product.id, cardId: product.id },
              }
            : isAccountDetailProduct(product)
            ? {
                screen: 'account',
                params: { productId: product.id, accountId: product.id },
              }
            : undefined,
        );
      }

      expect(value.onBack).not.toHaveBeenCalled();
    });
  },
);

it('keeps header actions and caller-owned amount privacy', () => {
  const context = contexts[0]!,
    value = host(context),
    tree = render(<RedesignedBaselineHome host={value} />);

  expect(tree.root.findAllByType(BaselineAmountVisibility)).toHaveLength(1);
  act(() => button(tree, 'Hide amounts').props.onPress());
  expect(value.onAmountsToggle).toHaveBeenCalledTimes(1);
  act(() => {
    button(tree, 'Prime').props.onPress();
    button(tree, 'Messages').props.onPress();
    button(tree, 'Profile').props.onPress?.();
  });
  expect(value.onNavigate).toHaveBeenNthCalledWith(1, { screen: 'prime' });
  expect(value.onNavigate).toHaveBeenNthCalledWith(2, { screen: 'messages' });
  expect(value.onProfile).not.toHaveBeenCalled();
  expect(value.onBack).not.toHaveBeenCalled();

  const hidden = { ...value, amountsHidden: true };
  act(() => tree.update(<RedesignedBaselineHome host={hidden} />));
  const hiddenCards = tree.root.findAllByType(BaselineProductCard);
  const expected = createCurrentProducts(hidden).formatProductAmount(
    createCurrentProducts(hidden).products[0]!,
  );
  expect(hiddenCards[0]!.props.amount).toBe(
    maskAmountParts(expected, true).integer,
  );
  expect(tree.root.findByType(BaselineAmountVisibility).props.hidden).toBe(
    true,
  );
});
