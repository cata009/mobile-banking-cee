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
  it('documents geometry and accessibility on Specs and links the Figma source once', () => {
    renderDetail()

    expect(screen.getByRole('heading', { name: 'Primary button', level: 1 })).toBeInTheDocument()
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Overview', 'States', 'Specs', 'Code'])
    expect(screen.getByRole('link', { name: 'Open Primary button in Figma' })).toHaveAttribute(
      'href',
      'https://www.figma.com/design/FKbbStgBIP9bFAMl3DPKHF/?node-id=10072-22172',
    )
    expect(screen.getByRole('button', { name: 'Measure' })).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Measure' }))
    expect(screen.getByRole('button', { name: 'Measure' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('tab', { name: 'Specs' }))
    expect(screen.getByRole('heading', { name: 'Dimensions and layout' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Behaviour' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Accessibility' })).toBeInTheDocument()
  })

  it('separates canonical mobile source from illustrative platform references', () => {
    renderDetail()
    fireEvent.click(screen.getByRole('tab', { name: 'Code' }))
    expect(screen.queryByText(/Illustrative/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Swift' }))
    expect(screen.getByText(/Illustrative Swift reference. No production Swift implementation is mapped/)).toBeInTheDocument()
  })

  it('shows the complete vendor-neutral package for Primary button', () => {
    renderDetail()

    fireEvent.click(screen.getByRole('tab', { name: 'Code' }))
    expect(screen.getByRole('button', { name: 'React Native' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Swift' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kotlin' })).toBeInTheDocument()

    const renderedText = document.body.textContent ?? ''
    expect(renderedText).not.toMatch(/asseco|asee|adaptive elements/i)
  })

  it('lists the implemented states on the States tab', () => {
    renderDetail()

    fireEvent.click(screen.getByRole('tab', { name: 'States' }))

    expect(screen.getByRole('list', { name: 'Primary button states' })).toBeInTheDocument()
  })

  it('keeps the existing Code mode for components without a package', () => {
    render(
      <ComponentDetailScreen
        componentId="analytics.spendings"
        onBack={vi.fn()}
      />,
    )

    expect(screen.getByRole('tab', { name: 'Code' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Specs' })).not.toBeInTheDocument()
  })

  it('renders the real PrimaryButton in the isolated preview', async () => {
    renderDetail()

    expect((await screen.findAllByRole('button', { name: 'Continue' })).length).toBeGreaterThan(0)
    expect(screen.queryByText(/No live preview/i)).not.toBeInTheDocument()
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
