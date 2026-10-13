import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { Authorization } from '../src/experiences/pi/cz/evo-2027/auth/Authorization';
import {
  authenticateNativeBiometric,
  nativeBiometricAvailable,
} from '../src/platform/biometrics';
import { CZECH_PROFILE_ADAPTER } from '../src/experiences/pi/cz/evo-2027/profile/adapter';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { translateCzech } from '../src/experiences/pi/cz/evo-2027/profile/features/preferences';
jest.mock('../src/platform/biometrics', () => ({
  nativeBiometricAvailable: jest.fn(),
  authenticateNativeBiometric: jest.fn(),
}));
const available = jest.mocked(nativeBiometricAvailable),
  authenticate = jest.mocked(authenticateNativeBiometric);
const mounted: Renderer.ReactTestRenderer[] = [];
async function render() {
  const onSign = jest.fn(),
    onBack = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Authorization onSign={onSign} onBack={onBack} />);
  });
  mounted.push(tree);
  return { tree, onSign, onBack };
}
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () => {
    tree.root
      .findAll(
        node =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === 'function',
      )
      .at(-1)!
      .props.onPress();
  });
}
beforeEach(() => {
  available.mockResolvedValue(false);
  authenticate.mockReset();
});
afterEach(async () => {
  await act(async () => mounted.splice(0).forEach(tree => tree.unmount()));
});
test('unavailable biometrics never silently approve and explicit demo consent approves once', async () => {
  const { tree, onSign } = await render();
  await press(tree, 'Sign');
  expect(onSign).not.toHaveBeenCalled();
  expect(JSON.stringify(tree.toJSON())).toContain('Demo authorization');
  await press(tree, 'Continue demo');
  expect(onSign).toHaveBeenCalledTimes(1);
});
test('native biometric cancellation preserves authorization and retry uses the actual port', async () => {
  available.mockResolvedValue(true);
  authenticate
    .mockResolvedValueOnce('cancelled')
    .mockResolvedValueOnce('authenticated');
  const { tree, onSign } = await render();
  await press(tree, 'Sign');
  expect(onSign).not.toHaveBeenCalled();
  await press(tree, 'Sign');
  expect(authenticate).toHaveBeenCalledWith('Sign');
  expect(onSign).toHaveBeenCalledTimes(1);
});
test('Back invalidates a pending biometric result', async () => {
  available.mockResolvedValue(true);
  let resolve!: (value: 'authenticated') => void;
  authenticate.mockImplementation(
    () =>
      new Promise(done => {
        resolve = done;
      }),
  );
  const { tree, onSign, onBack } = await render();
  await press(tree, 'Sign');
  await press(tree, 'Back');
  await act(async () => resolve('authenticated'));
  expect(onBack).toHaveBeenCalledTimes(1);
  expect(onSign).not.toHaveBeenCalled();
});
test('logout login has no portal-password form and requires explicit demo continuation when device biometrics are unavailable', async () => {
  const props: CzechNativeScreenProps = {
    route: { screen: 'login' },
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
  const Screen = CZECH_PROFILE_ADAPTER.screens.login!;
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Screen {...props} />);
  });
  mounted.push(tree);
  expect(JSON.stringify(tree.toJSON())).not.toContain('Password');
  await press(tree, translateCzech('preLoginActive.loginButton'));
  expect(props.onNavigate).not.toHaveBeenCalled();
  await press(tree, 'Continue demo');
  expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'home' });
});
test('inactive authorization clears typed private PIN without completing', async () => {
  const { tree, onSign, onBack } = await render();
  await act(async () =>
    tree.root.findAllByType(TextInput)[0].props.onChangeText('123456'),
  );
  await act(async () =>
    tree.update(
      <Authorization onSign={onSign} onBack={onBack} isActive={false} />,
    ),
  );
  expect(tree.root.findAllByType(TextInput)[0].props.value).toBe('******');
  expect(onSign).not.toHaveBeenCalled();
});
