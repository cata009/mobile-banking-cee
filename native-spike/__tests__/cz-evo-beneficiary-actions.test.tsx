import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import PaymentsScreen from '../src/experiences/pi/cz/evo-2027/payments/PaymentsScreen';
import { Page } from '../src/experiences/pi/cz/evo-2027/accounts/Primitives';
import { BaselineAccountActionBar } from '../src/universal/BaselineAccountActionBar';
import { SourceBottomSheet } from '../src/universal/SourceBottomSheet';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import Schedule from '../src/experiences/pi/cz/evo-2027/payments/Schedule';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import {
  getAllRecurrentPayments,
  getFrequentBeneficiaries,
} from '@/data/paymentsHub';
import { getPaymentTemplates } from '@/data/paymentTemplates';
const person = getFrequentBeneficiaries('CZ')[0]!;
const props: CzechNativeScreenProps = {
  route: {
    screen: 'payments',
    params: { view: 'beneficiary', beneficiaryId: person.id },
  },
  scenario: 'active',
  productCounts: DEFAULT_CZECH_COUNTS,
  amountsHidden: false,
  onBack: jest.fn(),
  onNavigate: jest.fn(),
  onSearch: jest.fn(),
  onProfile: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
};
const button = (tree: Renderer.ReactTestRenderer, name: string) =>
  tree.root.findAll(
    n =>
      n.props.accessibilityLabel === name &&
      typeof n.props.onPress === 'function',
  )[0]!;
test('beneficiary detail uses the original action bar, account facts, and fixed Send money action', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<PaymentsScreen {...props} />);
  });
  const bar = tree.root.findByType(BaselineAccountActionBar);
  expect(bar.props.items.map((item: { id: string }) => item.id)).toEqual([
    'edit',
    'favorite',
    'delete',
  ]);
  const page = tree.root.findByType(Page);
  expect(page.props.showLargeTitle).toBe(false);
  expect(page.props.footer).toBeDefined();
  expect(
    tree.root
      .findAllByType(PrimaryButton)
      .some(node => node.props.label === 'Send money'),
  ).toBe(true);
  expect(JSON.stringify(tree.toJSON())).toContain(person.paymentAccountNumber);
  expect(JSON.stringify(tree.toJSON())).toContain('Country / region');
  await act(() => button(tree, 'Send money').props.onPress());
  expect(props.onNavigate).toHaveBeenCalledWith({
    screen: 'payment-create',
    params: { beneficiaryId: person.id },
  });
  await act(() => button(tree, 'Add to favorites').props.onPress());
  expect(button(tree, 'Remove from favorites')).toBeDefined();
  await act(() => button(tree, 'Delete beneficiary').props.onPress());
  expect(tree.root.findByType(SourceBottomSheet).props.title).toBe(
    'Delete saved recipient?',
  );
  await act(() => button(tree, 'Cancel').props.onPress());
  expect(tree.root.findAllByType(SourceBottomSheet)).toHaveLength(0);
  await act(() => button(tree, 'Edit beneficiary').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Edit beneficiary');
  await act(() => tree.unmount());
});
test('template detail uses icon actions and a fixed Send money action', async () => {
  const template = getPaymentTemplates('CZ')[0]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentsScreen
        {...props}
        route={{
          screen: 'payments',
          params: { view: 'template', templateId: template.id },
        }}
      />,
    );
  });
  const bar = tree.root.findByType(BaselineAccountActionBar);
  expect(bar.props.items.map((item: { id: string }) => item.id)).toEqual([
    'edit',
    'delete',
  ]);
  expect(tree.root.findByType(Page).props.footer).toBeDefined();
  await act(() => button(tree, 'Send money').props.onPress());
  expect(props.onNavigate).toHaveBeenCalledWith({
    screen: 'payment-create',
    params: { templateId: template.id },
  });
  await act(() => button(tree, 'Delete').props.onPress());
  expect(tree.root.findByType(SourceBottomSheet).props.title).toBe(
    'Delete payment template?',
  );
  await act(() => button(tree, 'Cancel').props.onPress());
  await act(() => button(tree, 'Edit').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Edit template');
  await act(() => tree.unmount());
});

test('scheduled payment detail uses the same icon actions and a cancellable delete sheet', async () => {
  const payment = getAllRecurrentPayments('CZ').find(item => item.note)!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentsScreen
        {...props}
        route={{
          screen: 'payments',
          params: { view: 'scheduled-detail', paymentId: payment.id },
        }}
      />,
    );
  });
  const bar = tree.root.findByType(BaselineAccountActionBar);
  expect(bar.props.items.map((item: { id: string }) => item.id)).toEqual([
    'edit',
    'delete',
  ]);
  expect(tree.root.findByType(Page).props.showLargeTitle).toBe(false);
  expect(JSON.stringify(tree.toJSON())).toContain('Payment schedule');
  expect(JSON.stringify(tree.toJSON())).toContain(payment.note);
  await act(() => button(tree, 'Delete').props.onPress());
  expect(tree.root.findByType(SourceBottomSheet).props.title).toBe(
    'Delete scheduled payment?',
  );
  await act(() => button(tree, 'Cancel').props.onPress());
  expect(tree.root.findAllByType(SourceBottomSheet)).toHaveLength(0);
  await act(() => button(tree, 'Edit').props.onPress());
  expect(tree.root.findAllByType(Schedule)).toHaveLength(1);
  await act(() => tree.root.findByType(Schedule).props.onClose());
  await act(() => tree.unmount());
});
