import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { BaselineAccountActionBar } from '../src/universal/BaselineAccountActionBar';
import { Text } from '../src/universal/Typography';

it.each([
  ['bare', 15],
  ['bubble', 16],
] as const)(
  'keeps %s action labels at the Source line height so following content does not drift',
  (iconTreatment, expectedLineHeight) => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineAccountActionBar
          iconTreatment={iconTreatment}
          items={[
            { id: 'history', label: 'History', iconName: 'investment-history' },
            {
              id: 'documents',
              label: 'Documents',
              iconName: 'account-option-statement',
            },
          ]}
        />,
      );
    });
    try {
      const labels = tree.root.findAllByType(Text);
      expect(labels).toHaveLength(2);
      for (const label of labels)
        expect(StyleSheet.flatten(label.props.style).lineHeight).toBe(
          expectedLineHeight,
        );
    } finally {
      act(() => tree.unmount());
    }
  },
);
