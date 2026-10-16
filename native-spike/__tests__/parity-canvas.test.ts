import { sourceCanvasSize } from '../src/universal/DemoViewport';
import { sourceColor } from '../src/universal/sourceColor';

test('phone profiles reproduce the Source fixed authoring canvas rather than reflowing cards and fonts', () => {
  expect(sourceCanvasSize(393, 852, 375).width).toBe(375);
  expect(sourceCanvasSize(393, 852, 375).height).toBeCloseTo(812.977099, 5);
  expect(sourceCanvasSize(393, 852, 375).scale).toBeCloseTo(1.048, 5);
  expect(sourceCanvasSize(393, 852, 393)).toEqual({
    width: 393,
    height: 852,
    scale: 1,
  });
});
test('actual Source dark colors and native compatible overlay keep exact captured values', () => {
  expect(sourceColor('var(--uc-app-bg)', true)).toBe('#121212');
  expect(sourceColor('var(--uc-surface)', true)).toBe('#333333');
  expect(sourceColor('var(--uc-surface-raised)', true)).toBe('#555555');
  expect(sourceColor('var(--uc-overlay)')).toBe('rgba(0,0,0,0.4)');
});
