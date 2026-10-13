// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import MobileFirstInvestmentDepositInfo from '@/experiences/pi/it/mobile-first/MobileFirstInvestmentDepositInfo'
import { InvestmentEducation } from '@/experiences/pi/it/mobile-first/MobileFirstInvestmentExtras'

afterEach(cleanup)

it('connects the source investment webview to deposit information and appointment handoff', () => {
  const onAppointment = vi.fn()
  render(<MobileFirstInvestmentDepositInfo onClose={vi.fn()} onAppointment={onAppointment} />)
  fireEvent.click(screen.getByRole('button', { name: 'Conto Titoli come aprirlo' }))
  expect(screen.getByRole('dialog', { name: 'Conto Titoli come aprirlo' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Appuntamento' }))
  expect(onAppointment).toHaveBeenCalledOnce()
})

it('returns from deposit details to the source product listing', () => {
  const onClose = vi.fn()
  render(<MobileFirstInvestmentDepositInfo onClose={onClose} onAppointment={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: 'Conto Titoli come aprirlo' }))
  fireEvent.click(screen.getByRole('button', { name: 'Indietro' }))
  expect(screen.getByRole('dialog', { name: 'Tutti gli investimenti' })).toBeInTheDocument()
  expect(onClose).not.toHaveBeenCalled()
})

it('navigates the reference education carousel with bounded previous and next actions', () => {
  render(<InvestmentEducation onClose={vi.fn()} onNavigate={vi.fn()} />)
  expect(screen.getByRole('button', { name: 'Video precedenti' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Video successivi' }))
  expect(screen.getByRole('button', { name: 'Video successivi' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Video precedenti' })).toBeEnabled()
})
