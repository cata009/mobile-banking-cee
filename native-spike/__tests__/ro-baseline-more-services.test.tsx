import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView } from 'react-native';
import Contacts from '../src/experiences/pi/current/baseline/more/Contacts';
import Documents from '../src/experiences/pi/current/baseline/more/Documents';
import Messages from '../src/experiences/pi/current/baseline/more/Messages';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineSearchBar } from '../src/universal/BaselineSearchBar';
import { BaselineMailboxTabs } from '../src/universal/BaselineMailboxTabs';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { ServiceDatedRow } from '../src/experiences/pi/current/baseline/more/ServicePrimitives';
import { getMessagesConfigForCountry } from '@/app/config/messagesConfig';

function host(
  screen: 'contacts' | 'documents' | 'messages',
): CurrentScreenProps {
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
    route: { screen },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 12,
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
  };
}
const mounted: Renderer.ReactTestRenderer[] = [];
function mount(
  Component: React.ComponentType<CurrentScreenProps>,
  props: CurrentScreenProps,
) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Component {...props} />);
  });
  mounted.push(tree);
  return tree;
}
afterEach(() => {
  act(() => mounted.splice(0).forEach(tree => tree.unmount()));
});
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const button = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      n.props.accessibilityRole === 'button',
  )[0];
  expect(button).toBeDefined();
  act(() => button.props.onPress?.());
}
function text(tree: Renderer.ReactTestRenderer) {
  return JSON.stringify(tree.toJSON());
}

it('preserves Source contacts identity and only navigates the Prime advisor action', () => {
  const h = host('contacts'),
    tree = mount(Contacts, h);
  expect(text(tree)).toContain('+420 221 210 031');
  expect(text(tree)).toContain('WWW.UNICREDIT.CZ');
  press(tree, 'Branch & ATM Finder');
  press(tree, 'Call Us');
  press(tree, 'Help');
  expect(h.onNavigate).not.toHaveBeenCalled();
  press(tree, 'My Prime Advisor');
  expect(h.onNavigate).toHaveBeenCalledWith({ screen: 'prime' });
  press(tree, 'Back');
  expect(h.onBack).toHaveBeenCalledTimes(1);
});

it('keeps the toolbar fixed above the independently sticky mailbox rail and collapses at 64px', () => {
  const tree = mount(Messages, host('messages'));
  const scroll = tree.root.findByType(ScrollView);
  expect(scroll.findAllByType(BaselinePageHeader)).toHaveLength(0);
  expect(scroll.props.stickyHeaderIndices).toEqual([1]);
  expect(tree.root.findByType(BaselinePageHeader).props.safeAreaReserve).toBe(
    12,
  );
  act(() =>
    scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 32 } } }),
  );
  expect(
    tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
  ).toBe(0.5);
  act(() =>
    scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 120 } } }),
  );
  expect(
    tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
  ).toBe(1);
});

it('retains every Source mailbox row in order and filters the displayed translation', () => {
  const h = host('messages');
  const sourceT = h.t;
  h.t = (key, fallback) =>
    key === 'runtime.messages.rows.card-notification.title'
      ? 'Translated card'
      : sourceT(key, fallback);
  const tree = mount(Messages, h);
  expect(
    tree.root.findAllByType(ServiceDatedRow).map(row => row.props.item.id),
  ).toEqual(getMessagesConfigForCountry('RO').inbox.map(item => item.id));
  act(() =>
    tree.root
      .findByType(BaselineSearchBar)
      .props.onValueChange('  translated  '),
  );
  expect(
    tree.root.findAllByType(ServiceDatedRow).map(row => row.props.item.title),
  ).toEqual(['Translated card']);
  act(() => tree.root.findByType(BaselineSearchBar).props.onValueChange(''));
  act(() => tree.root.findByType(BaselineMailboxTabs).props.onChange('outbox'));
  expect(
    tree.root.findAllByType(ServiceDatedRow).map(row => row.props.item.id),
  ).toEqual(getMessagesConfigForCountry('RO').outbox.map(item => item.id));
});

it('preserves document ordering, localized search, cancellation and actual deletion', () => {
  const tree = mount(Documents, host('documents'));
  expect(text(tree).indexOf('2026')).toBeLessThan(text(tree).indexOf('2025'));
  act(() =>
    tree.root.findByType(BaselineSearchBar).props.onValueChange('  salary  '),
  );
  expect(text(tree)).toContain('SALARY TRANSFER');
  expect(text(tree)).not.toContain('LEONARDO OLIVEIRA');
  const id = 'documents-2025-12-12';
  press(tree, `Document actions ${id}`);
  press(tree, `Delete document ${id}`);
  press(tree, 'Cancel');
  expect(text(tree)).toContain('SALARY TRANSFER');
  press(tree, `Document actions ${id}`);
  press(tree, `Delete document ${id}`);
  press(tree, 'Delete');
  expect(text(tree)).not.toContain('SALARY TRANSFER');
});

it('keeps legal documents and shows a single-action legal alert after confirmation', () => {
  const tree = mount(Documents, host('documents')),
    id = 'documents-2026-05-28';
  press(tree, `Document actions ${id}`);
  press(tree, `Delete document ${id}`);
  press(tree, 'Delete');
  expect(text(tree)).toContain(
    'The selected file is marked as legal and cannot be deleted.',
  );
  expect(
    tree.root.findAll(n => n.props.accessibilityLabel === 'Cancel'),
  ).toHaveLength(0);
  press(tree, 'OK');
  press(tree, `Document actions ${id}`);
  expect(text(tree)).toContain('Legal');
});

it('filters Source messages across mailbox changes and keeps more actions inert', () => {
  const h = host('messages'),
    tree = mount(Messages, h);
  expect(text(tree)).toContain('CARD NOTIFICATION');
  press(tree, 'More actions');
  expect(h.onNavigate).not.toHaveBeenCalled();
  act(() =>
    tree.root.findByType(BaselineSearchBar).props.onValueChange('  request  '),
  );
  expect(text(tree)).not.toContain('CARD NOTIFICATION');
  act(() => tree.root.findByType(BaselineMailboxTabs).props.onChange('outbox'));
  expect(text(tree)).toContain('SUPPORT REQUEST');
  expect(text(tree)).not.toContain('ADDRESS UPDATE');
  act(() =>
    tree.root.findByType(BaselineSearchBar).props.onValueChange('2025'),
  );
  expect(text(tree)).toContain('ADDRESS UPDATE');
  press(tree, 'Back');
  expect(h.onBack).toHaveBeenCalledTimes(1);
});
