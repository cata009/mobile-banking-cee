// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { preloadNativeFonts } from '@/app/components/demo/nativeDemoLoader'

describe('Native demo font preparation', () => {
  const originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts')
  afterEach(() => {
    if (originalFonts) Object.defineProperty(document, 'fonts', originalFonts)
    else Reflect.deleteProperty(document, 'fonts')
  })

  it('waits for regular, medium and bold faces before the caller paints', async () => {
    const resolves: Array<() => void> = []
    const load = vi.fn((_font: string) => new Promise<void>(resolve => resolves.push(resolve)))
    Object.defineProperty(document, 'fonts', { configurable: true, value: { load } })
    const ready = vi.fn()
    const pending = preloadNativeFonts().then(ready)
    expect(load.mock.calls.map(call => call[0])).toEqual([
      '14px "UniCredit-regular"', '14px "UniCredit-medium"', '14px "UniCredit-bold"',
    ])
    resolves[0]!()
    resolves[1]!()
    await Promise.resolve()
    expect(ready).not.toHaveBeenCalled()
    resolves[2]!()
    await pending
    expect(ready).toHaveBeenCalledOnce()
  })
})
