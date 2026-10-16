import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import type { CurrentScreen, CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  bankingProducts,
  productTransactions,
} from '../src/experiences/pi/current/banking/model';
import { currentTokens, createCurrentTranslator } from '../src/experiences/pi/current/context';
import { RoBaselineTransactions } from '../src/experiences/pi/current/baseline/Transactions';
import { RoBaselineTransactionsScreen } from '../src/experiences/pi/current/baseline/TransactionsScreen';
import RoBaselineCard from '../src/experiences/pi/current/baseline/Card';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import { subscribeCurrentContextHelp } from '../src/experiences/pi/current/coapping/contextHelp';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';

const counts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 1,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};

function host(
  screen: CurrentScreen,
  extra: Partial<CurrentScreenProps> = {},
): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: counts,
    route: { screen },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
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

function renderTransactions(
  props: CurrentScreenProps,
  product: ReturnType<typeof bankingProducts>['currentAccounts'][number],
  transactions: ReturnType<typeof productTransactions>,
) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <RoBaselineTransactions
        host={props}
        kind="account"
        product={product}
        transactions={transactions}
        query=""
        onQueryChange={jest.fn()}
        onTransaction={jest.fn()}
      />,
    );
  });
  return tree;
}

test('matching Source presentation rows replace the Native ledger, including an empty filter result', () => {
  const base = host('account');
  const product = bankingProducts(base).currentAccounts[0]!;
  const nativeTransactions = productTransactions(base, product);
  const props = host('account', {
    bankingPresentation: { productId: product.id, rows: [] },
  });
  const tree = renderTransactions(props, product, nativeTransactions);

  expect(tree.root.findAllByType(BaselineTransactionRow)).toHaveLength(0);
  act(() => tree.unmount());
});

test('Source presentation rows are scoped to their product and carry their display data', () => {
  const base = host('account');
  const product = bankingProducts(base).currentAccounts[0]!;
  const transaction = productTransactions(base, product)[0]!;
  const props = host('account', {
    bankingPresentation: {
      productId: product.id,
      rows: [
        {
          transaction,
          displayLabel: 'Source display label',
          leadingVisual: {
            kind: 'merchant-logo',
            merchant: 'carrefour',
            size: 32,
          },
        },
      ],
    },
  });
  const tree = renderTransactions(props, product, [transaction]);
  const row = tree.root.findByType(BaselineTransactionRow);

  expect(row.props.displayLabel).toBe('Source display label');
  expect(row.props.leadingVisual).toEqual(
    expect.objectContaining({
      props: expect.objectContaining({
        transaction,
        visual: {
          kind: 'merchant-logo',
          merchant: 'carrefour',
          size: 32,
        },
      }),
    }),
  );
  let visual!: Renderer.ReactTestRenderer;
  act(() => {
    visual = Renderer.create(row.props.leadingVisual);
  });
  expect(JSON.stringify(visual.toJSON())).toContain('Carrefour merchant logo');
  act(() => visual.unmount());
  act(() => tree.unmount());
});

test('Source presentation rows for another product do not replace the Native ledger', () => {
  const base = host('account');
  const data = bankingProducts(base);
  const product = data.currentAccounts[0]!;
  const otherProduct = data.currentAccounts[1]!;
  const nativeTransactions = productTransactions(base, product);
  const props = host('account', {
    bankingPresentation: { productId: otherProduct.id, rows: [] },
  });
  const tree = renderTransactions(props, product, nativeTransactions);

  expect(tree.root.findAllByType(BaselineTransactionRow).length).toBeGreaterThan(0);
  act(() => tree.unmount());
});

test('global Native transactions apply Source category overrides before pooling row IDs', () => {
  const base = host('transactions');
  const account = bankingProducts(base).currentAccounts[0]!;
  const transaction = productTransactions(base, account)[0]!;
  const override = {
    groupId: 'source-category',
    groupLabel: 'Source category',
    category: 'Shopping' as const,
    subcategory: 'Source subcategory',
  };
  const props = host('transactions', {
    bankingPresentation: {
      transactionCategoryOverrides: { [transaction.id]: override },
    },
  });
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselineTransactionsScreen {...props} />);
  });

  const row = tree.root
    .findAllByType(BaselineTransactionRow)
    .find(item => item.props.transaction.id === `${account.id}-${transaction.id}`)!;
  expect(row.props.transaction.category).toBe('Source category');
  expect(row.props.transaction.pfmCategory).toBe('Shopping');
  expect(row.props.transaction.pfmSubcategory).toBe('Source subcategory');
  act(() => tree.unmount());
});

test('card carousel reports the selected Source card and details request', () => {
  const base = host('card');
  const cards = bankingProducts(base).cards;
  const activeCardChange = jest.fn();
  const showCardDetailsRequest = jest.fn();
  const props = host('card', {
    route: { screen: 'card', params: { productId: cards[0]!.id } },
    onActiveCardChange: activeCardChange,
    onShowCardDetailsRequest: showCardDetailsRequest,
  });
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselineCard {...props} />);
  });

  const secondCard = tree.root.findByProps({
    testID: `ro-card-carousel-${cards[1]!.id}`,
  });
  act(() => secondCard.props.onPress());
  expect(activeCardChange).toHaveBeenLastCalledWith(cards[1]!.id);

  const request = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Show Card Details' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  act(() => request.props.onPress());
  expect(showCardDetailsRequest).toHaveBeenCalledWith(cards[1]!.id);
  expect(tree.root.findAllByType(FaceIdOverlay)).toHaveLength(0);
  act(() => tree.unmount());
});

test('card details completion reports the verified Source card', () => {
  const base = host('card');
  const card = bankingProducts(base).cards[0]!;
  const onShowCardDetails = jest.fn();
  const props = host('card', {
    route: { screen: 'card', params: { productId: card.id } },
    onShowCardDetails,
  });
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselineCard {...props} />);
  });

  const request = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Show Card Details' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  act(() => request.props.onPress());
  const faceId = tree.root.findByType(FaceIdOverlay);
  act(() => faceId.props.onComplete());

  expect(onShowCardDetails).toHaveBeenCalledWith(card.id);
  act(() => tree.unmount());
});

test('card presents the Source opportunity nudge and forwards its CTA', () => {
  const base = host('card');
  const card = bankingProducts(base).cards[0]!;
  const onAiOpportunityClick = jest.fn();
  const nudge = {
    title: 'Review your card',
    body: 'There is a useful card insight.',
    ctaLabel: 'Review',
  };
  const props = host('card', {
    route: { screen: 'card', params: { productId: card.id } },
    bankingPresentation: { aiOpportunityNudge: nudge },
    onAiOpportunityClick,
  });
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselineCard {...props} />);
  });

  expect(JSON.stringify(tree.toJSON())).toContain(nudge.title);
  expect(JSON.stringify(tree.toJSON())).toContain(nudge.body);
  const cta = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === nudge.ctaLabel &&
      typeof node.props.onPress === 'function',
  )[0]!;
  act(() => cta.props.onPress());
  expect(onAiOpportunityClick).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});

test('CZ Co-app shows the default credit-limit nudge and routes its CTA to For You', () => {
  const base = host('card', {
    country: 'CZ',
    release: 'release-future-evo-2027',
    activeFeatures: ['fx_czCoAppingSmartAssistant'],
  });
  const creditCard = bankingProducts(base).cards.find(
    card => card.type === 'credit_card',
  )!;
  const props = host('card', {
    country: 'CZ',
    release: 'release-future-evo-2027',
    activeFeatures: ['fx_czCoAppingSmartAssistant'],
    route: { screen: 'card', params: { productId: creditCard.id } },
  });
  const requests: unknown[] = [];
  const unsubscribe = subscribeCurrentContextHelp(request => requests.push(request));
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselineCard {...props} />);
  });

  expect(JSON.stringify(tree.toJSON())).toContain(
    'Upgrade your credit limit to 15 000 CZK',
  );
  const cta = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'FIND OUT MORE' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  act(() => cta.props.onPress());
  expect(requests).toEqual([
    expect.objectContaining({ kind: 'for-you', host: props }),
  ]);

  unsubscribe();
  act(() => tree.unmount());
});

test('an explicit Source null suppresses the default CZ Co-app nudge', () => {
  const base = host('card', {
    country: 'CZ',
    release: 'release-future-evo-2027',
    activeFeatures: ['fx_czCoAppingSmartAssistant'],
  });
  const creditCard = bankingProducts(base).cards.find(
    card => card.type === 'credit_card',
  )!;
  const props = host('card', {
    country: 'CZ',
    release: 'release-future-evo-2027',
    activeFeatures: ['fx_czCoAppingSmartAssistant'],
    route: { screen: 'card', params: { productId: creditCard.id } },
    bankingPresentation: { aiOpportunityNudge: null },
  });
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselineCard {...props} />);
  });

  expect(JSON.stringify(tree.toJSON())).not.toContain(
    'Upgrade your credit limit to 15 000 CZK',
  );
  act(() => tree.unmount());
});

test('an accepted Source credit-limit override suppresses the default CZ Co-app nudge', () => {
  const base = host('card', {
    country: 'CZ',
    release: 'release-future-evo-2027',
    activeFeatures: ['fx_czCoAppingSmartAssistant'],
  });
  const creditCard = bankingProducts(base).cards.find(
    card => card.type === 'credit_card',
  )!;
  const props = host('card', {
    country: 'CZ',
    release: 'release-future-evo-2027',
    activeFeatures: ['fx_czCoAppingSmartAssistant'],
    route: { screen: 'card', params: { productId: creditCard.id } },
    creditLimitOverrides: { [creditCard.id]: 15000 },
  });
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselineCard {...props} />);
  });

  expect(JSON.stringify(tree.toJSON())).not.toContain(
    'Upgrade your credit limit to 15 000 CZK',
  );
  act(() => tree.unmount());
});
