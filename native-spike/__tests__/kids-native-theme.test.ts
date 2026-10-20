import {
  resolveKidsColor,
  sourceThemeGradient,
} from '../src/experiences/kids-pi/theme';
import { getHuTheme } from '@/app/screens/kids/hu/theme';
test('Kids theme consumes original Source palette and color-mix without changing assets', () => {
  expect(resolveKidsColor('var(--uc-orange-main)')).toBe('#E67300');
  expect(
    resolveKidsColor(
      'color-mix(in srgb, var(--uc-static-white) 50%, var(--uc-static-black))',
    ),
  ).toBe('rgba(147,147,147,1)');
});
test('every existing Kids theme has native Source linear-gradient stops', () => {
  expect(sourceThemeGradient(getHuTheme('nordlys').pageBackground)[0]).toEqual({
    color: '#03141C',
    offset: 0,
  });
  expect(
    sourceThemeGradient(getHuTheme('blue-lines').pageBackground).length,
  ).toBe(2);
});
