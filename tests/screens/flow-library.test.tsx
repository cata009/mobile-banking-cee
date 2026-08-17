// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import { DemoProvider } from '@/app/state/demoStore'
import { FLOW_DEFINITIONS, FLOW_ORDER, resolveScenario } from '@/app/screens/flow-library/flows'
import { FLOW_PREVIEWS, FLOW_PREVIEW_ORDER } from '@/app/registry/flowPreviewRegistry'

afterEach(cleanup)

function renderFlowLibrary(initialFlowId: Parameters<typeof FlowLibraryScreen>[0]['initialFlowId']) {
  return render(
    <DemoProvider>
      <FlowLibraryScreen initialFlowId={initialFlowId} />
    </DemoProvider>,
  )
}

function renderFlowLibraryInKidsHungary() {
  return render(
    <DemoProvider initialState={{ product: 'KIDS_PI', country: 'HU', bankingScenario: 'kids-child-preview' }}>
      <FlowLibraryScreen initialFlowId="mobile-pi-ethoca" />
    </DemoProvider>,
  )
}

describe('flow-library scenario resolution', () => {
  const flow = FLOW_DEFINITIONS['ro-round-up']

  it('resolves requested, default and empty scenarios coherently', () => {
    expect(resolveScenario(flow, 'deactivate').scenario.label).toBe('Deactivate')
    expect(resolveScenario(flow, 'missing')).toMatchObject({ scenarioId: flow.defaultScenarioId })

    const emptyFlow = { ...flow, scenarios: [], defaultScenarioId: 'missing' }
    const empty = resolveScenario(emptyFlow, 'also-missing')
    expect(empty.scenarioId).toBe('__empty__')
    expect(empty.scenario.steps).toEqual([])
    expect(empty.scenario.description).toMatch(/no scenarios/i)
  })
})

describe('flow definitions integrity', () => {
  it('covers every registered flow id with a valid default scenario', () => {
    for (const id of FLOW_ORDER) {
      const flow = FLOW_DEFINITIONS[id]
      expect(flow.id).toBe(id)
      expect(flow.scenarios.length).toBeGreaterThan(0)
      expect(flow.scenarios.some((scenario) => scenario.id === flow.defaultScenarioId)).toBe(true)
    }
  })

  it('derives the preview meta registry from the definitions', () => {
    expect(FLOW_PREVIEW_ORDER).toEqual(FLOW_ORDER)
    for (const id of FLOW_ORDER) {
      expect(FLOW_PREVIEWS[id].title).toBe(FLOW_DEFINITIONS[id].title)
      expect(FLOW_PREVIEWS[id].domain).toBe(FLOW_DEFINITIONS[id].domain)
    }
  })

  it('attaches a screen spec to every screen used by a scenario', () => {
    for (const id of FLOW_ORDER) {
      const flow = FLOW_DEFINITIONS[id]
      const screens = new Set(flow.scenarios.flatMap((scenario) => scenario.steps.map((step) => step.screen)))
      for (const kind of screens) {
        expect(flow.screenSpecs[kind], `${id}:${kind}`).toBeDefined()
      }
    }
  })
})

describe('flow-library screen', () => {
  it('opens the library index when entered from the global Flows destination', () => {
    render(
      <DemoProvider>
        <FlowLibraryScreen initialFlowId="mobile-pi-ethoca" initialView="index" />
      </DemoProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Future flows, spec-ready' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'ETHOCA Merchant Enrichment', level: 1 })).not.toBeInTheDocument()
  })

  it('opens on the selected flow and exposes capturable step screens', () => {
    renderFlowLibrary('ro-round-up')

    // Flow detail header (the preview PageHeaders are aria-hidden, so this is unique).
    expect(screen.getByRole('heading', { name: 'Round Up' })).toBeInTheDocument()

    // The off-screen capture strip renders capturable phone screens up-front so
    // export works regardless of the active tab.
    expect(document.querySelector('[data-flow-screen-capture="true"]')).toBeInTheDocument()

    // Tabs use real tab semantics; the Journey tab surfaces the scenarios.
    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))
    expect(screen.getByText('Create: existing account')).toBeInTheDocument()
  })

  it('registers ETHOCA as a global Mobile PI card-transaction specification', () => {
    const ethoca = FLOW_DEFINITIONS['mobile-pi-ethoca']
    const merchantAvailable = ethoca.scenarios.find((scenario) => scenario.id === 'merchant-available')
    const pending = ethoca.scenarios.find((scenario) => scenario.id === 'pending-card-transaction')
    const fallback = ethoca.scenarios.find((scenario) => scenario.id === 'merchant-logo-fallback')

    expect(ethoca.countryScope).toEqual(expect.arrayContaining(['RO', 'CZ', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI']))
    expect(ethoca.scenarios.map((scenario) => scenario.id)).toEqual([
      'merchant-available',
      'pending-card-transaction',
      'merchant-logo-fallback',
    ])
    expect(ethoca.overview.businessRules.join(' ')).toMatch(/32x32/i)
    expect(ethoca.overview.businessRules.join(' ')).toMatch(/Merchant Category Code/i)
    expect(ethoca.overview.signing).toBeUndefined()
    expect(ethoca.overview.analyticsEvents).not.toContain('ethoca_location_opened')
    expect(merchantAvailable?.steps.map((step) => step.title)).toEqual([
      'Enriched card list',
      'Enriched account list',
      'In-store detail',
      'Online detail',
    ])
    expect(pending?.steps.map((step) => step.title)).toEqual([
      'Pending card list',
      'Pending account list',
      'Pending transaction detail',
    ])
    expect(fallback?.steps.map((step) => step.title)).toEqual([
      'PFM fallback list',
      'Partial data without logo or map',
      'Fallback detail',
    ])
  })

  it('omits Signing from the ETHOCA flow specification', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Spec' }))

    expect(screen.queryByText('Signing')).not.toBeInTheDocument()
    expect(screen.getByText('Business analysis specification')).toBeInTheDocument()
    expect(screen.queryByText(/map deep-link/i)).not.toBeInTheDocument()
  })

  it('shows the Figma, PDF, and Word header actions without handoff copy', () => {
    renderFlowLibrary('ro-round-up')

    expect(screen.getByRole('link', { name: 'Open Figma source' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export flow as PDF' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export flow as Word' })).toBeInTheDocument()
    expect(screen.queryByText('Screens + full spec, ready for handoff.')).not.toBeInTheDocument()
  })

  it('keeps navigation outside the detail card and condenses flow metadata', () => {
    renderFlowLibrary('ro-round-up')

    const detailHeader = screen.getByRole('heading', { name: 'Round Up' }).closest('header')
    const libraryBack = screen.getByRole('button', { name: /flow library/i })
    const overview = screen.getByRole('heading', { name: 'At a glance' }).closest('section')

    expect(detailHeader).not.toContainElement(libraryBack)
    expect(detailHeader).not.toHaveTextContent('Future Release Preview')
    expect(detailHeader).not.toHaveTextContent('RO')
    expect(within(overview!).getByTestId('flow-overview-meta')).toHaveClass('sm:grid-cols-3')
    expect(within(overview!).queryByText('Status')).not.toBeInTheDocument()
  })

  it('keeps the library index focused on flow discovery rather than release statuses', () => {
    renderFlowLibrary('ro-round-up')

    fireEvent.click(screen.getByRole('button', { name: /flow library/i }))

    expect(screen.getByRole('heading', { name: 'Future flows, spec-ready' })).toBeInTheDocument()
    expect(screen.queryByText('FLOW LIBRARY')).not.toBeInTheDocument()
    expect(screen.queryByText('Status')).not.toBeInTheDocument()
    expect(screen.queryByText('in review')).not.toBeInTheDocument()
    expect(screen.queryByText('future release preview')).not.toBeInTheDocument()
    expect(screen.getByText(/Explore each journey visually/i)).toBeInTheDocument()
  })

  it('labels overview information for business review without a duplicate scenarios section', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    const purpose = screen.getByText('Purpose').closest('section')

    expect(purpose).toHaveClass('bg-[var(--uc-surface-muted)]')
    expect(purpose).not.toHaveClass('bg-[var(--uc-action-soft)]')
    expect(screen.getByText('Scope and demo note')).toBeInTheDocument()
    expect(screen.getByTestId('flow-overview-country-summary')).toHaveTextContent('8 markets')
    expect(screen.queryByRole('heading', { name: 'Scenarios' })).not.toBeInTheDocument()
  })

  it('renders header document actions as neutral icon cards', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    expect(screen.getByRole('link', { name: 'Open Figma source' })).toHaveClass('bg-[var(--uc-surface-muted)]')
    expect(screen.getByRole('button', { name: 'Export flow as PDF' })).toHaveClass('bg-[var(--uc-surface-muted)]')
    expect(screen.getByRole('button', { name: 'Export flow as Word' })).toHaveClass('bg-[var(--uc-surface-muted)]')
    expect(screen.getByTestId('flow-document-icon-figma')).toBeInTheDocument()
    expect(screen.getByTestId('flow-document-icon-pdf')).toBeInTheDocument()
    expect(screen.getByTestId('flow-document-icon-word')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export flow as PDF' })).toHaveAttribute('data-export-document', 'current-flow')
    expect(screen.getByRole('button', { name: 'Export flow as Word' })).toHaveAttribute('data-export-document', 'current-flow')
  })

  it('groups the proposed solution into BA-friendly decision sections', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Spec' }))

    expect(screen.getByText('Proposed solution')).toBeInTheDocument()
    expect(screen.getAllByText('Transaction lists').length).toBeGreaterThan(0)
  })

  it('renders ETHOCA in a BA-aligned, demo-safe specification structure', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Spec' }))

    expect(screen.getByText('Business analysis specification')).toBeInTheDocument()
    expect(screen.getByText('General information')).toBeInTheDocument()
    expect(screen.getByText('Version & change context')).toBeInTheDocument()
    expect(screen.getByText('Open issues')).toBeInTheDocument()
    expect(screen.getByText('Requirement')).toBeInTheDocument()
    expect(screen.getByText('Current status')).toBeInTheDocument()
    expect(screen.getByText('Non-functional requirements')).toBeInTheDocument()
    expect(screen.getByText('Digital receipts are out of scope for this demo.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /download.*txt/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/Card_GetMerchantDetails/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/OAuth/i)).not.toBeInTheDocument()
  })

  it('renders ETHOCA as one BA document instead of screen-spec selectors', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Spec' }))

    expect(screen.getByText('Version history')).toBeInTheDocument()
    expect(screen.getByText('Transaction lists')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Transaction details', level: 4 })).toHaveLength(1)
    expect(screen.getByText('Partial data and fallback')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Merchant data available' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /1\. Enriched card list/ })).not.toBeInTheDocument()
  })

  it('navigates to the library index and back', () => {
    renderFlowLibrary('ro-card-pin')

    expect(screen.getByRole('heading', { name: 'View / Reset PIN' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /flow library/i }))
    expect(screen.getByRole('heading', { name: /future flows/i })).toBeInTheDocument()
  })

  it('renders the ETHOCA flow with its real-demo merchant scenarios', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    expect(screen.getByRole('heading', { name: 'ETHOCA Merchant Enrichment' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))
    expect(screen.getByText('Merchant data available')).toBeInTheDocument()
    expect(screen.getAllByText('YouTube Premium').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Merchant Category Code (MCC)').length).toBeGreaterThan(0)
  })

  it('keeps ETHOCA merchant logos local and shows the grey PFM fallback in every list state', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))
    const focusedPreview = () => within(document.querySelector('[data-flow-preview-scrollable="true"]') as HTMLElement)
    expect(focusedPreview().getByLabelText('YouTube merchant logo')).toBeInTheDocument()
    expect(focusedPreview().getByLabelText('Carrefour merchant logo')).toBeInTheDocument()
    expect(focusedPreview().queryByLabelText('eMAG merchant logo')).not.toBeInTheDocument()
    expect(focusedPreview().queryByText('OMV Petrom')).not.toBeInTheDocument()
    expect(focusedPreview().queryByText('Regina Maria')).not.toBeInTheDocument()
    expect(focusedPreview().queryByText('DECEMBER 2025')).not.toBeInTheDocument()
    const carrefourLogo = focusedPreview().getByTestId('merchant-logo-carrefour')
    expect(carrefourLogo).toHaveAttribute('data-ethoca-logo-source', 'bundled-official-carrefour')
    expect(carrefourLogo.querySelector('img')).toHaveAttribute('src', expect.not.stringMatching(/^https?:\/\//))

    fireEvent.click(screen.getByRole('button', { name: 'Pending card transaction' }))
    expect(focusedPreview().getAllByLabelText('eMAG merchant logo').length).toBeGreaterThan(0)
    const emagLogo = focusedPreview().getAllByTestId('merchant-logo-emag')[0]!
    expect(emagLogo).toHaveAttribute('data-ethoca-logo-source', 'bundled-official-emag')
    expect(emagLogo.querySelector('img')).toHaveAttribute('src', expect.not.stringMatching(/^https?:\/\//))
    expect(focusedPreview().queryByLabelText('Starbucks merchant logo')).not.toBeInTheDocument()
    const pfmFallbacks = focusedPreview().getAllByLabelText('PFM category fallback')
    expect(pfmFallbacks.length).toBeGreaterThan(0)
    expect(pfmFallbacks[0]?.querySelector('[data-pfm-icon-variant="category-circle"]')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Logo unavailable fallback' }))
    expect(focusedPreview().getAllByLabelText('PFM category fallback').length).toBeGreaterThan(0)
  })

  it('shows the PFM fallback if a bundled ETHOCA merchant logo cannot be rendered', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))
    const focusedPreview = () => within(document.querySelector('[data-flow-preview-scrollable="true"]') as HTMLElement)
    const carrefourLogo = focusedPreview().getByTestId('merchant-logo-carrefour')
    const logoImage = carrefourLogo.querySelector('img')

    expect(logoImage).not.toBeNull()
    fireEvent.error(logoImage as HTMLImageElement)

    expect(focusedPreview().queryByLabelText('Carrefour merchant logo')).not.toBeInTheDocument()
    expect(focusedPreview().getByLabelText('PFM category fallback')).toBeInTheDocument()
  })

  it('shows the account and pending ETHOCA states using the existing account and transaction-detail screens', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))
    const focusedPreview = () => within(document.querySelector('[data-flow-preview-scrollable="true"]') as HTMLElement)

    fireEvent.click(screen.getByRole('button', { name: /Enriched account list/ }))
    expect(focusedPreview().getAllByText('Enel Energie').length).toBeGreaterThan(0)
    expect(focusedPreview().getByLabelText('Carrefour merchant logo')).toBeInTheDocument()
    expect(focusedPreview().getAllByLabelText('PFM category fallback').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Pending card transaction' }))
    fireEvent.click(screen.getByRole('button', { name: /Pending account list/ }))
    expect(focusedPreview().getByText('Starbucks')).toBeInTheDocument()
    expect(focusedPreview().getAllByText('Pending').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Pending transaction detail/ }))
    expect(document.querySelector('[data-flow-preview-scrollable="true"] [data-pending-status]')).toBeInTheDocument()
    expect(focusedPreview().queryByTestId('transaction-pfm-summary')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Logo unavailable fallback' }))
    fireEvent.click(screen.getByRole('button', { name: /Partial data without logo or map/ }))
    expect(focusedPreview().queryByTitle('Google Maps — Merchant location')).not.toBeInTheDocument()
    expect(focusedPreview().getByText('5411 · Grocery stores, supermarkets')).toBeInTheDocument()
  })

  it('keeps the focused ETHOCA screen preview scrollable', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))

    const preview = document.querySelector('[data-flow-preview-scrollable="true"]')
    expect(preview).toBeInTheDocument()
    expect(preview).not.toHaveAttribute('aria-hidden')
    expect(preview).not.toHaveAttribute('inert')
    expect(preview).toHaveClass('overflow-y-auto')
    expect(preview).not.toHaveClass('overflow-hidden')
  })

  it('uses a stronger neutral review surface around the current Journey phone', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))

    const reviewSurface = screen.getByTestId('journey-current-screen-container')
    expect(reviewSurface).toHaveClass('bg-[var(--uc-neutral-200)]')
    expect(reviewSurface).not.toHaveClass('bg-[var(--uc-surface-muted)]')
  })

  it('offers a complete-screen download in the current and all-screens Journey views', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))

    expect(screen.getByRole('button', { name: 'Current screen' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All screens' })).toBeInTheDocument()

    const currentScreenDownload = screen.getByRole('button', { name: 'Download Enriched card list screen' })
    expect(currentScreenDownload).toHaveAttribute('data-flow-download-mode', 'full')
    expect(currentScreenDownload).toHaveAttribute('data-flow-download-placement', 'container')

    fireEvent.click(screen.getByRole('button', { name: 'All screens' }))

    const galleryScreenDownload = screen.getByRole('button', { name: 'Download Enriched card list screen' })
    expect(galleryScreenDownload).toHaveAttribute('data-flow-download-mode', 'full')
    expect(galleryScreenDownload).toHaveClass('opacity-0', 'group-hover:opacity-100')
    expect(document.querySelectorAll('[data-flow-preview-scrollable="true"]')).toHaveLength(4)
  })

  it('presents ETHOCA card and account transaction lists as independent entry points', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))
    fireEvent.click(screen.getByRole('button', { name: 'All screens' }))

    const gallery = screen.getByTestId('ethoca-journey-gallery')
    expect(within(gallery).getByText('Independent transaction-list entry points')).toBeInTheDocument()
    expect(within(gallery).getByText(/alternative entry points, not a navigation sequence/i)).toBeInTheDocument()
    expect(within(gallery).getByTestId('ethoca-entry-card-list')).toHaveTextContent('Card Detail transaction list')
    expect(within(gallery).getByTestId('ethoca-entry-account-list')).toHaveTextContent('Current Account card-transaction list')
    expect(within(gallery).getByTestId('ethoca-detail-examples')).toHaveTextContent('Transaction detail examples')
    expect(within(gallery).queryByTestId('journey-arrow')).not.toBeInTheDocument()
  })

  it('keeps ETHOCA list fixtures populated when Flow Library is opened from Kids Hungary', () => {
    renderFlowLibraryInKidsHungary()

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))
    const focusedPreview = () => within(document.querySelector('[data-flow-preview-scrollable="true"]') as HTMLElement)

    expect(focusedPreview().getByText('Carrefour')).toBeInTheDocument()
    expect(focusedPreview().getByText('YouTube Premium')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Enriched account list/ }))
    expect(focusedPreview().getAllByText('Enel Energie').length).toBeGreaterThan(0)
    expect(focusedPreview().getByText('Carrefour')).toBeInTheDocument()
  })

  it('anchors an ETHOCA merchant image inside its 32px list slot', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))
    const focusedPreview = document.querySelector('[data-flow-preview-scrollable="true"]') as HTMLElement
    const logo = within(focusedPreview).getAllByTestId('merchant-logo-carrefour').find(
      (candidate) => candidate.getAttribute('style')?.includes('width: 32px'),
    )

    expect(logo).toHaveClass('relative')
  })
})
