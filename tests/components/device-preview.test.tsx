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

describe('adaptive device preview', () => {
  it('changes the actual logical viewport for regular, Galaxy Fold8 and Apple passport profiles', () => {
    renderPreview()
    const screenSurface = screen.getByTestId('device-preview-screen')

    expect(screenSurface).toHaveStyle({ width: '430px', height: '932px' })

    fireEvent.change(screen.getByLabelText('Preview device'), { target: { value: 'galaxy-fold8-closed' } })
    expect(screenSurface).toHaveStyle({ width: '390px', height: '624px' })

    fireEvent.change(screen.getByLabelText('Preview device'), { target: { value: 'galaxy-fold8-open' } })
    expect(screenSurface).toHaveStyle({ width: '840px', height: '630px' })

    fireEvent.change(screen.getByLabelText('Preview device'), { target: { value: 'apple-foldable-closed' } })
    expect(screenSurface).toHaveStyle({ width: '390px', height: '573px' })

    fireEvent.change(screen.getByLabelText('Preview device'), { target: { value: 'apple-foldable-open' } })
    expect(screenSurface).toHaveStyle({ width: '848px', height: '600px' })
  })

  it('rotates by swapping logical dimensions instead of transforming the canvas', () => {
    renderPreview()
    fireEvent.change(screen.getByLabelText('Preview device'), { target: { value: 'galaxy-fold8-open' } })
    fireEvent.click(screen.getByRole('button', { name: 'Rotate preview' }))

    const screenSurface = screen.getByTestId('device-preview-screen')
    expect(screenSurface).toHaveStyle({ width: '630px', height: '840px' })
    expect(screenSurface.style.transform).toBe('')
  })
})
