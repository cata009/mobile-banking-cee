// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import MobileFrame from '@/app/components/MobileFrame'
import { DevicePreviewProvider, DevicePreviewSelector } from '@/app/components/demo/DevicePreview'

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

function renderPreview() {
  return render(
    <DevicePreviewProvider>
      <DevicePreviewSelector />
      <MobileFrame>
        <div>Homepage</div>
      </MobileFrame>
    </DevicePreviewProvider>,
  )
}

function selectDevice(label: string) {
  fireEvent.click(screen.getByRole('button', { name: /Preview device:/ }))
  fireEvent.click(screen.getByRole('menuitem', { name: label }))
}

describe('adaptive device preview', () => {
  it('provides a centered baseline-width fallback only on the open Duo preview', () => {
    window.history.replaceState(null, '', '/?previewDevice=iphone-duo-open')
    const { container } = renderPreview()
    const canvas = container.querySelector('[data-phone-canvas]') as HTMLElement
    expect(canvas.style.getPropertyValue('--uc-duo-fallback-left')).toBe('153.5px')
    expect(canvas.style.getPropertyValue('--uc-duo-fallback-width')).toBe('560px')
    expect(container.querySelector('style')?.textContent).toContain(':not(:has([data-duo-geometry="true"]))')
    fireEvent.click(screen.getByRole('button', { name: 'Rotate preview' }))
    expect(canvas.style.getPropertyValue('--uc-duo-fallback-left')).toBe('54.5px')
    expect(canvas.style.getPropertyValue('--uc-duo-fallback-width')).toBe('560px')
  })
  it('backs the Duo system strip with the themed screen surface for fallback experiences', () => {
    window.history.replaceState(null, '', '/?previewDevice=iphone-duo-closed')
    render(
      <DevicePreviewProvider>
        <MobileFrame statusBarVariant="light">
          <div>Fallback experience</div>
        </MobileFrame>
      </DevicePreviewProvider>,
    )
    const surface = screen.getByTestId('device-preview-screen')
    expect(surface.style.backgroundColor).toBe('var(--uc-app-bg)')
    expect(document.querySelector('[data-duo-system-strip]')).toBeInTheDocument()
  })
  it('uses a dark backing for white system chrome without changing normal devices', () => {
    render(
      <DevicePreviewProvider>
        <MobileFrame statusBarVariant="dark">
          <div>Fallback experience</div>
        </MobileFrame>
      </DevicePreviewProvider>,
    )
    expect(screen.getByTestId('device-preview-screen').style.backgroundColor).toBe('')
    cleanup()
    window.history.replaceState(null, '', '/?previewDevice=iphone-duo-open')
    render(
      <DevicePreviewProvider>
        <MobileFrame statusBarVariant="dark">
          <div>Fallback experience</div>
        </MobileFrame>
      </DevicePreviewProvider>,
    )
    expect(screen.getByTestId('device-preview-screen').style.backgroundColor).toBe('var(--uc-static-black)')
  })
  it('restores Duo rotation beside the selector and reflows the real viewport', () => {
    renderPreview()
    selectDevice('iPhone Duo - open')
    expect(screen.getByRole('button', { name: 'Rotate preview' })).toHaveAttribute('title', 'Rotate to portrait')
    fireEvent.click(screen.getByRole('button', { name: 'Rotate preview' }))
    expect(screen.getByTestId('device-preview-screen')).toHaveStyle({ width: '669px', height: '951px' })
    expect(screen.getByTestId('device-preview-screen')).toHaveAttribute('data-device-orientation', 'portrait')
    expect(document.querySelector('[data-duo-system-strip]')).not.toBeInTheDocument()
    expect(new URLSearchParams(window.location.search).get('previewOrientation')).toBe('portrait')
    fireEvent.click(screen.getByRole('button', { name: 'Rotate preview' }))
    expect(screen.getByTestId('device-preview-screen')).toHaveStyle({ width: '951px', height: '669px' })
    expect(document.querySelector('[data-duo-system-strip]')).toBeInTheDocument()
  })
  it('restores the Duo pose from a review link', () => {
    window.history.replaceState(null, '', '/?previewDevice=iphone-duo-open')
    renderPreview()
    expect(screen.getByTestId('device-preview-screen')).toHaveStyle({ width: '951px', height: '669px' })
    expect(screen.getByRole('button', { name: 'Preview device: iPhone Duo - open' })).toBeInTheDocument()
  })
  it('restores portrait orientation from the review link', () => {
    window.history.replaceState(null, '', '/?previewDevice=iphone-duo-open&previewOrientation=portrait')
    renderPreview()
    expect(screen.getByTestId('device-preview-screen')).toHaveStyle({ width: '669px', height: '951px' })
    expect(document.querySelector('[data-duo-system-strip]')).not.toBeInTheDocument()
    expect(document.querySelector('[data-duo-hinge]')).toHaveAttribute('data-duo-fold-axis', 'horizontal')
  })
  it('renders Mobile First at its Figma width while keeping the baseline canvas at 375px', () => {
    const { container, rerender } = render(
      <DevicePreviewProvider>
        <MobileFrame authoringWidth={393}>
          <div>Italia</div>
        </MobileFrame>
      </DevicePreviewProvider>,
    )
    const canvas = container.querySelector('[data-phone-canvas]') as HTMLElement
    expect(canvas).toHaveStyle({ width: '393px' })
    expect(canvas.style.transform).toBe('')
    rerender(
      <DevicePreviewProvider>
        <MobileFrame>
          <div>CEE</div>
        </MobileFrame>
      </DevicePreviewProvider>,
    )
    expect(container.querySelector('[data-phone-canvas]')).toHaveStyle({ width: '375px' })
  })
  it('uses the same flat chrome as neighboring demo actions', () => {
    const { container } = renderPreview()
    const controls = container.querySelector('[data-device-preview-controls]')

    expect(controls).toHaveClass('flex', 'items-center', 'gap-[4px]')
    expect(controls).not.toHaveClass('border', 'bg-[var(--uc-surface)]', 'p-[4px]', 'shadow-sm')
  })

  it('changes the actual logical viewport for regular, Galaxy Fold8 and iPhone Duo profiles', () => {
    renderPreview()
    const screenSurface = screen.getByTestId('device-preview-screen')

    expect(screenSurface).toHaveStyle({ width: '393px', height: '852px' })

    expect(screen.queryByRole('combobox', { name: 'Preview device' })).not.toBeInTheDocument()

    selectDevice('Galaxy Z Fold8 - closed')
    expect(screenSurface).toHaveStyle({ width: '390px', height: '624px' })

    selectDevice('Galaxy Z Fold8 - open')
    expect(screenSurface).toHaveStyle({ width: '840px', height: '630px' })

    selectDevice('iPhone Duo - closed')
    expect(screenSurface).toHaveStyle({ width: '466px', height: '678px' })
    expect(document.querySelector('[data-duo-system-strip]')).toBeInTheDocument()
    expect(screenSurface.style.borderRadius).toBe('3px 44px 44px 3px')
    expect(document.querySelector('[data-duo-cover-camera]')).toBeInTheDocument()
    expect(document.querySelector('[data-duo-folded-layer]')).toBeInTheDocument()

    selectDevice('iPhone Duo - open')
    expect(screenSurface).toHaveStyle({ width: '951px', height: '669px' })
    expect(document.querySelector('[data-duo-cover-camera]')).not.toBeInTheDocument()
    expect(document.querySelector('[data-duo-hinge]')).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Duo adaptation mode' })).not.toBeInTheDocument()
    expect(screen.queryByText('Duo findings')).not.toBeInTheDocument()
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

    selectDevice('iPhone Duo - closed')
    expect(document.querySelector('[data-device-dynamic-island]')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rotate preview' })).not.toBeInTheDocument()
    expect(screen.getByTestId('device-preview-screen')).toHaveStyle({ width: '466px', height: '678px' })
  })
})
