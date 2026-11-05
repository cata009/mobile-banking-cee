// @vitest-environment jsdom

import type { ReactNode } from 'react'
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { FLOW_DEFINITIONS, FLOW_ORDER } from '@/app/screens/flow-library/flows'
import { FLOW_PREVIEWS, FLOW_PREVIEW_ORDER } from '@/app/registry/flowPreviewRegistry'
import { renderFlowPreview } from '@/app/screens/flow-library/components/flowPreviews'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import type { FlowDefinition } from '@/app/screens/flow-library/flows/types'
import { CARDS_CUSTOM_ICONS } from '@/app/components/icons/domains/cards/custom'
import proposedIcon from '@/flows/rs/disposable-cards/assets/disposable-card-expiry-proposal.svg?raw'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

const flowId = 'rs-disposable-cards'
const screenKind = 'rs-disposable-cards-screen'
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const originalScrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() })
})

afterAll(() => {
  if (originalScrollIntoView) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScrollIntoView)
  else Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView')
})

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
})

describe('Disposable Cards flow', () => {
  it('registers the RS-only Disposable Cards flow in the library', () => {
    const definitions = FLOW_DEFINITIONS as unknown as Record<string, FlowDefinition>
    const previews = FLOW_PREVIEWS as unknown as Record<
      string,
      { title: string; countryScope: readonly string[]; domain: string }
    >
    const flow = definitions[flowId]
    if (!flow) throw new Error('Disposable Cards definition is missing')

    expect(FLOW_ORDER).toContain(flowId)
    expect(FLOW_PREVIEW_ORDER).toEqual(FLOW_ORDER)
    expect(flow).toMatchObject({
      id: flowId,
      title: 'Disposable Cards',
      domain: 'Cards',
      countryScope: ['RS'],
      screenSpecs: {
        [screenKind]: expect.objectContaining({
          title: 'Cards',
          purpose: expect.any(String),
        }),
      },
    })
    expect(flow.scenarios.map((scenario) => scenario.id)).toEqual([
      'normal-card-details',
      'disposable-card-details',
      'manage-disposable-cards',
      'disposable-card-payment',
    ])
    expect(flow.scenarios[0]?.steps.map((step) => step.screen)).toEqual([
      screenKind,
      'rs-disposable-cards-details-sheet',
      'rs-disposable-cards-face-id-normal',
      'rs-disposable-cards-normal-details',
    ])
    expect(flow.scenarios[1]?.steps.map((step) => step.screen)).toEqual([
      screenKind,
      'rs-disposable-cards-details-sheet',
      'rs-disposable-cards-face-id-disposable',
      'rs-disposable-cards-disposable-details',
    ])
    expect(flow.screenSpecs[screenKind]?.actions).toContainEqual({
      label: 'Show Card Details',
      result: 'Opens the card-choice sheet for the selected card.',
    })
    expect(flow.screenSpecs['rs-disposable-cards-details-sheet']).toMatchObject({
      actions: [
        { label: 'Open card', result: 'Starts Face ID when the user taps a standard or disposable card.' },
        {
          label: 'Create disposable card',
          result:
            'Starts Face ID, then creates a disposable card and opens its details when fewer than three are active.',
        },
      ],
    })
    expect(flow.screenSpecs['rs-disposable-cards-face-id-normal']).toMatchObject({
      actions: [{ label: 'Face ID verified', result: 'Opens the selected card details after verification.' }],
      back: 'The animation has no in-screen Back or cancel control in this preview.',
    })
    expect(flow.screenSpecs['rs-disposable-cards-face-id-disposable']).toMatchObject({
      actions: [{ label: 'Face ID verified', result: 'Opens disposable card details after verification.' }],
      back: 'The animation has no in-screen Back or cancel control in this preview.',
    })
    expect(flow.screenSpecs['rs-disposable-cards-normal-details']?.actions).toEqual(
      expect.arrayContaining([
        { label: 'Back', result: 'Returns to the Cards screen.' },
        { label: 'Copy card number', result: 'Copies the card number to the clipboard.' },
      ]),
    )
    expect(flow.screenSpecs['rs-disposable-cards-disposable-details']?.actions).toEqual(
      expect.arrayContaining([
        { label: 'Back', result: 'Returns to the card list, or to Cards with the choice sheet closed.' },
        {
          label: 'Copy card number',
          result: 'Copies the number and shows a temporary confirmation when copying succeeds.',
        },
      ]),
    )
    expect(previews[flowId]).toMatchObject({ title: 'Disposable Cards', countryScope: ['RS'], domain: 'Cards' })
  })

  it('renders the Journey snapshots with the state described by each step', async () => {
    const renderPreview = renderFlowPreview as unknown as (
      kind: string,
      context: { parameters: Record<string, string> },
    ) => ReactNode
    const fixture = (kind: string, journeyState: string) =>
      render(<>{renderPreview(kind, { parameters: { journeyState } })}</>)

    let view = fixture('rs-disposable-cards-disposable-details', 'disposable-details')
    expect(await screen.findByText('5392 1076 4411 0015')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close disposable card' })).toBeInTheDocument()
    view.rerender(
      <>{renderPreview('rs-disposable-cards-disposable-details', { parameters: { journeyState: 'list' } })}</>,
    )
    expect(await screen.findByRole('button', { name: 'View disposable card ending 0015' })).toBeInTheDocument()
    view.unmount()

    view = fixture('rs-disposable-cards-disposable-details', 'help')
    expect(await screen.findByRole('dialog', { name: 'About disposable cards' })).toBeInTheDocument()
    view.unmount()

    view = fixture('rs-disposable-cards-disposable-details', 'close-confirmation')
    expect(await screen.findByRole('dialog', { name: 'Close disposable card?' })).toBeInTheDocument()
    expect(screen.getByText(/permanently closed/)).toBeInTheDocument()
    view.unmount()

    view = fixture('rs-disposable-cards-face-id-disposable', 'creation-verification')
    expect(await screen.findByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 950))
    })
    expect(screen.getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    view.unmount()

    view = fixture('rs-disposable-cards-screen', 'payment-completed')
    await asyncNativeReady(view.container)
    expect(await screen.findByText('Disposable card payment')).toBeInTheDocument()
    view.unmount()

    view = fixture('rs-disposable-cards-details-sheet', 'payment-completed')
    expect(await screen.findByRole('dialog', { name: 'Choose a card' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /view disposable card ending 0015/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create disposable card' })).toBeInTheDocument()
  })

  it('shows the documented card and management states when selecting Journey steps', async () => {
    render(
      <DemoProvider
        initialState={{
          country: 'RS',
          product: 'PI',
          release: 'release-current',
          bankingScenario: 'retail-multi-account-card',
        }}
      >
        <LanguageProvider initialLanguage="en">
          <FlowLibraryScreen initialFlowId={flowId} />
        </LanguageProvider>
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create a disposable card' }))
    fireEvent.click(screen.getByRole('button', { name: 'Disposable card details' }))
    const preview = screen.getByTestId('journey-current-screen-container')
    expect(await within(preview).findByText('5392 1076 4411 0015')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Manage and close a card' }))
    fireEvent.click(screen.getByRole('button', { name: 'About disposable cards' }))
    expect(await within(preview).findByRole('dialog', { name: 'About disposable cards' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm early closure' }))
    expect(await within(preview).findByRole('dialog', { name: 'Close disposable card?' })).toBeInTheDocument()
  })

  it('links each management Journey step to its own matching screen specification', () => {
    const flow = (FLOW_DEFINITIONS as unknown as Record<string, FlowDefinition>)[flowId]!
    const journey = flow.scenarios.find((scenario) => scenario.id === 'manage-disposable-cards')!
    for (const title of ['Card options', 'Disposable cards', 'About disposable cards', 'Confirm early closure']) {
      const step = journey.steps.find((item) => item.title === title)!
      expect(flow.screenSpecs[step.screen]?.title).toBe(title)
    }
  })

  it('opens the selected empty-list Journey state in the interactive prototype', async () => {
    render(
      <DemoProvider
        initialState={{
          country: 'RS',
          product: 'PI',
          release: 'release-current',
          bankingScenario: 'retail-multi-account-card',
        }}
      >
        <LanguageProvider initialLanguage="en">
          <FlowLibraryScreen initialFlowId={flowId} />
        </LanguageProvider>
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Manage and close a card' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open the screen spec for Disposable cards after closure' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open in prototype →' }))
    const phone = screen.getByTestId('flow-prototype-inspect-phone')
    expect(await within(phone).findByText('No disposable cards yet')).toBeInTheDocument()
    expect(within(phone).queryByRole('button', { name: /View disposable card ending/i })).not.toBeInTheDocument()
  })

  it('opens the selected closure confirmation in the interactive prototype', async () => {
    render(
      <DemoProvider
        initialState={{
          country: 'RS',
          product: 'PI',
          release: 'release-current',
          bankingScenario: 'retail-multi-account-card',
        }}
      >
        <LanguageProvider initialLanguage="en">
          <FlowLibraryScreen initialFlowId={flowId} />
        </LanguageProvider>
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Manage and close a card' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open the screen spec for Confirm early closure' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open in prototype →' }))
    const phone = screen.getByTestId('flow-prototype-inspect-phone')
    const confirmation = await within(phone).findByRole('dialog', { name: 'Close disposable card?' })
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Cancel' }))
    expect(within(phone).getByText('5392 1076 4411 0015')).toBeInTheDocument()
  })

  it('continues card creation when the verification Journey step opens in the prototype', async () => {
    render(
      <DemoProvider
        initialState={{
          country: 'RS',
          product: 'PI',
          release: 'release-current',
          bankingScenario: 'retail-multi-account-card',
        }}
      >
        <LanguageProvider initialLanguage="en">
          <FlowLibraryScreen initialFlowId={flowId} />
        </LanguageProvider>
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create a disposable card' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open the screen spec for Face ID verification' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open in prototype →' }))
    const phone = screen.getByTestId('flow-prototype-inspect-phone')
    expect(await within(phone).findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
  })

  it('declares the Prototype path through both card detail choices', () => {
    const flow = (FLOW_DEFINITIONS as unknown as Record<string, FlowDefinition>)[flowId]
    if (!flow) throw new Error('Disposable Cards definition is missing')

    expect(flow.prototype).toMatchObject({
      start: screenKind,
      nodes: {
        [screenKind]: { primary: { label: 'Show Card Details', to: 'rs-disposable-cards-details-sheet' } },
        'rs-disposable-cards-details-sheet': {
          primary: { label: 'Selected card', to: 'rs-disposable-cards-face-id-normal' },
          secondary: { label: 'Disposable card', to: 'rs-disposable-cards-face-id-disposable' },
        },
        'rs-disposable-cards-face-id-normal': { primary: { to: 'rs-disposable-cards-normal-details' } },
        'rs-disposable-cards-face-id-disposable': { primary: { to: 'rs-disposable-cards-disposable-details' } },
        'rs-disposable-cards-normal-details': { back: screenKind },
        'rs-disposable-cards-disposable-details': { back: screenKind },
      },
    })
  })

  it('shows the full Serbia baseline Cards screen with balance and transactions', async () => {
    const renderPreview = renderFlowPreview as unknown as (kind: string) => ReactNode
    const { container } = render(<>{renderPreview(screenKind)}</>)
    await asyncNativeReady(container)

    expect(screen.getAllByRole('heading', { name: 'Cards' }).length).toBeGreaterThan(0)
    expect(screen.getByText('PETER JAGODIĆ')).toBeInTheDocument()
    expect(screen.getByText('Free To Spend')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show Card Details' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View PIN' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Media Markt-14\.086,91 RSD/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /IKEA-37\.565,09 RSD/ })).toBeInTheDocument()
    expect(screen.getAllByText('RSD').length).toBeGreaterThan(0)

    const secondCard = screen.getByRole('button', { name: 'Debit Card 1' })
    fireEvent.click(secondCard)
    await waitFor(() => expect(secondCard).toHaveAttribute('aria-selected', 'true'))
    fireEvent.click(screen.getByRole('button', { name: 'Show Card Details' }))
    const sheet = await screen.findByRole('dialog', { name: 'Choose a card' })
    expect(within(sheet).getByRole('button', { name: /view your debit card/i })).toHaveTextContent('Your debit card')
  })

  it('opens card details directly when the card is tapped in the carousel', async () => {
    const renderPreview = renderFlowPreview as unknown as (kind: string) => ReactNode
    const view = render(<>{renderPreview(screenKind)}</>)
    await asyncNativeReady(view.container)
    fireEvent.click(screen.getByRole('button', { name: 'Show Card Details' }))
    const sheet = await screen.findByRole('dialog', { name: 'Choose a card' })
    expect(within(sheet).queryByRole('button', { name: 'View card details' })).not.toBeInTheDocument()
    const carousel = within(sheet).getByRole('group', { name: 'Available cards' })
    const createTile = within(carousel).getByRole('button', { name: 'Create disposable card' })
    const standardTile = within(carousel).getByRole('button', { name: /view your credit card/i })
    expect(standardTile).toHaveTextContent('Your credit card')
    expect(createTile).toHaveClass(...standardTile.className.split(' '))
    expect(within(createTile).getByText('Disposable card')).toBeInTheDocument()
    expect(within(createTile).getByText('Add new')).toBeInTheDocument()
    expect(within(createTile).getByText('Single use')).toBeInTheDocument()
    expect(within(sheet).queryByTestId('card-carousel-pagination')).not.toBeInTheDocument()
    expect(within(sheet).getAllByRole('button', { name: 'Create disposable card' })).toHaveLength(1)
    fireEvent.click(within(sheet).getByRole('button', { name: /view your credit card ending 4301/i }))
    expect(screen.getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(screen.queryByText('Card number')).not.toBeInTheDocument()
    expect(await screen.findByText('5173500087654301', {}, { timeout: 5_000 })).toBeInTheDocument()
  })

  it('selects the standard or a generated disposable card in the carousel and verifies before revealing details', async () => {
    const view = render(
      <DemoProvider
        initialState={{
          country: 'RS',
          product: 'PI',
          release: 'release-current',
          bankingScenario: 'retail-multi-account-card',
        }}
      >
        <LanguageProvider initialLanguage="en">
          <FlowLibraryScreen initialFlowId={flowId} />
        </LanguageProvider>
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Prototype' }))
    await asyncNativeReady(view.container)
    const phone = screen.getByTestId('flow-prototype-inspect-phone')
    fireEvent.click(within(phone).getByRole('button', { name: 'Show Card Details' }))
    let sheet = await within(phone).findByRole('dialog', { name: 'Choose a card' })
    expect(within(sheet).getByRole('button', { name: /view your credit card/i })).toBeInTheDocument()
    expect(
      within(sheet).getByText(
        'Tap a card to view its details. Disposable cards have their own number and can be used once.',
      ),
    ).toBeInTheDocument()
    expect(within(sheet).queryByText('No disposable cards yet')).not.toBeInTheDocument()
    expect(within(sheet).getByTestId('empty-disposable-card')).toBeInTheDocument()
    expect(within(sheet).getByTestId('empty-disposable-carousel-icon')).toHaveAttribute(
      'data-icon-source',
      'disposable-card-expiry',
    )
    fireEvent.click(within(sheet).getByRole('button', { name: /view your credit card/i }))
    expect(await within(phone).findByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(within(phone).queryByText('Card number')).not.toBeInTheDocument()
    expect(await within(phone).findByText('5173500087654301', {}, { timeout: 5_000 })).toBeInTheDocument()
    expect(within(phone).queryByRole('button', { name: 'Help' })).not.toBeInTheDocument()

    fireEvent.click(within(phone).getByRole('button', { name: 'Back' }))
    fireEvent.click(await within(phone).findByRole('button', { name: 'Show Card Details' }))
    sheet = await within(phone).findByRole('dialog', { name: 'Choose a card' })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Create disposable card' }))
    expect(within(phone).getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(within(phone).queryByText('Card number')).not.toBeInTheDocument()
    expect(await within(phone).findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
    expect(within(phone).queryByRole('button', { name: 'Help' })).not.toBeInTheDocument()
    fireEvent.click(within(phone).getByRole('button', { name: 'Back' }))
    fireEvent.click(await within(phone).findByRole('button', { name: 'Show Card Details' }))
    sheet = await within(phone).findByRole('dialog', { name: 'Choose a card' })
    expect(within(sheet).getByLabelText('Page 1 of 2').children).toHaveLength(2)
    const carousel = within(sheet).getByRole('group', { name: 'Available cards' })
    Object.defineProperties(carousel, {
      scrollWidth: { configurable: true, value: 600 },
      clientWidth: { configurable: true, value: 300 },
      scrollLeft: { configurable: true, writable: true, value: 180 },
      scrollTo: {
        configurable: true,
        value: ({ left }: { left: number }) => {
          carousel.scrollLeft = left
        },
      },
    })
    fireEvent.scroll(carousel)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 180))
    })
    expect(within(sheet).getByLabelText('Page 2 of 2').children).toHaveLength(2)
    const firstDisposableTile = within(sheet).getByRole('button', { name: /view disposable card ending 0015/i })
    expect(within(sheet).getByRole('button', { name: 'Create disposable card' })).toHaveClass(
      ...firstDisposableTile.className.split(' '),
    )
    const pages = carousel.querySelectorAll('[data-carousel-page]')
    expect(pages).toHaveLength(2)
    expect(within(pages[0] as HTMLElement).getAllByRole('button')).toHaveLength(2)
    expect(within(pages[1] as HTMLElement).getByRole('button', { name: 'Create disposable card' })).toBeInTheDocument()
    fireEvent.click(within(sheet).getByRole('button', { name: 'Create disposable card' }))
    expect(within(phone).getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(await within(phone).findByText('5392 1076 4411 0023', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(within(phone).getByRole('button', { name: 'Back' }))
    fireEvent.click(await within(phone).findByRole('button', { name: 'Show Card Details' }))
    sheet = await within(phone).findByRole('dialog', { name: 'Choose a card' })
    expect(within(sheet).getByRole('button', { name: /view disposable card ending 0015/i })).toBeInTheDocument()
    expect(within(sheet).getByRole('button', { name: /view disposable card ending 0023/i })).toBeInTheDocument()
    fireEvent.keyDown(within(sheet).getByRole('button', { name: /view your credit card/i }), { key: 'ArrowRight' })
    expect(within(sheet).getByRole('button', { name: /view disposable card ending 0015/i })).toHaveFocus()
    fireEvent.click(within(sheet).getByRole('button', { name: /view disposable card ending 0015/i }))
    expect(within(phone).getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(within(phone).queryByText('Card number')).not.toBeInTheDocument()
    expect(await within(phone).findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
  })

  it('returns to Cards with the sheet closed from the carousel, and to the list when opened from the list', async () => {
    const view = render(
      <DemoProvider
        initialState={{
          country: 'RS',
          product: 'PI',
          release: 'release-current',
          bankingScenario: 'retail-multi-account-card',
        }}
      >
        <LanguageProvider initialLanguage="en">
          <FlowLibraryScreen initialFlowId={flowId} />
        </LanguageProvider>
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Prototype' }))
    await asyncNativeReady(view.container)
    const phone = screen.getByTestId('flow-prototype-inspect-phone')
    fireEvent.click(within(phone).getByRole('button', { name: 'Show Card Details' }))
    let sheet = await within(phone).findByRole('dialog', { name: 'Choose a card' })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Create disposable card' }))
    expect(await within(phone).findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
    expect(
      within(phone).getByText('This card can be used once. The transaction will appear under your main card.'),
    ).toBeInTheDocument()
    fireEvent.click(within(phone).getByRole('button', { name: 'Back' }))
    expect(await within(phone).findByRole('button', { name: 'Show Card Details' })).toBeInTheDocument()
    expect(within(phone).queryByRole('dialog', { name: 'Choose a card' })).not.toBeInTheDocument()
    fireEvent.click(within(phone).getByRole('button', { name: 'Show Card Details' }))
    sheet = await within(phone).findByRole('dialog', { name: 'Choose a card' })
    fireEvent.click(within(sheet).getByRole('button', { name: /view disposable card ending 0015/i }))
    expect(await within(phone).findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(within(phone).getByRole('button', { name: 'Back' }))
    expect(await within(phone).findByRole('button', { name: 'Show Card Details' })).toBeInTheDocument()
    expect(within(phone).queryByRole('dialog', { name: 'Choose a card' })).not.toBeInTheDocument()
    fireEvent.click(await within(phone).findByRole('button', { name: 'Options' }))
    fireEvent.click(await within(phone).findByRole('button', { name: 'DISPOSABLE CARDS' }))
    fireEvent.click(await within(phone).findByRole('button', { name: 'View disposable card ending 0015' }))
    expect(await within(phone).findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(within(phone).getByRole('button', { name: 'Back' }))
    expect(within(phone).getByRole('button', { name: 'View disposable card ending 0015' })).toBeInTheDocument()
    expect(within(phone).queryByRole('dialog', { name: 'Choose a card' })).not.toBeInTheDocument()
  })

  it('does not create a card if the user leaves while Face ID is running', async () => {
    const view = render(
      <DemoProvider
        initialState={{
          country: 'RS',
          product: 'PI',
          release: 'release-current',
          bankingScenario: 'retail-multi-account-card',
        }}
      >
        <LanguageProvider initialLanguage="en">
          <FlowLibraryScreen initialFlowId={flowId} />
        </LanguageProvider>
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Prototype' }))
    await asyncNativeReady(view.container)
    const phone = screen.getByTestId('flow-prototype-inspect-phone')
    fireEvent.click(within(phone).getByRole('button', { name: 'Show Card Details' }))
    const sheet = await within(phone).findByRole('dialog', { name: 'Choose a card' })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Create disposable card' }))
    expect(within(phone).getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Restart' }))
    expect(await within(phone).findByRole('button', { name: 'Show Card Details' })).toBeInTheDocument()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 950))
    })
    fireEvent.click(within(phone).getByRole('button', { name: 'Show Card Details' }))
    const reopened = await within(phone).findByRole('dialog', { name: 'Choose a card' })
    expect(within(reopened).getByTestId('empty-disposable-card')).toBeInTheDocument()
    expect(
      within(within(reopened).getByRole('group', { name: 'Available cards' })).getAllByRole('button'),
    ).toHaveLength(2)
  })

  it('returns to the clear empty state after the last disposable card is closed', async () => {
    const renderPreview = renderFlowPreview as unknown as (kind: string) => ReactNode
    const view = render(<>{renderPreview(screenKind)}</>)
    await asyncNativeReady(view.container)
    fireEvent.click(screen.getByRole('button', { name: 'Show Card Details' }))
    let sheet = await screen.findByRole('dialog', { name: 'Choose a card' })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Create disposable card' }))
    expect(screen.getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(await screen.findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close disposable card' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirm closure' }))
    expect(screen.getByText('No disposable cards yet')).toBeInTheDocument()
    expect(screen.getByText('Create a card for one payment.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Show Card Details' }))
    sheet = await screen.findByRole('dialog', { name: 'Choose a card' })
    expect(within(sheet).getByTestId('empty-disposable-card')).toBeInTheDocument()
    expect(within(within(sheet).getByRole('group', { name: 'Available cards' })).getAllByRole('button')).toHaveLength(2)
    expect(within(sheet).getByRole('button', { name: 'Create disposable card' })).toBeEnabled()
  })

  it('limits creation in the carousel to three active disposable cards', async () => {
    const renderPreview = renderFlowPreview as unknown as (kind: string) => ReactNode
    const view = render(<>{renderPreview(screenKind)}</>)
    await asyncNativeReady(view.container)
    fireEvent.click(screen.getByRole('button', { name: 'Show Card Details' }))
    let sheet = await screen.findByRole('dialog', { name: 'Choose a card' })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Create disposable card' }))
    expect(await screen.findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    for (const pan of ['5392 1076 4411 0023', '5392 1076 4411 0031']) {
      fireEvent.click(await screen.findByRole('button', { name: 'Show Card Details' }))
      sheet = await screen.findByRole('dialog', { name: 'Choose a card' })
      fireEvent.click(within(sheet).getByRole('button', { name: 'Create disposable card' }))
      expect(screen.getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
      expect(await screen.findByText(pan, {}, { timeout: 5_000 })).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    }
    fireEvent.click(await screen.findByRole('button', { name: 'Options' }))
    fireEvent.click(await screen.findByRole('button', { name: 'DISPOSABLE CARDS' }))
    expect(screen.getByRole('button', { name: 'Generate new card' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Back' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Show Card Details' }))
    sheet = await screen.findByRole('dialog', { name: 'Choose a card' })
    expect(within(within(sheet).getByRole('group', { name: 'Available cards' })).getAllByRole('button')).toHaveLength(4)
    expect(within(sheet).queryByRole('button', { name: 'Create disposable card' })).not.toBeInTheDocument()
    expect(within(sheet).getByText('Maximum of 3 active disposable cards')).toBeInTheDocument()
    expect(within(sheet).getByLabelText('Page 1 of 2').children).toHaveLength(2)

    const carousel = within(sheet).getByRole('group', { name: 'Available cards' })
    const slides = within(carousel).getAllByRole('button')
    const pages = carousel.querySelectorAll('[data-carousel-page]')
    expect(pages).toHaveLength(2)
    expect(within(pages[0] as HTMLElement).getAllByRole('button')).toHaveLength(2)
    expect(within(pages[1] as HTMLElement).getAllByRole('button')).toHaveLength(2)
    Object.defineProperties(carousel, {
      clientWidth: { configurable: true, value: 343 },
      scrollWidth: { configurable: true, value: 686 },
      scrollLeft: { configurable: true, writable: true, value: 0 },
      scrollTo: {
        configurable: true,
        value: ({ left }: { left: number }) => {
          carousel.scrollLeft = left
        },
      },
    })
    fireEvent.mouseDown(slides[1]!, { button: 0, clientX: 300 })
    fireEvent.mouseMove(document, { buttons: 1, clientX: 170 })
    expect(carousel.scrollLeft).toBe(130)
    fireEvent.mouseUp(document)
    expect(within(sheet).getByLabelText('Page 2 of 2').children).toHaveLength(2)
    expect(carousel.scrollLeft).toBe(343)
    fireEvent.click(slides[0]!)
    expect(screen.queryByRole('status', { name: 'Face ID verification' })).not.toBeInTheDocument()
    fireEvent.pointerDown(slides[2]!, { pointerId: 7, pointerType: 'touch', clientX: 170 })
    fireEvent.pointerMove(carousel, { pointerId: 7, pointerType: 'touch', clientX: 300 })
    fireEvent.pointerUp(carousel, { pointerId: 7, pointerType: 'touch', clientX: 300 })
    expect(within(sheet).getByLabelText('Page 1 of 2').children).toHaveLength(2)
    expect(carousel.scrollLeft).toBe(0)
    fireEvent.keyDown(slides[1]!, { key: 'ArrowRight' })
    expect(within(sheet).getByLabelText('Page 2 of 2')).toBeInTheDocument()
    expect(slides[2]).toHaveFocus()
    expect(screen.queryByRole('status', { name: 'Face ID verification' })).not.toBeInTheDocument()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100))
    })
    fireEvent.click(within(carousel).getByRole('button', { name: /view disposable card ending 0023/i }))
    expect(screen.getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(await screen.findByText('5392 1076 4411 0023', {}, { timeout: 5_000 })).toBeInTheDocument()
  })

  it('verifies each new card before creation and opens its details directly', async () => {
    const renderPreview = renderFlowPreview as unknown as (kind: string) => ReactNode
    render(<>{renderPreview('rs-disposable-cards-disposable-details')}</>)
    expect(await screen.findByText('No disposable cards yet')).toBeInTheDocument()
    expect(screen.getByTestId('empty-disposable-list-icon')).toHaveAttribute(
      'data-icon-source',
      'disposable-card-expiry',
    )
    expect(screen.queryByText(/\d of 3 active cards/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Generate new card' }))
    expect(screen.getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(screen.queryByText('Card number')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Generate new card' })).not.toBeInTheDocument()
    expect(await screen.findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Close disposable card' }).closest('[data-disposable-card-footer]'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('button', { name: 'View disposable card ending 0015' })).toBeInTheDocument()
    expect(screen.queryByText(/\d of 3 active cards/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Generate new card' }))
    expect(screen.getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(screen.queryByText('Card number')).not.toBeInTheDocument()
    expect(await screen.findByText('5392 1076 4411 0023', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getAllByRole('button', { name: /View disposable card ending/ })).toHaveLength(2)
    expect(screen.queryByText(/\d of 3 active cards/)).not.toBeInTheDocument()
  })

  it('manages up to three disposable cards and explains the shared limits', async () => {
    const renderPreview = renderFlowPreview as unknown as (kind: string) => ReactNode
    render(<>{renderPreview('rs-disposable-cards-disposable-details')}</>)
    expect(await screen.findByText('No disposable cards yet')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    const help = screen.getByRole('dialog')
    expect(within(help).getByText(/one successful payment/i)).toBeInTheDocument()
    expect(within(help).getByRole('heading', { name: 'Valid for up to 30 days' })).toBeInTheDocument()
    expect(within(help).getByText(/transaction limits apply to all/i)).toBeInTheDocument()
    fireEvent.click(within(help).getByRole('button', { name: 'Close' }))

    for (const pan of ['5392 1076 4411 0015', '5392 1076 4411 0023', '5392 1076 4411 0031']) {
      fireEvent.click(screen.getByRole('button', { name: 'Generate new card' }))
      expect(screen.getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
      expect(await screen.findByText(pan, {}, { timeout: 5_000 })).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    }
    expect(screen.queryByText(/\d of 3 active cards/)).not.toBeInTheDocument()
    const generate = screen.getByRole('button', { name: 'Generate new card' })
    expect(generate).toBeDisabled()
    expect(generate.closest('[data-disposable-card-footer]')).toContainElement(
      screen.getByText('You have reached the maximum of 3 active cards.'),
    )
    const cards = screen.getAllByRole('button', { name: /View disposable card ending/ })
    expect(cards).toHaveLength(3)
    expect(cards[0]?.querySelector('[data-card-variant="mc-credit-partner-standard"]')).toBeInTheDocument()
    expect(new Set(cards.map((card) => card.getAttribute('aria-label'))).size).toBe(3)
    fireEvent.click(cards[0]!)
    expect(screen.getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(screen.queryByText('Card number')).not.toBeInTheDocument()
    expect(await screen.findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
    expect(screen.getByText('Expires on')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    fireEvent.click(screen.getByRole('button', { name: 'View disposable card ending 0023' }))
    expect(screen.getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(screen.queryByText('Card number')).not.toBeInTheDocument()
    expect(await screen.findByText('5392 1076 4411 0023', {}, { timeout: 5_000 })).toBeInTheDocument()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    fireEvent.click(screen.getByRole('button', { name: 'Copy card number' }))
    expect(await screen.findByText('Card number successfully copied')).toBeInTheDocument()
    expect(writeText).toHaveBeenCalledWith('5392 1076 4411 0023')
    expect(screen.getByText('Card number successfully copied').closest('[data-copy-toast]')).toHaveStyle({
      bottom: '100px',
    })
    await waitFor(() => expect(screen.queryByText('Card number successfully copied')).not.toBeInTheDocument(), {
      timeout: 3_000,
    })
    writeText.mockRejectedValueOnce(new Error('clipboard unavailable'))
    fireEvent.click(screen.getByRole('button', { name: 'Copy card number' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2))
    expect(screen.queryByText('Card number successfully copied')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close disposable card' }))
    const confirm = screen.getByRole('dialog')
    fireEvent.click(within(confirm).getByRole('button', { name: 'Confirm closure' }))
    expect(screen.getAllByRole('button', { name: /View disposable card ending/ })).toHaveLength(2)
    expect(screen.queryByText(/\d of 3 active cards/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate new card' })).toBeEnabled()
  })

  it('keeps the existing View PIN card silhouette in the disposable-card icon', () => {
    const original = CARDS_CUSTOM_ICONS['view-pin'].render().props.d as string
    const originalCard = original.slice(original.indexOf('M18.125 15.625'))
    expect(proposedIcon).toContain(originalCard)
    expect(proposedIcon).toContain('M15.15 1.9')
  })

  it('consumes the last viewed disposable card after a detected successful payment and leaves replacement manual', async () => {
    const view = render(
      <DemoProvider
        initialState={{
          country: 'RS',
          product: 'PI',
          release: 'release-current',
          bankingScenario: 'retail-multi-account-card',
        }}
      >
        <LanguageProvider initialLanguage="en">
          <FlowLibraryScreen initialFlowId={flowId} />
        </LanguageProvider>
      </DemoProvider>,
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Prototype' }))
    await asyncNativeReady(view.container)
    const phone = screen.getByTestId('flow-prototype-inspect-phone')
    fireEvent.click(within(phone).getByRole('button', { name: 'Show Card Details' }))
    const sheet = await within(phone).findByRole('dialog', { name: 'Choose a card' })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Create disposable card' }))
    expect(await within(phone).findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: 'Successful payment on last viewed disposable card' }))
    expect(await within(phone).findByRole('button', { name: 'Show Card Details' })).toBeInTheDocument()
    expect(await within(phone).findByText('Disposable card payment', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(within(phone).getByRole('button', { name: 'Debit Card 1' }))
    await waitFor(() => expect(within(phone).queryByText('Disposable card payment')).not.toBeInTheDocument())
    fireEvent.click(within(phone).getByRole('button', { name: 'Credit Card' }))
    expect(await within(phone).findByText('Disposable card payment', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(within(phone).getByRole('button', { name: 'Show Card Details' }))
    const afterPayment = await within(phone).findByRole('dialog', { name: 'Choose a card' })
    expect(
      within(afterPayment).queryByRole('button', { name: /view disposable card ending 0015/i }),
    ).not.toBeInTheDocument()
    expect(within(afterPayment).getByRole('button', { name: 'Create disposable card' })).toBeInTheDocument()
    fireEvent.click(within(afterPayment).getByRole('button', { name: 'Create disposable card' }))
    expect(await within(phone).findByText('5392 1076 4411 0023', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(within(phone).getByRole('button', { name: 'Back' }))
    fireEvent.click(await within(phone).findByRole('button', { name: 'Show Card Details' }))
    expect(within(phone).getByRole('button', { name: 'View disposable card ending 0023' })).toBeInTheDocument()
    expect(within(phone).queryByRole('button', { name: 'View disposable card ending 0015' })).not.toBeInTheDocument()
  })

  it('reveals Delete from card actions and closes the chosen card only after confirmation', async () => {
    const renderPreview = renderFlowPreview as unknown as (kind: string) => ReactNode
    render(<>{renderPreview('rs-disposable-cards-disposable-details')}</>)
    expect(await screen.findByText('No disposable cards yet')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Generate new card' }))
    expect(await screen.findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    const actions = screen.getByRole('button', { name: 'Card actions ending 0015' })
    expect(actions).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(actions)
    expect(actions).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Delete disposable card ending 0015' }))
    expect(screen.queryByRole('status', { name: 'Face ID verification' })).not.toBeInTheDocument()
    let confirm = screen.getByRole('dialog', { name: 'Close disposable card?' })
    expect(within(confirm).getByText(/0015/)).toBeInTheDocument()
    expect(within(confirm).getByText(/permanently closed/)).toBeInTheDocument()
    expect(within(confirm).getByText(/create a new disposable card/)).toBeInTheDocument()
    fireEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('button', { name: 'View disposable card ending 0015' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Card actions ending 0015' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete disposable card ending 0015' }))
    confirm = screen.getByRole('dialog', { name: 'Close disposable card?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Confirm closure' }))
    expect(screen.queryByRole('button', { name: 'View disposable card ending 0015' })).not.toBeInTheDocument()
    expect(screen.getByText('No disposable cards yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate new card' })).toBeEnabled()
  })

  it('opens disposable cards from Card options immediately below View PIN', async () => {
    const renderPreview = renderFlowPreview as unknown as (kind: string) => ReactNode
    const view = render(<>{renderPreview(screenKind)}</>)
    await asyncNativeReady(view.container)
    fireEvent.click(screen.getByRole('button', { name: 'Options' }))
    const entry = await screen.findByRole('button', { name: /disposable cards/i })
    expect(within(entry).getByTestId('disposable-card-icon').querySelector('svg')).toBeInTheDocument()
    expect(within(entry).getByText('View or create disposable cards')).toBeInTheDocument()
    const pin = screen.getByText('VIEW PIN')
    const limits = screen.getByText('CARD LIMITS')
    expect(pin.compareDocumentPosition(entry) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(entry.compareDocumentPosition(limits) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    fireEvent.click(entry)
    expect(await screen.findByText('No disposable cards yet')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Generate new card' }))
    expect(screen.getByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(screen.queryByText('Card number')).not.toBeInTheDocument()
    expect(await screen.findByText('5392 1076 4411 0015', {}, { timeout: 5_000 })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(await screen.findByRole('button', { name: /disposable cards/i })).toBeInTheDocument()
  })
})
