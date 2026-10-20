import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { DividerDesignSystemPreview } from '../src/app/designSystemPreviews/dividers';
import { BaselineSectionDivider } from '../src/universal/BaselineSectionDivider';
import { dividerFigmaCases } from '../../tests/fixtures/dividersFigma';

describe('canonical Divider Design System preview', () => {
  it.each(dividerFigmaCases)(
    'delegates $variant to the existing RN leaf',
    sample => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <DividerDesignSystemPreview
            componentId="ui.section-heading-divider"
            variantId={sample.variant}
            dark
          />,
        );
      });
      const leaf = tree.root.findByType(BaselineSectionDivider);
      expect(leaf.props).toMatchObject({
        variant: sample.variant,
        title: sample.title,
        dark: true,
      });
      if ('secondaryText' in sample)
        expect(leaf.props.secondaryText).toBe(sample.secondaryText);
      if ('count' in sample) expect(leaf.props.count).toBe(sample.count);
      act(() => tree.unmount());
    },
  );

  it('uses the existing first specimen when no variant is supplied', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <DividerDesignSystemPreview
          componentId="ui.section-heading-divider"
          dark={false}
        />,
      );
    });
    expect(tree.root.findByType(BaselineSectionDivider).props).toMatchObject({
      variant: 'small-title-data',
      dark: false,
    });
    act(() => tree.unmount());
  });

  it('returns null for unsupported IDs and variants, including prototype property names', () => {
    for (const componentId of [
      'unknown',
      'ui.transaction-divider',
      '__proto__',
    ])
      expect(
        DividerDesignSystemPreview({ componentId, dark: false }),
      ).toBeNull();
    for (const variantId of [
      'unknown',
      'section',
      'constructor',
      'toString',
      '__proto__',
    ])
      expect(
        DividerDesignSystemPreview({
          componentId: 'ui.section-heading-divider',
          variantId,
          dark: false,
        }),
      ).toBeNull();
  });

  it('demonstrates the controlled checkbox through the canonical leaf', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <DividerDesignSystemPreview
          componentId="ui.section-heading-divider"
          variantId="action-date-checkbox"
          dark={false}
        />,
      );
    });
    expect(tree.root.findByType(BaselineSectionDivider).props.checked).toBe(
      false,
    );
    act(() =>
      tree.root.findByType(BaselineSectionDivider).props.onCheckedChange(true),
    );
    expect(tree.root.findByType(BaselineSectionDivider).props.checked).toBe(
      true,
    );
    act(() => tree.unmount());
  });
});
