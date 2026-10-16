// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import { DemoProvider, useDemo } from '@/app/state/demoStore'
import type { DemoState } from '@/app/state/demoTypes'
import { getDocumentsConfigForCountry } from '@/app/config/documentsConfig'
import {
  asyncNativeReady,
  nativeWebRendererDiagnostics,
  resetNativeWebRendererDiagnostics,
} from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

const PRODUCT_COUNTS: DemoState['productCounts'] = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'CZ',
        designSystem: 'current',
        scenario: 'active',
        release: 'release-current',
        bankingScenario: 'retail-multi-account-card',
        productCounts: PRODUCT_COUNTS,
      }}
    >
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  resetNativeWebRendererDiagnostics()
})

describe('Native Source preview lifetime', () => {
  it('defaults to preserving Native preview state while allowing a snapshot override', async () => {
    const view = render(
      <NativeScreenPreview
        route={{ screen: 'payments' }}
        snapshot={{ componentPreview: { kind: 'internal-transfer' } }}
      />,
      { wrapper: Providers },
    )
    await asyncNativeReady(view.container)
    expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.preservePreviewState).toBe(true)

    view.rerender(
      <NativeScreenPreview
        route={{ screen: 'payments' }}
        snapshot={{ componentPreview: { kind: 'internal-transfer' }, preservePreviewState: false }}
      />,
    )
    await waitFor(() => {
      expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.preservePreviewState).toBe(false)
    })
  })

  it('preserves Native-owned transfer input when Source changes country in the mounted preview', async () => {
    let sourceDemo: ReturnType<typeof useDemo> | null = null
    function SourceContextReader() {
      sourceDemo = useDemo()
      return null
    }

    const view = render(
      <DemoProvider
        initialState={{
          product: 'PI',
          country: 'CZ',
          designSystem: 'current',
          scenario: 'active',
          release: 'release-current',
          bankingScenario: 'retail-multi-account-card',
          productCounts: PRODUCT_COUNTS,
        }}
      >
        <LanguageProvider initialLanguage="en">
          <SourceContextReader />
          <NativeScreenPreview
            route={{ screen: 'payments' }}
            snapshot={{ componentPreview: { kind: 'internal-transfer' } }}
          />
        </LanguageProvider>
      </DemoProvider>,
    )
    await asyncNativeReady(view.container)

    fireEvent.change(screen.getByRole('textbox', { name: /Amount in/ }), {
      target: { value: '125' },
    })
    await waitFor(() => expect(screen.getByRole('textbox', { name: /Amount in/ })).toHaveValue('125'))

    if (!sourceDemo) throw new Error('Source context reader did not mount')
    act(() => sourceDemo?.setCountry('RO'))

    await waitFor(() => {
      expect(nativeWebRendererDiagnostics.snapshots.at(-1)).toMatchObject({
        country: 'RO',
        preservePreviewState: true,
      })
      expect(screen.getByRole('textbox', { name: /Amount in/ })).toHaveValue('125')
    })
  })

  it('keeps Native document deletion scoped and persistent when Source switches countries', async () => {
    let sourceDemo: ReturnType<typeof useDemo> | null = null
    function SourceContextReader() {
      sourceDemo = useDemo()
      return null
    }

    const view = render(
      <DemoProvider
        initialState={{
          product: 'PI',
          country: 'RO',
          designSystem: 'current',
          scenario: 'active',
          release: 'release-current',
          bankingScenario: 'retail-multi-account-card',
          productCounts: PRODUCT_COUNTS,
        }}
      >
        <LanguageProvider initialLanguage="en">
          <SourceContextReader />
          <NativeScreenPreview route={{ screen: 'documents' }} />
        </LanguageProvider>
      </DemoProvider>,
    )
    await asyncNativeReady(view.container)

    const deletedId = getDocumentsConfigForCountry('RO')
      .groups.flatMap((group) => group.items)
      .find((item) => !item.isLegal)!.id
    const rowName = `Document actions ${deletedId}`
    fireEvent.click(await screen.findByRole('button', { name: rowName }))
    fireEvent.click(await screen.findByRole('button', { name: `Delete document ${deletedId}` }))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(screen.queryByRole('button', { name: rowName })).not.toBeInTheDocument())

    if (!sourceDemo) throw new Error('Source context reader did not mount')
    act(() => sourceDemo?.setCountry('SK'))
    await waitFor(() => expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.country).toBe('SK'))

    act(() => sourceDemo?.setCountry('RO'))
    await waitFor(() => {
      expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.country).toBe('RO')
      expect(screen.queryByRole('button', { name: rowName })).not.toBeInTheDocument()
    })
  })
})
