import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Appointment from '../src/experiences/pi/current/baseline/more/Appointment';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { createDemoAppointments } from '@/app/screens/appointments/appointmentModel';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';

it('opens an empty injected appointment session without reading or changing saved Demo meetings', async () => {
  const saved = JSON.stringify(createDemoAppointments());
  const getItem = jest.fn(() => saved);
  const setItem = jest.fn();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem, setItem },
  });
  const host: CurrentScreenProps = {
    country: 'CZ',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
    route: { screen: 'appointments' },
    tokens: currentTokens(),
    t: createCurrentTranslator('CZ', 'en'),
    amountsHidden: false,
    screenTopInset: 44,
    isActive: true,
    mode: 'light',
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
  };
  const store = { load: jest.fn(() => []), save: jest.fn() };
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Appointment {...host} appointmentStore={store} />);
  });
  expect(store.load).toHaveBeenCalled();
  expect(JSON.stringify(tree.toJSON())).toContain(
    'What do you want to talk about?',
  );
  expect(getItem).not.toHaveBeenCalled();
  expect(setItem).not.toHaveBeenCalled();
  expect(store.save).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});
