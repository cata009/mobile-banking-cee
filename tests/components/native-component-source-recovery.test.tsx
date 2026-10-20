// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { NativeComponentSource } from '@/app/screens/design-system/NativeComponentSource'

const source = vi.hoisted(() => ({ load: vi.fn() }))
vi.mock('@/app/screens/design-system/nativeComponentSourceLoader', () => ({ loadNativeComponentSource: source.load }))
vi.mock('@/app/components/CodeBlock', () => ({ default: ({ code }: { code: string }) => <pre>{code}</pre> }))
afterEach(() => { cleanup(); source.load.mockReset() })

it('recovers after a failed source request when revisiting the component', async () => {
  source.load.mockRejectedValueOnce(new Error('Temporary request failure')).mockResolvedValueOnce('Amount source').mockResolvedValueOnce('Recovered text field source')
  const view = render(<NativeComponentSource componentId="ui.text-field" />)
  expect(await screen.findByText('Native source could not be loaded.')).toBeVisible()
  view.rerender(<NativeComponentSource componentId="ui.amount-field" />)
  expect(await screen.findByText('Amount source')).toBeVisible()
  view.rerender(<NativeComponentSource componentId="ui.text-field" />)
  expect(await screen.findByText('Recovered text field source')).toBeVisible()
  expect(screen.queryByText('Native source could not be loaded.')).not.toBeInTheDocument()
})
