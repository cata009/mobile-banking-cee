import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import { Authorization } from '../src/experiences/pi/current/profile/Authorization';
import type {
  CurrentScreenProps,
  CurrentScreen,
} from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { getTutorialsForCountry } from '@/app/config/tutorialsConfig';
import {
  CoappingLayer,
  openCurrentContextHelp,
} from '../src/experiences/pi/current/coapping/adapter';
import { buildCzChatHelpContext } from '@/app/chat/cz/context';
import { BaselineMailboxTabs } from '../src/universal/BaselineMailboxTabs';
import { AppointmentSheet } from '../src/experiences/pi/current/baseline/more/appointment/Sheets';
const trees: Renderer.ReactTestRenderer[] = [];
function host(screen: CurrentScreen): CurrentScreenProps {
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
    tokens: currentTokens(false),
    t: createCurrentTranslator('RO', 'en'),
    route: { screen },
    screenTopInset: 12,
    isActive: true,
    amountsHidden: false,
    mode: 'light',
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
  };
}
async function render(screen: CurrentScreen) {
  const props = host(screen);
  const Screen = CURRENT_PROFILE_ADAPTER.screens[screen]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Screen {...props} />);
  });
  trees.push(tree);
  return { tree, props };
}
function pressable(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )
    .at(-1)!;
}
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () => {
    pressable(tree, label).props.onPress({ stopPropagation: jest.fn() });
  });
}
afterEach(async () => {
  await act(async () => trees.splice(0).forEach(tree => tree.unmount()));
  jest.useRealTimers();
});
test('More uses original Settings art crop, not a universal thumbnail box', async () => {
  const { tree } = await render('profile');
  const card = tree.root.findAll(
    node =>
      node.props.testID === 'ro-more-card-settings' &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(card).toBeDefined();
  const wrapper = card.findAll(
    node =>
      node.type === View &&
      StyleSheet.flatten(node.props.style)?.top === '47.86%',
  )[0];
  expect(wrapper).toBeDefined();
  expect(StyleSheet.flatten(wrapper.props.style)).toMatchObject({
    top: '47.86%',
    right: '-30.03%',
    bottom: '-29.17%',
    left: '42.2%',
  });
  const image = wrapper.findByType(Image);
  expect(image.props.resizeMode).toBe('stretch');
});
test('More Tutorials opens original local sheet and closes without changing navigation', async () => {
  const { tree, props } = await render('profile');
  await press(tree, 'Tutorials');
  expect(props.onNavigate).not.toHaveBeenCalled();
  expect(pressable(tree, 'Close')).toBeDefined();
  const tutorial = getTutorialsForCountry('RO')[0];
  await press(tree, `Open tutorial: ${tutorial.title}`);
  expect(pressable(tree, 'Close tutorial')).toBeDefined();
  await press(tree, 'Close tutorial');
  expect(pressable(tree, 'Contacts')).toBeDefined();
  expect(props.onBack).not.toHaveBeenCalled();
});
test('Messages retains original Inbox new-items marker', async () => {
  const { tree } = await render('messages');
  const tabs = tree.root.findByType(BaselineMailboxTabs);
  expect(tabs.props.tabs).toEqual([
    { id: 'inbox', label: 'Inbox', hasNewItems: true },
    { id: 'outbox', label: 'Outbox' },
  ]);
  const inbox = tabs.findAll(
    node =>
      node.props.accessibilityRole === 'tab' &&
      node.props.accessibilityLabel === 'Inbox' &&
      typeof node.props.onPress === 'function',
  )[0];
  const dot = inbox.findAll(
    node =>
      node.type === View &&
      StyleSheet.flatten(node.props.style)?.width === 12 &&
      StyleSheet.flatten(node.props.style)?.height === 12,
  )[0];
  expect(dot).toBeDefined();
  expect(StyleSheet.flatten(dot.props.style)).toMatchObject({
    width: 12,
    height: 12,
  });
});
test('Settings and Language preserve the visible inert Source Help action', async () => {
  for (const screen of ['settings', 'language'] as const) {
    const { tree } = await render(screen);
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityRole === 'button' &&
          node.props.accessibilityLabel === 'Help',
      ),
    ).not.toHaveLength(0);
    expect(pressable(tree, 'Help')).toBeUndefined();
  }
});
test('document exposed delete action includes original trash glyph and label', async () => {
  const { tree } = await render('documents');
  await press(tree, 'Document actions documents-2026-06-03');
  const action = pressable(tree, 'Delete document documents-2026-06-03');
  expect(
    action.findAll(node => node.props.name === 'trash-2'),
  ).not.toHaveLength(0);
});
test('Source mobile Sign demonstrates FaceId then completes at840ms without extra native dialog', async () => {
  jest.useFakeTimers();
  const props = host('login');
  const done = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <Authorization
        host={props}
        title="Sign"
        onBack={props.onBack}
        onDone={done}
      />,
    );
  });
  trees.push(tree);
  expect(tree.root.findAllByType(TextInput)[0].props.value).toBe('******');
  await press(tree, 'Sign');
  expect(JSON.stringify(tree.toJSON())).toContain('source-face-id-scanning');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Continue demo');
  await act(async () => {
    jest.advanceTimersByTime(400);
  });
  expect(JSON.stringify(tree.toJSON())).toContain(
    'source-face-id-exiting-glyph',
  );
  expect(JSON.stringify(tree.toJSON())).not.toContain('source-face-id-check');
  await act(async () => {
    jest.advanceTimersByTime(439);
  });
  expect(done).not.toHaveBeenCalled();
  await act(async () => {
    jest.advanceTimersByTime(1);
  });
  expect(done).toHaveBeenCalledTimes(1);
});
test('Prime preserves Source dark card and original local email composition instead of replacement pages', async () => {
  const { tree, props } = await render('support');
  const card = tree.root.findAll(
    node =>
      node.type === View && node.props.testID === 'source-prime-advisor-card',
  )[0];
  expect(card).toBeDefined();
  expect(StyleSheet.flatten(card.props.style)).toMatchObject({
    padding: 16,
    borderRadius: 16,
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  });
  await press(tree, 'Send an email');
  expect(JSON.stringify(tree.toJSON())).toContain('Create mail with');
  await press(tree, 'Gmail');
  expect(JSON.stringify(tree.toJSON())).toContain('New Message');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Demo email');
  await press(tree, 'Cancel');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Create mail with');
  expect(props.onBack).not.toHaveBeenCalled();
});
test('Prime call uses original local confirm and 1200ms connection timer', async () => {
  jest.useFakeTimers();
  const { tree } = await render('support');
  await press(tree, 'Call now');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Demo simulation');
  await press(tree, 'Call');
  expect(JSON.stringify(tree.toJSON())).toContain('Calling');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Demo call simulation');
  await act(async () => jest.advanceTimersByTime(1200));
  expect(JSON.stringify(tree.toJSON())).toContain('00:00');
  await act(async () => jest.advanceTimersByTime(1000));
  expect(JSON.stringify(tree.toJSON())).toContain('00:01');
  await press(tree, 'End call');
  expect(pressable(tree, 'Call now')).toBeDefined();
});
test('Source callback selection is a bottom sheet with original boxed check mark and prompt title', async () => {
  const { tree } = await render('call-request');
  await press(tree, 'Open What do you want to talk about?');
  const sheet = tree.root.findByType(AppointmentSheet);
  expect(sheet.props.title).toBe('What do you want to talk about?');
  expect(pressable(tree, 'Close sheet')).toBeDefined();
  await press(tree, 'Product related info');
  expect(JSON.stringify(tree.toJSON())).not.toContain('☑');
  expect(JSON.stringify(tree.toJSON())).toContain('10.7556 3.76108');
});
test('contextual Czech Help opens canonical help context without changing the bank route', async () => {
  const props = {
    ...host('account'),
    country: 'CZ' as const,
    release: 'release-future-cz-coapping' as const,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<CoappingLayer host={props} />);
  });
  trees.push(tree);
  await act(async () => openCurrentContextHelp(props, 'account'));
  expect(JSON.stringify(tree.toJSON())).toContain(
    buildCzChatHelpContext('account', 'example').title,
  );
  expect(props.onNavigate).not.toHaveBeenCalled();
});
