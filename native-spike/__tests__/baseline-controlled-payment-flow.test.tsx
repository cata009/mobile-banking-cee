import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import RoBaselinePaymentCreateScreen from '../src/experiences/pi/current/baseline/payments/domestic/RoBaselinePaymentCreateScreen';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { ToggleButton } from '../src/universal/ToggleButton';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import {
  createEmptyDomesticPaymentDraft,
  createTemplateDomesticPaymentDraft,
} from '@/data/paymentFlow';
import { getPaymentTemplates } from '@/data/paymentTemplates';
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';

type ControlledProps = {
  paymentFlow?: NativePaymentFlow | null;
  onPaymentFlowChange?: (flow: NativePaymentFlow | null) => void;
};
type PaymentHost = CurrentScreenProps & ControlledProps;

function host(
  extra: Partial<CurrentScreenProps> & ControlledProps = {},
): PaymentHost {
  return {
    country: 'RO',
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
    route: { screen: 'payment-create' },
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
  } as PaymentHost;
}

async function render(props: PaymentHost) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselinePaymentCreateScreen {...props} />);
  });
  return tree;
}

const fields = (tree: Renderer.ReactTestRenderer) =>
  tree.root.findAllByType(BaselineTextField);
const action = (tree: Renderer.ReactTestRenderer) =>
  tree.root.findByType(PrimaryButton);
const backButton = (tree: Renderer.ReactTestRenderer) =>
  tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Back' &&
      typeof node.props.onPress === 'function',
  )[0]!;

async function change(
  tree: Renderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  const input =
    fields(tree).find(field => field.props.ariaLabel === label) ??
    fields(tree).find(field => field.props.label === label)!;
  await act(() => input.props.onChange(value));
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('controlled flow restores Source Back changes without remounting the payment screen', async () => {
  const sourceDraft = {
    ...createEmptyDomesticPaymentDraft('RO'),
    beneficiaryName: 'Canonical beneficiary',
  };
  const props = host({ paymentFlow: { draft: sourceDraft, step: 'review' } });
  const tree = await render(props);

  expect(action(tree).props.label).toBe('Sign');
  const backDraft = {
    ...sourceDraft,
    beneficiaryName: 'Updated by Source Back',
  };
  await act(async () => {
    tree.update(
      <RoBaselinePaymentCreateScreen
        {...props}
        paymentFlow={{ draft: backDraft, step: 'create' }}
      />,
    );
    await Promise.resolve();
  });

  expect(action(tree).props.label).toBe('Next');
  expect(
    fields(tree).find(field => field.props.label === 'Beneficiary')?.props
      .value,
  ).toBe('Updated by Source Back');
  await act(() => tree.unmount());
});

test('Source Back to review resets review-only state and keeps the canonical draft', async () => {
  const sourceDraft = {
    ...createEmptyDomesticPaymentDraft('RO'),
    beneficiaryName: 'Canonical beneficiary',
  };
  const onPaymentFlowChange = jest.fn();
  const props = host({
    paymentFlow: { draft: sourceDraft, step: 'review' },
    onPaymentFlowChange,
  });
  const tree = await render(props);

  await act(() => tree.root.findByType(ToggleButton).props.onToggle(true));
  await act(() => action(tree).props.onPress());
  expect(onPaymentFlowChange).toHaveBeenLastCalledWith({
    draft: sourceDraft,
    step: 'sign',
  });

  const signFlow = { draft: sourceDraft, step: 'sign' } as const;
  await act(async () => {
    tree.update(
      <RoBaselinePaymentCreateScreen {...props} paymentFlow={signFlow} />,
    );
    await Promise.resolve();
  });
  await act(async () => {
    tree.update(
      <RoBaselinePaymentCreateScreen
        {...props}
        paymentFlow={{ draft: sourceDraft, step: 'review' }}
      />,
    );
    await Promise.resolve();
  });

  expect(tree.root.findByType(ToggleButton).props.checked).toBe(false);
  expect(action(tree).props.label).toBe('Sign');
  await act(() => tree.unmount());
});

test('controlled edits emit at Next, steps emit without native navigation, and Done clears the flow', async () => {
  const selection = getPaymentTemplates('RO')[0]!;
  const sourceDraft = {
    ...createTemplateDomesticPaymentDraft(selection, 'RO'),
    prefix: '19',
  };
  const onPaymentFlowChange = jest.fn();
  const onNavigate = jest.fn();
  const props = host({
    paymentFlow: { draft: sourceDraft, step: 'create' },
    onPaymentFlowChange,
    onNavigate,
  });
  const tree = await render(props);

  await change(tree, 'Beneficiary', 'Edited beneficiary');
  expect(onPaymentFlowChange).not.toHaveBeenCalled();
  const editedDraft = { ...sourceDraft, beneficiaryName: 'Edited beneficiary' };

  await act(() => action(tree).props.onPress());
  expect(onPaymentFlowChange).toHaveBeenLastCalledWith({
    draft: editedDraft,
    step: 'review',
  });
  expect(onNavigate).not.toHaveBeenCalled();

  await act(() => backButton(tree).props.onPress());
  expect(onPaymentFlowChange).toHaveBeenLastCalledWith({
    draft: editedDraft,
    step: 'create',
  });
  expect(onNavigate).not.toHaveBeenCalled();

  await act(() => action(tree).props.onPress());
  await act(() => action(tree).props.onPress());
  expect(onPaymentFlowChange).toHaveBeenLastCalledWith({
    draft: editedDraft,
    step: 'sign',
  });
  await act(() => action(tree).props.onPress());
  expect(tree.root.findAllByType(FaceIdOverlay)).toHaveLength(1);
  await act(() => jest.advanceTimersByTime(840));
  expect(onPaymentFlowChange).toHaveBeenLastCalledWith({
    draft: editedDraft,
    step: 'success',
  });
  expect(onNavigate).not.toHaveBeenCalled();

  const done = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Ok, got it' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => done.props.onPress());
  expect(onPaymentFlowChange).toHaveBeenLastCalledWith(null);
  expect(onNavigate).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});

test('keeps the current autonomous flow when no Source event is supplied', async () => {
  const onNavigate = jest.fn();
  const props = host({ onNavigate });
  const tree = await render(props);

  expect(action(tree).props.label).toBe('Next');
  await change(tree, 'Beneficiary', 'Alice');
  await change(tree, 'IBAN (mandatory)', 'RO49BACX000008204119876');
  await change(tree, 'Amount limit', '125');
  await act(() => action(tree).props.onPress());
  expect(action(tree).props.label).toBe('Sign');
  await act(() => tree.unmount());
});
