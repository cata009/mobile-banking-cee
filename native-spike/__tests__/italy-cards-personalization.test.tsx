import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import CardPersonalization from '../src/experiences/pi/it/cards/CardPersonalization';
import {
  getNativeItalyCardSession,
  saveNativeItalyCardSessionMetadata,
} from '../src/experiences/pi/it/cards/cardSession';
import { ITALY_CARDS } from '@/experiences/pi/it/mobile-first/cardsContent';
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
async function render() {
  const props = {
    cards: getNativeItalyCardSession(),
    hidden: false,
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onChanged: jest.fn(),
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<CardPersonalization {...props} />);
  });
  return { tree, props };
}
beforeEach(async () => {
  await act(() => saveNativeItalyCardSessionMetadata(ITALY_CARDS));
});
test('rename, reorder and favorites remain drafts until a single commit', async () => {
  const { tree, props } = await render();
  await act(() =>
    button(
      tree,
      'Sposta UniCredit Flexia Classic 5678 in basso',
    ).props.onPress(),
  );
  expect(getNativeItalyCardSession()[0].id).toBe('flexia');
  await act(() =>
    button(tree, 'Modifica nome UniCredit My One 5678').props.onPress(),
  );
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('Carta Andrea'),
  );
  await act(() => button(tree, 'Salva').props.onPress());
  expect(
    getNativeItalyCardSession().find(card => card.id === 'my-one')?.nickname,
  ).toBeUndefined();
  await act(() =>
    button(
      tree,
      'Aggiungi UniCredit Genius Card 7878 ai preferiti',
    ).props.onPress(),
  );
  expect(
    getNativeItalyCardSession().find(card => card.id === 'genius')?.favorite,
  ).toBe(false);
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => button(tree, 'Salva').props.onPress());
  expect(getNativeItalyCardSession()[0].id).toBe('my-one');
  expect(
    getNativeItalyCardSession().find(card => card.id === 'my-one')?.nickname,
  ).toBe('Carta Andrea');
  expect(
    getNativeItalyCardSession().find(card => card.id === 'genius')?.favorite,
  ).toBe(true);
  expect(props.onChanged).toHaveBeenCalledTimes(1);
  expect(props.onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});
test('back discards pending favorite changes without modifying shared metadata', async () => {
  const { tree, props } = await render();
  await act(() =>
    button(
      tree,
      'Rimuovi UniCredit Flexia Classic 5678 dai preferiti',
    ).props.onPress(),
  );
  await act(() => button(tree, 'Indietro').props.onPress());
  expect(
    getNativeItalyCardSession().find(card => card.id === 'flexia')?.favorite,
  ).toBe(true);
  expect(props.onChanged).not.toHaveBeenCalled();
  expect(props.onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});
test('invalid rename stays in the native form and preserves the card nickname', async () => {
  const { tree } = await render();
  await act(() =>
    button(tree, 'Modifica nome UniCredit My One 5678').props.onPress(),
  );
  await act(() => tree.root.findByType(TextInput).props.onChangeText('bad!'));
  await act(() => button(tree, 'Salva').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Massimo 20 caratteri alfanumerici',
  );
  expect(tree.root.findByType(TextInput)).toBeTruthy();
  expect(
    getNativeItalyCardSession().find(card => card.id === 'my-one')?.nickname,
  ).toBeUndefined();
  await act(() => tree.unmount());
});
