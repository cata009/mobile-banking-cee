// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MarketingEmailBuilderTool from '@/app/screens/tools/MarketingEmailBuilderTool'
import { DRAFT_KEY, LIBRARY_KEY } from '@/features/marketing-email/storage'
import { createDocument } from '@/features/marketing-email/catalog'
import { serializeDocument } from '@/features/marketing-email/model'
import { emailCollisions } from '@/app/screens/tools/email-builder/dragDrop'
import type { CollisionDetection } from '@dnd-kit/core'
import { compileEmail, type CompiledEmail } from '@/features/marketing-email/compiler'
import type { EmailDocument } from '@/features/marketing-email/model'
import { APP_ICON_METADATA } from '@/features/marketing-email/appIconMetadata'
import { ICON_INVENTORY } from '@/app/components/icons'
import { IconArtwork } from '@/app/screens/tools/email-builder/IconArtwork'
import travelArtworkUrl from '@/assets/design-system/icons/brand-9382-18707-0.svg?url'

beforeEach(() => {
  localStorage.clear()
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('marketing email editor', () => {
  it('keeps pure generated metadata in parity with the live DS icon inventory', () => {
    expect(APP_ICON_METADATA).toEqual(
      ICON_INVENTORY.map((icon) => ({
        name: icon.name,
        label: icon.label,
        category: icon.category,
        source: icon.source,
        width: icon.previewWidth,
        height: icon.previewHeight,
        usage: icon.usage,
      })),
    )
  })
  it('reuses executable AppIcon/PFM renderers and original layered canonical artwork', () => {
    const { container, rerender } = render(<IconArtwork variantId="app:payment-scan-qr" size={48} />)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('[data-email-icon-source="app"]')).toHaveStyle({ width: '48px' })
    rerender(<IconArtwork variantId="pfm:income:category-circle" size={64} />)
    expect(container.querySelector('[data-pfm-category="Income"]')).toHaveAttribute(
      'data-pfm-icon-variant',
      'category-circle',
    )
    rerender(<IconArtwork variantId="9382:18711" size={64} />)
    expect(container.querySelectorAll('[data-email-artwork-layer]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-email-artwork-shape]')).toHaveLength(2)
    expect(container.querySelector('img')?.getAttribute('src')).toBe(travelArtworkUrl)
  })
  it('searches the full collection beyond the initial page and distinguishes source implementations', () => {
    render(<MarketingEmailBuilderTool />)
    fireEvent.click(screen.getByRole('button', { name: 'Add Icon' }))
    expect(screen.getByRole('button', { name: 'Load more icons' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Search design system icons' }), {
      target: { value: 'scan qr' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Choose Scan QR code, Default, source' }))
    expect(screen.getByText('Application SVG')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: 'Icon source' }), { target: { value: 'pfm' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Search design system icons' }), {
      target: { value: 'income' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Choose Income, Glyph, source' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Icon variant' }), {
      target: { value: 'pfm:income:category-circle' },
    })
    expect(screen.getByRole('combobox', { name: 'Icon variant' })).toHaveValue('pfm:income:category-circle')
  })
  it('ignores a late worker response from an earlier revision', async () => {
    const requests: { requestId: number; document: EmailDocument }[] = []
    let respond: (event: { data: { requestId: number; result: CompiledEmail } }) => void = () => {}
    class TestWorker {
      set onmessage(callback: typeof respond) {
        respond = callback
      }
      postMessage(request: (typeof requests)[number]) {
        requests.push(request)
      }
      terminate() {}
    }
    vi.stubGlobal('Worker', TestWorker)
    const doc = createDocument('blank')
    doc.config.senderAddress = '1 Example Street'
    doc.config.unsubscribeUrl = 'https://example.com/unsubscribe'
    localStorage.setItem(DRAFT_KEY, serializeDocument(doc))
    try {
      render(<MarketingEmailBuilderTool />)
      await waitFor(() => expect(requests).toHaveLength(1))
      fireEvent.change(screen.getByRole('textbox', { name: 'Subject' }), { target: { value: 'The latest draft' } })
      await waitFor(() => expect(requests).toHaveLength(2))
      const first = requests[0]!,
        second = requests[1]!
      const oldResult = await compileEmail(first.document)
      await act(async () => {
        respond({ data: { requestId: first.requestId, result: oldResult } })
      })
      expect(screen.getByRole('button', { name: 'Export ZIP' })).toBeDisabled()
      const latestResult = await compileEmail(second.document)
      await act(async () => {
        respond({ data: { requestId: second.requestId, result: latestResult } })
      })
      expect(screen.getByRole('button', { name: 'Export ZIP' })).toBeEnabled()
    } finally {
      cleanup()
      vi.unstubAllGlobals()
    }
  })
  it('offers the existing DS icon catalog with search and editable size presets', () => {
    render(<MarketingEmailBuilderTool />)
    fireEvent.click(screen.getByRole('button', { name: 'Add Icon' }))
    expect(screen.getByRole('textbox', { name: 'Search design system icons' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '64 px' }))
    expect(screen.getByRole('spinbutton', { name: 'Icon size (px)' })).toHaveValue(64)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Icon size (px)' }), { target: { value: '1' } })
    expect(screen.getByRole('spinbutton', { name: 'Icon size (px)' })).toHaveValue(1)
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Icon size (px)' }), { target: { value: '128' } })
    fireEvent.blur(screen.getByRole('spinbutton', { name: 'Icon size (px)' }))
    expect(screen.getByRole('spinbutton', { name: 'Icon size (px)' })).toHaveValue(128)
    fireEvent.change(screen.getByRole('textbox', { name: 'Search design system icons' }), {
      target: { value: 'no icon matches this phrase' },
    })
    expect(screen.getByText('No icons match your search.')).toBeInTheDocument()
  })
  it('targets blocks instead of their containing column during keyboard drag with a compact overlay', () => {
    const rect = (top: number, height: number) => ({
      top,
      bottom: top + height,
      left: 0,
      right: 600,
      width: 600,
      height,
    })
    const args = {
      active: { id: 'a' },
      collisionRect: { ...rect(154, 60), width: 260, right: 260 },
      pointerCoordinates: null,
      droppableContainers: [
        { id: 'column', data: { current: { type: 'column' } } },
        { id: 'a', data: { current: { type: 'block' } } },
        { id: 'b', data: { current: { type: 'block' } } },
      ],
      droppableRects: new Map([
        ['column', rect(0, 420)],
        ['a', rect(0, 146)],
        ['b', rect(154, 143)],
      ]),
    } as unknown as Parameters<CollisionDetection>[0]
    expect(emailCollisions(args)[0]?.id).toBe('b')
  })
  it('allows typing multiple variables and changing language through incomplete drafts', () => {
    render(<MarketingEmailBuilderTool />)
    const language = screen.getByRole('textbox', { name: 'Language code (e.g. en)' })
    fireEvent.change(language, { target: { value: 'e' } })
    expect(language).toHaveValue('e')
    fireEvent.change(language, { target: { value: 'en' } })
    const variables = screen.getByRole('textbox', { name: 'Declared variables (comma separated)' })
    fireEvent.change(variables, { target: { value: 'first_name,' } })
    expect(variables).toHaveValue('first_name,')
    fireEvent.change(variables, { target: { value: 'first_name,unsubscribe_url' } })
    fireEvent.blur(variables)
    expect(screen.getByRole('textbox', { name: 'Declared variables (comma separated)' })).toHaveValue(
      'first_name, unsubscribe_url',
    )
  })
  it('adds and edits blocks, moves them with explicit keyboard controls, undoes/redoes and autosaves', async () => {
    render(<MarketingEmailBuilderTool />)
    fireEvent.click(screen.getByRole('button', { name: 'Add Heading' }))
    const title = screen.getByRole('textbox', { name: 'Heading' })
    fireEvent.change(title, { target: { value: 'Edited heading' } })
    expect(screen.getByRole('button', { name: /Select Edited heading/ })).toBeInTheDocument()
    const row = screen.getByRole('button', { name: /Select Edited heading/ }).closest('[data-email-block]')!
    fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'Move up' }))
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(localStorage.getItem(DRAFT_KEY)).toContain('Edited heading'))
    expect(screen.getByRole('button', { name: 'Export ZIP' })).toBeDisabled()
  })

  it('compiles the current revision in an isolated iframe and enables final export only after errors are fixed', async () => {
    const doc = createDocument('blank')
    doc.config.senderAddress = 'Strada Exemplu 1'
    doc.config.unsubscribeUrl = 'https://example.com/unsubscribe'
    localStorage.setItem(DRAFT_KEY, serializeDocument(doc))
    render(<MarketingEmailBuilderTool />)
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
    await waitFor(() =>
      expect(screen.getByTitle('Compiled email')).toHaveAttribute('srcdoc', expect.stringContaining('color-scheme')),
    )
    expect(screen.getByTitle('Compiled email')).toHaveAttribute('sandbox', '')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Export ZIP' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
    expect(screen.getByTitle('Compiled email').getAttribute('srcdoc')).toContain('#141414')
    fireEvent.click(screen.getByRole('button', { name: 'Images off' }))
    expect(screen.getByTitle('Compiled email').getAttribute('srcdoc')).toContain("img-src 'none'")
    fireEvent.change(screen.getByRole('textbox', { name: 'Subject' }), { target: { value: '' } })
    expect(screen.getByRole('button', { name: 'Export ZIP' })).toBeDisabled()
  })

  it('keeps corrupt saved data intact until an explicit recovery choice and reports storage failures', async () => {
    localStorage.setItem(DRAFT_KEY, '{broken')
    render(<MarketingEmailBuilderTool />)
    expect(screen.getByRole('alert')).toHaveTextContent(/local storage/i)
    fireEvent.change(screen.getByRole('textbox', { name: 'Subject' }), { target: { value: 'Recuperare' } })
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect(localStorage.getItem(DRAFT_KEY)).toBe('{broken')
    fireEvent.click(screen.getByRole('button', { name: 'Replace unreadable draft' }))
    await waitFor(() => expect(localStorage.getItem(DRAFT_KEY)).toContain('Recuperare'))
  })

  it('saves reusable copies, inserts them independently and imports validated JSON without losing the current draft on failure', async () => {
    render(<MarketingEmailBuilderTool />)
    fireEvent.click(screen.getByRole('button', { name: 'Add Text' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save block to library' }))
    expect(localStorage.getItem(LIBRARY_KEY)).toContain('marketing-email-library')
    fireEvent.click(screen.getByRole('button', { name: /Insert Text saved/ }))
    expect(screen.getAllByRole('button', { name: /Select A clear message/ })).toHaveLength(3)
    const input = screen.getByLabelText('Import document JSON')
    fireEvent.change(input, { target: { files: [new File(['{bad'], 'bad.json', { type: 'application/json' })] } })
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/Invalid JSON/i))
    expect(screen.getByRole('textbox', { name: 'Subject' })).toHaveValue('Something for your next chapter')
  })
})
