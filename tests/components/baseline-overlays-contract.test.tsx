// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BottomSheet } from '@/app/components/BottomSheet'
import { BottomSheet as BeforeBottomSheet } from '../fixtures/baseline-overlays-before/BottomSheet'
import { LogoutConfirmDialog } from '@/app/components/LogoutConfirmDialog'
import PanelMenuSheet from '@/app/components/PanelMenuSheet'
import { resolveBottomSheet } from '@/app/components/contracts/bottomSheet'

afterEach(cleanup)
const normalize = (html: string) => html.replace(/:[rR][a-zA-Z0-9]+:/g, ':generated:').replace(/\s+/g, ' ')
describe('baseline overlay preservation', () => {
  it('keeps exact default shell DOM and explicit fill-height geometry', () => {
    const props = { title: 'Filters', onClose: vi.fn(), fillHeight: true, maxHeightOffsetPx: 64 }
    const { container, rerender } = render(<BeforeBottomSheet {...props}>Content</BeforeBottomSheet>)
    const before = normalize(container.innerHTML)
    rerender(<BottomSheet {...props}>Content</BottomSheet>)
    expect(normalize(container.innerHTML)).toBe(before)
    expect(resolveBottomSheet({ animated: true })).toMatchObject({ closeDelay: 360, maxHeightOffsetPx: 54 })
  })
  it('Escape calls the owner exactly once', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet title="Filters" onClose={onClose}>
        Content
      </BottomSheet>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('logout closes before confirmation', () => {
    const calls: string[] = []
    render(<LogoutConfirmDialog isOpen onClose={() => calls.push('close')} onConfirm={() => calls.push('confirm')} />)
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(calls).toEqual(['close', 'confirm'])
  })
  it('panel keeps non-interactive rows inert and coapping owner action active', () => {
    const onStart = vi.fn()
    render(
      <PanelMenuSheet
        aboutSmartBanking="About"
        exchangeRates="Exchange"
        findAtmBranches="ATM"
        startCoAppingSession="Start session"
        onStartCoApping={onStart}
      />,
    )
    fireEvent.click(screen.getByText('About'))
    expect(onStart).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Start session'))
    expect(onStart).toHaveBeenCalledTimes(1)
  })
})
