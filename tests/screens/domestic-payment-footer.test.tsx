// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DomesticPaymentCreateScreen } from '@/app/screens/payments/DomesticPaymentFlowScreens'
import { DemoProvider } from '@/app/state/demoStore'
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
})

describe('Domestic payment footer', () => {
  it('keeps the Native create action disabled until recipient data is valid', async () => {
    const onNext = vi.fn()
    const view = render(
      <DemoProvider initialState={{ country: 'CZ', product: 'PI', release: 'release-future-evo-2027' }}>
        <LanguageProvider initialLanguage="en">
          <DomesticPaymentCreateScreen draft={createEmptyDomesticPaymentDraft('CZ')} onBack={vi.fn()} onNext={onNext} />
        </LanguageProvider>
      </DemoProvider>,
    )

    await asyncNativeReady(view.container)
    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()
    expect(onNext).not.toHaveBeenCalled()
  })
})
