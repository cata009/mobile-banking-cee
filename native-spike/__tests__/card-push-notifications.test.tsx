import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import CardPushNotifications from '../src/experiences/pi/current/baseline/CardPushNotifications';
import { AccountPushNotifications } from '../src/experiences/pi/current/baseline/AccountPushNotifications';
import { currentTokens } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

test('opens notification preferences and remembers changes per card', () => {
  const host = {
    country: 'CZ',
    tokens: currentTokens(),
    screenTopInset: 54,
  } as CurrentScreenProps;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <CardPushNotifications
        host={host}
        cardId="test-notifications"
        onClose={() => {}}
      />,
    );
  });
  const screen = () => tree.root.findByType(AccountPushNotifications);
  expect(screen().props.screen).toBe('overview');
  act(() => screen().props.onNavigate('card'));
  expect(screen().props.screen).toBe('card');
  const preferences = screen().props.preferences;
  act(() =>
    screen().props.onPreferencesChange({
      ...preferences,
      notificationsEnabled: false,
    }),
  );
  act(() => tree.unmount());
  act(() => {
    tree = Renderer.create(
      <CardPushNotifications
        host={host}
        cardId="test-notifications"
        onClose={() => {}}
      />,
    );
  });
  expect(screen().props.preferences.notificationsEnabled).toBe(false);
  act(() => tree.unmount());
});
