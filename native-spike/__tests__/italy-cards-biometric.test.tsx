import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import CardScreen from '../src/experiences/pi/it/cards/CardScreen';
import { DEFAULT_ITALY_COUNTS } from '../src/experiences/pi/it/contracts';
import {
  authenticateNativeBiometric,
  nativeBiometricAvailable,
} from '../src/platform/biometrics';
jest.mock('../src/platform/biometrics', () => ({
  authenticateNativeBiometric: jest.fn(),
  nativeBiometricAvailable: jest.fn().mockResolvedValue(true),
}));
const auth = jest.mocked(authenticateNativeBiometric),
  available = jest.mocked(nativeBiometricAvailable);
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
async function render() {
  let tree!: Renderer.ReactTestRenderer;
  const changed = jest.fn();
  await act(async () => {
    tree = Renderer.create(
      <CardScreen
        target={{ kind: 'card', cardId: 'my-one' }}
        intent={{ kind: 'card-action', cardId: 'my-one', action: 'pin' }}
        productCounts={DEFAULT_ITALY_COUNTS}
        amountsHidden={false}
        onBack={jest.fn()}
        onNavigate={jest.fn()}
        onProfile={jest.fn()}
        onChanged={changed}
      />,
    );
  });
  await act(() => button(tree, 'Mostra PIN').props.onPress());
  return { tree, changed };
}
beforeEach(() => {
  jest.clearAllMocks();
  available.mockResolvedValue(true);
});
test('cancelled biometric keeps PIN hidden and requires explicit manual authorization', async () => {
  auth.mockResolvedValue('cancelled');
  const { tree, changed } = await render();
  await act(async () => {
    button(tree, 'Biometria').props.onPress();
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Autenticazione annullata.');
  expect(JSON.stringify(tree.toJSON())).not.toContain('12345');
  expect(tree.root.findByType(TextInput).props.maxLength).toBe(5);
  expect(button(tree, 'Conferma').props.disabled).toBe(true);
  expect(changed).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
test('unavailable biometric retains the source five digit Mobile Code flow', async () => {
  auth.mockResolvedValue('unavailable');
  const { tree } = await render();
  await act(async () => {
    button(tree, 'Biometria').props.onPress();
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Inserisci il Mobile Code.');
  await act(() => tree.root.findByType(TextInput).props.onChangeText('12345'));
  await act(() => button(tree, 'Conferma').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('PIN carta');
  expect(JSON.stringify(tree.toJSON())).toContain('12345');
  await act(() => tree.unmount());
});
test('a biometric result arriving after cancellation never reveals the PIN', async () => {
  let finish!: (value: 'authenticated') => void;
  auth.mockReturnValue(
    new Promise(resolve => {
      finish = resolve;
    }),
  );
  const { tree } = await render();
  await act(() => button(tree, 'Biometria').props.onPress());
  await act(() => button(tree, 'Indietro').props.onPress());
  await act(async () => finish('authenticated'));
  expect(JSON.stringify(tree.toJSON())).not.toContain('12345');
  expect(button(tree, 'Mostra PIN')).toBeTruthy();
  await act(() => tree.unmount());
});
