import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import PaymentFlow from '../src/experiences/pi/cz/evo-2027/payments/PaymentFlow';
import { czechProducts } from '../src/experiences/pi/cz/evo-2027/accounts/source';
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow';
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';

type ControlledPaymentFlow = NativePaymentFlow & {
  entryId?: number;
  initialStep?: 'recipient' | 'amount';
};

type PaymentProps = CzechNativeScreenProps & {
  paymentFlow?: ControlledPaymentFlow | null;
  onDemoPayment?: jest.Mock;
};

const eurPayer = czechProducts(DEFAULT_CZECH_COUNTS).find(
  product => product.type === 'current_account' && product.currency === 'EUR',
)!;

const canonicalDraft = {
  ...createEmptyDomesticPaymentDraft('CZ', eurPayer),
  beneficiaryName: 'Canonical EUR recipient',
  recipientCountry: 'AT',
  recipientAccountMode: 'iban' as const,
  accountNumber: 'AT611904300234573201',
  bankSwift: 'BKAUATWW',
  currency: 'EUR',
  amount: '321,45',
  instantPayment: false,
  dueDate: '2027-03-18',
};

function propsFor(
  screen: CzechNativeScreenProps['route']['screen'],
  extra: Partial<PaymentProps> = {},
): PaymentProps {
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
    ...extra,
  };
}

async function render(props: PaymentProps) {
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

test('controlled review consumes the exact Source EUR payer and amount and Back emits one create step', async () => {
  const onPaymentFlowChange = jest.fn();
  const onBack = jest.fn();
  const onNavigate = jest.fn();
  const sourceFlow: ControlledPaymentFlow = {
    draft: canonicalDraft,
    step: 'review',
    entryId: 14,
    initialStep: 'amount',
  };
  const props = propsFor('payment-review', {
    paymentFlow: sourceFlow,
    onPaymentFlowChange,
    onBack,
    onNavigate,
  });
  const tree = await render(props);

  const rendered = JSON.stringify(tree.toJSON());
  expect(rendered).toContain(canonicalDraft.payerAccountNumber);
  expect(rendered).toContain('Canonical EUR recipient');
  expect(rendered).toContain('321');
  expect(rendered).toContain('Mar 18, 2027');

  await act(() => press(tree, 'Back'));
  expect(onPaymentFlowChange).toHaveBeenCalledTimes(1);
  expect(onPaymentFlowChange).toHaveBeenCalledWith({
    draft: canonicalDraft,
    step: 'create',
    entryId: 14,
    initialStep: 'amount',
  });
  expect(onBack).not.toHaveBeenCalled();
  expect(onNavigate).not.toHaveBeenCalled();

  await act(() =>
    tree.update(
      <PaymentFlow
        {...props}
        paymentFlow={{ ...sourceFlow, step: 'create' }}
      />,
    ),
  );
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(input => input.props.accessibilityLabel === 'Amount')?.props.value,
  ).toBe('321,45');
  await act(() => tree.unmount());
});

test('controlled create Next and review Back update Source without native navigation', async () => {
  const onPaymentFlowChange = jest.fn();
  const onBack = jest.fn();
  const onNavigate = jest.fn();
  const props = propsFor('payment-create', {
    paymentFlow: {
      draft: canonicalDraft,
      step: 'create',
      entryId: 15,
      initialStep: 'recipient',
    },
    onPaymentFlowChange,
    onBack,
    onNavigate,
  });
  const tree = await render(props);

  await act(() => press(tree, 'Review transfer'));
  expect(onPaymentFlowChange).toHaveBeenLastCalledWith({
    draft: canonicalDraft,
    step: 'review',
    entryId: 15,
    initialStep: 'recipient',
  });
  const reviewFlow: ControlledPaymentFlow = {
    draft: canonicalDraft,
    step: 'review',
    entryId: 15,
    initialStep: 'recipient',
  };
  await act(() =>
    tree.update(
      <PaymentFlow
        {...props}
        route={{ screen: 'payment-review' }}
        paymentFlow={reviewFlow}
      />,
    ),
  );
  await act(() => press(tree, 'Back'));
  expect(onPaymentFlowChange).toHaveBeenLastCalledWith({
    draft: canonicalDraft,
    step: 'create',
    entryId: 15,
    initialStep: 'recipient',
  });
  expect(onBack).not.toHaveBeenCalled();
  expect(onNavigate).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});

test('controlled beneficiary entry preserves Source amount initial step when the draft has no amount', async () => {
  const draft = {
    ...canonicalDraft,
    amount: '',
  };
  const tree = await render(
    propsFor('payment-create', {
      paymentFlow: {
        draft,
        step: 'create',
        entryId: 16,
        initialStep: 'amount',
      },
    }),
  );

  expect(
    tree.root
      .findAllByType(TextInput)
      .find(input => input.props.accessibilityLabel === 'Amount'),
  ).toBeDefined();
  await act(() => tree.unmount());
});

test('equal Source flow rerender preserves the in-progress Native amount edit', async () => {
  const sourceFlow: ControlledPaymentFlow = {
    draft: canonicalDraft,
    step: 'create',
    entryId: 17,
    initialStep: 'amount',
  };
  const props = propsFor('payment-create', { paymentFlow: sourceFlow });
  const tree = await render(props);
  const amount = tree.root
    .findAllByType(TextInput)
    .find(input => input.props.accessibilityLabel === 'Amount')!;

  await act(() => amount.props.onChangeText('654,32'));
  await act(() =>
    tree.update(
      <PaymentFlow
        {...props}
        paymentFlow={{ ...sourceFlow, draft: { ...sourceFlow.draft } }}
      />,
    ),
  );

  expect(
    tree.root
      .findAllByType(TextInput)
      .find(input => input.props.accessibilityLabel === 'Amount')?.props.value,
  ).toBe('654,32');
  await act(() => tree.unmount());
});

test('new Source entryId resets transient form state from the new canonical draft', async () => {
  const firstFlow: ControlledPaymentFlow = {
    draft: canonicalDraft,
    step: 'create',
    entryId: 18,
    initialStep: 'amount',
  };
  const props = propsFor('payment-create', { paymentFlow: firstFlow });
  const tree = await render(props);
  await act(() => {
    tree.root
      .findAllByType(TextInput)
      .find(input => input.props.accessibilityLabel === 'Amount')!
      .props.onChangeText('654,32');
  });

  const nextFlow: ControlledPaymentFlow = {
    ...firstFlow,
    entryId: 19,
    draft: {
      ...canonicalDraft,
      beneficiaryName: 'Second canonical recipient',
      amount: '987,65',
    },
  };
  await act(() =>
    tree.update(<PaymentFlow {...props} paymentFlow={nextFlow} />),
  );

  expect(
    tree.root
      .findAllByType(TextInput)
      .find(input => input.props.accessibilityLabel === 'Amount')?.props.value,
  ).toBe('987,65');
  expect(JSON.stringify(tree.toJSON())).toContain('Second canonical recipient');
  await act(() => tree.unmount());
});

test('controlled Done asks Source to clear the canonical draft', async () => {
  const onPaymentFlowChange = jest.fn();
  const onBack = jest.fn();
  const onNavigate = jest.fn();
  const tree = await render(
    propsFor('payment-success', {
      paymentFlow: { draft: canonicalDraft, step: 'success' },
      onPaymentFlowChange,
      onBack,
      onNavigate,
    }),
  );

  await act(() => press(tree, 'Ok, got it'));
  expect(onPaymentFlowChange).toHaveBeenCalledTimes(1);
  expect(onPaymentFlowChange).toHaveBeenCalledWith(null);
  expect(onBack).not.toHaveBeenCalled();
  expect(onNavigate).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});

test('controlled sign cancels Source demo Face ID when Source moves back to review', async () => {
  jest.useFakeTimers();
  const onPaymentFlowChange = jest.fn();
  const onDemoPayment = jest.fn();
  const signFlow: ControlledPaymentFlow = {
    draft: canonicalDraft,
    step: 'sign',
    entryId: 20,
    initialStep: 'amount',
  };
  const props = propsFor('payment-sign', {
    paymentFlow: signFlow,
    onPaymentFlowChange,
    onDemoPayment,
  });
  let tree!: Renderer.ReactTestRenderer;
  try {
    tree = await render(props);

    await act(() => press(tree, 'Sign'));
    expect(tree.root.findAllByType(FaceIdOverlay)).toHaveLength(1);
    const reviewFlow: ControlledPaymentFlow = {
      ...signFlow,
      step: 'review',
    };
    await act(() =>
      tree.update(
        <PaymentFlow
          {...props}
          route={{ screen: 'payment-review' }}
          paymentFlow={reviewFlow}
        />,
      ),
    );
    expect(tree.root.findAllByType(FaceIdOverlay)).toHaveLength(0);
    await act(() => jest.advanceTimersByTime(1000));

    expect(onPaymentFlowChange).not.toHaveBeenCalledWith({
      ...reviewFlow,
      step: 'success',
    });
    expect(onDemoPayment).not.toHaveBeenCalled();
  } finally {
    if (tree) await act(() => tree.unmount());
    jest.useRealTimers();
  }
});

test('controlled Source sign emits success after the demo Face ID timeline and preserves payment metadata', async () => {
  jest.useFakeTimers();
  const onPaymentFlowChange = jest.fn();
  const onDemoPayment = jest.fn();
  const signFlow: ControlledPaymentFlow = {
    draft: canonicalDraft,
    step: 'sign',
    entryId: 21,
    initialStep: 'amount',
  };
  const props = propsFor('payment-sign', {
    paymentFlow: signFlow,
    onPaymentFlowChange,
    onDemoPayment,
  });
  let tree!: Renderer.ReactTestRenderer;
  try {
    tree = await render(props);
    await act(() => press(tree, 'Sign'));
    expect(tree.root.findAllByType(FaceIdOverlay)).toHaveLength(1);
    await act(() => jest.advanceTimersByTime(839));
    expect(onPaymentFlowChange).not.toHaveBeenCalledWith({
      ...signFlow,
      step: 'success',
    });
    await act(() => jest.advanceTimersByTime(1));

    expect(onPaymentFlowChange).toHaveBeenLastCalledWith({
      ...signFlow,
      step: 'success',
    });
    expect(onDemoPayment).toHaveBeenCalledWith({
      draft: canonicalDraft,
      demo: true,
    });
  } finally {
    if (tree) await act(() => tree.unmount());
    jest.useRealTimers();
  }
});
