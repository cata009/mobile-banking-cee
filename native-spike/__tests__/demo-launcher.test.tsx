import React, { useState } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, StyleSheet, View } from 'react-native';
import GlobalDemoSelector from '../src/app/GlobalDemoSelector';
import { NATIVE_DEMO_CHOICES } from '../src/app/registry';
import type { NativeDemoSelection } from '../src/app/registry';

const ITALY: NativeDemoSelection = {
  product: 'PI',
  country: 'IT',
  designSystem: 'mobile-first',
  release: 'release-current',
  scenario: 'active',
};
const CZECH: NativeDemoSelection = {
  product: 'PI',
  country: 'CZ',
  designSystem: 'current',
  release: 'release-future-evo-2027',
  scenario: 'active',
};
const mounted: Renderer.ReactTestRenderer[] = [];
const action = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(() => action(tree, label).props.onPress());
}
async function render(
  initial = ITALY,
  extra: { entryAvailable?: boolean; onSearch?: () => void } = {},
) {
  const change = jest.fn(),
    open = jest.fn();
  function Harness() {
    const [selection, select] = useState(initial);
    return (
      <GlobalDemoSelector
        {...extra}
        selection={selection}
        onChange={next => {
          change(next);
          select(next);
        }}
        onOpen={open}
      />
    );
  }
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Harness />);
  });
  mounted.push(tree);
  return { tree, change, open };
}
afterEach(async () => {
  await act(() => {
    mounted.splice(0).forEach(tree => tree.unmount());
  });
});
test('open action stays outside the scrolling catalogue so selecting a market does not require scrolling to the end', async () => {
  const { tree } = await render();
  let ancestor = action(tree, 'Deschide demo').parent;
  while (ancestor) {
    expect(ancestor.type).not.toBe(ScrollView);
    ancestor = ancestor.parent;
  }
});

test('launcher exposes every catalogued experience with separate release/scenario axes and preserves exact context callbacks', async () => {
  const { tree, change, open } = await render();
  const choices = tree.root.findAll(
    node =>
      node.props.testID?.startsWith('demo-choice-') &&
      typeof node.props.onPress === 'function',
  );
  expect(choices).toHaveLength(NATIVE_DEMO_CHOICES.length);
  expect(
    action(tree, 'Italia, Mobile First').props.accessibilityState.selected,
  ).toBe(true);
  expect(
    action(tree, 'Cehia, Evo 2027').props.accessibilityState.selected,
  ).toBe(false);
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityState?.expanded !== undefined &&
        typeof node.props.onPress === 'function',
    ),
  ).toHaveLength(1);
  await press(tree, 'Cehia, Evo 2027');
  expect(change).toHaveBeenLastCalledWith(CZECH);
  expect(open).not.toHaveBeenCalled();
  expect(
    action(tree, 'Cehia, Evo 2027').props.accessibilityState.selected,
  ).toBe(true);
  await press(tree, 'Deschide demo');
  expect(open).toHaveBeenCalledTimes(1);
  await press(tree, 'Italia, Mobile First');
  expect(change).toHaveBeenLastCalledWith(ITALY);
  const contents = JSON.stringify(tree.toJSON());
  expect(contents).not.toContain('release-future-evo-2027');
  expect(contents).not.toContain('Design system');
  expect(contents).not.toContain('Scenario');
});

test('unsupported initial axes are not silently replaced; selection requires an explicit supported action', async () => {
  const { tree, change, open } = await render({
    ...CZECH,
    country: 'IT',
    release: 'release-current',
    scenario: 'inactive',
  });
  expect(change).not.toHaveBeenCalled();
  expect(
    action(tree, 'Italia, Mobile First').props.accessibilityState.selected,
  ).toBe(false);
  expect(
    action(tree, 'Cehia, Evo 2027').props.accessibilityState.selected,
  ).toBe(false);
  expect(action(tree, 'Deschide demo').props.disabled).toBe(true);
  await press(tree, 'Deschide demo');
  expect(open).not.toHaveBeenCalled();
  await press(tree, 'Italia, Mobile First');
  expect(change).toHaveBeenCalledWith(ITALY);
  expect(action(tree, 'Deschide demo').props.disabled).toBe(false);
  await press(tree, 'Deschide demo');
  expect(open).toHaveBeenCalledTimes(1);
});

test('entry availability disables opening and hides generic Search without changing the selected context', async () => {
  const search = jest.fn();
  const { tree, change, open } = await render(CZECH, {
    entryAvailable: false,
    onSearch: search,
  });
  expect(action(tree, 'Deschide demo').props.disabled).toBe(true);
  await press(tree, 'Deschide demo');
  expect(open).not.toHaveBeenCalled();
  expect(action(tree, 'Caută în demo')).toBeUndefined();
  expect(change).not.toHaveBeenCalled();
  expect(search).not.toHaveBeenCalled();
});

test('generic Search is a separate optional action only for exact active Czech Evo', async () => {
  const search = jest.fn();
  const { tree, change, open } = await render(CZECH, { onSearch: search });
  expect(action(tree, 'Caută în demo')).toBeDefined();
  await press(tree, 'Caută în demo');
  expect(search).toHaveBeenCalledTimes(1);
  expect(open).not.toHaveBeenCalled();
  expect(change).not.toHaveBeenCalled();
  await press(tree, 'Italia, Mobile First');
  expect(action(tree, 'Caută în demo')).toBeUndefined();
  const noCallback = await render(CZECH);
  expect(action(noCallback.tree, 'Caută în demo')).toBeUndefined();
  const inactive = await render(
    { ...CZECH, scenario: 'inactive' },
    { onSearch: search },
  );
  expect(action(inactive.tree, 'Caută în demo')).toBeUndefined();
});

test('launcher remains scrollable with large accessible card targets and a capped readable width', async () => {
  const { tree } = await render();
  expect(tree.root.findAllByType(ScrollView)).toHaveLength(1);
  const cards = tree.root.findAll(
    node =>
      node.props.testID?.startsWith('demo-choice-') &&
      typeof node.props.onPress === 'function',
  );
  for (const card of cards) {
    expect(card.props.accessibilityRole).toBe('button');
    expect(card.props.focusable).toBe(true);
    const style =
      typeof card.props.style === 'function'
        ? card.props.style({ pressed: false })
        : card.props.style;
    expect(StyleSheet.flatten(style).minHeight).toBeGreaterThanOrEqual(44);
  }
  expect(
    tree.root
      .findAllByType(View)
      .some(node => StyleSheet.flatten(node.props.style)?.maxWidth === 520),
  ).toBe(true);
});
