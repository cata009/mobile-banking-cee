import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ToggleButton } from '../src/universal/ToggleButton';

describe('isolated native toggle pilot', () => {
  it.each(['baseline', 'prime-mail'] as const)(
    'keeps controlled checked state and inverse callback for %s',
    variant => {
      const onToggle = jest.fn();
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <ToggleButton
            variant={variant}
            checked
            ariaLabel="Notifications"
            onToggle={onToggle}
          />,
        );
      });
      const control = tree.root.find(
        n =>
          n.props.accessibilityRole === 'switch' &&
          typeof n.props.onPress === 'function',
      );
      expect(control.props['aria-checked']).toBe(true);
      act(() => control.props.onPress());
      expect(onToggle).toHaveBeenCalledTimes(1);
      expect(onToggle).toHaveBeenCalledWith(false);
      act(() =>
        tree.update(
          <ToggleButton
            variant={variant}
            checked={false}
            disabled
            ariaLabel="Notifications"
            onToggle={onToggle}
          />,
        ),
      );
      const disabled = tree.root.find(
        n =>
          n.props.accessibilityRole === 'switch' &&
          typeof n.props.onPress === 'function',
      );
      expect(disabled.props['aria-checked']).toBe(false);
      expect(disabled.props['aria-disabled']).toBe(true);
      act(() => disabled.props.onPress());
      expect(onToggle).toHaveBeenCalledTimes(1);
      act(() => tree.unmount());
    },
  );
  it('keeps the no-callback indicator decorative and does not dim it for disabled', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<ToggleButton checked disabled />);
    });
    expect(
      tree.root.findAll(n => n.props.accessibilityRole === 'switch'),
    ).toHaveLength(0);
    act(() => tree.unmount());
  });
});
