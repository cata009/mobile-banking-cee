import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { BaselineSectionDivider } from '../src/universal/BaselineSectionDivider';
import { BaselineTransactionDivider } from '../src/universal/BaselineTransactionDivider';
import { BaselineNavigationLink } from '../src/universal/BaselineNavigationLink';
import { BaselineCardNavigationRow } from '../src/universal/BaselineCardNavigationRow';

describe('isolated Native row contracts', () => {
  it('keeps the nested toggle controlled and never invokes its row owner', () => {
    const onPress = jest.fn(),
      onToggle = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineNavigationRow
          title="Notifications"
          trailingAccessory="toggle"
          toggleChecked
          onPress={onPress}
          onToggle={onToggle}
        />,
      );
    });
    const control = tree.root.find(
      node =>
        node.props?.accessibilityRole === 'switch' &&
        typeof node.props.onPress === 'function',
    );
    expect(control.props.accessibilityState.checked).toBe(true);
    act(() => {
      control.props.onPress();
    });
    expect(onToggle).toHaveBeenCalledWith(false);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
    expect(control.props.accessibilityState.checked).toBe(true);
    act(() => {
      tree.unmount();
    });
  });
  it('retains callback-only interactive row and inert nested row owner', () => {
    const onPress = jest.fn(),
      onLinkPress = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineNavigationRow
          title="Settings"
          onPress={onPress}
          chevronStyle={{ opacity: 1 }}
        />,
      );
    });
    const button = tree.root.find(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    );
    act(() => {
      button.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => {
      tree.update(
        <BaselineNavigationRow
          title="Settings"
          linkLabel="Details"
          onPress={onPress}
          onLinkPress={onLinkPress}
        />,
      );
    });
    const buttons = tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    );
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every(node => node.props.onPress === onLinkPress)).toBe(
      true,
    );
    act(() => {
      buttons[0].props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onLinkPress).toHaveBeenCalledTimes(1);
    act(() => {
      tree.unmount();
    });
  });
  it('renders month/date and Meniga distinctions without navigation owners', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <>
          <BaselineSectionDivider title="October" variant="light-date" />
          <BaselineSectionDivider title="Title" variant="large-title" />
          <BaselineSectionDivider title="Date" variant="action-date-checkbox" />
          <BaselineTransactionDivider
            title="October"
            total="0"
            currency="RON"
          />
          <BaselineTransactionDivider
            title="Today"
            currency="RON"
            dateSeparator
          />
        </>,
      );
    });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('343');
    expect(json).toContain('375');
    expect(json).toContain('October');
    expect(json).toContain('Today');
    expect(json).toContain('22');
    expect(
      tree.root.findAll(node => node.props?.accessibilityRole === 'button'),
    ).toHaveLength(0);
    act(() => {
      tree.unmount();
    });
  });
  it('retains inert card/button semantics and original logo artwork for every mapping', () => {
    let tree!: Renderer.ReactTestRenderer;
    for (const card of [
      undefined,
      { type: 'debit_card', id: 'card-3' },
      { type: 'credit_card', id: 'card-2' },
    ]) {
      act(() => {
        tree = Renderer.create(
          <BaselineCardNavigationRow card={card} label="Mastercard" />,
        );
      });
      const button = tree.root.find(
        node => node.props.accessibilityRole === 'button',
      );
      expect(button.props.onPress).toBeUndefined();
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain('M10.3 0 31.4 20');
      expect(json).toContain('5545 XXXX XXXX 3250');
      expect(json).toContain('M14.0279');
      act(() => {
        tree.unmount();
      });
    }
  });
  it('keeps inline link an enabled button and delegates activation', () => {
    const onPress = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineNavigationLink text="Details" onPress={onPress} />,
      );
    });
    const button = tree.root.find(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    );
    act(() => {
      button.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => {
      tree.unmount();
    });
  });
});
