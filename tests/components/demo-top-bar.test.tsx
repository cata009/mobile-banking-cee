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
})
