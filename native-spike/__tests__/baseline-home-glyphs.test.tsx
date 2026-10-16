import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BaselineAmountVisibility } from '../src/universal/BaselineAmountVisibility';
import { BaselineAccordion } from '../src/universal/BaselineAccordion';
import { BaselineProductsList } from '../src/universal/BaselineProductsList';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { View, StyleSheet } from 'react-native';
import { BaselineTotalRow } from '../src/universal/BaselineTotalRow';
import { SvgXml } from 'react-native-svg';

it('exposes controlled privacy state to both Web and native accessibility', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineAmountVisibility hidden onToggle={() => {}} />,
    );
  });
  try {
    const control = tree.root
      .findAll(
        n =>
          n.props.accessibilityRole === 'button' &&
          n.props.accessibilityLabel === 'Show amounts' &&
          typeof n.props.onPress === 'function',
      )
      .at(-1)!;
    expect(control.props['aria-pressed']).toBe(true);
    expect(control.props.accessibilityState).toEqual({ checked: true });
  } finally {
    act(() => tree.unmount());
  }
});

it('excludes collapsed descendants from the Web accessibility tree like Source', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineProductsList isOpen={false}>
        <View />
        <View />
      </BaselineProductsList>,
    );
  });
  try {
    const content = tree.root.findAll(
      n =>
        n.props.accessibilityElementsHidden === true &&
        typeof n.props.importantForAccessibility === 'string',
    );
    expect(content.some(n => n.props['aria-hidden'] === true)).toBe(true);
  } finally {
    act(() => tree.unmount());
  }
});

it('uses the original20px Source glyphs within32px privacy/accordion slots', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <>
        <BaselineAmountVisibility hidden={false} onToggle={() => {}} />
        <BaselineAccordion title="Accounts" defaultOpen={false}>
          <BaselineProductsList isOpen={false}>
            <View />
            <View />
          </BaselineProductsList>
        </BaselineAccordion>
      </>,
    );
  });
  const glyphs = tree.root.findAllByType(SourceCustomIcon);
  try {
    expect(glyphs.map(g => g.findByType(SvgXml).props.width)).toEqual([20, 20]);
  } finally {
    act(() => tree.unmount());
  }
});
it('aligns the legacy total label and amount on the Source shared text baseline', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineTotalRow integer="100" decimals=",25" currency="RON" />,
    );
  });
  try {
    expect(
      StyleSheet.flatten(tree.root.findAllByType(View)[0].props.style)
        .alignItems,
    ).toBe('baseline');
  } finally {
    act(() => tree.unmount());
  }
});
