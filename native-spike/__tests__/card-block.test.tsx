import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { CardBlockScreen } from '../src/experiences/pi/current/baseline/CardBlockScreen';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { currentTokens } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

test('offers explicit confirmation for both block and unblock', () => {
  const confirm = jest.fn();
  const host = {
    tokens: currentTokens(),
    screenTopInset: 54,
  } as CurrentScreenProps;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <CardBlockScreen
        host={host}
        blocked={false}
        onBack={() => {}}
        onConfirm={confirm}
      />,
    );
  });
  expect(tree.root.findByType(PrimaryButton).props.label).toBe('BLOCK');
  act(() => tree.root.findByType(PrimaryButton).props.onPress());
  expect(confirm).toHaveBeenCalledTimes(1);
  act(() =>
    tree.update(
      <CardBlockScreen
        host={host}
        blocked
        onBack={() => {}}
        onConfirm={confirm}
      />,
    ),
  );
  expect(tree.root.findByType(PrimaryButton).props.label).toBe('UNBLOCK');
  act(() => tree.unmount());
});
