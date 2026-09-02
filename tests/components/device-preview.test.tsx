// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import MobileFrame from '@/app/components/MobileFrame'
import {
  DevicePreviewProvider,
  DevicePreviewSelector,
} from '@/app/components/demo/DevicePreview'

afterEach(cleanup)

function renderPreview() {
  return render(
    <DevicePreviewProvider>
      <DevicePreviewSelector />
      <MobileFrame><div>Homepage</div></MobileFrame>
    </DevicePreviewProvider>,
  )
}

function selectDevice(label: string) {
  fireEvent.click(screen.getByRole('button', { name: /Preview device:/ }))
  fireEvent.click(screen.getByRole('menuitem', { name: label }))
}

describe('adaptive device preview', () => {
  it('uses the same flat chrome as neighboring demo actions', () => {
    const { container } = renderPreview()
    const controls = container.querySelector('[data-device-preview-controls]')

    expect(controls).toHaveClass('flex', 'items-center', 'gap-[4px]')
    expect(controls).not.toHaveClass('border', 'bg-[var(--uc-surface)]', 'p-[4px]', 'shadow-sm')
  })

  it('changes the actual logical viewport for regular, Galaxy Fold8 and Apple passport profiles', () => {
    renderPreview()
    const screenSurface = screen.getByTestId('device-preview-screen')

    expect(screenSurface).toHaveStyle({ width: '393px', height: '852px' })

    expect(screen.queryByRole('combobox', { name: 'Preview device' })).not.toBeInTheDocument()

    selectDevice('Galaxy Z Fold8 - closed')
    expect(screenSurface).toHaveStyle({ width: '390px', height: '624px' })

    selectDevice('Galaxy Z Fold8 - open')
    expect(screenSurface).toHaveStyle({ width: '840px', height: '630px' })

    selectDevice('Apple passport concept - closed')
    expect(screenSurface).toHaveStyle({ width: '390px', height: '573px' })

    selectDevice('Apple passport concept - open')
    expect(screenSurface).toHaveStyle({ width: '848px', height: '600px' })
  })

  it('rotates by swapping logical dimensions instead of transforming the canvas', () => {
    renderPreview()
    selectDevice('Galaxy Z Fold8 - open')
    fireEvent.click(screen.getByRole('button', { name: 'Rotate preview' }))

    const screenSurface = screen.getByTestId('device-preview-screen')
    expect(screenSurface).toHaveStyle({ width: '630px', height: '840px' })
    expect(screenSurface.style.transform).toBe('')
  })

  it('reserves rotation for open foldable previews and restores portrait when switching away', () => {
    renderPreview()

    expect(document.querySelector('[data-device-dynamic-island]')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rotate preview' })).not.toBeInTheDocument()

    selectDevice('Galaxy Z Fold8 - closed')
    expect(screen.queryByRole('button', { name: 'Rotate preview' })).not.toBeInTheDocument()
    expect(screen.getByTestId('device-preview-screen')).toHaveStyle({ width: '390px', height: '624px' })

    selectDevice('Galaxy Z Fold8 - open')
    fireEvent.click(screen.getByRole('button', { name: 'Rotate preview' }))
    expect(screen.getByTestId('device-preview-screen')).toHaveStyle({ width: '630px', height: '840px' })

    selectDevice('Apple passport concept - closed')
    expect(document.querySelector('[data-device-dynamic-island]')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rotate preview' })).not.toBeInTheDocument()
    expect(screen.getByTestId('device-preview-screen')).toHaveStyle({ width: '390px', height: '573px' })
  })
})
