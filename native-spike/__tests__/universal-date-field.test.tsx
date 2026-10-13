import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput, Text, View, StyleSheet } from 'react-native';
import {
  CalendarPanel,
  DateField,
  parseDisplayDate,
  validIsoDate,
} from '../src/universal/DateField';
import { mobileFirstTokens as tokens } from '../src/universal/tokens';
test('ISO/display dates preserve leap-day rules and reject partial input', () => {
  expect(parseDisplayDate('29/02/2024')).toBe('2024-02-29');
  expect(parseDisplayDate('29/02/2025')).toBe('');
  expect(parseDisplayDate('01012000')).toBe('2000-01-01');
  expect(parseDisplayDate('01/0')).toBe('');
  expect(validIsoDate('2025-02-31')).toBe(false);
});

test('compact calendars keep seven columns, Italian initials and selected month synchronized', async () => {
  let tree!: Renderer.ReactTestRenderer;
  const props = {
    tokens,
    value: '2025-01-12',
    compact: true,
    onSelect: jest.fn(),
    onClose: jest.fn(),
  };
  await act(() => {
    tree = Renderer.create(<CalendarPanel {...props} />);
  });
  const grid = tree.root
    .findAllByType(View)
    .find(node => typeof node.props.onLayout === 'function')!;
  await act(() =>
    grid.props.onLayout({ nativeEvent: { layout: { width: 346 } } }),
  );
  const weekday = grid
    .findAllByType(Text)
    .slice(0, 7)
    .map(node => node.props.children);
  expect(weekday).toEqual(['L', 'M', 'M', 'G', 'V', 'S', 'D']);
  const cell = grid
    .findAllByType(View)
    .find(node => StyleSheet.flatten(node.props.style)?.height === 40)!;
  expect(StyleSheet.flatten(cell.props.style).width).toBeCloseTo(
    (346 - 12) / 7,
  );
  expect(
    tree.root.findAll(
      node => node.props?.accessibilityLabel === 'Chiudi calendario',
    ),
  ).toHaveLength(0);
  await act(() => {
    tree.update(<CalendarPanel {...props} value="2025-02-12" />);
  });
  expect(
    tree.root
      .findAllByType(Text)
      .some(node => node.props.children === 'febbraio 2025'),
  ).toBe(true);
});
test('native date typing keeps partial text while canonical incomplete values stay empty', async () => {
  const changed = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <DateField
        tokens={tokens}
        label="Data di nascita"
        value=""
        onChange={changed}
      />,
    );
  });
  await act(() => tree.root.findByType(TextInput).props.onChangeText('01/0'));
  expect(tree.root.findByType(TextInput).props.value).toBe('01/0');
  expect(changed).toHaveBeenLastCalledWith('');
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('01/01/2000'),
  );
  expect(changed).toHaveBeenLastCalledWith('2000-01-01');
});
test('hidden dates are masked and do not expose a date-selection panel', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <DateField
        tokens={tokens}
        label="Data di nascita"
        value="2000-01-01"
        hidden
        onChange={() => {}}
      />,
    );
  });
  expect(tree.root.findByType(TextInput).props.secureTextEntry).toBe(true);
  expect(
    tree.root.findAll(
      node =>
        node.props?.accessibilityLabel === 'Apri calendario Data di nascita',
    ),
  ).toHaveLength(0);
});
test('calendar enforces actual min/max and sends exact selected ISO date', async () => {
  const selected = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <CalendarPanel
        tokens={tokens}
        value="2025-02-10"
        min="2025-02-05"
        max="2025-02-15"
        onSelect={selected}
        onClose={() => {}}
      />,
    );
  });
  const buttons = tree.root.findAll(
    node =>
      typeof node.props?.onPress === 'function' &&
      node.props.accessibilityLabel === '16 febbraio 2025',
  );
  expect(buttons[0]!.props.disabled).toBe(true);
  const day = tree.root.findAll(
    node =>
      typeof node.props?.onPress === 'function' &&
      node.props.accessibilityLabel === '12 febbraio 2025',
  )[0]!;
  await act(() => day.props.onPress());
  expect(selected).toHaveBeenCalledWith('2025-02-12');
});
