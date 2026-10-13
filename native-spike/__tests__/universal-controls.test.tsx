import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import {
  Select,
  SearchField,
  Tabs,
  NavigationRow,
} from '../src/universal/controls';
import { mobileFirstTokens } from '../src/universal/tokens';

function button(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      typeof node.props?.onPress === 'function' &&
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === label,
  )[0]!;
}
test('one Select handles arbitrary country and account data without selecting disabled options', async () => {
  const change = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Select
        tokens={mobileFirstTokens}
        label="Choose demo"
        value="IT"
        items={[
          { value: 'IT', label: 'Italy' },
          { value: 'RO', label: 'Romania', disabled: true },
        ]}
        onChange={change}
      />,
    );
  });
  expect(button(tree, 'Choose demo').props.accessibilityValue).toEqual({
    text: 'Italy',
  });
  await act(() => button(tree, 'Choose demo').props.onPress());
  expect(button(tree, 'Romania').props.disabled).toBe(true);
  await act(() => button(tree, 'Italy').props.onPress());
  expect(change).toHaveBeenCalledWith('IT');
  await act(() =>
    tree.update(
      <Select
        tokens={mobileFirstTokens}
        label="Account"
        value="a2"
        items={[
          { value: 'a1', label: 'Primary' },
          { value: 'a2', label: 'Joint' },
        ]}
        onChange={change}
      />,
    ),
  );
  expect(button(tree, 'Account').props.accessibilityValue).toEqual({
    text: 'Joint',
  });
});
test('SearchField uses real TextInput and exposes query change, submit and clear', async () => {
  const change = jest.fn(),
    submit = jest.fn(),
    clear = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <SearchField
        tokens={mobileFirstTokens}
        label="Search app"
        value="Spotify"
        onChange={change}
        onSubmit={submit}
        onClear={clear}
      />,
    );
  });
  const input = tree.root.findByType(TextInput);
  expect(input.props.returnKeyType).toBe('search');
  await act(() => {
    input.props.onChangeText('Bonifico');
    input.props.onSubmitEditing();
  });
  expect(change).toHaveBeenCalledWith('Bonifico');
  expect(submit).toHaveBeenCalledTimes(1);
  await act(() => button(tree, 'Clear search').props.onPress());
  expect(clear).toHaveBeenCalledTimes(1);
});
test('Tabs and NavigationRow preserve typed payloads and selected state', async () => {
  const select = jest.fn(),
    payload = { kind: 'account', id: '000012345' };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <>
        <Tabs
          tokens={mobileFirstTokens}
          value="accounts"
          items={[
            { value: 'all', label: 'All' },
            { value: 'accounts', label: 'Accounts', count: 3 },
          ]}
          onChange={select}
        />
        <NavigationRow
          tokens={mobileFirstTokens}
          title="Andrea"
          subtitle="Primary account"
          payload={payload}
          onSelect={select}
        />
      </>,
    );
  });
  const tab = tree.root.findAll(
    node =>
      typeof node.props?.onPress === 'function' &&
      node.props.accessibilityRole === 'tab' &&
      node.props.accessibilityLabel === 'Accounts',
  )[0]!;
  expect(tab.props.accessibilityState).toEqual({
    selected: true,
    disabled: false,
  });
  await act(() => tab.props.onPress());
  expect(select).toHaveBeenCalledWith('accounts');
  await act(() => button(tree, 'Andrea').props.onPress());
  expect(select).toHaveBeenCalledWith(payload);
});
