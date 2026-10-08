// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ScreenErrorBoundary } from '@/app/components/ScreenErrorBoundary'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function Screen({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Destination failed')
  return <p>Destination ready</p>
}

it('contains destination failure while keeping the shell and back action usable', () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const onBack = vi.fn()
  render(
    <>
      <button>Operator controls</button>
      <ScreenErrorBoundary resetKey="one" onBack={onBack}>
        <Screen broken />
      </ScreenErrorBoundary>
    </>,
  )
  expect(screen.getByRole('button', { name: 'Operator controls' })).toBeEnabled()
  fireEvent.click(screen.getByRole('button', { name: 'Go back' }))
  expect(onBack).toHaveBeenCalledOnce()
})

it('recovers when the destination changes and preserves successful output', () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { rerender } = render(
    <ScreenErrorBoundary resetKey="one">
      <Screen broken />
    </ScreenErrorBoundary>,
  )
  rerender(
    <ScreenErrorBoundary resetKey="two">
      <Screen broken={false} />
    </ScreenErrorBoundary>,
  )
  expect(screen.getByText('Destination ready')).toBeInTheDocument()
  expect(screen.queryByText('Unable to open this screen')).not.toBeInTheDocument()
})

it('offers a fresh page load when a cached lazy import cannot be retried in place', () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const onReload = vi.fn()
  render(
    <ScreenErrorBoundary resetKey="one" onReload={onReload}>
      <Screen broken />
    </ScreenErrorBoundary>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(onReload).toHaveBeenCalledOnce()
})
