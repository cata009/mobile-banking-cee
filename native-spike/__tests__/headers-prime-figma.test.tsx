import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, Text } from 'react-native';
import { BaselineHomeHeader } from '../src/experiences/pi/current/baseline/Header';
import PrimeBackground from '../src/experiences/pi/current/baseline/PrimeBackground';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { SourceVector } from '../src/universal/SourceCustomIcon';
import { mobileFirstTokens } from '../src/universal/tokens';

describe('Prime PI source 7467:13122', () => {
  it.each([false, true])(
    'keeps the 4px mark/label gap and original interactions, dark=%s',
    dark => {
      const onNavigate = jest.fn();
      const host = {
        tokens: {
          ...mobileFirstTokens,
          background: dark ? '#121212' : '#ffffff',
        },
        onNavigate,
        onAmountsToggle: jest.fn(),
        amountsHidden: false,
      } as unknown as CurrentScreenProps;
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(<BaselineHomeHeader host={host} />);
      });
      const prime = tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Prime' &&
          typeof node.props.onHoverIn === 'function',
      )[0];
      expect(StyleSheet.flatten(prime.props.style)).toMatchObject({
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
        opacity: 1,
      });
      expect(prime.findByType(PrimeBackground).props.dark).toBe(dark);
      expect(prime.findByType(SourceVector).props).toMatchObject({
        size: 16,
        color: '#ffffff',
      });
      const label = prime.findByType(Text);
      expect(label.props.children).toBe('Prime');
      expect(StyleSheet.flatten(label.props.style)).toMatchObject({
        fontSize: 14,
        lineHeight: 16,
        color: '#ffffff',
      });
      act(() => {
        prime.props.onPress();
      });
      expect(onNavigate).toHaveBeenCalledWith({ screen: 'prime' });
      act(() => {
        prime.props.onHoverIn();
      });
      expect(StyleSheet.flatten(prime.props.style).opacity).toBe(0.8);
      act(() => {
        prime.props.onHoverOut();
      });
      expect(StyleSheet.flatten(prime.props.style).opacity).toBe(1);
      act(() => tree.unmount());
    },
  );
});
