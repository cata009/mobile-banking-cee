import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { RadioButton } from '../src/universal/RadioButton';
import { sourceCustomIconXml } from '../src/universal/SourceCustomIcon';

describe('isolated Native radio pilot', () => {
  it('keeps the actual outline and selected dot artwork instead of a placeholder', () => {
    const variables = { '--uc-surface': '#ffffff', '--uc-action': '#007a91' };
    const unselected = sourceCustomIconXml(
      'radio-unselected',
      '#262626',
      variables,
    );
    const selected = sourceCustomIconXml(
      'radio-selected',
      '#262626',
      variables,
    );
    expect(unselected).toContain('r="9.5"');
    expect(unselected).not.toContain('r="4.5"');
    expect(selected).toContain('r="9.5"');
    expect(selected).toContain('r="4.5"');
    expect(selected).toContain('fill="#007a91"');
  });
  it.each(['standard', 'date-filter'] as const)(
    'preserves controlled selection for %s',
    variant => {
      const onPress = jest.fn();
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <RadioButton
            variant={variant}
            selected
            label="LAST WEEK"
            onPress={onPress}
          />,
        );
      });
      const control = tree.root.find(
        node =>
          node.props.accessibilityRole === 'radio' &&
          typeof node.props.onPress === 'function',
      );
      expect(control.props.accessibilityState).toEqual({ checked: true });
      expect(control.props['aria-checked']).toBe(true);
      act(() => {
        control.props.onPress();
      });
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(control.props.accessibilityState.checked).toBe(true);
      act(() => {
        tree.update(
          <RadioButton
            variant={variant}
            selected={false}
            label="LAST WEEK"
            onPress={onPress}
          />,
        );
      });
      expect(
        tree.root.find(
          node =>
            node.props.accessibilityRole === 'radio' &&
            typeof node.props.onPress === 'function',
        ).props.accessibilityState,
      ).toEqual({ checked: false });
      expect(
        tree.root.find(
          node =>
            node.props.accessibilityRole === 'radio' &&
            typeof node.props.onPress === 'function',
        ).props['aria-checked'],
      ).toBe(false);
      act(() => {
        tree.unmount();
      });
    },
  );
});
