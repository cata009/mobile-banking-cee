import {
  APP_2027_THEMES,
  type HomeTheme,
} from '@/features/products/evoAppearance';
import type { CountryId } from '@/app/state/demoTypes';
export type { HomeTheme };
export const themeChoices = APP_2027_THEMES;
export type AppearanceMode = 'light' | 'dark' | 'system';
export function readHomeTheme(country: CountryId): HomeTheme {
  try {
    const value = globalThis.localStorage?.getItem(
      `native-current-home-theme:${country}`,
    );
    return themeChoices.some(theme => theme.id === value)
      ? (value as HomeTheme)
      : 'standard';
  } catch {
    return 'standard';
  }
}
export function storeHomeTheme(country: CountryId, theme: HomeTheme) {
  try {
    globalThis.localStorage?.setItem(
      `native-current-home-theme:${country}`,
      theme,
    );
  } catch {
    /* Retain UI state when storage is unavailable. */
  }
}
export function toggleChoice(values: readonly string[], value: string) {
  return values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value];
}
