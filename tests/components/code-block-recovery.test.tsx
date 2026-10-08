// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import CodeBlock from '@/app/components/CodeBlock'

const createHighlighter = vi.hoisted(() => vi.fn())
vi.mock('shiki', () => ({ createHighlighter }))
afterEach(cleanup)

it('keeps code readable after highlighting failure and retries a later mount', async () => {
  createHighlighter.mockRejectedValueOnce(new Error('Highlighter unavailable')).mockResolvedValueOnce({
    codeToHtml: (code: string) => `<pre><code>${code}</code></pre>`,
  })
  const first = render(<CodeBlock code="const first = 1" language="tsx" />)
  await waitFor(() => expect(createHighlighter).toHaveBeenCalledTimes(1))
  expect(screen.getByText('const first = 1')).toBeInTheDocument()
  first.unmount()
  render(<CodeBlock code="const second = 2" language="tsx" />)
  await waitFor(() => expect(createHighlighter).toHaveBeenCalledTimes(2))
  expect(screen.getByText('const second = 2')).toBeInTheDocument()
})
