// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import ToolsScreen from '@/app/screens/tools/ToolsScreen'
import { DemoProvider } from '@/app/state/demoStore'

// jsdom cannot decode images or create blob URLs. Control only these browser
// boundaries; the tool, providers and both prelogin screens render for real.
class DecodedImage {
  static instances: DecodedImage[] = []
  naturalWidth = 1125
  naturalHeight = 2436
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''
  constructor() {
    DecodedImage.instances.push(this)
  }
}

let released: string[]
beforeEach(() => {
  DecodedImage.instances = []
  released = []
  let nextUrl = 0
  vi.stubGlobal('Image', DecodedImage)
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL() {
        return `blob:picture-${++nextUrl}`
      }
      static revokeObjectURL(url: string) {
        released.push(url)
      }
    },
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function openTester() {
  const view = render(
    <DemoProvider initialState={{ country: 'SI', product: 'PI' }}>
      <LanguageProvider initialLanguage="en">
        <ToolsScreen />
      </LanguageProvider>
    </DemoProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: /Prelogin picture tester/ }))
  return view
}

function upload(name = 'portrait.jpg', type = 'image/jpeg') {
  fireEvent.change(screen.getByLabelText('Choose a prelogin image'), {
    target: { files: [new File(['image'], name, { type })] },
  })
  return DecodedImage.instances.at(-1)!
}

describe('prelogin picture tester', () => {
  it('enables crop download only after an image finishes decoding', () => {
    openTester()
    expect(screen.getByRole('button', { name: 'Download cropped image' })).toBeDisabled()
    const decoded = upload()
    expect(screen.getByRole('button', { name: 'Download cropped image' })).toBeDisabled()
    act(() => decoded.onload?.())
    expect(screen.getByRole('button', { name: 'Download cropped image' })).toBeEnabled()
    fireEvent.change(screen.getByRole('slider', { name: 'Zoom' }), { target: { value: '150' } })
    for (const label of ['Active app preview', 'Inactive app preview']) {
      expect(within(screen.getByLabelText(label)).getByAltText('Background')).toHaveStyle({ transform: 'scale(1.5)' })
    }
    fireEvent.click(screen.getByRole('button', { name: 'Reset image' }))
    expect(screen.getByRole('button', { name: 'Download cropped image' })).toBeDisabled()
    expect(screen.getByRole('slider', { name: 'Zoom' })).toHaveValue('100')
  })

  it('shows both real prelogin layouts with the default picture', () => {
    openTester()
    expect(within(screen.getByLabelText('Active app preview')).getByText('Log in')).toBeInTheDocument()
    expect(within(screen.getByLabelText('Inactive app preview')).getByText('Activate application')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Image guidelines' })).toBeInTheDocument()
  })

  it('applies a decoded local image and crop position to both screens', () => {
    openTester()
    const decoded = upload()
    act(() => decoded.onload?.())
    expect(screen.getByText('portrait.jpg')).toBeInTheDocument()
    expect(screen.getByText(/^1125 × 2436 px/)).toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider', { name: 'Horizontal position' }), { target: { value: '75' } })
    fireEvent.change(screen.getByRole('slider', { name: 'Vertical position' }), { target: { value: '25' } })
    for (const label of ['Active app preview', 'Inactive app preview']) {
      const image = within(screen.getByLabelText(label)).getByAltText('Background')
      expect(image).toHaveAttribute('src', 'blob:picture-1')
      expect(image).toHaveStyle({ objectPosition: '75% 25%' })
    }
  })

  it('accepts a dropped image and releases it on reset', () => {
    openTester()
    fireEvent.drop(screen.getByLabelText('Image drop zone'), {
      dataTransfer: { files: [new File(['image'], 'dropped.webp', { type: 'image/webp' })] },
    })
    act(() => DecodedImage.instances.at(-1)?.onload?.())
    expect(screen.getByText('dropped.webp')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reset image' }))
    expect(screen.queryByText('dropped.webp')).not.toBeInTheDocument()
    expect(released).toContain('blob:picture-1')
    expect(
      within(screen.getByLabelText('Active app preview')).getByAltText('Background').getAttribute('src'),
    ).not.toMatch(/^blob:/)
  })

  it('rejects unsupported, oversized and undecodable files without replacing a working preview', () => {
    openTester()
    act(() => upload().onload?.())
    upload('vector.svg', 'image/svg+xml')
    expect(screen.getByRole('alert')).toHaveTextContent(/JPG, PNG or WebP/)
    const oversized = new File(['image'], 'large.png', { type: 'image/png' })
    Object.defineProperty(oversized, 'size', { value: 10 * 1024 * 1024 + 1 })
    fireEvent.change(screen.getByLabelText('Choose a prelogin image'), { target: { files: [oversized] } })
    expect(screen.getByRole('alert')).toHaveTextContent(/10 MB/)
    const broken = upload('broken.jpg')
    act(() => broken.onerror?.())
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be read/)
    expect(within(screen.getByLabelText('Active app preview')).getByAltText('Background')).toHaveAttribute(
      'src',
      'blob:picture-1',
    )
  })

  it('keeps the latest selection when image decoding finishes out of order', () => {
    openTester()
    const first = upload('first.jpg')
    const lateLoad = first.onload
    const second = upload('second.jpg')
    act(() => second.onload?.())
    act(() => lateLoad?.())
    expect(screen.getByText('second.jpg')).toBeInTheDocument()
    expect(screen.queryByText('first.jpg')).not.toBeInTheDocument()
    expect(released).toContain('blob:picture-1')
  })

  it('discards uploaded files when leaving the tool and reopening it', () => {
    openTester()
    act(() => upload().onload?.())
    fireEvent.click(screen.getByRole('button', { name: 'Back to Tools overview' }))
    expect(released).toContain('blob:picture-1')
    fireEvent.click(screen.getByRole('button', { name: /Prelogin picture tester/ }))
    expect(screen.queryByText('portrait.jpg')).not.toBeInTheDocument()
    expect(
      within(screen.getByLabelText('Inactive app preview')).getByAltText('Background').getAttribute('src'),
    ).not.toMatch(/^blob:/)
  })
})
