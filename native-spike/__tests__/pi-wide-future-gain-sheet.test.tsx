import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Sheet } from '../src/experiences/pi/current/future-gain/Primitives';
import { SourceBottomSheet } from '../src/universal/SourceBottomSheet';
import { currentTokens } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

it('uses the shared bottom-anchored sheet and its dismiss action for Future Gain disclosures', async () => {
  const onClose = jest.fn();
  const host = { tokens: currentTokens(false), isActive: true } as CurrentScreenProps;
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => { tree = Renderer.create(<Sheet host={host} title="Terms" visible onClose={onClose}>Terms content</Sheet>); });
  const sheet = tree.root.findByType(SourceBottomSheet);
  expect(sheet.props.title).toBe('Terms');
  const backdrop = tree.root.findAll(node => typeof node.props.onPress === 'function' && node.props.accessibilityLabel === 'Close sheet')[0]!;
  await act(async () => backdrop.props.onPress());
  expect(onClose).toHaveBeenCalledTimes(1);
  await act(async () => tree.update(<Sheet host={host} title="Terms" visible={false} onClose={onClose}>Terms content</Sheet>));
  expect(tree.toJSON()).toBeNull();
});
