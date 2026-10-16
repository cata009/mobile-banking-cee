import React from 'react';
import { StyleSheet } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { TOGGLE_ARTWORK } from '@/app/components/contracts/toggleArtwork';
import { sourceColor } from '../src/universal/sourceColor';
import { ToggleButton } from '../src/universal/ToggleButton';

const states = [
  { dark: false, checked: false, disabled: false },
  { dark: false, checked: true, disabled: false },
  { dark: false, checked: false, disabled: true },
  { dark: true, checked: false, disabled: false },
  { dark: true, checked: true, disabled: false },
  { dark: true, checked: false, disabled: true },
] as const;

test.each(states)(
  'toggle Source parity uses parent alignment and artwork (dark=$dark, checked=$checked, disabled=$disabled)',
  ({ dark, checked, disabled }) => {
    const onToggle = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <ToggleButton
          ariaLabel="Accept terms and conditions"
          checked={checked}
          disabled={disabled}
          dark={dark}
          onToggle={onToggle}
        />,
      );
    });

    try {
      const control = tree.root.find(
        node =>
          node.props.accessibilityRole === 'switch' &&
          typeof node.props.onPress === 'function',
      ),
      controlStyle = StyleSheet.flatten(control.props.style),
      frame = tree.root.find(node => node.props.accessibilityElementsHidden),
      frameStyle = StyleSheet.flatten(frame.props.style),
      expectedTrack = sourceColor('var(--uc-surface)', dark),
      expectedMuted = sourceColor('var(--uc-text-muted)', dark);

    // Source's inline-flex button has align-self:auto, so it follows the
    // centered terms row. Do not pin the Native control to flex-start.
    expect(controlStyle.alignSelf).toBeUndefined();
    expect(control.props.accessibilityState).toEqual({ checked, disabled });
    expect(control.props['aria-checked']).toBe(checked);
    expect(control.props['aria-disabled']).toBe(disabled);
    expect(frameStyle.opacity).toBe(disabled ? 0.5 : 1);

      const svgs = tree.root.findAllByType(Svg);
      expect(svgs.map(svg => [svg.props.width, svg.props.height])).toEqual([
        [60, 30],
        [22, 22],
      ]);

      if (checked) {
        const paths = tree.root.findAllByType(Path);
        expect(paths.map(path => path.props.d)).toEqual([
          TOGGLE_ARTWORK.checkedTrackPath,
          TOGGLE_ARTWORK.checkedKnobPath,
        ]);
        expect(paths[0]!.props).toMatchObject({
          fill: expectedTrack,
          stroke: sourceColor('var(--uc-action)', dark),
          strokeWidth: 2,
        });
        expect(paths[1]!.props.fill).toBe(
          sourceColor('var(--uc-action)', dark),
        );
      } else {
        expect(tree.root.findByType(Rect).props).toMatchObject({
          x: 1,
          y: 1,
          width: 58,
          height: 28,
          rx: 14,
          fill: expectedTrack,
          stroke: expectedMuted,
          strokeWidth: 2,
        });
        expect(tree.root.findByType(Circle).props).toMatchObject({
          cx: 11,
          cy: 11,
          r: 11,
          fill: expectedMuted,
        });
      }

      act(() => control.props.onPress());
      expect(onToggle).toHaveBeenCalledTimes(disabled ? 0 : 1);
      if (!disabled) expect(onToggle).toHaveBeenCalledWith(!checked);
    } finally {
      act(() => tree.unmount());
    }
  },
);
