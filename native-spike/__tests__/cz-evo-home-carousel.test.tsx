import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, Text } from 'react-native';
import { Rail } from '../src/experiences/pi/cz/evo-2027/home/Primitives';
import { BaselineCarouselIndicator } from '../src/universal/BaselineCarouselIndicator';

test('product rail uses the shared indicator and tracks both selection and scrolling', async () => {
  const items = ['Everyday account', 'Euro account', 'Dollar account'].map(label => ({ id: label, label, content: <Text>{label}</Text> }));
  let tree!: Renderer.ReactTestRenderer;
  await act(() => { tree = Renderer.create(<Rail title="Accounts" items={items} peek />); });
  const indicator = () => tree.root.findByType(BaselineCarouselIndicator);
  expect(indicator().props.itemLabels).toEqual(items.map(item => `Go to ${item.label}`));
  await act(() => indicator().props.onSelect(2));
  expect(indicator().props.activeIndex).toBe(2);
  const rail = tree.root.findByType(ScrollView);
  await act(() => rail.props.onScroll({ nativeEvent: { contentOffset: { x: 0 } } }));
  expect(indicator().props.activeIndex).toBe(0);
  await act(() => tree.unmount());
});
