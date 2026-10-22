import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, TextInput } from 'react-native';
import { CzRoboFlow } from '../src/experiences/pi/cz/evo-2027/robo';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { ToggleButton } from '../src/universal/ToggleButton';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import { AssetGlyph } from '../src/universal/AssetGlyph';

function render() {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <CzRoboFlow onBack={jest.fn()} onExit={jest.fn()} />,
    );
  });
  return tree;
}
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const button = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0]!;
  act(() => button.props.onPress());
}
function toName(tree: Renderer.ReactTestRenderer) {
  press(tree, 'Create Goal');
  press(tree, 'I confirm these data');
  press(tree, 'Continue');
  press(
    tree,
    'General build-up wealth. Grow your wealth to support long-term goals.',
  );
  press(tree, 'Continue');
}
function change(
  tree: Renderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === label)!
      .props.onChangeText(value),
  );
}

test('intro uses the three Figma icons, exact subtitle, legal note, and canonical CTA', () => {
  const tree = render();
  expect(
    tree.root.findAllByType(SourceCustomIcon).map(n => n.props.name),
  ).toEqual(
    expect.arrayContaining(['user-round', 'chart-bars', 'shield-check']),
  );
  const text = JSON.stringify(tree.toJSON());
  expect(text).toContain(
    'Create a goal and invest with a portfolio selected for your needs.',
  );
  expect(text).toContain('Creating your goal does not invest money.');
  expect(
    tree.root.findAllByType(PrimaryButton).map(n => n.props.label),
  ).toContain('Create Goal');
  act(() => tree.unmount());
});

test('name and target pages compose the canonical DS fields', () => {
  const tree = render();
  toName(tree);
  expect(
    tree.root
      .findAllByType(BaselineTextField)
      .some(n => n.props.label === 'Enter your goal name'),
  ).toBe(true);
  change(tree, 'Enter your goal name', 'Bright future');
  press(tree, 'Continue');
  expect(tree.root.findByType(BaselineAmountField).props.currency).toBe('CZK');
  press(tree, 'Other time horizon');
  expect(
    tree.root
      .findAllByType(BaselineTextField)
      .some(n => n.props.label === 'Other time horizon (3–15 years)'),
  ).toBe(true);
  act(() => tree.unmount());
});

test('review uses the original DS switch and portfolio detail retains the 82px product rows', () => {
  const tree = render();
  toName(tree);
  change(tree, 'Enter your goal name', 'Bright future');
  press(tree, 'Continue');
  change(tree, 'Target amount', '100000');
  press(tree, '10 years');
  press(tree, 'Continue');
  const details = tree.root.findAll(
    n => n.props.text === 'DETAILS' && typeof n.props.onPress === 'function',
  )[0]!;
  act(() => details.props.onPress());
  const row = tree.root.findByProps({ testID: 'cz-basket-holding-1' });
  expect(StyleSheet.flatten(row.props.style).minHeight).toBe(82);
  press(tree, 'Back');
  press(tree, 'Continue');
  expect(tree.root.findByType(ToggleButton).props.ariaLabel).toBe(
    'Accept investment account terms',
  );
  act(() => tree.root.findByType(ToggleButton).props.onToggle(true));
  const sheet = tree.root.findByType(BaselineBottomSheet);
  expect(sheet.props.padding).toBe(24);
  expect(sheet.props.contentBleed).toBe(true);
  act(() => tree.unmount());
});

test('a fixed amount currency is a suffix aligned with the value, without an inert selector button', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineAmountField
        label="Target amount"
        value="0"
        currency="CZK"
        currencyPresentation="suffix"
        onChange={jest.fn()}
      />,
    );
  });
  expect(
    tree.root.findAll(n => n.props.accessibilityRole === 'button'),
  ).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toContain('CZK');
  act(() => tree.unmount());
});

test('processing and success retain the Figma type sizes, artwork, and canonical actions', async () => {
  jest.useFakeTimers();
  const tree = render();
  try {
    toName(tree);
    change(tree, 'Enter your goal name', 'Bright future');
    press(tree, 'Continue');
    change(tree, 'Target amount', '100000');
    press(tree, '10 years');
    press(tree, 'Continue');
    press(tree, 'Continue');
    act(() => tree.root.findByType(ToggleButton).props.onToggle(true));
    act(() =>
      tree.root
        .findByProps({ testID: 'cz-investment-contract-scroll' })
        .props.onScroll({
          nativeEvent: {
            contentOffset: { y: 500 },
            layoutMeasurement: { height: 300 },
            contentSize: { height: 720 },
          },
        }),
    );
    press(tree, 'I have read it');
    press(tree, 'Continue to sign');
    await act(async () => Promise.resolve());
    await act(async () => {
      await tree.root
        .findAll(
          n =>
            n.props.accessibilityLabel === 'Sign' &&
            typeof n.props.onPress === 'function',
        )[0]!
        .props.onPress();
    });
    await act(async () => {
      jest.advanceTimersByTime(840);
      await Promise.resolve();
    });
    expect(
      tree.root.findByProps({ testID: 'cz-processing' }).findByType(AssetGlyph)
        .props.size,
    ).toBe(100);
    await act(async () => {
      jest.advanceTimersByTime(900);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(tree.root.findByProps({ testID: 'cz-success' })).toBeDefined();
    const artwork = tree.root
      .findAllByType(AssetGlyph)
      .find(n => n.props.width === 343)!;
    expect(StyleSheet.flatten(artwork.parent!.props.style).height).toBe(160);
    expect(
      tree.root.findAllByType(PrimaryButton).map(n => n.props.label),
    ).toEqual(['Add money', 'View goal']);
  } finally {
    act(() => tree.unmount());
    jest.useRealTimers();
  }
});
