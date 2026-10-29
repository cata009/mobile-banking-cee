import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { PanResponder, Platform, Text } from 'react-native';
import { Rail } from '../src/experiences/pi/cz/evo-2027/home/Primitives';
import Carousel from '../src/experiences/pi/cz/evo-2027/accounts/Carousel';
import { BaselineCarouselIndicator } from '../src/universal/BaselineCarouselIndicator';
jest.mock('../src/universal/DemoViewport', () => ({
  useDemoCanvas: () => ({ scale: 0.5 }),
}));
const items = ['one', 'two', 'three'].map(id => ({
  id,
  label: id,
  content: <Text>{id}</Text>,
}));
let originalOS: typeof Platform.OS;
beforeEach(() => {
  originalOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
});
afterEach(() => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: originalOS,
  });
  jest.restoreAllMocks();
});
test('home rail captures horizontal mouse drag, leaves vertical/click gestures alone, and selects the next page', () => {
  const spy = jest.spyOn(PanResponder, 'create');
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Rail title="Accounts" items={items} peek />);
  });
  const cfg = spy.mock.calls.at(-1)![0];
  const event = { nativeEvent: { pageX: 300 } } as any;
  const gesture = { dx: -180, dy: 4, moveX: 120 } as any;
  expect(cfg.onMoveShouldSetPanResponderCapture!(event, gesture)).toBe(true);
  expect(
    cfg.onMoveShouldSetPanResponderCapture!(event, {
      ...gesture,
      dx: 3,
      dy: 100,
    }),
  ).toBe(false);
  expect(
    cfg.onMoveShouldSetPanResponderCapture!(event, {
      ...gesture,
      dx: 2,
      dy: 1,
    }),
  ).toBe(false);
  act(() => {
    cfg.onStartShouldSetPanResponderCapture!(event, gesture);
    cfg.onPanResponderGrant!(event, gesture);
    cfg.onPanResponderMove!(event, gesture);
    cfg.onPanResponderRelease!(event, gesture);
  });
  expect(
    tree.root.findByType(BaselineCarouselIndicator).props.activeIndex,
  ).toBe(1);
  act(() => tree.unmount());
});
test('detail carousel snaps to the next selected item after mouse drag', () => {
  const spy = jest.spyOn(PanResponder, 'create');
  const onSelect = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <Carousel
        items={items}
        selectedId="one"
        onSelect={onSelect}
        geometry={{
          width: 270,
          height: 120,
          gap: 10,
          gutter: 0,
          inactiveScale: 1,
        }}
        label={x => x.label}
        renderItem={x => x.content}
      />,
    );
  });
  const cfg = spy.mock.calls.at(-1)![0];
  const event = { nativeEvent: { pageX: 300 } } as any;
  const gesture = { dx: -120, dy: 3, moveX: 180 } as any;
  act(() => {
    cfg.onStartShouldSetPanResponderCapture!(event, gesture);
    cfg.onPanResponderGrant!(event, gesture);
    cfg.onPanResponderMove!(event, gesture);
    cfg.onPanResponderRelease!(event, gesture);
  });
  expect(onSelect).toHaveBeenLastCalledWith(items[1]);
  act(() => tree.unmount());
});
import Appearance from '../src/experiences/pi/cz/evo-2027/profile/Appearance';
import { themeChoices } from '../src/experiences/pi/cz/evo-2027/profile/features/preferences';
test('theme carousel supports drag while theme selection remains a click action', () => {
  const spy = jest.spyOn(PanResponder, 'create');
  const onSelect = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <Appearance
        applied={themeChoices[0].id}
        draft={themeChoices[0].id}
        mode="light"
        onSelect={onSelect}
        onMode={jest.fn()}
        onApply={jest.fn()}
        onBack={jest.fn()}
      />,
    );
  });
  const cfg = spy.mock.calls.at(-1)![0];
  const event = { nativeEvent: { pageX: 300 } } as any;
  const gesture = { dx: -70, dy: 3, moveX: 230 } as any;
  expect(cfg.onMoveShouldSetPanResponderCapture!(event, gesture)).toBe(true);
  act(() => {
    cfg.onStartShouldSetPanResponderCapture!(event, gesture);
    cfg.onPanResponderMove!(event, gesture);
    cfg.onPanResponderRelease!(event, gesture);
  });
  expect(onSelect).not.toHaveBeenCalled();
  const choice = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === `Select ${themeChoices[1].name} theme` &&
      typeof n.props.onPress === 'function',
  )[0];
  act(() => choice.props.onPress());
  expect(onSelect).toHaveBeenCalledWith(themeChoices[1].id);
  act(() => tree.unmount());
});
