// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ComponentDetailScreen from '@/app/screens/design-system/ComponentDetailScreen'
import { COMPONENT_CODE_SAMPLES } from '@/app/registry/componentCodeSamples'

afterEach(() => cleanup())

describe('portable component implementation package', () => {
  it('shows the complete vendor-neutral package for Primary button', () => {
    render(
      <ComponentDetailScreen
        componentId="ui.primary-button"
        onBack={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Implementation package' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Implementation code' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Visual specifications' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'States' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Motion' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Accessibility' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Assets' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'React' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Swift' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kotlin' })).toBeInTheDocument()

    const renderedText = document.body.textContent ?? ''
    expect(renderedText).not.toMatch(/asseco|asee|adaptive elements/i)
  })

  it('keeps the existing Code mode for components without a package', () => {
    render(
      <ComponentDetailScreen
        componentId="analytics.spendings"
        onBack={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /code/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Implementation package' })).not.toBeInTheDocument()
  })

  it('renders the real PrimaryButton in the isolated View preview', () => {
    render(
      <ComponentDetailScreen
        componentId="ui.primary-button"
        onBack={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'view' }))

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    expect(screen.queryByText(/No isolated live preview/i)).not.toBeInTheDocument()
  })

  it('ships self-contained reference samples for the Primary button package', () => {
    const sample = COMPONENT_CODE_SAMPLES['ui.primary-button']

    expect(sample).toBeDefined()
    if (!sample) throw new Error('Missing Primary button code sample')
    expect(sample.react).toContain('import type { ReactNode } from "react"')
    expect(sample.react).toContain('focus-visible:ring-offset-2')
    expect(sample.kotlin).toContain('import androidx.compose.runtime.remember')
    expect(sample.kotlin).toContain('animateFloatAsState')
  })
})
