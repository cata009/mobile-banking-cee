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
    ['products-menu', 18, '85a14c2a1aa8b8b34792716627a0f3b1c9d7ca95387cf4be873c385f14b3136b'],
    ['products-shopsmart', 15, 'd139acf5df5f8d9fe3252d8bf0e882794af8fe48d6ba887c57d892528c1b99d7'],
    ['analytics-overview', 0, '647a8a3dcd449c096d32a105d26bf3a06aa4da5e9abe83df7c9bf64aaccf686e'],
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
