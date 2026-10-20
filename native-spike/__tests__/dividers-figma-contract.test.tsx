import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { BaselineSectionDivider } from '../src/universal/BaselineSectionDivider';
import { BaselineTransactionDivider } from '../src/universal/BaselineTransactionDivider';
import { dividerFigmaCases } from '../../tests/fixtures/dividersFigma';

describe('Divider Figma geometry and reading structure', () => {
  it('activates Space and Enter once each without duplicating RN Web activation', () => {
    const platform = jest.replaceProperty(Platform, 'OS', 'web');
    const change = jest.fn(),
      preventDefault = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    try {
      act(() => {
        tree = Renderer.create(
          <BaselineSectionDivider
            variant="action-date-checkbox"
            title="SELECT ALL"
            checked={false}
            onCheckedChange={change}
          />,
        );
      });
      const control = tree.root.find(
        node =>
          typeof node.props?.onPress === 'function' &&
          node.props.accessibilityRole === 'checkbox',
      );
      expect(typeof control.props.onKeyDown).toBe('function');
      act(() =>
        control.props.onKeyDown({ key: ' ', repeat: false, preventDefault }),
      );
      expect(change).toHaveBeenCalledWith(true);
      expect(change).toHaveBeenCalledTimes(1);
      expect(preventDefault).toHaveBeenCalledTimes(1);
      act(() =>
        control.props.onKeyDown({ key: ' ', repeat: true, preventDefault }),
      );
      expect(change).toHaveBeenCalledTimes(1);
      // RN Web handles Enter through onPress; the supplemental handler must not duplicate it.
      act(() =>
        control.props.onKeyDown({
          key: 'Enter',
          repeat: false,
          preventDefault,
        }),
      );
      expect(change).toHaveBeenCalledTimes(1);
      act(() => control.props.onPress());
      expect(change).toHaveBeenCalledTimes(2);
    } finally {
      if (tree) act(() => tree.unmount());
      platform.restore();
    }
  });
  it.each(dividerFigmaCases)(
    '$variant matches source line boxes on native',
    sample => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(<BaselineSectionDivider {...sample} />);
      });
      const title = tree.root.find(node => {
        return (
          String(node.type) === 'Text' && node.props.testID === 'divider-title'
        );
      });
      expect(StyleSheet.flatten(title.props.style)).toMatchObject({
        fontSize: sample.fontSize,
        lineHeight: sample.lineHeight,
        includeFontPadding: false,
      });
      act(() => tree.unmount());
    },
  );

  it('exposes real, controlled action/selection controls and readable date text', () => {
    const action = jest.fn(),
      change = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineSectionDivider
          variant="action-date"
          title="SELECT ALL"
          secondaryText="1–31 OCT"
          onAction={action}
        />,
      );
    });
    const button = tree.root.find(
      node =>
        typeof node.props?.onPress === 'function' &&
        node.props.accessibilityRole === 'button',
    );
    act(() => button.props.onPress());
    expect(action).toHaveBeenCalledTimes(1);
    expect(
      tree.root.findAll(node => node.props?.accessibilityRole === 'header'),
    ).toHaveLength(0);
    act(() => {
      tree.update(
        <BaselineSectionDivider
          variant="action-date-checkbox"
          title="SELECT ALL"
          checked={false}
          onCheckedChange={change}
        />,
      );
    });
    const checkbox = tree.root.find(
      node =>
        typeof node.props?.onPress === 'function' &&
        node.props.accessibilityRole === 'checkbox',
    );
    expect(checkbox.props.accessibilityState.checked).toBe(false);
    act(() => checkbox.props.onPress());
    expect(change).toHaveBeenCalledWith(true);
    expect(checkbox.props.accessibilityState.checked).toBe(false);
    act(() => tree.unmount());
  });
  it('exposes section/month titles as headings, while dates, totals and counters remain text', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <>
          <BaselineSectionDivider title="PRODUCTS" count={0} />
          <BaselineSectionDivider
            title="PAYMENT DETAILS"
            variant="medium-title"
          />
          <BaselineSectionDivider title="SELECT ALL" variant="action-date" />
          <BaselineSectionDivider title="15 JULY 2022" variant="light-date" />
          <BaselineTransactionDivider
            title="October"
            total="0.00"
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
    const headings = tree.root.findAll(
      node =>
        String(node.type) === 'Text' &&
        node.props.accessibilityRole === 'header',
    );
    expect(headings.map(node => node.props.children)).toEqual([
      'PRODUCTS',
      'PAYMENT DETAILS',
      'October',
    ]);
    const rules = tree.root.findAll(
      node =>
        String(node.type) === 'View' &&
        StyleSheet.flatten(node.props.style)?.height === 1,
    );
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every(node => node.props.accessible === false)).toBe(true);
    expect(
      rules.every(node => node.props.accessibilityElementsHidden === true),
    ).toBe(true);
    const controls = tree.root.findAll(
      node =>
        typeof node.props?.onPress === 'function' &&
        node.props.accessibilityRole === 'button',
    );
    expect(controls).toHaveLength(1);
    expect(controls[0].props.accessibilityState.disabled).toBe(true);
    act(() => tree.unmount());
  });
});
