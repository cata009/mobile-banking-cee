import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Advisor from '../src/experiences/pi/current/baseline/more/Advisor';
import { ProfileHost } from '../src/experiences/pi/current/profile/Host';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import { ToggleButton } from '../src/universal/ToggleButton';
import { TextInput } from 'react-native';
import PrimeContact from '../src/experiences/pi/current/baseline/more/PrimeContact';
const host: CurrentScreenProps = {
  country: 'RO',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
  route: { screen: 'prime' },
  tokens: currentTokens(),
  t: createCurrentTranslator('RO', 'en'),
  amountsHidden: false,
  screenTopInset: 12,
  isActive: true,
  onBack: jest.fn(),
  onNavigate: jest.fn(),
  onProfile: jest.fn(),
  onSearch: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
  onLanguageChange: jest.fn(),
  mode: 'light',
  onModeChange: jest.fn(),
};
it('keeps canonical RO advisor identity and routes booking and callback to their own flows', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <ProfileHost host={host}>
        <Advisor {...host} />
      </ProfileHost>,
    );
  });
  const text = JSON.stringify(tree.toJSON());
  expect(text).toContain('david.novak@unicredit.ro');
  expect(text).toContain('+40 602 123 456');
  await act(async () =>
    tree.root
      .findAll(
        n =>
          n.props.accessibilityRole === 'button' &&
          n.props.accessibilityLabel === 'Book an appointment',
      )[0]
      .props.onPress(),
  );
  expect(host.onNavigate).toHaveBeenLastCalledWith({ screen: 'appointments' });
  await act(async () =>
    tree.root
      .findAll(
        n =>
          n.props.accessibilityRole === 'button' &&
          n.props.accessibilityLabel === 'Request a call',
      )[0]
      .props.onPress(),
  );
  expect(host.onNavigate).toHaveBeenLastCalledWith({ screen: 'call-request' });
  await act(async () => tree.unmount());
});
it('switches benefits locally without adding routes to inert terms or benefit cards', async () => {
  let tree!: Renderer.ReactTestRenderer;
  const navigate = jest.fn();
  const context = { ...host, onNavigate: navigate };
  await act(async () => {
    tree = Renderer.create(
      <ProfileHost host={context}>
        <Advisor {...context} />
      </ProfileHost>,
    );
  });
  await act(async () =>
    tree.root
      .findAll(
        n => n.props.accessibilityLabel === 'YOUR BENEFITS' && n.props.onPress,
      )[0]
      .props.onPress(),
  );
  const terms = tree.root.findAll(
    n => n.props.testID === 'ro-prime-terms' && n.props.onPress,
  )[0];
  await act(async () => terms.props.onPress());
  expect(navigate).not.toHaveBeenCalled();
  expect(JSON.stringify(tree.toJSON())).toContain(
    host.t('prime.benefits.benefit1Description'),
  );
  await act(async () => tree.unmount());
});

function press(tree: Renderer.ReactTestRenderer, label: string) {
  act(() =>
    tree.root
      .findAll(
        n =>
          n.props.accessibilityLabel === label &&
          typeof n.props.onPress === 'function',
      )[0]
      .props.onPress(),
  );
}
function renderAdvisor() {
  const h = { ...host, onNavigate: jest.fn(), onBackHandlerChange: jest.fn() };
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <ProfileHost host={h}>
        <Advisor {...h} />
      </ProfileHost>,
    );
  });
  return { h, tree };
}
it('uses the source mail preference control and remembers a selected app when Ask every time is off', () => {
  const { h, tree } = renderAdvisor();
  try {
    press(tree, 'Send an email');
    const toggle = tree.root.findByType(ToggleButton);
    expect(toggle.props.checked).toBe(true);
    act(() => toggle.props.onToggle(false));
    press(tree, 'Default mail app');
    const subject = tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Subject')!;
    act(() => subject.props.onChangeText('Appointment question'));
    const body = tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Message')!;
    act(() => body.props.onChangeText('Please contact me tomorrow.'));
    expect(subject.props.value).toBe('Appointment question');
    press(tree, 'Send');
    expect(JSON.stringify(tree.toJSON())).toContain('Message sent');
    press(tree, 'Done');
    press(tree, 'Send an email');
    expect(tree.root.findAllByType(ToggleButton)).toHaveLength(0);
    expect(tree.root.findAllByType(TextInput)).toHaveLength(2);
    press(tree, 'Cancel');
    expect(tree.root.findAllByType(PrimeContact)).toHaveLength(0);
    expect(h.onNavigate).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});
it('connects the call simulation after 1200ms and keeps keypad, mute and end call local', () => {
  jest.useFakeTimers();
  const { h, tree } = renderAdvisor();
  try {
    press(tree, 'Call now');
    press(tree, 'Call');
    act(() => jest.advanceTimersByTime(1199));
    expect(JSON.stringify(tree.toJSON())).toContain('Calling');
    act(() => jest.advanceTimersByTime(1));
    expect(JSON.stringify(tree.toJSON())).toContain('00:00');
    act(() => jest.advanceTimersByTime(1000));
    expect(JSON.stringify(tree.toJSON())).toContain('00:01');
    press(tree, 'Mute');
    expect(
      tree.root.findAll(
        n => n.props.accessibilityLabel === 'Mute' && n.props.onPress,
      )[0].props.accessibilityState.selected,
    ).toBe(true);
    press(tree, 'Keypad');
    expect(
      tree.root.findAll(n => n.props.accessibilityLabel === 'Dial 5'),
    ).not.toHaveLength(0);
    press(tree, 'Close keypad');
    press(tree, 'End call');
    expect(tree.root.findAllByType(PrimeContact)).toHaveLength(0);
    expect(h.onNavigate).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
    jest.clearAllTimers();
    jest.useRealTimers();
  }
});
