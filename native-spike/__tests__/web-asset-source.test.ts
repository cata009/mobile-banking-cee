import { registeredWebAssetSource } from '../src/platform/webAssetSource';

const asset = { httpServerLocation: '/assets', name: 'prelogin', type: 'png', width: 375, height: 812, scales: [1, 2, 3] };

test('resolves the exact registered URI and dimensions at normal density', () => {
  expect(registeredWebAssetSource(asset, 1)).toEqual({ uri: '/assets/prelogin.png', width: 375, height: 812, scale: 1 });
});

test('uses the same nearest-density asset as React Native Web', () => {
  expect(registeredWebAssetSource(asset, 2.2)?.uri).toBe('/assets/prelogin@2x.png');
  expect(registeredWebAssetSource(asset, 1.5)?.scale).toBe(1);
});

test('does not invent an asset when its registry ID is missing', () => {
  expect(registeredWebAssetSource(undefined, 2)).toBeNull();
});
