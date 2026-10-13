// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import { InvestmentAmount, InvestmentPage } from '@/experiences/pi/it/mobile-first/MobileFirstInvestmentPrimitives'

afterEach(cleanup)

it('groups four-digit source portfolio values with the Italian thousands separator', () => {
  const view = render(
    <DemoProvider>
      <InvestmentAmount value={8659.04} />
    </DemoProvider>,
  )
  expect(view.container).toHaveTextContent('8.659,04 €')
})

it('masks detail amounts and preserves the Italian decimal format', () => {
  const view = render(
    <DemoProvider initialState={{ amountsHidden: false }}>
      <InvestmentAmount value={21647.62} />
    </DemoProvider>,
  )
  expect(view.container).toHaveTextContent('21.647,62 €')
  view.unmount()
  const masked = render(
    <DemoProvider initialState={{ amountsHidden: true }}>
      <InvestmentAmount value={21647.62} />
    </DemoProvider>,
  )
  expect(masked.container).toHaveTextContent('••••')
  expect(masked.container).not.toHaveTextContent('21.647')
})

it('offers independent back and close actions and handles Escape through the shared dialog', () => {
  const onBack = vi.fn(),
    onClose = vi.fn()
  render(
    <InvestmentPage title="Acquisto" onBack={onBack} onClose={onClose}>
      Riepilogo
    </InvestmentPage>,
  )
  expect(screen.getByRole('dialog', { name: 'Acquisto' })).toHaveTextContent('Riepilogo')
  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
  expect(onBack).toHaveBeenCalledOnce()
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(onClose).toHaveBeenCalledOnce()
})
