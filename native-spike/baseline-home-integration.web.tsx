import React, { useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import CurrentApplication from './src/app/CurrentApplication';
import type { ProductCounts } from '@/app/state/demoTypes';
import {
  getAvailableLanguages,
  getLanguageDisplayName,
  type AppLanguage,
} from '@/app/registry/languageByCountry';
import { COUNTRY_META } from '@/app/registry/demoConfig';
import { PI_BASELINE_COUNTRIES } from './src/experiences/pi/current/baseline/policy';
import type { CurrentRoute } from './src/experiences/pi/current/contracts';
import { DemoViewport } from './src/universal/DemoViewport';
import { OverlayHost } from './src/universal/ModalPortal';
import './web.css';
const runtime = globalThis as typeof globalThis & {
  global?: typeof globalThis;
};
runtime.global ??= globalThis;
const query = new URLSearchParams(location.search);
const initialCountry =
  PI_BASELINE_COUNTRIES.find(country => country === query.get('country')) ??
  'RO';
const captureMode = query.get('capture') === '1';
const requestedCaptureHeight = Number(query.get('canvasHeight'));
const captureHeight =
  Number.isFinite(requestedCaptureHeight) &&
  requestedCaptureHeight >= 320 &&
  requestedCaptureHeight <= 1600
    ? requestedCaptureHeight
    : 812;
const requestedScreen = query.get('screen');
const previewScreens: CurrentRoute['screen'][] = [
  'home',
  'account',
  'card',
  'account-info',
  'account-options',
  'card-info',
  'card-options',
  'transaction',
  'payments',
  'payment-create',
  'pfm',
  'products',
  'product-detail',
  'profile',
  'settings',
  'language',
  'documents',
  'messages',
  'contacts',
  'prime',
  'appointments',
  'call-request',
  'prelogin',
];
const initialRoute: CurrentRoute = {
  screen: previewScreens.find(screen => screen === requestedScreen) ?? 'home',
  params: Object.fromEntries(
    [
      'productId',
      'transactionId',
      'selectionId',
      'selectionKind',
      'view',
      'title',
      'cardId',
      'optionId',
      'focus',
    ].flatMap(key => (query.has(key) ? [[key, query.get(key)!]] : [])),
  ),
};
const defaultCounts: ProductCounts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};
const countSeed = query.get('counts');
const initialCounts =
  countSeed === 'zero'
    ? (Object.fromEntries(
        Object.keys(defaultCounts).map(k => [k, 0]),
      ) as ProductCounts)
    : countSeed === 'one'
    ? { ...defaultCounts, accounts: 1, debitCards: 1, creditCards: 0 }
    : defaultCounts;
const pageStyle: CSSProperties = {
  padding: 24,
  fontFamily: 'UniCredit-regular, sans-serif',
  background: '#f4f5f5',
};
const canvasStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: 375,
  height: captureMode ? captureHeight : 758.96875,
  overflow: 'hidden',
  marginTop: captureMode ? 0 : 16,
  boxShadow: '0 0 0 1px #ccc',
};
const controlsStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};
function Preview() {
  const [country, setCountry] = useState(initialCountry);
  const [mode, setMode] = useState<'light' | 'dark'>(
    query.get('theme') === 'dark' ? 'dark' : 'light',
  );
  const [language, setLanguage] = useState<AppLanguage>(
    getAvailableLanguages(initialCountry).find(
      value => value === query.get('lang'),
    ) ?? 'en',
  );
  const [counts, setCounts] = useState(initialCounts);
  const seed = JSON.stringify({ country, mode, language, counts });
  const application = (
    <CurrentApplication
      key={seed}
      country={country}
      release="release-current"
      scenario="active"
      initialLanguage={language}
      initialMode={mode}
      initialAmountsHidden={query.get('hidden') === '1'}
      initialRoute={initialRoute}
      screenTopInset={
        captureMode ? (query.get('topInset') === '54' ? 54 : 12) : 0
      }
      bottomInset={0}
      productCounts={counts}
    />
  );
  if (captureMode)
    return (
      <div id="home-canvas" style={canvasStyle}>
        <DemoViewport>
          <OverlayHost>{application}</OverlayHost>
        </DemoViewport>
      </div>
    );
  return (
    <main style={pageStyle}>
      <h1>PI Baseline · Native Home, Details, Payments, PFM, Offers & More</h1>
      <p>
        Același CurrentApplication/adapter ca în demo-ul Native. Canvas375×758
        exclude doar zona simulată de sistem de54px; hostul real păstrează
        propriile insets.
      </p>
      <div style={controlsStyle}>
        <label>
          Country{' '}
          <select
            aria-label="Baseline country"
            value={country}
            onChange={event => {
              const next = PI_BASELINE_COUNTRIES.find(
                value => value === event.target.value,
              );
              if (!next) return;
              setCountry(next);
              setLanguage(value =>
                getAvailableLanguages(next).includes(value) ? value : 'en',
              );
            }}
          >
            {PI_BASELINE_COUNTRIES.map(value => (
              <option key={value} value={value}>
                {COUNTRY_META[value].nameEN}
              </option>
            ))}
          </select>
        </label>
        <label>
          Language{' '}
          <select
            aria-label="Baseline language"
            value={language}
            onChange={event => {
              const next = getAvailableLanguages(country).find(
                value => value === event.target.value,
              );
              if (next) setLanguage(next);
            }}
          >
            {getAvailableLanguages(country).map(value => (
              <option key={value} value={value}>
                {getLanguageDisplayName(value)}
              </option>
            ))}
          </select>
        </label>
        {(
          [
            'home',
            'account',
            'card',
            'payments',
            'payment-create',
            'pfm',
            'products',
            'profile',
          ] as const
        ).map(screen => (
          <a
            key={screen}
            href={`?screen=${screen}&theme=${mode}&lang=${language}&country=${country}`}
          >
            {screen === 'home'
              ? 'Home'
              : screen === 'account'
              ? 'Account Details'
              : screen === 'card'
              ? 'Card Details'
              : screen === 'payments'
              ? 'Payments'
              : screen === 'payment-create'
              ? 'Domestic payment'
              : screen === 'pfm'
              ? 'Spending / PFM'
              : screen === 'products'
              ? 'Offers / Produse'
              : 'More / Mai multe'}
          </a>
        ))}
        <button
          onClick={() => setMode(v => (v === 'light' ? 'dark' : 'light'))}
        >
          Light / Dark
        </button>
        <button
          onClick={() =>
            setLanguage(v =>
              v === 'en' ? getAvailableLanguages(country)[0] : 'en',
            )
          }
        >
          EN / Local
        </button>
        <button onClick={() => setCounts(defaultCounts)}>
          Default products
        </button>
        <button
          onClick={() =>
            setCounts({
              ...defaultCounts,
              accounts: 1,
              debitCards: 1,
              creditCards: 0,
            })
          }
        >
          Singletons
        </button>
        <button
          onClick={() =>
            setCounts(
              Object.fromEntries(
                Object.keys(defaultCounts).map(k => [k, 0]),
              ) as ProductCounts,
            )
          }
        >
          No products
        </button>
      </div>
      <div id="home-canvas" style={canvasStyle}>
        <DemoViewport>
          <OverlayHost>{application}</OverlayHost>
        </DemoViewport>
      </div>
      <p>
        În lucru: comparație cu Web4004. Acest preview nu certifică APK-ul sau
        comportamentul pe dispozitiv.
      </p>
    </main>
  );
}
const root = document.getElementById('root')!;
root.style.maxWidth = 'none';
root.style.display = 'block';
createRoot(root).render(<Preview />);
