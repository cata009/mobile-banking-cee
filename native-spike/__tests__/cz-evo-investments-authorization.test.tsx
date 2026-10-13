import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import { Signing } from '../src/experiences/pi/cz/evo-2027/investments/Signing';
import { InvestmentRuntime } from '../src/experiences/pi/cz/evo-2027/investments/Runtime';
import {
  authenticateNativeBiometric,
  nativeBiometricAvailable,
} from '../src/platform/biometrics';

jest.mock('../src/platform/biometrics', () => ({
  authenticateNativeBiometric: jest.fn(),
  nativeBiometricAvailable: jest.fn(),
}));
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll(
    item =>
      item.props.accessibilityLabel === label &&
      typeof item.props.onPress === 'function',
  )[0]!;
  expect(node).toBeDefined();
  expect(node.props.disabled).not.toBe(true);
  act(() => {
    node.props.onPress();
  });
}
describe('CZ investment authorization lifecycle', () => {
  beforeEach(() => {
    jest.mocked(nativeBiometricAvailable).mockResolvedValue(true);
    jest.mocked(authenticateNativeBiometric).mockReset();
  });
  it.each(['back', 'unmount', 'blur'] as const)(
    'ignores a delayed authenticated result after %s',
    async action => {
      let resolve!: (value: 'authenticated') => void;
      jest.mocked(authenticateNativeBiometric).mockReturnValue(
        new Promise(done => {
          resolve = done;
        }),
      );
      const signed = jest.fn(),
        back = jest.fn();
      let tree!: Renderer.ReactTestRenderer;
      await act(async () => {
        tree = Renderer.create(
          <InvestmentRuntime active>
            <Signing onBack={back} onExit={back} onSigned={signed} />
          </InvestmentRuntime>,
        );
      });
      press(tree, 'Sign order');
      if (action === 'back') press(tree, 'Back');
      else if (action === 'unmount') act(() => tree.unmount());
      else
        act(() =>
          tree.update(
            <InvestmentRuntime active={false}>
              <Signing onBack={back} onExit={back} onSigned={signed} />
            </InvestmentRuntime>,
          ),
        );
      await act(async () => resolve('authenticated'));
      expect(signed).not.toHaveBeenCalled();
      if (action !== 'unmount') act(() => tree.unmount());
    },
  );
  it('invalidates authentication on app background', async () => {
    let change!: (value: 'background') => void;
    const listener = jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_event, callback) => {
        change = callback;
        return { remove: jest.fn() };
      });
    let resolve!: (value: 'authenticated') => void;
    jest.mocked(authenticateNativeBiometric).mockReturnValue(
      new Promise(done => {
        resolve = done;
      }),
    );
    const signed = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    await act(async () => {
      tree = Renderer.create(
        <Signing onBack={jest.fn()} onExit={jest.fn()} onSigned={signed} />,
      );
    });
    press(tree, 'Sign order');
    act(() => change('background'));
    await act(async () => resolve('authenticated'));
    expect(signed).not.toHaveBeenCalled();
    act(() => tree.unmount());
    listener.mockRestore();
  });
});
