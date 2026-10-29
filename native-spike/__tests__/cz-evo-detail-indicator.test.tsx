import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Indicator from '../src/experiences/pi/cz/evo-2027/accounts/Indicator';
import { BaselineCarouselIndicator } from '../src/universal/BaselineCarouselIndicator';

test('account and card details use the shared DS indicator and forward the selected item', async () => {
  const select = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => { tree = Renderer.create(<Indicator ids={['a','b','c']} selectedId="a" label="card" onSelect={select} />); });
  const indicator = tree.root.findByType(BaselineCarouselIndicator);
  await act(() => indicator.props.onSelect(2));
  expect(select).toHaveBeenCalledWith('c');
  await act(() => tree.unmount());
});
