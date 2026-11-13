// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import RequestCallScreen from '@/app/screens/appointments/RequestCallScreen'
import { renderBankingScreen } from '../helpers/coverageProviders'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', () => ({
  loadNativeDemoModule: async () => (await import('../helpers/nativeWebRenderer')).loadNativeDemoModuleForWebTest(),
}))
afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
})
it('exposes one dialog when the request reason sheet opens', async () => {
  const rendered = renderBankingScreen(<RequestCallScreen country="CZ" onBack={vi.fn()} />)
  await asyncNativeReady(rendered.container)
  fireEvent.click(await screen.findByRole('button', { name: 'Open What do you want to talk about?' }))
  expect(await screen.findAllByRole('dialog')).toHaveLength(1)
})
