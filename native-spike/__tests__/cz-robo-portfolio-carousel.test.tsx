import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { PanResponder, Platform, StyleSheet } from 'react-native';
import { PortfolioCarousel } from '../src/experiences/pi/cz/evo-2027/robo/PortfolioCarousel';
import { BaselineCarouselIndicator } from '../src/universal/BaselineCarouselIndicator';

jest.mock('../src/universal/DemoViewport', () => ({
  useDemoCanvas: () => ({ scale: 0.5 }),
}));

test('reuses the compact account carousel indicator with all five portfolios actionable', () => {
  const onSelect = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <PortfolioCarousel count={5} selectedIndex={3} onSelect={onSelect}>
        {null}
      </PortfolioCarousel>,
    );
  });
  const indicator = tree.root.findByType(BaselineCarouselIndicator);
  expect(indicator.props).toMatchObject({
    count: 5,
    activeIndex: 3,
    windowSize: 5,
  });
  const dots = indicator.findAll(
    node => typeof node.props.onPress === 'function',
  );
  // One native Pressable per item; its hit slop does not spread the visible ink.
  const uniqueDots = dots.filter(node => typeof node.type !== 'string');
  expect(uniqueDots).toHaveLength(5);
  expect(StyleSheet.flatten(uniqueDots[3].props.style)).toMatchObject({
    width: 30,
    height: 6,
  });
  expect(StyleSheet.flatten(uniqueDots[0].props.style)).toMatchObject({
    width: 6,
    height: 6,
  });
  expect(uniqueDots[3].props.accessibilityState).toEqual({ selected: true });
  expect(uniqueDots[4].props.accessibilityLabel).toBe('Portfolio 5 of 5');
  act(() => uniqueDots[4].props.onPress());
  expect(onSelect).toHaveBeenLastCalledWith(4);
  act(() => tree.unmount());
});

test('mouse dragging snaps in logical canvas coordinates and ignores vertical gestures', () => {
  const originalPlatform = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  const create = jest.spyOn(PanResponder, 'create');
  const onSelect = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  try {
    act(() => {
      tree = Renderer.create(
        <PortfolioCarousel count={5} selectedIndex={0} onSelect={onSelect}>
          {null}
        </PortfolioCarousel>,
      );
    });
    const config = create.mock.calls.at(-1)![0];
    const event = { nativeEvent: { pageX: 300 } } as Parameters<
      NonNullable<typeof config.onPanResponderMove>
    >[0];
    const gesture = { dx: -180, dy: 5, moveX: 120 } as Parameters<
      NonNullable<typeof config.onPanResponderMove>
    >[1];
    expect(config.onMoveShouldSetPanResponderCapture!(event, gesture)).toBe(
      true,
    );
    expect(
      config.onMoveShouldSetPanResponderCapture!(event, {
        ...gesture,
        dx: 5,
        dy: 100,
      }),
    ).toBe(false);
    act(() => {
      config.onStartShouldSetPanResponderCapture!(event, gesture);
      config.onPanResponderMove!(event, gesture);
      config.onPanResponderRelease!(event, gesture);
    });
    expect(onSelect).toHaveBeenLastCalledWith(1);
    act(() => {
      config.onStartShouldSetPanResponderCapture!(event, gesture);
      config.onPanResponderMove!(event, {
        ...gesture,
        dx: -5000,
        moveX: -4700,
      });
      config.onPanResponderRelease!(event, { ...gesture, moveX: -4700 });
    });
    expect(onSelect).toHaveBeenLastCalledWith(4);
  } finally {
    act(() => tree?.unmount());
    create.mockRestore();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatform,
    });
  }
});

test('web scrolling selects the nearest basket without a native momentum-end event', () => {
  jest.useFakeTimers();
  const originalPlatform = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  const onSelect = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  try {
    act(() => {
      tree = Renderer.create(
        <PortfolioCarousel count={5} selectedIndex={0} onSelect={onSelect}>
          {null}
        </PortfolioCarousel>,
      );
    });
    act(() =>
      tree.root
        .findByProps({ testID: 'cz-portfolio-carousel' })
        .props.onScroll({ nativeEvent: { contentOffset: { x: 220 } } }),
    );
    act(() => jest.advanceTimersByTime(180));
    expect(onSelect).toHaveBeenLastCalledWith(1);
  } finally {
    act(() => tree?.unmount());
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatform,
    });
    jest.useRealTimers();
  }
});

test('a dot selection cancels the pending completion of the previous web scroll', () => {
  jest.useFakeTimers();
  const originalPlatform = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  const onSelect = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  try {
    act(() => {
      tree = Renderer.create(
        <PortfolioCarousel count={5} selectedIndex={0} onSelect={onSelect}>
          {null}
        </PortfolioCarousel>,
      );
    });
    act(() =>
      tree.root
        .findByProps({ testID: 'cz-portfolio-carousel' })
        .props.onScroll({ nativeEvent: { contentOffset: { x: 315 } } }),
    );
    act(() =>
      tree.update(
        <PortfolioCarousel count={5} selectedIndex={3} onSelect={onSelect}>
          {null}
        </PortfolioCarousel>,
      ),
    );
    act(() =>
      tree.root
        .findByProps({ testID: 'cz-portfolio-carousel' })
        .props.onScroll({ nativeEvent: { contentOffset: { x: 315 } } }),
    );
    act(() => jest.advanceTimersByTime(180));
    expect(onSelect).not.toHaveBeenCalled();
  } finally {
    act(() => tree?.unmount());
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatform,
    });
    jest.useRealTimers();
  }
});
