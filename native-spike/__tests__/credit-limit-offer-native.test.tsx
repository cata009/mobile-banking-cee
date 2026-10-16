import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import type { CreditCard } from '@/data/products';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import RoBaselineCard from '../src/experiences/pi/current/baseline/Card';
import { bankingProducts } from '../src/experiences/pi/current/banking/model';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';

type CreditLimitHost = CurrentScreenProps & {
  creditLimitOffer?: CreditCard | null;
  creditLimitOverrides?: Readonly<Record<string, number>>;
  onCreditLimitOfferCancel?: () => void;
  onCreditLimitOfferComplete?: (id: string, limit: number) => void;
};

function host(extra: Partial<CreditLimitHost> = {}): CreditLimitHost {
  return {
    country: 'CZ',
    release: 'release-current',
    bankingScenario: 'retail-single-account',
    scenario: 'active',
    language: 'cs',
    productCounts: { ...DEFAULT_CZECH_COUNTS, creditCards: 2 },
    route: { screen: 'cards' },
    tokens: currentTokens(),
    t: createCurrentTranslator('CZ', 'cs'),
    amountsHidden: false,
    screenTopInset: 24,
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
    ...extra,
  };
}

function renderCard(props: CreditLimitHost) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselineCard {...props} />);
  });
  return tree;
}

function press(tree: Renderer.ReactTestRenderer, label: string) {
  const control = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(control).toBeDefined();
  act(() => control!.props.onPress());
}

function text(tree: Renderer.ReactTestRenderer) {
  return tree.root
    .findAll(
      node => typeof node.type === 'string' && String(node.type) === 'Text',
    )
    .map(node =>
      node.children.filter(value => typeof value === 'string').join(''),
    )
    .join('\n');
}

test('controlled offer overrides the route card and completes through review, terms, Face ID and success', () => {
  const base = host();
  const creditCards = bankingProducts(base).cards.filter(
    (card): card is CreditCard => card.type === 'credit_card',
  );
  expect(creditCards.length).toBeGreaterThan(1);
  const offerCard = {
    ...creditCards[1]!,
    creditLimit: 12_000,
    availableCredit: 7_500,
  };
  const onCreditLimitOfferComplete = jest.fn();
  const props = host({
    route: {
      screen: 'cards',
      params: { productId: creditCards[0]!.id },
    },
    creditLimitOffer: offerCard,
    onCreditLimitOfferComplete,
  });
  const tree = renderCard(props);

  expect(
    tree.root.findAll(
      node => node.props.testID === 'baseline-credit-limit-offer-review',
    ).length,
  ).toBeGreaterThan(0);
  expect(text(tree)).toContain('Current limit');
  expect(text(tree)).toContain('New limit');
  expect(text(tree)).toContain(
    new Intl.NumberFormat('cs-CZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(offerCard.creditLimit),
  );
  expect(
    tree.root.findAll(node => node.props.testID === 'ro-card-carousel'),
  ).toHaveLength(0);

  const continueButton = tree.root.findAll(
    node => node.props.accessibilityLabel === 'Continue',
  )[0]!;
  expect(continueButton.props.disabled).toBe(true);
  const termsToggle = tree.root.findAll(
    node =>
      node.props.accessibilityRole === 'switch' &&
      node.props.accessibilityLabel === 'Accept credit limit terms',
  )[0];
  expect(termsToggle).toBeDefined();
  expect(termsToggle!.props.accessibilityState.checked).toBe(false);
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'checkbox' &&
        node.props.accessibilityLabel === 'Accept credit limit terms',
    ),
  ).toHaveLength(0);
  press(tree, 'Accept credit limit terms');
  press(tree, 'Continue');
  expect(
    tree.root.findAll(
      node => node.props.testID === 'baseline-credit-limit-offer-sign',
    ).length,
  ).toBeGreaterThan(0);
  press(tree, 'Sign change');
  const faceId = tree.root.findByType(FaceIdOverlay);
  act(() => faceId.props.onComplete());
  expect(
    tree.root.findAll(
      node => node.props.testID === 'baseline-credit-limit-offer-success',
    ).length,
  ).toBeGreaterThan(0);
  expect(text(tree)).toContain(offerCard.name);
  press(tree, 'Back to card');
  expect(onCreditLimitOfferComplete).toHaveBeenCalledWith(
    offerCard.id,
    offerCard.creditLimit + 5_000,
  );
  expect(
    tree.root.findAll(node => node.props.testID === 'ro-card-carousel').length,
  ).toBeGreaterThan(0);
  act(() => tree.update(<RoBaselineCard {...props} creditLimitOffer={null} />));
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === offerCard.name &&
        node.props.accessibilityState?.selected === true,
    ).length,
  ).toBeGreaterThan(0);
  act(() => tree.unmount());
});

test('standalone credit-limit route cancels to its originating card and reports cancellation', () => {
  const base = host();
  const card = bankingProducts(base).cards.find(
    (item): item is CreditCard => item.type === 'credit_card',
  )!;
  const onCreditLimitOfferCancel = jest.fn();
  const props = host({
    route: {
      screen: 'cards',
      params: { view: 'credit-limit', productId: card.id },
    },
    creditLimitOffer: null,
    onCreditLimitOfferCancel,
  });
  const tree = renderCard(props);

  expect(
    tree.root.findAll(
      node => node.props.testID === 'baseline-credit-limit-offer-review',
    ).length,
  ).toBeGreaterThan(0);
  press(tree, 'Back');
  expect(onCreditLimitOfferCancel).toHaveBeenCalledTimes(1);
  expect(
    tree.root.findAll(
      node => node.props.testID === 'baseline-credit-limit-offer-review',
    ),
  ).toHaveLength(0);
  expect(
    tree.root.findAll(node => node.props.testID === 'ro-card-carousel').length,
  ).toBeGreaterThan(0);
  expect(props.route.params?.productId).toBe(card.id);
  act(() => tree.unmount());
});

test('native Back cancels the review locally before the host leaves the card', () => {
  const base = host();
  const card = bankingProducts(base).cards.find(
    (item): item is CreditCard => item.type === 'credit_card',
  )!;
  const onCreditLimitOfferCancel = jest.fn();
  const onBackHandlerChange = jest.fn();
  const props = host({
    route: {
      screen: 'cards',
      params: { view: 'credit-limit', productId: card.id },
    },
    onCreditLimitOfferCancel,
    onBackHandlerChange,
  });
  const tree = renderCard(props);
  const consumeBack = onBackHandlerChange.mock.calls.at(-1)?.[0];

  expect(consumeBack).toEqual(expect.any(Function));
  act(() => expect(consumeBack!()).toBe(true));
  expect(onCreditLimitOfferCancel).toHaveBeenCalledTimes(1);
  expect(
    tree.root.findAll(
      node => node.props.testID === 'baseline-credit-limit-offer-review',
    ),
  ).toHaveLength(0);
  expect(props.route.params?.productId).toBe(card.id);
  act(() => tree.unmount());
});

test('credit-limit overrides apply to the card list only', () => {
  const base = host();
  const before = bankingProducts(base);
  const card = before.cards.find(
    (item): item is CreditCard => item.type === 'credit_card',
  )!;
  const newLimit = card.creditLimit + 5_000;
  const after = bankingProducts(
    host({ creditLimitOverrides: { [card.id]: newLimit } }),
  );
  const updatedCard = after.cards.find(
    item => item.id === card.id,
  ) as CreditCard;

  expect(updatedCard.creditLimit).toBe(newLimit);
  expect(updatedCard.availableCredit).toBe(
    card.availableCredit + (newLimit - card.creditLimit),
  );
  expect(after.products.find(item => item.id === card.id)).toEqual(
    before.products.find(item => item.id === card.id),
  );
  expect(after.categories).toEqual(before.categories);
});
