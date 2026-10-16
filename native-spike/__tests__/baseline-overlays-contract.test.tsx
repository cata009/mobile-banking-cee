import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BaselineDialog } from '../src/universal/BaselineDialog';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
describe('isolated overlay contract owners', () => {
  it('leaves termination lifecycle with its owner', () => {
    const calls: string[] = [];
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineDialog
          kind="terminate"
          title="End session"
          onCancel={() => calls.push('close')}
          onConfirm={() => calls.push('terminate')}
        />,
      );
    });
    act(() =>
      tree.root
        .find(
          n =>
            n.props.accessibilityLabel === 'OK' &&
            typeof n.props.onPress === 'function',
        )
        .props.onPress(),
    );
    expect(calls).toEqual(['terminate']);
    act(() => tree.unmount());
  });
  it.each([false, true])(
    'honors animated close timing and reduced motion %s',
    reducedMotion => {
      jest.useFakeTimers();
      const close = jest.fn();
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <BaselineBottomSheet
            animated
            reducedMotion={reducedMotion}
            title="Filters"
            subtitle="Choose a period"
            meta="12 transactions"
            onClose={close}
          >
            Content
          </BaselineBottomSheet>,
        );
      });
      const press = () =>
        tree.root
          .find(
            n =>
              n.props.accessibilityLabel === 'Close' &&
              typeof n.props.onPress === 'function',
          )
          .props.onPress();
      act(press);
      if (reducedMotion) expect(close).toHaveBeenCalledTimes(1);
      else {
        act(press);
        act(() => jest.advanceTimersByTime(359));
        expect(close).not.toHaveBeenCalled();
        act(() => jest.advanceTimersByTime(1));
        expect(close).toHaveBeenCalledTimes(1);
        // Owners may keep the leaf mounted: a later request is a new close cycle.
        act(press);
        act(() => jest.advanceTimersByTime(360));
        expect(close).toHaveBeenCalledTimes(2);
      }
      act(() => tree.unmount());
      jest.useRealTimers();
    },
  );
  it('preserves logout close-before-confirm ordering', () => {
    const calls: string[] = [];
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineDialog
          title="Logout"
          onCancel={() => calls.push('close')}
          onConfirm={() => calls.push('confirm')}
        />,
      );
    });
    act(() =>
      tree.root
        .find(
          n =>
            n.props.accessibilityLabel === 'OK' &&
            typeof n.props.onPress === 'function',
        )
        .props.onPress(),
    );
    expect(calls).toEqual(['close', 'confirm']);
    act(() => tree.unmount());
  });
  it('keeps default sheet close immediate', () => {
    const close = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineBottomSheet title="Filters" onClose={close}>
          Content
        </BaselineBottomSheet>,
      );
    });
    const backdrop = tree.root.find(
      n =>
        n.props.accessibilityLabel === 'Close sheet' &&
        typeof n.props.onPress === 'function',
    );
    expect(backdrop.props.accessibilityRole).toBe('button');
    act(() =>
      tree.root
        .find(
          n =>
            n.props.accessibilityLabel === 'Close' &&
            typeof n.props.onPress === 'function',
        )
        .props.onPress(),
    );
    expect(close).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
});
