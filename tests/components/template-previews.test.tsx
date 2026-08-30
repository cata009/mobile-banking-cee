// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { createHash } from 'node:crypto'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { type PropsWithChildren } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { TemplateCodePreview, type TemplateCodePreviewId } from '@/app/components/templates/TemplateCodePreviews'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'

vi.mock('@/app/components/payments/PaymentHeroCard', () => ({
  default: ({ item }: { item: { title: string } }) => <button type="button">{item.title}</button>,
}))

vi.mock('@/app/components/products/ProductOfferCard', () => ({
  default: ({ offer }: { offer: { title: string } }) => <button type="button">{offer.title}</button>,
}))

vi.mock('@/app/components/products/ProductMenuCard', () => ({
  default: ({
    card,
    onClick,
  }: {
    card: { title: string }
    onClick?: (card: { title: string }) => void
  }) => (
    <button type="button" onClick={() => onClick?.(card)} data-has-explicit-callback={String(Boolean(onClick))}>
      {card.title}
    </button>
  ),
}))

vi.mock('@/app/components/shopsmart/ShopsmartOfferCard', () => ({
  default: ({ merchant }: { merchant: string }) => <button type="button">{merchant}</button>,
}))

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'RO' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function renderPreview(previewId: TemplateCodePreviewId, presentationOnly: boolean) {
  return render(
    <TemplateCodePreview previewId={previewId} presentationOnly={presentationOnly} />,
    { wrapper: AppProviders },
  )
}

function markupHash(markup: string) {
  const stableMarkup = markup
    .replace(/>\d{2}:\d{2}</g, '>HH:MM<')
    .replace(/ data-has-explicit-callback="(?:true|false)"/g, '')
  return createHash('sha256').update(stableMarkup).digest('hex')
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('static template previews', () => {
  it.each([
    ['products-menu', 18, '94bcc6cf9c856849395fa935d13af4fdec52da19ea0aae3f111d2806c47757b5'],
    ['products-shopsmart', 15, 'd599d178e4549596bfaa7131c729de7a201095cc58a3f1ca2b6af0b66abdf8c2'],
    ['analytics-overview', 0, '974342acb4197789bc4572f938cf9865dcae3309190cb3dc1885a2450f612f60'],
  ] as const)('preserves %s markup in normal and presentation-only modes', (previewId, buttonCount, expectedHash) => {
    const normal = renderPreview(previewId, false)
    const normalMarkup = normal.container.innerHTML
    expect(normal.queryAllByRole('button')).toHaveLength(buttonCount)
    normal.unmount()

    const presentation = renderPreview(previewId, true)
    expect(presentation.queryAllByRole('button')).toHaveLength(buttonCount)
    expect(presentation.container.innerHTML).toBe(normalMarkup)
    expect(markupHash(normalMarkup)).toBe(expectedHash)
  })

  it('keeps banking product cards as safe explicit no-op interactions', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    renderPreview('products-menu', false)

    fireEvent.click(screen.getByRole('button', { name: 'Account' }))

    expect(error).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Account' })).toHaveAttribute('data-has-explicit-callback', 'true')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
