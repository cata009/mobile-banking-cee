// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import { FLOW_DEFINITIONS, FLOW_ORDER, resolveScenario } from '@/app/screens/flow-library/flows'
import { FLOW_PREVIEWS, FLOW_PREVIEW_ORDER } from '@/app/registry/flowPreviewRegistry'

afterEach(cleanup)

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
  it('opens on the selected flow and exposes capturable step screens', () => {
    render(<FlowLibraryScreen initialFlowId="ro-round-up" />)

    // Flow detail header (the preview PageHeaders are aria-hidden, so this is unique).
    expect(screen.getByRole('heading', { name: 'Round Up' })).toBeInTheDocument()

    // The off-screen capture strip renders capturable phone screens up-front so
    // export works regardless of the active tab.
    expect(document.querySelector('[data-flow-screen-capture="true"]')).toBeInTheDocument()

    // Tabs use real tab semantics; the Journey tab surfaces the scenarios.
    fireEvent.click(screen.getByRole('tab', { name: 'Journey' }))
    expect(screen.getByText('Create: existing account')).toBeInTheDocument()
  })

  it('navigates to the library index and back', () => {
    render(<FlowLibraryScreen initialFlowId="ro-card-pin" />)

    expect(screen.getByRole('heading', { name: 'View / Reset PIN' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /flow library/i }))
    expect(screen.getByRole('heading', { name: /future flows/i })).toBeInTheDocument()
  })
})
