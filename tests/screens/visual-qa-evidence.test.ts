// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { drawVisualQaEvidence } from '@/app/screens/tools/visualQaEvidence'

it.each([false, true])('places markers only on the uploaded screenshot (aligned: %s)', (aligned) => {
  const reference = {} as HTMLImageElement
  const actual = {} as HTMLImageElement
  let image = ''
  let marked = false
  const context = {
    clearRect: vi.fn(),
    drawImage: vi.fn((source: HTMLImageElement) => { image = source === reference ? 'reference' : 'actual'; marked = false }),
    beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), stroke: vi.fn(),
    fillText: vi.fn(() => { marked = true }),
  }
  const canvas = { width: 750, height: 1600, getContext: () => context, toDataURL: () => `data:image/png;base64,${image}${marked ? '-marked' : ''}` } as unknown as HTMLCanvasElement
  const result = drawVisualQaEvidence(canvas, reference, actual, [{ x: 50, y: 25 }], aligned ? 110 : 100, 0, 0)
  expect(result.referencePng).toBe('reference')
  expect(result.actualPng).toBe(aligned ? 'actual' : 'actual-marked')
  expect(result.alignedActualPng).toBe(aligned ? 'actual-marked' : undefined)
  expect(context.arc).toHaveBeenCalledWith(375, 400, 18, 0, Math.PI * 2)
})
