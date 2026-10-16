// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import AnalyticsScreen from '@/app/screens/analytics/AnalyticsScreen';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { DemoProvider } from '@/app/state/demoStore';
import { mockProducts } from '@/data/products';
import { deriveProductCategories } from '@/features/products/selectors';
import {
  createSpendingAnalyticsTimeline,
  createSpendingCategoryDetail,
} from '@/data/spendingAnalytics';
import { createEvoTranslations } from '@/translations/evo';
import {
  loadActualNativeAnalyticsModule,
  productCountsForNative,
  waitForNativeAnalyticsScreen,
} from './nativeAnalyticsL6Harness';

const nativeLoader = vi.hoisted(() => ({ load: vi.fn() }));

vi.mock('@/app/components/demo/nativeDemoLoader', () => ({
  loadNativeDemoModule: nativeLoader.load,
}));

function Context({
  country,
  release,
  children,
}: PropsWithChildren<{
  country: 'RO' | 'CZ';
  release: 'release-current' | 'release-future-evo-2027';
}>) {
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country,
        release,
        scenario: 'active',
        productCounts: productCountsForNative(mockProducts),
      }}
    >
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  );
}

beforeEach(() => {
  nativeLoader.load.mockReset();
  nativeLoader.load.mockImplementation(loadActualNativeAnalyticsModule);
});

afterEach(cleanup);

it('renders RO Baseline analytics in the actual Native host and preserves category transaction selection', async () => {
  const onTransactionClick = vi.fn();
  const sourceProducts = deriveProductCategories({ country: 'RO', release: 'release-current', resolvedProductCounts: productCountsForNative(mockProducts) }).flatMap(category => category.products);
  const timeline = createSpendingAnalyticsTimeline('RO', sourceProducts);
  const summary = timeline.summariesByPeriodKey[timeline.activePeriodKey]!;
  const expected = createSpendingCategoryDetail(summary, 'Shopping', 'out');
  expect(expected.transactions.length).toBeGreaterThan(0);

  const view = render(
    <Context country="RO" release="release-current">
      <AnalyticsScreen onTransactionClick={onTransactionClick} />
    </Context>,
  );
  await waitForNativeAnalyticsScreen(view.container);

  const overview = screen.getByTestId('ro-pfm-overview');
  expect(overview).toHaveTextContent('APRIL');
  expect(overview).toHaveTextContent('11.759,09');
  expect(overview).toHaveTextContent('13.283,76');

  fireEvent.click(
    screen.getByRole('button', { name: 'Open category details: SHOPPING' }),
  );
  expect(await screen.findByTestId('ro-pfm-category-detail')).toBeInTheDocument();
  const firstTransaction = expected.transactions[0]!;
  fireEvent.click(
    screen.getByRole('button', {
      name: new RegExp(firstTransaction.label),
    }),
  );
  await waitFor(() => expect(onTransactionClick).toHaveBeenCalledWith(firstTransaction));
});

it('renders CZ/Evo PFM in the actual Native host with Source scope, direction, and period selection', async () => {
  const onAddTransaction = vi.fn();
  const view = render(
    <Context country="CZ" release="release-future-evo-2027">
      <AnalyticsScreen
        initialScopeId="acc-1"
        initialDirection="expense"
        onAddTransaction={onAddTransaction}
      />
    </Context>,
  );
  await waitForNativeAnalyticsScreen(view.container);

  expect((await screen.findAllByRole('heading', { name: 'Money out' })).length).toBeGreaterThan(0);
  expect(screen.getByRole('tab', { name: 'Donut' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('button', { name: 'Choose accounts' })).toHaveTextContent(
    deriveProductCategories({ country: 'CZ', release: 'release-future-evo-2027', resolvedProductCounts: productCountsForNative(mockProducts) }).flatMap(category => category.products).find(product => product.id === 'acc-1')!.name,
  );
  fireEvent.click(
    screen.getByRole('button', {
      name: createEvoTranslations('en').spending.changePeriod,
    }),
  );
  fireEvent.click(await screen.findByRole('radio', { name: 'Last 3 months' }));
  await waitFor(() => expect(screen.getByRole('button', { name: createEvoTranslations('en').spending.changePeriod })).toHaveTextContent('Last 3 months'));
  fireEvent.click(screen.getByRole('button', { name: 'Add transaction' }));
  await waitFor(() => expect(onAddTransaction).toHaveBeenCalledTimes(1));
});
