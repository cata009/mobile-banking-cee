// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import ToolsScreen from '@/app/screens/tools/ToolsScreen'
import { ComparisonHandle } from '@/app/screens/tools/VisualQaInspectorTool'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('lets keyboard users move the on-image comparison handle without a separate slider', () => {
  function Preview() {
    const [value, setValue] = useState(50)
    return <ComparisonHandle value={value} onChange={setValue} disabled={false} />
  }
  render(<Preview />)
  const handle = screen.getByRole('slider', { name: 'Comparison position' })
  expect(handle).toHaveAttribute('aria-valuenow', '50')
  fireEvent.keyDown(handle, { key: 'ArrowRight' })
  expect(handle).toHaveAttribute('aria-valuenow', '55')
  fireEvent.keyDown(handle, { key: 'Home' })
  expect(handle).toHaveAttribute('aria-valuenow', '0')
  fireEvent.keyDown(handle, { key: 'End' })
  expect(handle).toHaveAttribute('aria-valuenow', '100')
})

it('opens an interactive demo reference beside a local screenshot upload', () => {
  render(<DemoProvider initialState={{ country: 'RO', product: 'PI' }}><LanguageProvider initialLanguage="en"><ToolsScreen /></LanguageProvider></DemoProvider>)
  fireEvent.click(screen.getByRole('button', { name: /visual qa inspector/i }))
  expect(screen.getByTitle('Interactive demo reference')).toHaveAttribute('src', expect.stringContaining('frame=0'))
  expect(screen.getByTitle('Interactive demo reference')).toHaveStyle({ width: '375px', height: '768px' })
  expect(screen.getByLabelText(/upload.*screenshot/i)).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /capture reference/i })).not.toBeInTheDocument()
  expect(screen.getByText(/the current demo screen is captured automatically/i)).toBeInTheDocument()
  expect(screen.queryByText(/navigate to the same screen/i)).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Your visual comparison' })).not.toBeInTheDocument()
  expect(screen.getByText(/images stay in your browser/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /compare screens/i })).toBeDisabled()
  expect(screen.getByLabelText(/phone type/i)).toHaveValue('iPhone · simulated')
  expect(screen.getByLabelText(/system bar height/i)).toBeInTheDocument()
  fireEvent.change(screen.getByLabelText(/upload.*screenshot/i), { target: { files: [new File(['text'], 'bad.txt', { type: 'text/plain' })] } })
  expect(screen.getByRole('alert')).toHaveTextContent(/choose a png/i)
})

it('shows reset only after uploading a screenshot and clears it immediately', async () => {
  vi.stubGlobal('Image', class {
    naturalWidth = 375
    naturalHeight = 812
    onload: (() => void) | null = null
    set src(_value: string) { queueMicrotask(() => this.onload?.()) }
  })
  render(<DemoProvider initialState={{ country: 'RO', product: 'PI' }}><LanguageProvider initialLanguage="en"><ToolsScreen /></LanguageProvider></DemoProvider>)
  fireEvent.click(screen.getByRole('button', { name: /visual qa inspector/i }))
  expect(screen.queryByRole('button', { name: 'Reset comparison' })).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText(/upload.*screenshot/i), { target: { files: [new File(['image'], 'screen.png', { type: 'image/png' })] } })
  await waitFor(() => expect(screen.getByRole('button', { name: 'Reset comparison' })).toBeInTheDocument())
  expect(screen.getByRole('button', { name: 'Reset comparison' }).compareDocumentPosition(screen.getByRole('button', { name: 'Compare screens' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Reset comparison' }))
  expect(screen.queryByText(/remove the screenshots and observations/i)).not.toBeInTheDocument()
  expect(screen.getByTitle('Interactive demo reference')).toBeInTheDocument()
  expect(screen.queryByRole('img', { name: 'Uploaded app screenshot' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Compare screens' })).toBeDisabled()
  expect(screen.queryByRole('button', { name: 'Reset comparison' })).not.toBeInTheDocument()
})

it('changes the reference context and opens a directly accessible screen without changing the main demo', () => {
  render(<DemoProvider initialState={{ country: 'RO', product: 'PI', release: 'release-current' }}><LanguageProvider initialLanguage="en"><ToolsScreen /></LanguageProvider></DemoProvider>)
  fireEvent.click(screen.getByRole('button', { name: /visual qa inspector/i }))
  const frame = screen.getByTitle('Interactive demo reference')
  const screenSearch = screen.getByLabelText('Go to screen')
  fireEvent.change(screenSearch, { target: { value: 'Pay' } })
  expect(screenSearch).toHaveValue('Pay')
  expect(document.getElementById(screenSearch.getAttribute('list')!)?.querySelector('option[value="PI Payments overview"]')).toBeInTheDocument()
  expect(new URL(frame.getAttribute('src')!).searchParams.get('screen')).toBe('homepage')
  fireEvent.change(screen.getByLabelText('Reference country'), { target: { value: 'Czech Republic' } })
  fireEvent.change(screen.getByLabelText('Reference language'), { target: { value: 'Čeština' } })
  fireEvent.change(screen.getByLabelText('Reference version'), { target: { value: 'Evo 2027' } })
  fireEvent.change(screen.getByLabelText('Go to screen'), { target: { value: 'PI Payments overview' } })
  const params = new URL(frame.getAttribute('src')!).searchParams
  expect(params.get('country')).toBe('CZ')
  expect(params.get('lang')).toBe('cs')
  expect(params.get('release')).toBe('release-future-evo-2027')
  expect(params.get('screen')).toBe('payments')
  expect(params.get('frame')).toBe('0')
  expect(window.location.search).not.toContain('country=CZ')
})

it('applies customer presets and product counts only to the reference phone', () => {
  render(<DemoProvider initialState={{ country: 'RO', product: 'PI', bankingScenario: 'retail-single-account' }}><LanguageProvider initialLanguage="en"><ToolsScreen /></LanguageProvider></DemoProvider>)
  fireEvent.click(screen.getByRole('button', { name: /visual qa inspector/i }))
  fireEvent.click(screen.getByText('Customer & products'))
  fireEvent.change(screen.getByLabelText('Customer scenario'), { target: { value: 'Prospect / no products' } })
  expect(screen.getByLabelText('Accounts in reference')).toHaveValue(0)
  expect(screen.getByLabelText('Credit cards in reference')).toHaveValue(0)
  fireEvent.change(screen.getByLabelText('Credit cards in reference'), { target: { value: '2' } })
  const params = new URL(screen.getByTitle('Interactive demo reference').getAttribute('src')!).searchParams
  expect(params.get('bank')).toBe('retail-prospect')
  expect(params.get('count_accounts')).toBe('0')
  expect(params.get('count_credit_cards')).toBe('2')
  expect(window.location.search).not.toContain('bank=retail-prospect')
})
