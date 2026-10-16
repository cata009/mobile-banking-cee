import React from 'react';
import { Image } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { BaselineHomeBody } from '../src/experiences/pi/current/baseline/Body';
import {
  createCurrentProducts,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineAccordion } from '../src/universal/BaselineAccordion';
import { BaselineProductsList } from '../src/universal/BaselineProductsList';
import { BaselineProductCard } from '../src/universal/BaselineProductCard';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import type { ProductCounts } from '@/app/state/demoTypes';

const emptyCounts: ProductCounts = {
  accounts: 0,
  debitCards: 0,
  creditCards: 0,
  mealCards: 0,
  deposits: 0,
  savingsAccounts: 0,
  loans: 0,
  mortgages: 0,
  investments: 0,
};
function host(overrides: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES },
    route: { screen: 'home' },
    tokens: currentTokens(),
    t: (key, fallback) =>
      key === 'home.totalAvailable' ? 'Total Available' : fallback ?? key,
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
    ...overrides,
  };
}
function renderBody(value: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<BaselineHomeBody host={value} />);
  });
  return tree;
}
describe('scoped RO current Native Home body', () => {
  it('uses the canonical model and caller-owned privacy for all product figures', () => {
    const context = host(),
      model = createCurrentProducts(context),
      tree = renderBody(context);
    const cards = tree.root.findAllByType(BaselineProductCard);
    expect(cards).toHaveLength(model.products.length);
    for (const [index, product] of model.products.entries()) {
      const amount = model.formatProductAmount(product);
      expect(cards[index].props).toMatchObject({
        title: product.name,
        accountNumber: model.getProductDisplayNumber(product),
        amount: amount.integer,
        decimals: amount.decimals,
        currency: amount.currency,
        variant: 'legacy',
      });
    }
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain(model.calculateTotalAvailable().integer);
    expect(json).toContain(model.calculateTotalOwed().integer);
    act(() => {
      tree.update(
        <BaselineHomeBody host={{ ...context, amountsHidden: true }} />,
      );
    });
    for (const [index, product] of model.products.entries()) {
      const amount = maskAmountParts(model.formatProductAmount(product), true);
      expect(
        tree.root.findAllByType(BaselineProductCard)[index].props,
      ).toMatchObject({
        amount: amount.integer,
        decimals: amount.decimals,
        currency: amount.currency,
      });
    }
    expect(JSON.stringify(tree.toJSON())).not.toContain(
      model.calculateTotalAvailable().integer,
    );
    act(() => tree.unmount());
  });
  it.each([0, 1, 2])(
    'keeps source category-count behavior for %s accounts',
    accounts => {
      const context = host({ productCounts: { ...emptyCounts, accounts } }),
        tree = renderBody(context);
      expect(tree.root.findAllByType(BaselineAccordion)).toHaveLength(
        accounts ? 1 : 0,
      );
      expect(tree.root.findAllByType(BaselineProductCard)).toHaveLength(
        accounts,
      );
      if (accounts) {
        const section = tree.root.findByType(BaselineAccordion);
        const controls = section.findAll(
          node =>
            node.props?.accessibilityRole === 'button' &&
            typeof node.props.onPress === 'function',
        );
        if (accounts === 1) {
          expect(
            controls.every(
              node =>
                node.props.onPress ===
                section.findByType(BaselineProductCard).props.onPress,
            ),
          ).toBe(true);
          expect(
            section.findByType(BaselineProductsList).props.totalData,
          ).toBeUndefined();
        } else {
          expect(section.findByType(BaselineProductsList).props.isOpen).toBe(
            false,
          );
          act(() => {
            controls[0].props.onPress();
          });
          expect(tree.root.findByType(BaselineProductsList).props.isOpen).toBe(
            true,
          );
          expect(tree.root.findAllByType(BaselineProductCard)).toHaveLength(2);
          expect(context.onNavigate).not.toHaveBeenCalled();
          act(() => {
            controls[0].props.onPress();
          });
          expect(tree.root.findByType(BaselineProductsList).props.isOpen).toBe(
            false,
          );
        }
      }
      act(() => tree.unmount());
    },
  );
  it('supplies expanded totals only for multi-product non-card categories', () => {
    const context = host(),
      model = createCurrentProducts(context),
      tree = renderBody(context);
    const lists = tree.root.findAllByType(BaselineProductsList);
    for (const [index, category] of model.categories.entries()) {
      expect(lists[index].props.showTotal).toBe(category.key !== 'cards');
      expect(lists[index].props.totalData).toEqual(
        category.key !== 'cards' && category.products.length >= 2
          ? model.calculateTotal(category.products)
          : undefined,
      );
    }
    act(() => tree.unmount());
  });
  it('routes account/card/investment owners with original product IDs and leaves meal cards inert', () => {
    const context = host({
        productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES, mealCards: 1 },
      }),
      model = createCurrentProducts(context),
      tree = renderBody(context);
    for (const [index, product] of model.products.entries()) {
      const card = tree.root.findAllByType(BaselineProductCard)[index];
      if (product.type === 'meal_card') {
        expect(card.props.onPress).toBeUndefined();
        continue;
      }
      act(() => card.props.onPress());
      const expected =
        product.type === 'investment_account'
          ? { screen: 'investments' }
          : product.type === 'debit_card' || product.type === 'credit_card'
          ? {
              screen: 'card',
              params: { productId: product.id, cardId: product.id },
            }
          : {
              screen: 'account',
              params: { productId: product.id, accountId: product.id },
            };
      expect(context.onNavigate).toHaveBeenLastCalledWith(expected);
    }
    act(() => tree.unmount());
  });
  it('preserves summary labels, Source leading heights and original lighthouse aspect', () => {
    const tree = renderBody(
      host({
        language: 'ro',
        t: key =>
          key === 'home.totalAvailable' ? 'Total disponibil' : 'Tradus',
      }),
    );
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('Total disponibil');
    expect(json).toContain('Total Owed');
    const image = tree.root.findByType(Image);
    expect(image.props.accessibilityLabel).toBe('Lighthouse');
    expect(image.props.style).toMatchObject({
      width: 96,
      aspectRatio: 193 / 481,
    });
    expect(json).not.toContain('Quick actions');
    expect(json).not.toContain('Recent transactions');
    act(() => tree.unmount());
  });
});
