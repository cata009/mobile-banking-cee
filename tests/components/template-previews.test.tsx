// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { createHash } from 'node:crypto'
import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { TemplateCodePreview, type TemplateCodePreviewId } from '@/app/components/templates/TemplateCodePreviews'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import type { NativeProductsPreview } from '@/features/demo-native/productsPreviewContracts'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'
import {
  asyncNativeReady,
  nativeWebRendererDiagnostics,
  resetNativeWebRendererDiagnostics,
} from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ product: 'PI', country: 'RO' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function renderPreview(previewId: TemplateCodePreviewId, presentationOnly: boolean) {
  resetNativeWebRendererDiagnostics()
  const view = render(
    <TemplateCodePreview previewId={previewId} presentationOnly={presentationOnly} />,
    { wrapper: AppProviders },
  )
  return { view }
}

function nativeRequests() {
  const requests = new Map<string, { route: NativeDemoRoute; preview: NativeProductsPreview }>()
  for (const snapshot of nativeWebRendererDiagnostics.snapshots) {
    if (snapshot.productsPreview) {
      requests.set(snapshot.productsPreview.region, {
        route: snapshot.route,
        preview: snapshot.productsPreview,
      })
    }
  }
  return Array.from(requests.values())
}

function markupHash(markup: string) {
  const stableMarkup = markup.replace(/>\d{2}:\d{2}</g, '>HH:MM<')
  return createHash('sha256').update(stableMarkup).digest('hex')
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

let originalMatchMedia: typeof window.matchMedia

beforeEach(() => {
  resetNativeWebRendererDiagnostics()
  originalMatchMedia = window.matchMedia
  window.matchMedia = vi.fn((media: string) => ({ media, matches: false })) as unknown as typeof window.matchMedia
})

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
  window.matchMedia = originalMatchMedia
  vi.unstubAllGlobals()
})

describe('products templates request the shared Native component regions', () => {
  it.each([
    ['products-menu', ['products-header', 'products-tabs', 'products-banking']],
    ['products-shopsmart', ['products-header', 'products-tabs', 'products-shopsmart']],
  ] as const)('%s sends the same Native regions in normal and presentation-only modes', async (previewId, expectedRegions) => {
    const normal = renderPreview(previewId, false)
    await asyncNativeReady(normal.view.container)
    await waitFor(() => expect(nativeRequests()).toHaveLength(expectedRegions.length))
    const normalRequests = nativeRequests().sort((left, right) => left.preview.region.localeCompare(right.preview.region))
    expect(normalRequests.map(item => item.preview.region)).toEqual([...expectedRegions].sort())
    expect(normalRequests.every(item => item.route.screen === 'products')).toBe(true)
    const normalNativeText = Array.from(normal.view.container.querySelectorAll('[data-native-current-host="true"]'))
      .map(host => host.textContent ?? '')
      .join(' ')
    expect(normalNativeText).toContain('Offers')
    normal.view.unmount()

    const presentation = renderPreview(previewId, true)
    await asyncNativeReady(presentation.view.container)
    await waitFor(() => expect(nativeRequests()).toHaveLength(expectedRegions.length))
    expect(nativeRequests().sort((left, right) => left.preview.region.localeCompare(right.preview.region)))
      .toEqual(normalRequests)
    const presentationNativeText = Array.from(presentation.view.container.querySelectorAll('[data-native-current-host="true"]'))
      .map(host => host.textContent ?? '')
      .join(' ')
    expect(presentationNativeText).toBe(normalNativeText)
    presentation.view.unmount()
  })

  it('preserves the Analytics Overview source template markup', () => {
    const normal = renderPreview('analytics-overview', false)
    const normalMarkup = normal.view.container.innerHTML
    expect(normal.view.queryAllByRole('button')).toHaveLength(0)
    normal.view.unmount()

    const presentation = renderPreview('analytics-overview', true)
    expect(presentation.view.queryAllByRole('button')).toHaveLength(0)
    expect(presentation.view.container.innerHTML).toBe(normalMarkup)
    expect(markupHash(normalMarkup)).toBe('974342acb4197789bc4572f938cf9865dcae3309190cb3dc1885a2450f612f60')
    presentation.view.unmount()
  })

  it('keeps product-card interactions as explicit no-ops in the static Banking template', async () => {
    const { view } = renderPreview('products-menu', false)
    try {
      await asyncNativeReady(view.container)
      await waitFor(() => expect(nativeRequests().some(request => request.preview.region === 'products-banking')).toBe(true))
      const banking = nativeRequests().map(request => request.preview).find(
        (preview): preview is Extract<NativeProductsPreview, { region: 'products-banking' }> =>
          preview?.region === 'products-banking',
      )
      expect(banking).toBeDefined()
      expect(banking?.products.map(card => card.id)).toContain('account')
      const account = banking?.products.find(card => card.id === 'account')
      if (!account) throw new Error('The Banking preview must include its account card')
      const native = Array.from(view.container.querySelectorAll<HTMLElement>('[data-native-current-host="true"]'))
        .find(host => host.textContent?.includes(account.title.replace(/\n/g, ' ')))
      if (!native) throw new Error('The Native Banking region must render the Source account card')
      fireEvent.click(within(native).getByRole('button', { name: account.title.replace(/\n/g, ' ') }))
      expect(view.queryByRole('dialog')).not.toBeInTheDocument()
      expect(nativeRequests().at(-1)?.route).toEqual({ screen: 'products' })
    } finally {
      view.unmount()
    }
  })
})
