import { isLocalVirtualCardRoute } from '../src/experiences/pi/current/banking/virtualCardRouting';

it('keeps issued card routes inside the native host and preserves ordinary routes', () => {
  const cards = [{ id: 'virtual-card-1' }];
  expect(
    isLocalVirtualCardRoute(
      { screen: 'card', params: { productId: 'virtual-card-1' } },
      cards,
    ),
  ).toBe(true);
  expect(
    isLocalVirtualCardRoute(
      { screen: 'card-options', params: { cardId: 'virtual-card-1' } },
      cards,
    ),
  ).toBe(true);
  expect(
    isLocalVirtualCardRoute(
      { screen: 'card', params: { productId: 'card-1' } },
      cards,
    ),
  ).toBe(false);
  expect(isLocalVirtualCardRoute({ screen: 'home' }, cards)).toBe(false);
});
