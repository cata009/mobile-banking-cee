import React, { useState } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { getFrequentBeneficiaries } from '@/data/paymentsHub';
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents';
import { DEFAULT_CZECH_COUNTS, type CzechNativeScreenProps } from '../src/experiences/pi/cz/evo-2027/contracts';
import PaymentFlow, { initialPaymentDraft } from '../src/experiences/pi/cz/evo-2027/payments/PaymentFlow';

const props: CzechNativeScreenProps = {
  route: { screen: 'payment-create', params: { beneficiaryId: getFrequentBeneficiaries('CZ')[0]!.id } },
  scenario: 'active', productCounts: DEFAULT_CZECH_COUNTS, amountsHidden: false,
  onBack: jest.fn(), onNavigate: jest.fn(), onSearch: jest.fn(), onProfile: jest.fn(),
  onAmountsToggle: jest.fn(), onChanged: jest.fn(),
};
function Host() {
  const [flow, setFlow] = useState<NativePaymentFlow | null>({
    draft: initialPaymentDraft(props)!, step: 'create', initialStep: 'amount', entryId: 1,
  });
  return <PaymentFlow {...props} paymentFlow={flow} onPaymentFlowChange={setFlow} />;
}
const input = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAllByType(TextInput).find(node => node.props.accessibilityLabel === label)!;
const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(node => typeof node.props.onPress === 'function' && node.props.accessibilityLabel === label)[0]!.props.onPress();

test('saving payment date keeps an entered amount when the controlled draft changes', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => { tree = Renderer.create(<Host />); });
  await act(() => input(tree, 'Amount').props.onChangeText('120,50'));
  await act(() => input(tree, 'Reference').props.onChangeText('Lunch'));
  const dateButton = tree.root.findAll(node => typeof node.props.onPress === 'function' && node.props.accessibilityLabel?.startsWith('Payment date:'))[0]!;
  await act(() => dateButton.props.onPress());
  await act(() => press(tree, 'Done'));
  expect(input(tree, 'Amount').props.value).toBe('120,50');
  await act(() => tree.unmount());
});
