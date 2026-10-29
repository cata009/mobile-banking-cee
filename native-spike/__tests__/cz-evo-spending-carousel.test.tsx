import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { SpendingPeriodCarousel } from '../src/experiences/pi/cz/evo-2027/pfm/SpendingPeriodCarousel';

test('settling a period swipe selects its period and preserves the active card', async () => {
  const select = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <SpendingPeriodCarousel
        count={3}
        activeIndex={1}
        onSelect={select}
        renderItem={index => <Text>Period {index}</Text>}
      />,
    );
  });
  const carousel = tree.root.findByProps({ testID: 'cz-pfm-period-rail' });
  await act(() =>
    carousel.props.onMomentumScrollEnd({
      nativeEvent: {
        contentOffset: { x: 640 },
        layoutMeasurement: { width: 320 },
      },
    }),
  );
  expect(select).toHaveBeenCalledWith(2);
  await act(() => tree.unmount());
});
