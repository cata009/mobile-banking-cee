// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { loadNativeDemoModuleForWebTest, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'
import ComponentDetailScreen from '@/app/screens/design-system/ComponentDetailScreen'
import { COMPONENT_CODE_SAMPLES } from '@/app/registry/componentCodeSamples'

const nativeLoader = vi.hoisted(() => ({ load: vi.fn() }))
vi.mock('@/app/components/demo/nativeDemoLoader', () => ({ loadNativeDemoModule: nativeLoader.load }))

beforeEach(() => { resetNativeWebRendererDiagnostics(); nativeLoader.load.mockReset(); nativeLoader.load.mockImplementation(loadNativeDemoModuleForWebTest) })
afterEach(() => cleanup())

function renderDetail() {
  return render(<DemoProvider initialState={{ country: 'RO' }}><LanguageProvider initialLanguage="en"><ComponentDetailScreen componentId="ui.primary-button" onBack={vi.fn()} /></LanguageProvider></DemoProvider>)
}

describe('portable component implementation package', () => {
  it('makes accessibility and geometry available in the documentation view', () => {
    renderDetail()

    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Accessibility' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Anatomy, dimensions & spacing' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open Figma documentation/i })).toHaveAttribute('href', 'https://www.figma.com/design/FKbbStgBIP9bFAMl3DPKHF/?node-id=10072-22172')
    expect(screen.getByRole('button', { name: 'Inspector OFF' })).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Inspector OFF' }))
    expect(screen.getByRole('button', { name: 'Inspector ON' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('separates canonical mobile source from illustrative platform references', () => {
    renderDetail()
    fireEvent.click(screen.getByRole('button', { name: 'Implementation package' }))
    expect(screen.getByText('Implemented source')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Swift reference' }))
    expect(screen.getByText('Illustrative reference')).toBeInTheDocument()
    expect(screen.getByText(/No production Swift implementation is mapped/)).toBeInTheDocument()
  })

  it('shows the complete vendor-neutral package for Primary button', () => {
    renderDetail()

    // View is the default tab; switch to the Implementation package to assert its content.
    fireEvent.click(screen.getByRole('button', { name: 'Implementation package' }))
    expect(screen.getByRole('heading', { name: 'Implementation code' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Visual specifications' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Motion' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'React Native' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Swift reference' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kotlin reference' })).toBeInTheDocument()

    const renderedText = document.body.textContent ?? ''
    expect(renderedText).not.toMatch(/asseco|asee|adaptive elements/i)
  })

  it('renders States, Accessibility and Assets under the View tab', () => {
    renderDetail()

    fireEvent.click(screen.getByRole('button', { name: 'view' }))

    expect(screen.getByRole('heading', { name: 'States' })).toBeInTheDocument()
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

  it('renders the real PrimaryButton in the isolated View preview', async () => {
    renderDetail()

    fireEvent.click(screen.getByRole('button', { name: 'view' }))

    // The View tab now also renders the States section, so the PrimaryButton
    // appears in both the live preview and the state previews.
    expect((await screen.findAllByRole('button', { name: 'Continue' })).length).toBeGreaterThan(0)
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
