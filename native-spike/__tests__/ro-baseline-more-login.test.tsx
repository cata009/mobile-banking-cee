import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import Login from '../src/experiences/pi/current/baseline/more/Login';
import { BaselineNavigationLink } from '../src/universal/BaselineNavigationLink';
import { BaselinePanelMenuSheet } from '../src/universal/BaselinePanelMenuSheet';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import FaceIdAnimation from '../src/experiences/pi/current/profile/FaceIdAnimation';

function host(): CurrentScreenProps {
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
    route: { screen: 'prelogin' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 12,
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
    onPrimaryNavigationChange: jest.fn(),
    onBackHandlerChange: jest.fn(),
  };
}
function mount(h = host()) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Login {...h} />);
  });
  return tree;
}

it('keeps Contacts and MToken inert, opens the Romanian three-row Other panel and consumes Back locally', () => {
  const h = host(),
    tree = mount(h);
  try {
    const links = tree.root.findAllByType(BaselineNavigationLink);
    expect(links.map(link => link.props.text)).toEqual([
      'CONTACTS',
      'MTOKEN',
      'OTHER',
    ]);
    act(() => links[0].props.onPress());
    act(() => links[1].props.onPress());
    expect(h.onNavigate).not.toHaveBeenCalled();
    act(() => links[2].props.onPress());
    const panel = tree.root.findByType(BaselinePanelMenuSheet);
    expect(panel.props.startCoAppingSession).toBeUndefined();
    expect(panel.props.aboutSmartBanking).toBe('ABOUT SMART BANKING');
    const back = (h.onBackHandlerChange as jest.Mock).mock.calls.at(-1)![0];
    act(() => {
      expect(back()).toBe(true);
    });
    expect(tree.root.findAllByType(BaselinePanelMenuSheet)).toHaveLength(0);
    expect(h.onBack).not.toHaveBeenCalled();
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(false);
  } finally {
    act(() => tree.unmount());
  }
  expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
});

it('routes the language selector without persisting a language draft', () => {
  const h = host(),
    tree = mount(h);
  try {
    const language = tree.root.findAll(
      node => node.props.accessibilityLabel === 'Language',
    )[0];
    act(() => language.props.onPress());
    expect(h.onNavigate).toHaveBeenCalledWith({ screen: 'language' });
    expect(h.onLanguageChange).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});

it('completes the source Face ID demonstration only at 840ms and cancels pending completion on unmount', () => {
  jest.useFakeTimers();
  const h = host(),
    tree = mount(h);
  try {
    act(() => tree.root.findByType(PrimaryButton).props.onPress());
    expect(tree.root.findAllByType(FaceIdAnimation)).toHaveLength(1);
    act(() => jest.advanceTimersByTime(839));
    expect(h.onNavigate).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(h.onNavigate).toHaveBeenCalledWith({ screen: 'home' });
    expect(tree.root.findAllByType(FaceIdAnimation)).toHaveLength(0);
    act(() => tree.root.findByType(PrimaryButton).props.onPress());
    act(() => tree.unmount());
    act(() => jest.advanceTimersByTime(1000));
    expect(h.onNavigate).toHaveBeenCalledTimes(1);
  } finally {
    jest.clearAllTimers();
    jest.useRealTimers();
  }
});
