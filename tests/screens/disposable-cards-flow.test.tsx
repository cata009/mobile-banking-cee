// @vitest-environment jsdom

import type { ReactNode } from 'react'
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FLOW_DEFINITIONS, FLOW_ORDER } from '@/app/screens/flow-library/flows'
import { FLOW_PREVIEWS, FLOW_PREVIEW_ORDER } from '@/app/registry/flowPreviewRegistry'
import { renderFlowPreview } from '@/app/screens/flow-library/components/flowPreviews'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import type { FlowDefinition } from '@/app/screens/flow-library/flows/types'
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

const flowId = 'rs-disposable-cards'
const screenKind = 'rs-disposable-cards-screen'

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
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
    expect(flow.scenarios.map((scenario) => scenario.id)).toEqual(['normal-card-details', 'disposable-card-details'])
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
        {
          label: 'Selected card',
          result: 'Starts Face ID verification before showing the selected card details.',
        },
        {
          label: 'Disposable card',
          result: 'Starts Face ID verification before showing disposable card details.',
        },
      ],
    })
    expect(flow.screenSpecs['rs-disposable-cards-face-id-normal']).toMatchObject({
      actions: [{ label: 'Face ID verified', result: 'Opens the selected card details after verification.' }],
      back: 'Returns to the card-choice sheet.',
    })
    expect(flow.screenSpecs['rs-disposable-cards-face-id-disposable']).toMatchObject({
      actions: [{ label: 'Face ID verified', result: 'Opens disposable card details after verification.' }],
      back: 'Returns to the card-choice sheet.',
    })
    expect(flow.screenSpecs['rs-disposable-cards-normal-details']?.actions).toEqual(
      expect.arrayContaining([
        { label: 'Back', result: 'Returns to the Cards screen.' },
        { label: 'Copy card number', result: 'Copies the card number to the clipboard.' },
      ]),
    )
    expect(flow.screenSpecs['rs-disposable-cards-disposable-details']?.actions).toEqual(
      expect.arrayContaining([
        { label: 'Back', result: 'Returns to the Cards screen.' },
        { label: 'Copy card number', result: 'Copies the card number to the clipboard.' },
      ]),
    )
    expect(previews[flowId]).toMatchObject({ title: 'Disposable Cards', countryScope: ['RS'], domain: 'Cards' })
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
  })

  it('opens the Payment-style sheet and routes to normal or disposable card details', async () => {
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

    const detailsSheet = await within(phone).findByRole('dialog')
    expect(within(detailsSheet).getByRole('heading', { name: 'Choose a card' })).toBeInTheDocument()
    const standardDetailsOption = within(detailsSheet).getByRole('button', { name: 'View selected card details' })
    expect(standardDetailsOption).toHaveTextContent('View the full card number, security code and expiry date.')
    fireEvent.click(standardDetailsOption)
    expect(await within(phone).findByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(within(phone).queryByText('Card number')).not.toBeInTheDocument()
    expect(await within(phone).findAllByRole('heading', { name: 'Card details' }, { timeout: 5_000 })).not.toHaveLength(0)
    expect(within(phone).getByText('Card number')).toBeInTheDocument()

    fireEvent.click(await within(phone).findByRole('button', { name: 'Back' }))
    fireEvent.click(await within(phone).findByRole('button', { name: 'Show Card Details' }))
    const reopenedSheet = await within(phone).findByRole('dialog')
    const disposableDetailsOption = within(reopenedSheet).getByRole('button', { name: 'View disposable card details' })
    expect(disposableDetailsOption).toHaveTextContent('View the disposable card number, security code and expiry date.')
    fireEvent.click(disposableDetailsOption)
    expect(await within(phone).findByRole('status', { name: 'Face ID verification' })).toBeInTheDocument()
    expect(within(phone).queryByText('Card number')).not.toBeInTheDocument()
    expect(await within(phone).findAllByRole('heading', { name: 'Disposable card details' }, { timeout: 5_000 })).not.toHaveLength(0)
    expect(within(phone).getByText('Card number')).toBeInTheDocument()
    fireEvent.click(await within(phone).findByRole('button', { name: 'Back' }))
    expect(await within(phone).findByRole('button', { name: 'Show Card Details' })).toBeInTheDocument()
  })
})
