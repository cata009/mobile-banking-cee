import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { PanResponder, Platform } from 'react-native';
import { VIRTUAL_CARD_DESIGNS } from '@/features/cards/virtual-card/model';
import { DesignCarousel } from '../src/experiences/pi/current/baseline/virtual-card/DesignCarousel';

jest.mock('../src/universal/DemoViewport', () => ({
  useDemoCanvas: () => ({ scale: 0.5 }),
}));

it('drags a category on scaled web without selecting a card and allows direct card selection', () => {
  const oldOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  const spy = jest.spyOn(PanResponder, 'create');
  const onSelect = jest.fn();
  const items = VIRTUAL_CARD_DESIGNS.filter(item => item.group === 'HOBBIES');
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DesignCarousel
        title="HOBBIES"
        items={items}
        textColor="#262626"
        onSelect={onSelect}
      />,
    );
  });
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Next HOBBIES designs' }),
  ).toHaveLength(0);
  expect(
    tree.root.findAllByProps({
      accessibilityLabel: 'Previous HOBBIES designs',
    }),
  ).toHaveLength(0);
  const config = spy.mock.calls.at(-1)![0];
  const event = { nativeEvent: { pageX: 300 } } as any;
  const gesture = { dx: -50, dy: 1, moveX: 250 } as any;
  expect(config.onMoveShouldSetPanResponderCapture!(event, gesture)).toBe(true);
  expect(
    config.onMoveShouldSetPanResponderCapture!(event, {
      ...gesture,
      dx: 1,
      dy: 50,
    }),
  ).toBe(false);
  act(() => {
    config.onStartShouldSetPanResponderCapture!(event, gesture);
    config.onPanResponderMove!(event, gesture);
    config.onPanResponderRelease!(event, gesture);
  });
  expect(onSelect).not.toHaveBeenCalled();
  const last = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Select Photography' &&
      node.props.onPress,
  )[0]!;
  const preventDefault = jest.fn();
  act(() => last.props.onKeyDown({ key: 'ArrowLeft', preventDefault }));
  expect(preventDefault).toHaveBeenCalled();
  act(() => last.props.onPress());
  expect(onSelect).toHaveBeenCalledWith('photography');
  act(() => tree.unmount());
  spy.mockRestore();
  Object.defineProperty(Platform, 'OS', { configurable: true, value: oldOS });
});
