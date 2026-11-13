import { describe, expect, it } from 'vitest'
import { alignedScreenshotRect, comparePixels, findDifferenceRegions, heightForScreenshot } from '@/app/screens/tools/visualQaComparison'

describe('visual QA image comparison', () => {
  it('maps the on-screen alignment to the export canvas without scaling the translation', () => {
    expect(alignedScreenshotRect(750, 1600, 110, 4, -8)).toEqual({ x: -29.5, y: -96, width: 825, height: 1760 })
    expect(alignedScreenshotRect(750, 1600, 100, 0, 0)).toEqual({ x: 0, y: 0, width: 750, height: 1600 })
  })
  it('highlights meaningful changes while ignoring small rendering noise', () => {
    const reference = new Uint8ClampedArray([100, 100, 100, 255, 0, 0, 0, 255])
    const actual = new Uint8ClampedArray([104, 102, 100, 255, 200, 0, 0, 255])
    const result = comparePixels(reference, actual, 20)
    expect(result.changedPixels).toBe(1)
    expect(result.overlay[3]).toBe(0)
    expect(result.overlay[7]).toBeGreaterThan(0)
  })

  it('rejects images that do not have matching pixel buffers', () => {
    expect(() => comparePixels(new Uint8ClampedArray(4), new Uint8ClampedArray(8), 10)).toThrow()
  })

  it('can exclude dynamic system-bar pixels from the difference overlay', () => {
    const reference = new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255])
    const actual = new Uint8ClampedArray([255, 0, 0, 255, 255, 0, 0, 255])
    const result = comparePixels(reference, actual, 10, 1)
    expect(result.changedPixels).toBe(1)
    expect(result.overlay[3]).toBe(0)
    expect(result.overlay[7]).toBeGreaterThan(0)
  })

  it('preserves the uploaded phone screenshot aspect ratio at the demo width', () => {
    expect(heightForScreenshot(736, 1600)).toBe(815)
    expect(heightForScreenshot(0, 0)).toBe(812)
  })

  it('groups nearby changed pixels into separate reviewable regions', () => {
    const width = 64
    const height = 48
    const overlay = new Uint8ClampedArray(width * height * 4)
    for (let y = 4; y < 12; y++) for (let x = 4; x < 12; x++) overlay[(y * width + x) * 4 + 3] = 190
    for (let y = 28; y < 36; y++) for (let x = 44; x < 52; x++) overlay[(y * width + x) * 4 + 3] = 190
    const regions = findDifferenceRegions(overlay, width, height, 8)
    expect(regions).toHaveLength(2)
    expect(regions[0]).toMatchObject({ x: 0, y: 0, width: 16, height: 16 })
    expect(regions[1]).toMatchObject({ x: 40, y: 24, width: 16, height: 16 })
  })

  it('does not invent regions when images match or when there is isolated pixel noise', () => {
    const overlay = new Uint8ClampedArray(32 * 32 * 4)
    overlay[(8 * 32 + 8) * 4 + 3] = 190
    expect(findDifferenceRegions(overlay, 32, 32, 8)).toEqual([])
  })
})
