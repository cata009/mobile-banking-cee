// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DemoTopBar } from '@/app/components/demo/DemoTopBar'
import { NavigationProvider } from '@/app/contexts/NavigationContext'
import { COUNTRIES } from '@/app/registry/demoConfig'
import { DemoProvider } from '@/app/state/demoStore'
import type { CountryId } from '@/app/state/demoTypes'

afterEach(cleanup)

function renderTopBar(country: CountryId = 'CZ') {
  return render(
    <DemoProvider initialState={{ product: 'PI', country, scenario: 'active' }}>
      <NavigationProvider initialScreen="investments">
        <DemoTopBar />
      </NavigationProvider>
    </DemoProvider>,
  )
}

describe('DemoTopBar app and country selector', () => {
  it('opens the Flows library index instead of preselecting a flow', () => {
    const receivedEvents: string[] = []
    const recordLibraryIndex = () => receivedEvents.push('library-index')
    const recordFlowSelection = () => receivedEvents.push('flow-selection')
    window.addEventListener('flow-library-open-index', recordLibraryIndex)
    window.addEventListener('flow-preview-select', recordFlowSelection)

    try {
      renderTopBar()

      fireEvent.click(screen.getByRole('button', { name: 'Flows' }))

      expect(receivedEvents).toEqual(['library-index'])
    } finally {
      window.removeEventListener('flow-library-open-index', recordLibraryIndex)
      window.removeEventListener('flow-preview-select', recordFlowSelection)
    }
  })

  it('keeps the compact app menu visible while opening countries in a separate submenu', () => {
    renderTopBar()

    fireEvent.click(screen.getByRole('button', { name: 'PI - Czech Republic' }))
    const piApp = screen.getByText('PI App')
    fireEvent.click(piApp)

    expect(screen.getByText('SME App')).toBeInTheDocument()
    expect(screen.getByText('Kids App')).toBeInTheDocument()
    expect(screen.getByText('Romania')).toBeInTheDocument()
    expect(screen.getByText('Czech Republic')).toBeInTheDocument()
  })

  it('lists the four CZ Future previews in the requested order', () => {
    renderTopBar()

    fireEvent.click(screen.getByRole('button', { name: 'Baseline App' }))
    fireEvent.click(screen.getByRole('button', { name: 'Future App' }))
    fireEvent.click(screen.getByRole('button', { name: 'CZ - Chatbot' }))

    const optionButtons = screen
      .getByRole('button', { name: 'Evo 2027' })
      .parentElement
      ?.querySelectorAll('button')

    expect(Array.from(optionButtons ?? []).map((button) => button.textContent?.trim())).toEqual([
      'CZ - Chatbot',
      'CZ - Robo',
      'App 2027',
      'Evo 2027',
    ])
  })

  it('does not expose Evo 2027 outside Czech Republic', () => {
    renderTopBar('RO')

    fireEvent.click(screen.getByRole('button', { name: 'Baseline App' }))
    fireEvent.click(screen.getByRole('button', { name: 'Future App' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'App 2027' })[0]!)
    fireEvent.click(screen.getAllByRole('button', { name: 'App 2027' })[0]!)

    expect(screen.queryByRole('button', { name: 'Evo 2027' })).not.toBeInTheDocument()
  })

  it.each(COUNTRIES)('lists App 2027 for PI %s on the current design system', (country) => {
    renderTopBar(country)

    fireEvent.click(screen.getByRole('button', { name: 'Baseline App' }))
    fireEvent.click(screen.getByRole('button', { name: 'Future App' }))

    const selectedFutureRelease = country === 'CZ' ? 'CZ - Chatbot' : 'App 2027'
    fireEvent.click(screen.getByRole('button', { name: selectedFutureRelease }))

    expect(screen.getAllByRole('button', { name: 'App 2027' }).length).toBeGreaterThan(0)
  })
})
