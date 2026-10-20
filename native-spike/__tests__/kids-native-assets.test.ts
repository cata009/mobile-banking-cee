import { kidsAssets, kidsImageSource } from '../src/experiences/kids-pi/assets';
test('original Kids images support Metro registration IDs and Vite URLs', () => {
  expect(kidsImageSource(42)).toBe(42);
  expect(kidsImageSource('/src/assets/kids/figma/hu-card-bg-cat.png')).toEqual({
    uri: '/src/assets/kids/figma/hu-card-bg-cat.png',
  });
  expect(kidsAssets.huCardBackground).toBeDefined();
  expect(kidsAssets.contactsBuilding).toBeDefined();
});
