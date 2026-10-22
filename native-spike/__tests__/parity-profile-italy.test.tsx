import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import ProfileScreen from '../src/experiences/pi/it/profile/ProfileScreen';
import { DEFAULT_ITALY_COUNTS } from '../src/experiences/pi/it/contracts';
import { profileServicesStore } from '@/features/profile/mobileFirstProfileServices';
import { initializeProfileComposition } from '@/experiences/pi/it/mobile-first/profileComposition';
const trees: Renderer.ReactTestRenderer[] = [];
async function render() {
  initializeProfileComposition();
  profileServicesStore.reset();
  const onBack = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <ProfileScreen
        target={{ kind: 'profile', area: 'hub' }}
        productCounts={DEFAULT_ITALY_COUNTS}
        amountsHidden={false}
        onBack={onBack}
        onNavigate={jest.fn()}
        onProfile={jest.fn()}
        onChanged={jest.fn()}
      />,
    );
  });
  trees.push(tree);
  return { tree, onBack };
}
function button(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )
    .at(-1)!;
}
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () => button(tree, label).props.onPress());
}
afterEach(async () => {
  await act(async () => trees.splice(0).forEach(tree => tree.unmount()));
});
test('Source Italy profile Back remounts Hub initial Notifiche tab', async () => {
  const { tree } = await render();
  await press(tree, 'Messaggi');
  await press(tree, 'Impostazioni');
  await press(tree, 'Indietro');
  expect(button(tree, 'Notifiche').props.accessibilityState.selected).toBe(
    true,
  );
  expect(
    tree.root.findAll(node => node.props.testID === 'native-profile-hidden'),
  ).toHaveLength(0);
});
test('Source Italy close on a Hub child returns Hub and retains host', async () => {
  const { tree, onBack } = await render();
  await press(tree, 'Impostazioni');
  await press(tree, 'Chiudi');
  expect(button(tree, 'Seleziona profilo')).toBeDefined();
  expect(onBack).not.toHaveBeenCalled();
});
test('Source Italy Hub preserves40px top controls and empty communication copy', async () => {
  const { tree } = await render();
  expect(
    StyleSheet.flatten(button(tree, 'Chiudi profilo').props.style),
  ).toMatchObject({ width: 40, height: 40 });
  await act(async () =>
    profileServicesStore.update('messages', items =>
      items.map(item => ({ ...item, archived: true })),
    ),
  );
  await press(tree, 'Messaggi');
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Nessun messaggio disponibile',
  );
});
