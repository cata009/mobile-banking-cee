import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {
  COUNTRIES,
  PRODUCT_ORDER,
  DESIGN_SYSTEM_ORDER,
  RELEASE_ORDER,
  DEFAULT_NATIVE_SELECTION,
  resolveNativeDemo,
} from './src/app/registry';
import type { NativeDemoSelection } from './src/app/registry';
import { getAvailableLanguages } from '@/app/registry/languageByCountry';
import { readSourceDemoInputs } from './src/app/sourceDemoInputs';
import { readSourceNativeRoute } from './src/app/sourceRouteInputs';
import './web.css';
import './global-native.css';

const query = new URLSearchParams(location.search);
const sourceState = readSourceDemoInputs(query);
function axis<T extends string>(
  name: string,
  values: readonly T[],
  fallback: T,
): T {
  const requested = query.get(name);
  if (requested === null) return fallback;
  if (!values.includes(requested as T))
    throw new Error(`Unknown Source ${name} axis`);
  return requested as T;
}
const selection: NativeDemoSelection = {
  product: axis('product', PRODUCT_ORDER, DEFAULT_NATIVE_SELECTION.product),
  country: axis('country', COUNTRIES, DEFAULT_NATIVE_SELECTION.country),
  designSystem: axis(
    'ds',
    DESIGN_SYSTEM_ORDER,
    DEFAULT_NATIVE_SELECTION.designSystem,
  ),
  release: axis('release', RELEASE_ORDER, DEFAULT_NATIVE_SELECTION.release),
  scenario: axis(
    'scenario',
    ['active', 'inactive'],
    DEFAULT_NATIVE_SELECTION.scenario,
  ),
};
const comparison = query.get('demo') === '1';
const initialRoute = readSourceNativeRoute(query,resolveNativeDemo(selection).implementation);
const reserve = Number(query.get('topReserve') ?? (selection.country === 'IT' && selection.designSystem === 'mobile-first' ? '70' : query.get('frame') === '0' ? '12' : '54'));
for (const [axisName, cssProperty, fallback] of [
  ['width', '--native-preview-width', '393'],
  ['height', '--native-preview-height', '852'],
] as const) {
  const dimension = Number(query.get(axisName) ?? fallback);
  if (Number.isFinite(dimension) && dimension >= 240 && dimension <= 2000)
    document.documentElement.style.setProperty(cssProperty, `${dimension}px`);
}
createRoot(document.getElementById('root')!).render(
  <App
    initialSelection={selection}
    startInDemo={comparison}
    showSelectorControl={!comparison}
    initialRoute={initialRoute}
    initialLanguage={axis(
      'lang',
      getAvailableLanguages(selection.country),
      'en',
    )}
    initialMode={axis('theme', ['light', 'dark', 'system'] as const, 'light')}
    initialHomeTheme={query.get('homeTheme') ?? 'standard'}
    productCounts={sourceState?.productCounts}
    initialAmountsHidden={sourceState?.amountsHidden}
    bankingScenario={sourceState?.bankingScenario}
    previewInsetTop={
      Number.isFinite(reserve) && reserve >= 0 && reserve <= 100 ? reserve : 0
    }
  />,
);
