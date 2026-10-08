// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { installRuntimeErrorHandlers, renderBootError } from '@/app/platform/runtimeErrors'

afterEach(() => {
  document.body.innerHTML = ''
})

it('shows escaped diagnostics for a failure before React has committed', () => {
  const root = document.createElement('div')
  document.body.append(root)
  const target = new EventTarget()
  const runtime = installRuntimeErrorHandlers(target, (error) => renderBootError(root, error))
  target.dispatchEvent(new ErrorEvent('error', { error: new Error('<script>bad</script>') }))
  expect(root.textContent).toContain('App boot error')
  expect(root.textContent).toContain('<script>bad</script>')
  expect(root.querySelector('script')).toBeNull()
  runtime.dispose()
})

it('preserves mounted controls after a later error and rejection, and cleans up listeners', () => {
  const root = document.createElement('div')
  root.innerHTML = '<button>Operator controls</button>'
  document.body.append(root)
  const report = vi.fn()
  const target = new EventTarget()
  const runtime = installRuntimeErrorHandlers(target, (error) => renderBootError(root, error), report)
  runtime.markMounted()
  target.dispatchEvent(new ErrorEvent('error', { error: new Error('Screen failed') }))
  const rejection = new Event('unhandledrejection')
  Object.defineProperty(rejection, 'reason', { value: new Error('Later request failed') })
  target.dispatchEvent(rejection)
  expect(root.querySelector('button')?.textContent).toBe('Operator controls')
  expect(report).toHaveBeenCalledTimes(2)
  runtime.dispose()
  target.dispatchEvent(new ErrorEvent('error', { error: new Error('Disposed listener') }))
  expect(report).toHaveBeenCalledTimes(2)
})
