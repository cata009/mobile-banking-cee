import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { DesignSystemPreview } from '../src/app/designSystemPreviews';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { BaselineCodeField } from '../src/universal/BaselineCodeField';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';
import { NATIVE_DESIGN_SYSTEM_PREVIEWS } from '@/features/demo-native/designSystemPreview';

test.each([
  ['ui.text-field', 'disabled-filled', BaselineTextField],
  ['ui.amount-field', 'error-empty', BaselineAmountField],
  ['ui.code-field', 'disabled', BaselineCodeField],
  ['accounts.transaction-row', 'pending', BaselineTransactionRow],
] as const)(
  'catalog %s renders the canonical Native primitive',
  (componentId, variantId, Primitive) => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <DesignSystemPreview
          componentId={componentId}
          variantId={variantId}
          dark
        />,
      );
    });
    expect(tree.root.findAllByType(Primitive)).toHaveLength(1);
    expect(tree.root.findByType(Primitive).props.dark).toBe(true);
    act(() => tree.unmount());
  },
);

test('unsupported state does not silently render another field state', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DesignSystemPreview
        componentId="ui.text-field"
        variantId="invented"
        dark={false}
      />,
    );
  });
  expect(tree.toJSON()).toBeNull();
  act(() => tree.unmount());
});

test('every published Native catalog mapping renders and rejects unsupported variants', () => {
  for (const [componentId, definition] of Object.entries(
    NATIVE_DESIGN_SYSTEM_PREVIEWS,
  )) {
    for (const variantId of [undefined, ...definition.variants]) {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <DesignSystemPreview
            componentId={componentId}
            variantId={variantId}
            dark={false}
          />,
        );
      });
      expect({
        componentId,
        variantId,
        visible: tree.toJSON() !== null,
      }).toEqual({ componentId, variantId, visible: true });
      act(() => tree.unmount());
    }
    let invalid!: Renderer.ReactTestRenderer;
    act(() => {
      invalid = Renderer.create(
        <DesignSystemPreview
          componentId={componentId}
          variantId="unsupported-state"
          dark={false}
        />,
      );
    });
    expect(invalid.toJSON()).toBeNull();
    act(() => invalid.unmount());
  }
});
