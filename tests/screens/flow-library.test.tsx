// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import { DemoProvider } from '@/app/state/demoStore'
import { FLOW_DEFINITIONS, FLOW_ORDER, resolveScenario } from '@/app/screens/flow-library/flows'
import { FLOW_PREVIEWS, FLOW_PREVIEW_ORDER } from '@/app/registry/flowPreviewRegistry'
import { buildFlowReferencePackage } from '@/app/screens/flow-library/handoff/referencePackage'
import { FLOW_SCREEN_SOURCES } from '@/app/screens/flow-library/components/screenSources'
import { rulesForScreen, screensForRule } from '@/app/screens/flow-library/flows/rules'

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
  it('registers the all-country Investments bulk approval prototype', () => {
    expect(FLOW_ORDER).toContain('investments-bulk-approval')
    expect(FLOW_DEFINITIONS).toHaveProperty('investments-bulk-approval')
  })

  it('makes the bulk selected count a canonical, implementation-ready selection rule', () => {
    const selectionSpec = FLOW_DEFINITIONS['investments-bulk-approval'].screenSpecs['investments-bulk-selection']
    expect(selectionSpec).toBeDefined()
    if (!selectionSpec) throw new Error('Bulk selection screen spec is required')
    const countField = selectionSpec.fields?.find((field) => field.name === 'Selected count / Select all')

    expect(countField?.notes).toMatch(/Counts selected eligible IDs/i)
    expect(countField?.notes).toMatch(/Selected 0/i)
    expect(countField?.notes).toMatch(/Sign orders disabled/i)
    expect(selectionSpec.actions?.find((action) => action.label === 'Select all')?.result).toMatch(
      /Selected count immediately/i,
    )
  })

  it('records a canonical visible default for every declared bulk-approval prototype state', () => {
    const specs = FLOW_DEFINITIONS['investments-bulk-approval'].screenSpecs
    const expectedDefaults = {
      'investments-bulk-prototype': 'Orders to approve: 10 pending drafts, row-level details, BULK SIGNING enabled; no selection, checkboxes, selected count, or sticky signing footer.',
      'investments-bulk-selection': 'Bulk mode: 10 eligible drafts and all checkboxes clear; CANCEL, Select all, and a Selected 0 footer are visible; Sign orders is disabled.',
      'investments-bulk-review-first': 'Three marked drafts: Order 1 of 3 has a checked current-order checkbox, Ex-Ante Costs expanded, optional disclosures closed, View summary and Next enabled, no Terms, and a Back spacer.',
      'investments-bulk-review-last': 'Three marked drafts: Order 3 of 3 has a checked current-order checkbox, Ex-Ante Costs expanded, optional disclosures closed, Terms unchecked, Previous enabled, Continue disabled, and the caught-up status.',
      'investments-bulk-summary-blocked': 'Ten-draft summary: three marked to sign, one rejected, and the rest not signed; header Back and card inspection are available, the prerequisite notice is visible, and Confirm and sign ALL marked ORDERS is disabled.',
      'investments-bulk-summary-ready': 'Ten-draft summary: three marked to sign, one rejected, and the rest not signed; header Back and card inspection are available, all marked drafts are reviewed, Terms are accepted, and Confirm and sign ALL marked ORDERS is enabled.',
      'investments-bulk-sign': 'Standard signature: a focused masked six-digit PIN and helper are visible, Sign order is enabled, no authentication animation is shown, and Back returns to the ready summary.',
      'investments-bulk-confirmation': 'Success tile: Signing successful and the prototype-only helper are visible; Back to Orders to approve is enabled and there is no failure shortcut.',
      'investments-bulk-failure': 'Signing result: red Failed to send, onemarkets Climate Focus Fund · LU1953188835, and prototype-only explanatory copy are visible; header Back returns to summary.',
    } as const

    expect(Object.keys(expectedDefaults)).toHaveLength(9)
    for (const [screen, defaultState] of Object.entries(expectedDefaults)) {
      expect(specs[screen as keyof typeof specs]?.defaultState).toBe(defaultState)
    }
  })

  it('keeps bulk-approval context separate from one compact canonical flow contract', () => {
    const overview = FLOW_DEFINITIONS['investments-bulk-approval'].overview

    expect(overview.businessRules).toHaveLength(4)
    // One paragraph per group is derived from the id-carrying rules, never authored twice.
    expect(overview.businessRules[0]).toMatch(/^Selection: /)
    expect(overview.rules?.map((rule) => rule.id)).toEqual(
      Array.from({ length: 12 }, (_, index) => `R${index + 1}`),
    )
    expect(overview.openQuestions).toEqual([])
    expect(overview.notes).toEqual([])
    expect(overview.businessAnalysis.requirements).toEqual([])
    expect(overview.businessAnalysis.proposedSolution).toEqual([])
    expect(overview.businessAnalysis.nonFunctionalRequirements).toEqual([])
  })

  it('threads one rule id set through screen contracts, controls and guards', () => {
    const flow = FLOW_DEFINITIONS['investments-bulk-approval']
    const ids = new Set(flow.overview.rules?.map((rule) => rule.id))
    expect(ids.size).toBe(12)

    for (const spec of Object.values(flow.screenSpecs)) {
      expect(spec.title).toBeTruthy()
      for (const id of spec.rules ?? []) expect(ids.has(id)).toBe(true)
      for (const action of spec.actions ?? []) if (action.rule) expect(ids.has(action.rule)).toBe(true)
    }
    for (const guard of flow.implementation?.guards ?? []) {
      for (const id of guard.rules) expect(ids.has(id)).toBe(true)
      for (const screen of guard.enforcedOn) expect(flow.screenSpecs[screen]).toBeDefined()
    }
    // Every rule is cited by at least one screen contract, so none is orphaned.
    for (const id of ids) expect(screensForRule(flow, id).length).toBeGreaterThan(0)
    expect(rulesForScreen(flow, 'investments-bulk-summary-ready').map((rule) => rule.id)).toEqual(['R10', 'R11'])
  })

  it('packages the scoped developer starter material in the Implementation ZIP', async () => {
    const flow = FLOW_DEFINITIONS['investments-bulk-approval']
    if (!flow.prototype) throw new Error('Bulk approval prototype is required')

    const blob = buildFlowReferencePackage(flow, FLOW_SCREEN_SOURCES[flow.id])
    const bytes = new Uint8Array(
      await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(blob)
      }),
    )
    const zipText = new TextDecoder('latin1').decode(bytes)

    expect(zipText).toContain('src/models.ts')
    expect(zipText).toContain('src/mockData.ts')
    expect(zipText).toContain('src/adapter.ts')
    expect(zipText).toContain('handoff/frontend-handoff-manifest.json')
    expect(zipText).toContain('INTEGRATION_CHECKLIST.md')
    // Everything derived from the definition, plus the screens as built — verbatim.
    expect(zipText).toContain('src/session.ts')
    expect(zipText).toContain('handoff/rules.md')
    expect(zipText).toContain('handoff/state-machine.md')
    expect(zipText).toContain('screens/investmentsBulkApprovalPreviews.tsx')
    expect(zipText).toContain('screens/COMPONENTS.md')
    expect(zipText).toContain('tests/acceptance.skeleton.test.ts')
    expect(zipText).toContain('function BulkSelectionScreen(')
    expect(zipText).toContain('canConfirmAndSign')
    expect(zipText).toContain('R11')
  })

  it('covers every registered flow id with a valid default scenario', () => {
    for (const id of FLOW_ORDER) {
      const flow = FLOW_DEFINITIONS[id]
      expect(flow.id).toBe(id)
      expect(flow.scenarios.length).toBeGreaterThan(0)
      expect(flow.scenarios.some((scenario) => scenario.id === flow.defaultScenarioId)).toBe(true)
    }
  })

  it('provides the complete business analysis document for every registered flow', () => {
    for (const id of FLOW_ORDER) {
      const analysis = FLOW_DEFINITIONS[id].overview.businessAnalysis
      expect(analysis, `${id} is missing its business analysis document`).toBeDefined()

      if (!analysis) continue

      expect(analysis.generalInformation.length, `${id}: general information`).toBeGreaterThan(0)
      expect(analysis.versionContext, `${id}: version context`).toBeTruthy()
      expect(analysis.versionHistory.length, `${id}: version history`).toBeGreaterThan(0)
      if (id === 'investments-bulk-approval') {
        expect(analysis.currentStatus.length, `${id}: current status`).toBeGreaterThan(0)
        continue
      }
      expect(analysis.requirements.length, `${id}: requirements`).toBeGreaterThan(0)
      expect(analysis.currentStatus.length, `${id}: current status`).toBeGreaterThan(0)
      expect(analysis.proposedSolution.length, `${id}: proposed solution`).toBeGreaterThan(0)
      expect(analysis.nonFunctionalRequirements.length, `${id}: non-functional requirements`).toBeGreaterThan(0)
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

function expandAllSections() {
  screen.getAllByRole('button', { name: 'Expand all' }).forEach((button) => fireEvent.click(button))
}

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

    // Flow detail header. The Journey tab is the landing tab, and its previews
    // carry headings of their own, so this looks in the header specifically.
    expect(screen.getByTestId('flow-detail-header')).toHaveTextContent('Round Up')

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

    fireEvent.click(screen.getByRole('tab', { name: 'Specification' }))

    expect(screen.queryByText('Signing')).not.toBeInTheDocument()
    expect(screen.getByText('Business analysis specification')).toBeInTheDocument()
    expect(screen.queryByText(/map deep-link/i)).not.toBeInTheDocument()
  })

  it('shows the Figma, PDF, Word and Confluence header actions without handoff copy', () => {
    renderFlowLibrary('ro-round-up')

    expect(screen.getByRole('link', { name: 'Open Figma source' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export flow as PDF' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Download .docx (screens included) — Confluence: Tools > Import Word Document',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Screens + full spec, ready for handoff.')).not.toBeInTheDocument()
  })

  it('keeps navigation outside the detail card and condenses flow metadata', () => {
    renderFlowLibrary('ro-round-up')

    const detailHeader = screen.getByTestId('flow-detail-header')
    const libraryBack = screen.getByRole('button', { name: /flow library/i })

    expect(detailHeader).not.toContainElement(libraryBack)
    expect(detailHeader).not.toHaveTextContent('Future Release Preview')
    expect(detailHeader).not.toHaveTextContent('RO')
    expect(within(detailHeader).queryByText('Status')).not.toBeInTheDocument()
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

  it('opens a flow on its journey, with no separate overview tab to step through first', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    expect(screen.queryByRole('tab', { name: 'Overview' })).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Journey' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByRole('heading', { name: 'At a glance' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Entry points' })).not.toBeInTheDocument()
    expect(screen.queryByText('Scope and demo note')).not.toBeInTheDocument()
  })

  it('keeps Prototype flow-only and leads Specification with paired business/build behavior', () => {
    renderFlowLibrary('investments-bulk-approval')

    fireEvent.click(screen.getByRole('tab', { name: 'Prototype' }))
    expect(screen.getByTestId('flow-prototype-inspect-phone')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Inspect' })).not.toBeInTheDocument()

    // The screen card names the screen the way Specification does, says what it
    // shows on entry, cites its rules and links to the contract — nothing more.
    const card = screen.getByTestId('flow-prototype-screen-card')
    expect(within(card).getByRole('heading', { name: 'Orders to approve' })).toBeInTheDocument()
    expect(within(card).getByText(/10 pending drafts/)).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: 'R2' })).toBeInTheDocument()
    expect(screen.queryByText('Investments bulk prototype')).not.toBeInTheDocument()

    fireEvent.click(within(card).getByRole('button', { name: 'Open screen contract →' }))
    expect(screen.getByRole('tab', { name: 'Specification' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText(/Orders to approve: 10 pending drafts/)).toBeInTheDocument()
  })

  it('numbers the business-analysis contents by what is shown, with no gaps', () => {
    renderFlowLibrary('investments-bulk-approval')

    fireEvent.click(screen.getByRole('tab', { name: 'Specification' }))
    const badges = Array.from(
      screen.getByTestId('business-analysis-document').querySelectorAll('[data-ba-section]'),
    ).map((node) => node.getAttribute('data-ba-section'))

    expect(badges).toEqual(['01', '02', '03'])
  })

  it('renders the canonical rules with ids and cites them on the controls they govern', () => {
    renderFlowLibrary('investments-bulk-approval')

    fireEvent.click(screen.getByRole('tab', { name: 'Specification' }))
    const list = screen.getByTestId('flow-rule-list')
    expect(within(list).getByText('R11')).toBeInTheDocument()
    // R10 and R11 both apply to the two summary screens; read it off R11's own row.
    const r11 = list.querySelector('#rule-R11') as HTMLElement
    expect(within(r11).getByText(/Applies to: Summary - not ready to sign · Summary - ready to sign/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '5. All-drafts summary' }))
    expect(screen.getAllByRole('button', { name: 'R11' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Open in prototype →' })).toBeInTheDocument()
  })

  it('leads each screen specification with its default state before element behavior contracts', () => {
    renderFlowLibrary('investments-bulk-approval')

    fireEvent.click(screen.getByRole('tab', { name: 'Specification' }))
    const defaultState = screen.getByRole('heading', { name: 'Default state on entry' })
    const elementBehavior = screen.getByRole('heading', { name: 'What each element does on this screen' })

    expect(defaultState.compareDocumentPosition(elementBehavior) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('orders bulk-approval Specification as context, flow contract, then screen contracts', () => {
    renderFlowLibrary('investments-bulk-approval')

    fireEvent.click(screen.getByRole('tab', { name: 'Specification' }))
    const context = screen.getByRole('heading', { name: 'Business analysis specification' })
    const flow = screen.getByRole('heading', { name: 'Flow specification' })
    const screens = screen.getByRole('heading', { name: 'Screen spec' })

    expect(context.compareDocumentPosition(flow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(flow.compareDocumentPosition(screens) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Interaction logic — business view' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '2. BULK SIGNING' }))
    expect(screen.queryByRole('heading', { name: 'Fields' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Actions' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Edge cases' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Acceptance criteria' })).not.toBeInTheDocument()
  })

  it('keeps Implementation as the developer delivery surface, not a second specification', () => {
    renderFlowLibrary('investments-bulk-approval')

    fireEvent.click(screen.getByRole('tab', { name: 'Implementation' }))

    expect(screen.getByRole('tabpanel')).toHaveClass('w-full', 'min-w-0')
    expect(screen.getByTestId('flow-detail-header').parentElement).toHaveClass('min-w-0')
    expect(screen.getByRole('heading', { name: 'Developer delivery package' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download developer reference package (.zip)' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Technical integration boundary' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Implementation-specific caveats' })).toBeInTheDocument()
    // The cross-screen layer no screen contract owns, and the screens as built.
    expect(screen.getByRole('heading', { name: 'Screens as built' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Session model and guards' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'State machine' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rule → guard → test' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inspect spacing & tokens' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getAllByTestId('impl-screen')).toHaveLength(9)
    expect(screen.getAllByText(/function BulkSelectionScreen\(/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('canConfirmAndSign').length).toBeGreaterThan(0)
    expect(screen.queryByText('Business wording')).not.toBeInTheDocument()
    expect(screen.queryByText('Implementation interpretation')).not.toBeInTheDocument()
    expect(screen.queryByText('Same canonical rule, two readers')).not.toBeInTheDocument()
  })

  it('renders header document actions as neutral icon cards', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    expect(screen.getByRole('link', { name: 'Open Figma source' })).toHaveClass('bg-[var(--uc-surface-muted)]')
    expect(screen.getByRole('button', { name: 'Export flow as PDF' })).toHaveClass('bg-[var(--uc-surface-muted)]')
    expect(
      screen.getByRole('button', {
        name: 'Download .docx (screens included) — Confluence: Tools > Import Word Document',
      }),
    ).toHaveClass('bg-[var(--uc-surface-muted)]')
    expect(screen.getByTestId('flow-document-icon-figma')).toBeInTheDocument()
    expect(screen.getByTestId('flow-document-icon-pdf')).toBeInTheDocument()
    expect(screen.getByTestId('flow-document-icon-word')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export flow as PDF' })).toHaveAttribute(
      'data-export-document',
      'current-flow',
    )
    expect(
      screen.getByRole('button', {
        name: 'Download .docx (screens included) — Confluence: Tools > Import Word Document',
      }),
    ).toHaveAttribute('data-export-document', 'current-flow')
  })

  it('groups the proposed solution into BA-friendly decision sections', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Specification' }))
    expandAllSections()

    expect(screen.getAllByText('Proposed solution').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Transaction lists').length).toBeGreaterThan(0)
  })

  it('renders ETHOCA in a BA-aligned, demo-safe specification structure', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Specification' }))
    expandAllSections()

    expect(screen.getByText('Business analysis specification')).toBeInTheDocument()
    expect(screen.getAllByText('General information').length).toBeGreaterThan(0)
    expect(screen.queryByText('Version & change context')).not.toBeInTheDocument()
    expect(screen.getAllByText('Open issues').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Requirement').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Current status').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Non-functional requirements').length).toBeGreaterThan(0)
    expect(screen.getByText('Digital receipts are out of scope for this demo.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /download.*txt/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/Card_GetMerchantDetails/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/OAuth/i)).not.toBeInTheDocument()
  })

  it('renders ETHOCA as one BA document instead of screen-spec selectors', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Specification' }))
    expandAllSections()

    expect(screen.queryByText('Version history')).not.toBeInTheDocument()
    expect(screen.getByText('Transaction lists')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Transaction details', level: 4 })).toHaveLength(1)
    expect(screen.getByText('Partial data and fallback')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Merchant data available' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /1\. Enriched card list/ })).not.toBeInTheDocument()
  })

  it('renders RS property insurance as a BA document followed by its screen specs', () => {
    renderFlowLibrary('rs-property-insurance')

    fireEvent.click(screen.getByRole('tab', { name: 'Specification' }))
    expandAllSections()

    // The document, then the screen-by-screen detail and the flow-level rules:
    // this flow specifies both, and a reviewer needs both.
    expect(screen.getByText('Business analysis specification')).toBeInTheDocument()
    // 'Screen spec' is both a panel heading and an entry in the sticky section nav.
    expect(screen.getByRole('heading', { name: 'Screen spec' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Specification sections' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /4\. Choose a package/ })).toBeInTheDocument()
    // The title now appears twice: once in the jump strip, once on the block.
    expect(screen.getAllByText('Key decision rules').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Questions to close').length).toBeGreaterThan(0)
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

    fireEvent.click(screen.getByRole('button', { name: 'Enriched account list' }))
    expect(focusedPreview().getAllByText('Enel Energie').length).toBeGreaterThan(0)
    expect(focusedPreview().getByLabelText('Carrefour merchant logo')).toBeInTheDocument()
    expect(focusedPreview().getAllByLabelText('PFM category fallback').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Pending card transaction' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pending account list' }))
    expect(focusedPreview().getByText('Starbucks')).toBeInTheDocument()
    expect(focusedPreview().getAllByText('Pending').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Pending transaction detail' }))
    expect(document.querySelector('[data-flow-preview-scrollable="true"] [data-pending-status]')).toBeInTheDocument()
    expect(focusedPreview().queryByTestId('transaction-pfm-summary')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Logo unavailable fallback' }))
    fireEvent.click(screen.getByRole('button', { name: 'Partial data without logo or map' }))
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
    expect(within(gallery).getByTestId('ethoca-entry-account-list')).toHaveTextContent(
      'Current Account card-transaction list',
    )
    expect(within(gallery).getByTestId('ethoca-detail-examples')).toHaveTextContent('Transaction detail examples')
    expect(within(gallery).queryByTestId('journey-arrow')).not.toBeInTheDocument()
  })

  it('keeps ETHOCA list fixtures populated when Flow Library is opened from Kids Hungary', () => {
    renderFlowLibraryInKidsHungary()

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))
    const focusedPreview = () => within(document.querySelector('[data-flow-preview-scrollable="true"]') as HTMLElement)

    expect(focusedPreview().getByText('Carrefour')).toBeInTheDocument()
    expect(focusedPreview().getByText('YouTube Premium')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Enriched account list' }))
    expect(focusedPreview().getAllByText('Enel Energie').length).toBeGreaterThan(0)
    expect(focusedPreview().getByText('Carrefour')).toBeInTheDocument()
  })

  it('anchors an ETHOCA merchant image inside its 32px list slot', () => {
    renderFlowLibrary('mobile-pi-ethoca')

    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))
    const focusedPreview = document.querySelector('[data-flow-preview-scrollable="true"]') as HTMLElement
    const logo = within(focusedPreview)
      .getAllByTestId('merchant-logo-carrefour')
      .find((candidate) => candidate.getAttribute('style')?.includes('width: 32px'))

    expect(logo).toHaveClass('relative')
  })
})
