import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Switch } from 'react-native';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import PaymentFlow from '../src/experiences/pi/cz/evo-2027/payments/PaymentFlow';
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents';
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow';
import { FormField } from '../src/universal/FormField';
import { DateField } from '../src/universal/DateField';
import { SourceBottomSheet } from '../src/universal/SourceBottomSheet';
import { ToggleButton } from '../src/universal/ToggleButton';

const sourceDraft = {
  ...createEmptyDomesticPaymentDraft('CZ'),
  recipientCountry: 'CZ',
  recipientAccountMode: 'local' as const,
  recipientKind: 'individual' as const,
  beneficiaryName: 'Maria Popescu',
  accountNumber: '2000144101',
  bankCode: '2700',
  currency: 'CZK',
  amount: '500',
  instantPayment: true,
  dueDate: '2030-01-20',
};

function propsFor(
  screen: CzechNativeScreenProps['route']['screen'],
  paymentFlow: NativePaymentFlow,
  extra: Partial<CzechNativeScreenProps> = {},
): CzechNativeScreenProps {
  return {
    route: { screen },
    scenario: 'active',
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onSearch: jest.fn(),
    onProfile: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    paymentFlow,
    ...extra,
  };
}

async function render(props: CzechNativeScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<PaymentFlow {...props} />);
  });
  return tree;
}

const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )[0]!
    .props.onPress();

test('create Payment date sheet turns off instant payment, selects a date, and Done updates the canonical row', async () => {
  const onPaymentFlowChange = jest.fn();
  const paymentFlow: NativePaymentFlow = {
    draft: sourceDraft,
    step: 'create',
    entryId: 31,
    initialStep: 'amount',
  };
  const tree = await render(
    propsFor('payment-create', paymentFlow, { onPaymentFlowChange }),
  );

  await act(() => press(tree, 'Payment date: Instant payment'));
  const sheet = tree.root.findByType(SourceBottomSheet);
  expect(sheet.props.title).toBe('Payment date');
  const instant = tree.root.findByType(ToggleButton);
  expect(instant.props.checked).toBe(true);

  await act(() => instant.props.onToggle(false));
  const date = tree.root.findByType(DateField);
  expect(date.props.label).toBe('Payment date');
  await act(() => date.props.onChange('2030-09-30'));
  await act(() => press(tree, 'Done'));

  expect(tree.root.findAllByType(SourceBottomSheet)).toHaveLength(0);
  expect(
    tree.root.findAll(
      node => node.props.accessibilityLabel === 'Payment date: Sep 30, 2030',
    ),
  ).not.toHaveLength(0);
  expect(onPaymentFlowChange).toHaveBeenCalledWith({
    ...paymentFlow,
    draft: {
      ...sourceDraft,
      instantPayment: false,
      dueDate: '2030-09-30',
    },
  });
  await act(() => tree.unmount());
});

test('review Note for me editor preserves the selected date and instant setting', async () => {
  const draft = {
    ...sourceDraft,
    instantPayment: false,
    dueDate: '2026-09-30',
    informationForMe: '',
  };
  const paymentFlow: NativePaymentFlow = {
    draft,
    step: 'review',
    entryId: 32,
    initialStep: 'recipient',
  };
  const onPaymentFlowChange = jest.fn();
  const tree = await render(
    propsFor('payment-review', paymentFlow, { onPaymentFlowChange }),
  );

  const renderedBefore = JSON.stringify(tree.toJSON());
  expect(renderedBefore).toContain('Sep 30, 2026');
  expect(tree.root.findAllByType(ToggleButton)).toHaveLength(0);
  expect(tree.root.findAllByType(Switch)).toHaveLength(0);

  await act(() => press(tree, 'Note for me Add a private note'));
  expect(tree.root.findByType(SourceBottomSheet).props.title).toBe(
    'Note for me',
  );
  const note = tree.root
    .findAllByType(FormField)
    .find(field => field.props.label === 'Note for me (optional)')!;
  await act(() => note.props.onChange('Chirie septembrie'));
  await act(() => press(tree, 'Save'));

  expect(JSON.stringify(tree.toJSON())).toContain('Chirie septembrie');
  expect(JSON.stringify(tree.toJSON())).toContain('Sep 30, 2026');
  expect(onPaymentFlowChange).toHaveBeenCalledWith({
    ...paymentFlow,
    draft: {
      ...draft,
      informationForMe: 'Chirie septembrie',
    },
  });
  expect(onPaymentFlowChange.mock.calls[0]?.[0]?.draft).toEqual(
    expect.objectContaining({
      dueDate: '2026-09-30',
      instantPayment: false,
      informationForMe: 'Chirie septembrie',
    }),
  );
  await act(() => tree.unmount());
});
