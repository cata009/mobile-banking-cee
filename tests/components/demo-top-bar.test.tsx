// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DemoTopBar } from '@/app/components/demo/DemoTopBar'
import { NavigationProvider } from '@/app/contexts/NavigationContext'
import { DemoProvider } from '@/app/state/demoStore'

afterEach(cleanup)

function renderTopBar() {
  return render(
    <DemoProvider initialState={{ product: 'PI', country: 'CZ', scenario: 'active' }}>
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

  it('lists Chatbot and Robo as separate CZ Future previews', () => {
    renderTopBar()

    fireEvent.click(screen.getByRole('button', { name: 'Baseline App' }))
    fireEvent.click(screen.getByRole('button', { name: 'Future App' }))
    fireEvent.click(screen.getByRole('button', { name: 'CZ - Chatbot' }))

    expect(screen.getAllByRole('button', { name: 'CZ - Chatbot' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'CZ - Robo' })).toBeInTheDocument()
  })
})
