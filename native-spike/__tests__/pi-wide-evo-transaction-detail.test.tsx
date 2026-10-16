import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  DEFAULT_CZECH_COUNTS,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import {
  cardProducts,
  cardMovements,
  czechProducts,
  accountMovements,
} from '../src/experiences/pi/cz/evo-2027/accounts/source';
import { MovementDetail } from '../src/experiences/pi/cz/evo-2027/accounts/Movements';
import { createTransactionDetailData } from '@/data/paymentFlow';
import {
  getMerchantLocation,
  resolveTransactionMerchant,
} from '@/data/merchantDirectory';
import {
  getPfmCategorySelection,
  PFM_CATEGORY_GROUPS,
} from '@/data/pfmCategories';
import { applyCategoryOverride } from '../src/experiences/pi/current/banking/categoryOverrides';

const typeCategoryContext = {
  country: 'CZ',
  release: 'release-future-evo-2027',
} as const;

const textContent = (
  node:
    | Renderer.ReactTestRendererJSON
    | Renderer.ReactTestRendererJSON[]
    | null,
): string => {
  if (!node) return '';
  if (Array.isArray(node)) return node.map(textContent).join('');
  return (node.children ?? [])
    .map(child =>
      typeof child === 'string' ? child : textContent(child),
    )
    .join('');
};

function cardTransaction() {
  const products = czechProducts(DEFAULT_CZECH_COUNTS);
  return cardProducts(products)
    .flatMap(card =>
      cardMovements(card, products).map(transaction => ({ card, transaction })),
    )
    .find(
      row =>
        row.transaction.status === 'Booked' &&
        resolveTransactionMerchant(row.transaction) !== null,
    )!;
}

function accountTransaction() {
  const products = czechProducts(DEFAULT_CZECH_COUNTS);
  const product = products.find(item => item.type === 'current_account')!;
  const transaction = accountMovements(product, products).find(
    item => item.status === 'Booked' && item.source !== 'card',
  )!;
  return { product, transaction };
}

test('card detail matches Source merchant context, amount, card-used row and accordion', async () => {
  const { card, transaction } = cardTransaction();
  const detail = createTransactionDetailData(transaction, 'CZ', card);
  const merchant = resolveTransactionMerchant(transaction);
  const location = merchant ? getMerchantLocation(merchant, 'CZ') : undefined;
  const onBack = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <MovementDetail
        transaction={transaction}
        product={card}
        hidden
        onBack={onBack}
      />,
    );
  });

  let visibleText = textContent(tree.toJSON());
  expect(visibleText).toContain(merchant?.name ?? detail.title);
  expect(visibleText).toContain(detail.amount);
  expect(visibleText).toContain(detail.bookingDate);
  expect(visibleText).toContain(detail.pfmCategoryLabel.toUpperCase());
  expect(visibleText).toContain('Spending Insight');
  expect(visibleText).toContain('CARD USED');
  if (location) expect(visibleText).toContain(location);
  expect(visibleText).not.toContain('Transaction date');

  const actionLabels = tree.root
    .findAll(node => typeof node.props.accessibilityLabel === 'string')
    .map(node => node.props.accessibilityLabel);
  expect(actionLabels).toContain('Change category');
  expect(actionLabels).toContain('Request chargeback');
  expect(actionLabels).toContain('Send payment');
  const hiddenStandingOrder = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Create Standing order' &&
      node.props.accessibilityState?.disabled === true &&
      node.props.accessibilityElementsHidden === true,
  );
  expect(hiddenStandingOrder.length).toBeGreaterThan(0);

  const showMore = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Show more' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => showMore.props.onPress());
  visibleText = textContent(tree.toJSON());
  expect(visibleText).toContain('Transaction date');

  const back = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Back' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => back.props.onPress());
  expect(onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test('account detail expands payment facts, redoes payment and persists category selection', async () => {
  const { product, transaction } = accountTransaction();
  const detail = createTransactionDetailData(transaction, 'CZ', product);
  const onBack = jest.fn();
  const onRedo = jest.fn();
  const onTransactionCategoryChange = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <MovementDetail
        transaction={transaction}
        product={product}
        hidden={false}
        onBack={onBack}
        onRedo={onRedo}
        onTransactionCategoryChange={onTransactionCategoryChange}
      />,
    );
  });

  expect(textContent(tree.toJSON())).toContain(detail.amount);
  expect(textContent(tree.toJSON())).toContain(detail.accountTitle);
  expect(textContent(tree.toJSON())).not.toContain('Payment details');

  const redo = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Redo payment' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => redo.props.onPress());
  expect(onRedo).toHaveBeenCalledTimes(1);

  const current = getPfmCategorySelection(
    transaction.pfmCategory,
    transaction.pfmSubcategory,
  );
  const group = PFM_CATEGORY_GROUPS.find(
    entry => entry.id !== current.groupId && entry.subcategories.length > 1,
  )!;
  const subcategory = group.subcategories[0]!;
  const categoryCountLabel =
    group.subcategories.length === 1 ? 'category' : 'categories';
  const change = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Change category' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => change.props.onPress());
  const groupButton = tree.root.findAll(
    node =>
      node.props.accessibilityLabel ===
        `${group.label} ${group.subcategories.length} ${categoryCountLabel}` &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => groupButton.props.onPress());
  const radio = tree.root.findAll(
    node =>
      node.props.accessibilityRole === 'radio' &&
      node.props.accessibilityLabel === subcategory,
  )[0]!;
  await act(() => radio.props.onPress());
  const confirm = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'CHANGE CATEGORY' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => confirm.props.onPress());

  const selection = {
    groupId: group.id,
    groupLabel: group.label,
    category: group.category,
    subcategory,
  };
  expect(onTransactionCategoryChange).toHaveBeenCalledWith(
    transaction,
    selection,
  );
  expect(
    applyCategoryOverride(typeCategoryContext, transaction).pfmCategory,
  ).toBe(selection.category);

  const showMore = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Show more' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => showMore.props.onPress());
  const expanded = textContent(tree.toJSON());
  expect(expanded).toContain(detail.paymentDetails);
  expect(expanded).toContain(detail.referenceNumber);
  await act(() => tree.unmount());
});

test('copyable transaction facts use the Source copy feedback', async () => {
  const { product, transaction } = accountTransaction();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <MovementDetail
        transaction={transaction}
        product={product}
        hidden={false}
        onBack={jest.fn()}
      />,
    );
  });
  const copy = tree.root.findAll(
    node => node.props.accessibilityLabel === 'Copy Account number',
  )[0]!;
  expect(typeof copy.props.onPress).toBe('function');
  await act(async () => {
    await copy.props.onPress();
  });
  expect(textContent(tree.toJSON())).toContain(
    'Account number successfully copied',
  );
  await act(() => tree.unmount());
});

