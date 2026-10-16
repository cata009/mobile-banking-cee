import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Detail from '../src/experiences/pi/current/baseline/offers/Detail';
import ProductDetail from '../src/experiences/pi/cz/evo-2027/products/ProductDetail';
import { currentTokens } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import type { CzechNativeScreenProps } from '../src/experiences/pi/cz/evo-2027/contracts';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import type { NativeProductDetailPresentation } from '../../src/features/demo-native/productDetailPresentation';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { PrimaryButton } from '../src/universal/PrimaryButton';

const presentation: NativeProductDetailPresentation = {
  title: 'Presentation current account',
  cardId: 'account',
  optionId: 'current-account',
  actionLabel: 'Continue with Source action',
  includeSafeArea: false,
  heroImage: '/source-current-account.png',
  heroImagePosition: '68% 44%',
  headline: 'A Source account headline',
  intro: 'A Source account promise.',
};

function currentHost(
  extra: Partial<CurrentScreenProps> = {},
): CurrentScreenProps {
  return {
    country: 'CZ',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: DEFAULT_CZECH_COUNTS,
    route: {
      screen: 'product-detail',
      params: {
        title: 'Stale route title',
        cardId: 'account',
        optionId: 'current-account',
      },
    },
    tokens: currentTokens(),
    t: (_key, fallback) => fallback ?? _key,
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
    ...extra,
  };
}

function czechHost(
  extra: Partial<CzechNativeScreenProps> = {},
): CzechNativeScreenProps {
  return {
    route: { screen: 'product-detail', params: { itemId: 'current-account' } },
    scenario: 'active',
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    language: 'en',
    mode: 'light',
    screenTopInset: 54,
    ...extra,
  };
}

it('renders the plain presentation and delegates the Native primary action override', async () => {
  const onProductDetailAction = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Detail
        {...currentHost({
          productDetailPresentation: presentation,
          onProductDetailAction,
        })}
      />,
    );
  });
  try {
    expect(tree.root.findByType(BaselinePageHeader).props.title).toBe(
      presentation.title,
    );
    expect(tree.root.findByType(PrimaryButton).props.label).toBe(
      presentation.actionLabel,
    );
    expect(JSON.stringify(tree.toJSON())).toContain(presentation.headline);
    expect(JSON.stringify(tree.toJSON())).toContain(presentation.intro);
    expect(tree.root.findByType(BaselinePageHeader).props.includeSafeArea).toBe(
      false,
    );

    await act(() => tree.root.findByType(PrimaryButton).props.onPress());

    expect(onProductDetailAction).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(tree.toJSON())).not.toContain('Mobile banking PIN');
  } finally {
    await act(() => tree.unmount());
  }
});

it('adapts Czech Evo product detail into the canonical Native Baseline detail renderer', async () => {
  const onProductDetailAction = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <ProductDetail
        {...czechHost({
          productDetailPresentation: presentation,
          onProductDetailAction,
        })}
      />,
    );
  });
  try {
    expect(
      tree.root.findByProps({ testID: 'ro-product-detail' }),
    ).toBeDefined();
    expect(tree.root.findByType(BaselinePageHeader).props.title).toBe(
      presentation.title,
    );
    expect(tree.root.findByType(PrimaryButton).props.label).toBe(
      presentation.actionLabel,
    );

    await act(() => tree.root.findByType(PrimaryButton).props.onPress());

    expect(onProductDetailAction).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(tree.toJSON())).not.toContain('Demo authorization');
  } finally {
    await act(() => tree.unmount());
  }
});
