import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput, View } from 'react-native';
import { CZECH_PROFILE_ADAPTER } from '../src/experiences/pi/cz/evo-2027/profile/adapter';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
  type CzechNativeScreen,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { getDocumentsConfigForCountry } from '@/app/config/documentsConfig';
import { getMessagesConfigForCountry } from '@/app/config/messagesConfig';
import { DeleteActionReveal } from '../src/universal/DeleteActionReveal';
import { czechPreferences } from '../src/experiences/pi/cz/evo-2027/profile/features/preferences';

const mounted: Renderer.ReactTestRenderer[] = [];
beforeEach(() => czechPreferences.reset());
const pressable = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )
    .at(-1)!;
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () => {
    pressable(tree, label).props.onPress();
  });
}
async function type(
  tree: Renderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  await act(async () => {
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!
      .props.onChangeText(value);
  });
}
async function render(
  screen: CzechNativeScreen,
  params?: Record<string, string>,
) {
  const props: CzechNativeScreenProps = {
    route: { screen, params },
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
  const Screen = CZECH_PROFILE_ADAPTER.screens[screen]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Screen {...props} />);
  });
  mounted.push(tree);
  return { tree, props };
}
afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach(tree => tree.unmount());
  });
});

test('More preserves CZ order and only active Source cards navigate', async () => {
  const { tree, props } = await render('profile');
  const cards = tree.root.findAll(
    node =>
      node.props.testID?.startsWith('cz-more-card-') &&
      typeof node.props.onPress === 'function',
  );
  expect(cards.map(node => node.props.testID)).toEqual(
    [
      'contacts',
      'documents',
      'settings',
      'third-party-consent',
      'digital-activities',
      'my-requests',
      'tutorial',
    ].map(id => `cz-more-card-${id}`),
  );
  await press(tree, 'Documents');
  expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'documents' });
  await press(tree, 'Consent to third parties');
  expect(props.onNavigate).toHaveBeenCalledTimes(1);
});
test('documents cancellation and legal protection preserve Source rows, confirmed ordinary deletion removes just that row', async () => {
  const { tree } = await render('documents');
  const regular = getDocumentsConfigForCountry('CZ').groups[0].items.find(
    item => !item.isLegal,
  )!;
  const legal = getDocumentsConfigForCountry('CZ').groups[0].items.find(
    item => item.isLegal,
  )!;
  await press(tree, `Document actions ${regular.id}`);
  const reveal = tree.root
    .findAllByType(DeleteActionReveal)
    .find(node => node.props.testID === `delete-reveal-${regular.id}`);
  expect(reveal?.props.actionsOpen).toBe(true);
  await press(tree, `Delete document ${regular.id}`);
  await press(tree, 'Cancel');
  expect(pressable(tree, `Document actions ${regular.id}`)).toBeDefined();
  await press(tree, `Document actions ${legal.id}`);
  await press(tree, `Delete document ${legal.id}`);
  await press(tree, 'Delete');
  expect(JSON.stringify(tree.toJSON())).toContain('cannot be deleted');
  await press(tree, 'OK');
  expect(pressable(tree, `Document actions ${legal.id}`)).toBeDefined();
  await press(tree, `Document actions ${regular.id}`);
  await press(tree, `Delete document ${regular.id}`);
  await press(tree, 'Delete');
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === `Document actions ${regular.id}`,
    ),
  ).toHaveLength(0);
});
test('document localized search trims query and searches year, legal description and badge', async () => {
  const { tree } = await render('documents');
  await type(tree, 'Search', ' legal ');
  expect(
    tree.root.findAll(
      node => node.type === View && node.props.testID === 'cz-document-row',
    ),
  ).toHaveLength(3);
  await type(tree, 'Search', 'new');
  expect(
    tree.root.findAll(
      node => node.type === View && node.props.testID === 'cz-document-row',
    ),
  ).toHaveLength(1);
  await type(tree, 'Search', '2025');
  expect(
    tree.root.findAll(
      node => node.type === View && node.props.testID === 'cz-document-row',
    ),
  ).toHaveLength(5);
});
test('mailbox selection preserves query and uses canonical outbox data', async () => {
  const { tree } = await render('messages');
  expect(
    tree.root.findAll(
      node => node.type === View && node.props.testID === 'cz-message-row',
    ),
  ).toHaveLength(16);
  await type(tree, 'Search', 'card transaction');
  await press(tree, 'Outbox');
  expect(
    tree.root.findAll(
      node => node.type === View && node.props.testID === 'cz-message-row',
    ),
  ).toHaveLength(1);
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Question about a card transaction.',
  );
});

test('CZ Evo Messages expose Delete, preserve the row on cancel, and remove it on confirmation', async () => {
  const { tree } = await render('messages');
  const first = getMessagesConfigForCountry('CZ').inbox[0]!;
  await press(tree, `Message actions ${first.title}`);
  expect(
    pressable(tree, `Message actions ${first.title}`).props.accessibilityState,
  ).toEqual({ expanded: true });
  expect(pressable(tree, `Delete message ${first.title}`)).toBeDefined();
  await press(tree, `Delete message ${first.title}`);
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Are you sure you want to delete this message?',
  );
  await press(tree, 'Cancel');
  expect(pressable(tree, `Message actions ${first.title}`)).toBeDefined();
  await press(tree, `Message actions ${first.title}`);
  await press(tree, `Delete message ${first.title}`);
  await press(tree, 'Delete');
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === `Message actions ${first.title}`,
    ),
  ).toHaveLength(0);
});
test('settings keeps inactive rows inert and language Back discards the selection', async () => {
  const { tree, props } = await render('settings');
  await press(tree, 'Security');
  expect(props.onNavigate).not.toHaveBeenCalled();
  await press(tree, 'Language');
  await press(tree, 'Čeština');
  await press(tree, 'Back');
  await press(tree, 'Language');
  expect(pressable(tree, 'English').props.accessibilityState.selected).toBe(
    true,
  );
});
test('appearance Back cancels wallpaper draft but keeps immediate appearance mode', async () => {
  const { tree } = await render('settings');
  await press(tree, 'Appearance');
  await press(tree, 'Select Aurora theme');
  await press(tree, 'dark');
  expect(czechPreferences.getSnapshot()).toMatchObject({
    appearance: 'dark',
    homeTheme: 'standard',
  });
  await press(tree, 'Back');
  await press(tree, 'Appearance');
  expect(
    pressable(tree, 'Select Classic UniCredit theme').props.accessibilityState
      .selected,
  ).toBe(true);
  expect(pressable(tree, 'dark').props.accessibilityState.selected).toBe(true);
});
test('appearance Apply commits only the selected Source wallpaper', async () => {
  const { tree } = await render('settings');
  await press(tree, 'Appearance');
  await press(tree, 'Select Aurora theme');
  await press(tree, 'Apply Aurora');
  expect(czechPreferences.getSnapshot().homeTheme).toBe('aurora');
  await press(tree, 'Appearance');
  expect(
    pressable(tree, 'Select Aurora theme').props.accessibilityState.selected,
  ).toBe(true);
});
test('language Save applies CS copy while the draft only previews it', async () => {
  const { tree } = await render('settings');
  await press(tree, 'Language');
  await press(tree, 'Čeština');
  expect(czechPreferences.getSnapshot().language).toBe('en');
  const save = tree.root
    .findAll(
      node =>
        typeof node.props.onPress === 'function' &&
        node.props.accessibilityLabel === 'Uložit',
    )
    .at(-1)!;
  await act(async () => save.props.onPress());
  expect(czechPreferences.getSnapshot().language).toBe('cs');
  expect(JSON.stringify(tree.toJSON())).toContain('Nastavení');
});
test('messages places its Source large title before the sticky mailbox controls', async () => {
  const { tree } = await render('messages');
  const rendered = JSON.stringify(tree.toJSON());
  expect(rendered.indexOf('"Messages"')).toBeLessThan(
    rendered.indexOf('"Inbox"'),
  );
});
test('document delete backdrop cancels the Source confirmation without deleting the row', async () => {
  const { tree } = await render('documents');
  const id = getDocumentsConfigForCountry('CZ').groups[0].items[0].id;
  await press(tree, `Document actions ${id}`);
  await press(tree, `Delete document ${id}`);
  const backdrop = tree.root
    .findAll(
      node =>
        node.props.testID === 'cz-confirm-backdrop' &&
        typeof node.props.onPress === 'function',
    )
    .at(-1);
  expect(backdrop).toBeDefined();
  await act(async () => backdrop!.props.onPress());
  expect(pressable(tree, `Document actions ${id}`)).toBeDefined();
  expect(JSON.stringify(tree.toJSON())).not.toContain(
    'Are you sure you want to delete this document?',
  );
});
