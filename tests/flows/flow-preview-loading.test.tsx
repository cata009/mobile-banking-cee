// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DeferredPreview, waitForPreviewReady } from '@/features/flow-collaboration/DeferredPreview'

afterEach(cleanup)
it('waits for the NativeScreenPreview renderer, not just the lazy module or demo wrapper', async () => {
  const view = render(<div data-native-screen-preview="loading"><div><p>Native content</p></div></div>)
  let resolved = false
  const ready = waitForPreviewReady(view.container).then(() => { resolved = true })
  await Promise.resolve()
  expect(resolved).toBe(false)
  view.container.firstElementChild!.setAttribute('data-native-screen-preview', 'ready')
  await ready
  expect(resolved).toBe(true)
})

it('waits for the first Native React commit after the host announces ready', async () => {
  const view = render(<div data-native-screen-preview="ready"><div /></div>)
  let resolved = false
  const ready = waitForPreviewReady(view.container).then(() => { resolved = true })
  await Promise.resolve()
  expect(resolved).toBe(false)
  const content = document.createElement('p'); content.textContent = 'Actual transaction content'
  view.container.firstElementChild!.firstElementChild!.appendChild(content)
  await ready
  expect(resolved).toBe(true)
})

it('does not capture a failed NativeScreenPreview as an exportable screen', async () => {
  const view = render(<div data-native-screen-preview="error">Native preview unavailable.</div>)
  await expect(waitForPreviewReady(view.container)).rejects.toThrow('Preview failed')
})
it('shows a loading state until a real deferred renderer is ready', async () => {
  let release!: (module: { default: () => React.ReactNode }) => void
  const pending = new Promise<{ default: () => React.ReactNode }>((resolve) => { release = resolve })
  const view = render(<DeferredPreview load={() => pending} screen="ethoca-detail-online" context={{}} />)
  expect(screen.getByRole('status')).toHaveTextContent('Loading preview')
  const ready = waitForPreviewReady(view.container)
  release({ default: () => <button type="button">Real deferred screen</button> })
  expect(await screen.findByRole('button', { name: 'Real deferred screen' })).toBeVisible()
  await expect(ready).resolves.toBeUndefined()
})

it('a failed family load can be retried instead of exporting its loading/error placeholder', async () => {
  let attempt = 0
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    const load = async () => { if (++attempt === 1) throw new Error('Temporary module failure'); return { default: () => <p>Recovered screen</p> } }
    const view = render(<DeferredPreview load={load} screen="ethoca-detail-online" context={{}} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded')
    await expect(waitForPreviewReady(view.container)).rejects.toThrow('Preview failed')
    fireEvent.click(screen.getByRole('button', { name: 'Retry preview' }))
    expect(await screen.findByText('Recovered screen')).toBeVisible()
  } finally { log.mockRestore() }
})
