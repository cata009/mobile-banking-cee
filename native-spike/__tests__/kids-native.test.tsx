import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import NativeKidsApp from '../src/experiences/kids-pi/NativeKidsApp';
import { RO_AVAILABLE_BALANCE } from '@/app/screens/kids/ro/data';
import { formatRonFull } from '@/app/screens/kids/ro/money';
import * as biometrics from '../src/platform/biometrics';
import * as privacy from '../src/platform/screenPrivacy';
import { HU_LEARN_TOPICS } from '@/app/screens/kids/hu/learnTopics';

const mounted: Renderer.ReactTestRenderer[] = [];
async function render(
  country: 'RO' | 'HU' | 'SK',
  scenario: 'active' | 'inactive' = 'active',
) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeKidsApp country={country} scenario={scenario} />,
    );
  });
  mounted.push(tree);
  return tree;
}
function text(tree: Renderer.ReactTestRenderer) {
  return JSON.stringify(tree.toJSON());
}
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  const item = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0];
  if (!item) throw new Error(`Missing ${label}`);
  await act(() => item.props.onPress());
}
async function fill(
  tree: Renderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  const item = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onChangeText === 'function',
  )[0];
  if (!item) throw new Error(`Missing input ${label}`);
  await act(() => item.props.onChangeText(value));
}
afterEach(async () => {
  await act(() => mounted.splice(0).forEach(t => t.unmount()));
  jest.restoreAllMocks();
});

test('SK retains real Source tabs and inert task/shortcut cards', async () => {
  const tree = await render('SK');
  expect(text(tree)).toContain('SK31UNCR7000123456789');
  await press(tree, 'Education');
  expect(text(tree)).toContain('Skills for transition');
  await press(tree, 'Tasks');
  expect(text(tree)).toContain('Rejected by parent');
  expect(
    tree.root.findAll(
      n => n.props.accessibilityLabel === 'Clean your room' && n.props.onPress,
    ),
  ).toHaveLength(0);
});
test('RO trusted small payment settles using its original curated payee model', async () => {
  const tree = await render('RO');
  await press(tree, 'Plătește');
  await press(tree, 'Mama');
  await fill(tree, 'Sumă', '20');
  await press(tree, 'Trimite 20 RON');
  await press(tree, 'Gata');
  expect(text(tree)).toContain(formatRonFull(RO_AVAILABLE_BALANCE - 20));
  expect(text(tree)).toContain('Către Mama');
  expect(text(tree)).not.toContain('IBAN');
});
test('RO restricted payee stages approval and only explicit demo parent approval changes balance', async () => {
  const tree = await render('RO');
  await press(tree, 'Plătește');
  await press(tree, 'David');
  await fill(tree, 'Sumă', '10');
  await press(tree, 'Trimite Mamei spre aprobare');
  await press(tree, 'Gata');
  expect(text(tree)).toContain(formatRonFull(RO_AVAILABLE_BALANCE));
  await press(tree, 'Cereri & aprobări');
  await press(tree, 'Aprobă Plată David');
  await press(tree, 'Back');
  expect(text(tree)).toContain(formatRonFull(RO_AVAILABLE_BALANCE - 10));
});
test('RO per-payee and weekly caps block native confirmation', async () => {
  const tree = await render('RO');
  await press(tree, 'Plătește');
  await press(tree, 'Vlad');
  await fill(tree, 'Sumă', '999');
  expect(text(tree)).toContain('Peste limita');
  const button = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === 'Alege o sumă validă' && n.props.onPress,
  )[0];
  expect(button.props.disabled).toBe(true);
});
test('RO card control state survives tab navigation', async () => {
  const tree = await render('RO');
  await press(tree, 'Card');
  await press(tree, 'Blochează');
  await press(tree, 'Acasă');
  await press(tree, 'Card');
  expect(text(tree)).toContain('Card oprit acum');
  await press(tree, 'Deblochează');
  expect(text(tree)).toContain('Activ');
});
test('HU send threshold preserves pending versus approved without mutating original ledger', async () => {
  const tree = await render('HU');
  await press(tree, 'Send money');
  await fill(tree, 'Amount', '6000');
  await press(tree, 'Ask Mom to approve');
  await press(tree, 'Back');
  expect(text(tree)).toContain('Send Money');
  expect(text(tree)).toContain('pending');
  await press(tree, 'Send money');
  await fill(tree, 'Amount', '100');
  await press(tree, 'Send money');
  await press(tree, 'Back');
  expect(text(tree)).toContain('Money sent');
  expect(text(tree)).toContain('approved');
});
test('HU goal create and add money follow canonical reducer and reject over-balance amount', async () => {
  const tree = await render('HU');
  await press(tree, 'Saving');
  await press(tree, 'Create goal');
  await fill(tree, 'Goal name', 'Native bicycle');
  await fill(tree, 'Target', '4000');
  await press(tree, 'Create goal');
  await press(tree, 'Add money');
  await fill(tree, 'Amount', '40000');
  expect(text(tree)).toContain('Insufficient funds');
  await fill(tree, 'Amount', '100');
  await press(tree, 'Add money');
  expect(text(tree)).toContain('You added money');
});
test('inactive Kids has no invented PI login or live child flow', async () => {
  const tree = await render('RO', 'inactive');
  expect(text(tree)).toContain('inactive');
  expect(text(tree)).not.toContain('Plătește');
});
test('HU card reveal waits for privacy protection and discards late authentication after Back', async () => {
  jest
    .spyOn(biometrics, 'authenticateNativeBiometric')
    .mockResolvedValue('authenticated');
  let releasePrivacy!: (value: boolean) => void;
  jest.spyOn(privacy, 'setNativeScreenshotsAllowed').mockImplementationOnce(
    () =>
      new Promise(resolve => {
        releasePrivacy = resolve;
      }),
  );
  const tree = await render('HU');
  await press(tree, 'Account details');
  await press(tree, 'Reveal card details');
  expect(text(tree)).not.toContain('CVV');
  await press(tree, 'Back');
  await act(async () => {
    releasePrivacy(true);
  });
  expect(text(tree)).not.toContain('CVV');
});
test('HU lesson completion requires every canonical quiz answer', async () => {
  const lesson = HU_LEARN_TOPICS[0].lessons[1];
  const tree = await render('HU');
  await press(tree, 'Earning');
  await press(tree, 'Money basics');
  await press(tree, lesson.title);
  for (let index = 0; index < (lesson.slides?.length ?? 0); index++)
    await press(tree, 'Continue');
  const complete = () =>
    tree.root.findAll(
      n => n.props.accessibilityLabel === 'Complete lesson' && n.props.onPress,
    )[0];
  expect(complete().props.disabled).toBe(true);
  await press(tree, lesson.quiz![0].options[lesson.quiz![0].correctIndex]);
  expect(complete().props.disabled).toBe(true);
  await press(tree, lesson.quiz![1].options[lesson.quiz![1].correctIndex]);
  expect(complete().props.disabled).toBe(false);
  await press(tree, 'Complete lesson');
  expect(text(tree)).toContain('Completed');
});
