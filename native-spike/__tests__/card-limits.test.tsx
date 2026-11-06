import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import CardLimitsSheet from '../src/experiences/pi/current/baseline/CardLimitsSheet';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { PrimaryButton } from '../src/universal/PrimaryButton';
jest.mock('../src/universal/ModalPortal', () => ({
  ModalPortal: ({ children }: { children: React.ReactNode }) => children,
}));
test('edits a local-currency limit and retains it for the same card', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <CardLimitsSheet
        country="HU"
        cardId="test-hu"
        dark={false}
        onClose={() => {}}
      />,
    );
  });
  const row = () =>
    tree.root
      .findAllByType(BaselineNavigationRow)
      .find(x => x.props.ariaLabel === 'ATM amount limit')!;
  expect(row().props.description).toContain('HUF');
  act(() => row().props.onPress());
  const field = tree.root.findByType(BaselineTextField);
  act(() => field.props.onChange('500000'));
  expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(false);
  act(() => tree.root.findByType(PrimaryButton).props.onPress());
  expect(row().props.description).toContain('500,000.00 HUF');
  act(() => tree.unmount());
  act(() => {
    tree = Renderer.create(
      <CardLimitsSheet
        country="HU"
        cardId="test-hu"
        dark={false}
        onClose={() => {}}
      />,
    );
  });
  expect(row().props.description).toContain('500,000.00 HUF');
  act(() => tree.unmount());
});

import { StyleSheet } from 'react-native';
import { Text } from '../src/universal/Typography';
test('aligns limit controls with section dividers and uses UniCredit for explanatory text', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <CardLimitsSheet
        country="BA"
        cardId="alignment"
        dark={false}
        onClose={() => {}}
      />,
    );
  });
  const rows = () => tree.root.findAllByType(BaselineNavigationRow);
  for (const row of rows())
    expect(StyleSheet.flatten(row.props.style)).toMatchObject({
      paddingLeft: 0,
      paddingRight: 0,
    });
  const intro = tree.root
    .findAllByType(Text)
    .find(
      node =>
        Array.isArray(node.props.children) &&
        node.props.children.some(
          (part: unknown) =>
            typeof part === 'string' &&
            part.includes('Set your daily card limits'),
        ),
    )!;
  expect(StyleSheet.flatten(intro.props.style).fontFamily).toBe(
    'UniCredit-regular',
  );
  act(() =>
    rows()
      .find(node => node.props.ariaLabel === 'ATM amount limit')!
      .props.onPress(),
  );
  const validity = rows().find(
    node => node.props.title === 'SET FOR THE REST OF THE DAY',
  )!;
  expect(StyleSheet.flatten(validity.props.style)).toMatchObject({
    paddingLeft: 0,
    paddingRight: 0,
  });
  const currency = tree.root
    .findAllByType(Text)
    .find(node => node.props.children === 'CURRENCY')!;
  expect(StyleSheet.flatten(currency.props.style).fontFamily).toBe(
    'UniCredit-regular',
  );
  act(() => tree.unmount());
});
