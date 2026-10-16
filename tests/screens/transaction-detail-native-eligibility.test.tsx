// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import type { CountryId, ProductId, ReleaseId } from '@/app/state/demoTypes'
import { TransactionDetailScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import { createTransactionDetailData } from '@/data/paymentFlow'
import { getAccountTransactions } from '@/data/accountDetails'
import { mockProducts, type Currency } from '@/data/products'
import { asyncNativeReady, nativeWebRendererDiagnostics, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
})

const excludedContexts: readonly {
  product: ProductId
  demoCountry: CountryId
  screenCountry: CountryId
  release: ReleaseId
}[] = [
  { product: 'SME', demoCountry: 'RO', screenCountry: 'RO', release: 'release-current' },
  { product: 'PI', demoCountry: 'IT', screenCountry: 'IT', release: 'release-current' },
  { product: 'PI', demoCountry: 'RO', screenCountry: 'IT', release: 'release-current' },
  { product: 'KIDS_PI', demoCountry: 'HU', screenCountry: 'HU', release: 'release-current' },
]

const nativeReleaseContexts: readonly { country: CountryId; currency: Currency; release: ReleaseId }[] = [
  { country: 'RO', currency: 'RON', release: 'release-current' },
  { country: 'RO', currency: 'RON', release: 'release-v1' },
  { country: 'RO', currency: 'RON', release: 'release-v2' },
  { country: 'RO', currency: 'RON', release: 'release-v3' },
  { country: 'RO', currency: 'RON', release: 'release-v4' },
  { country: 'CZ', currency: 'CZK', release: 'release-future-cz-coapping' },
  { country: 'CZ', currency: 'CZK', release: 'release-future-cz-robo' },
  { country: 'CZ', currency: 'CZK', release: 'release-future-evo-2027' },
  { country: 'RS', currency: 'RSD', release: 'release-future-rs-my-banker' },
  { country: 'RS', currency: 'RSD', release: 'release-future-rs-future-gain' },
]

describe('transaction detail Native eligibility', () => {
  it.each(excludedContexts)('keeps LegacySourceTransactionDetailBody for excluded $product / $screenCountry / $release', context => {
    const currency: Currency = 'RON'
    const baseProduct = mockProducts.find(product => product.id === 'acc-1')
    if (!baseProduct) throw new Error('Current-account fixture is unavailable')
    const product = { ...baseProduct, currency }
    const transaction = getAccountTransactions('RO', 0, currency)[0]
    if (!transaction) throw new Error('Romanian current-account fixture is unavailable')
    const expectedTitle = createTransactionDetailData(transaction, context.screenCountry, product).title

    const view = render(
      <DemoProvider
        initialState={{
          product: context.product,
          country: context.demoCountry,
          release: context.release,
        }}
      >
        <LanguageProvider initialLanguage="en">
          <TransactionDetailScreen
            country={context.screenCountry}
            product={product}
            transaction={transaction}
            onBack={() => undefined}
            onRedoPayment={() => undefined}
          />
        </LanguageProvider>
      </DemoProvider>,
    )

    expect(view.container.querySelector('[data-native-screen-preview]')).not.toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: expectedTitle }).length).toBeGreaterThan(0)
  })

  it.each(nativeReleaseContexts)('forwards the transaction DTO for PI/current design system on $release', async context => {
    const baseProduct = mockProducts.find(candidate => candidate.id === 'acc-1')
    if (!baseProduct) throw new Error('Current-account fixture is unavailable')
    const product = { ...baseProduct, currency: context.currency }
    const transaction = getAccountTransactions(context.country, 0, context.currency)[0]
    if (!transaction) throw new Error(`No transaction fixture for ${context.country}`)
    const merchantEnrichment = {
      cleanMerchantName: 'Ethoca merchant',
      mcc: '5944 · Retail stores',
      location: { label: 'Store', address: 'Main Street 1' },
    }

    const view = render(
      <DemoProvider
        initialState={{
          product: 'PI',
          country: context.country,
          designSystem: 'current',
          release: context.release,
        }}
      >
        <LanguageProvider initialLanguage="en">
          <TransactionDetailScreen
            country={context.country}
            product={product}
            transaction={transaction}
            merchantEnrichment={merchantEnrichment}
            onBack={() => undefined}
            onRedoPayment={() => undefined}
          />
        </LanguageProvider>
      </DemoProvider>,
    )

    await asyncNativeReady(view.container)
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)).toMatchObject({
      country: context.country,
      release: context.release,
      route: {
        screen: 'transaction',
        params: { productId: product.id, transactionId: transaction.id, source: 'account' },
      },
      transactionSelection: { productId: product.id, source: 'account', transaction },
      transactionPresentation: { product, merchantEnrichment },
    })
  })
})
