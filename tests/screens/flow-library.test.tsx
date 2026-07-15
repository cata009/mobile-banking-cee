// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import FlowLibraryScreen, {
  resolveFlowScenario,
  type FlowContent,
} from '@/app/screens/flow-library/FlowLibraryScreen'
import { FLOW_PREVIEWS } from '@/app/registry/flowPreviewRegistry'

afterEach(cleanup)

const scenario = (label: string) => ({
  label,
  description: `${label} description`,
  steps: [],
})

describe('flow-library scenario resolution', () => {
  const content: FlowContent = {
    defaultScenarioId: 'configured-default',
    uxSpec: [],
    scenarios: {
      first: scenario('First'),
      requested: scenario('Requested'),
      'configured-default': scenario('Configured default'),
    },
  }

  it('keeps the resolved scenario id and content coherent across fallbacks', () => {
    expect(resolveFlowScenario(content, 'requested')).toMatchObject({
      scenarioId: 'requested',
      scenario: { label: 'Requested' },
    })
    expect(resolveFlowScenario(content, 'missing')).toMatchObject({
      scenarioId: 'configured-default',
      scenario: { label: 'Configured default' },
    })

    const withoutConfiguredDefault = { ...content, defaultScenarioId: 'missing' }
    expect(resolveFlowScenario(withoutConfiguredDefault, 'also-missing')).toMatchObject({
      scenarioId: 'first',
      scenario: { label: 'First' },
    })

    const empty = resolveFlowScenario({ ...content, scenarios: {} }, 'missing')
    expect(empty.scenarioId).toBe('__empty__')
    expect(empty.scenario.steps).toEqual([])
    expect(empty.scenario.description).toMatch(/no scenarios/i)
  })
})

describe('flow-library country scope boundaries', () => {
  it('renders an empty country scope safely and retains the existing RO phone fallback', () => {
    const preview = FLOW_PREVIEWS['ro-round-up']
    const originalScope = preview.countryScope
    preview.countryScope = []

    try {
      render(<FlowLibraryScreen initialFlowId="ro-round-up" />)

      expect(screen.getByRole('button', { name: 'RO' })).toBeDisabled()
      expect(screen.getAllByRole('button', { name: /^(RO|CZ|SK|HU|SI|BA|BA_BL|RS)$/ }))
        .toHaveLength(8)

      fireEvent.click(screen.getByRole('button', { name: 'Demo' }))
      expect(screen.getByText('Create: existing account')).toBeInTheDocument()
      expect(document.querySelector('[data-flow-screen-capture="true"]')).toBeInTheDocument()
    } finally {
      preview.countryScope = originalScope
    }
  })
})
