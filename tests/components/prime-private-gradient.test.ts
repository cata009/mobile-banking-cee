import { expect, it } from 'vitest'
import { PRIVATE_BADGE_GRADIENTS, PRIVATE_PAGE_GRADIENTS } from '../../native-spike/src/app/primePrivateFills'

it('preserves the original Figma affine paint for the Private badge', () => {
  for (const layers of [PRIVATE_BADGE_GRADIENTS]) {
    const matrix = layers[0].match(/gradientTransform='matrix\(([^)]+)\)'/)?.[1]?.split(' ').map(Number)
    expect(matrix).toHaveLength(6)
    if (!matrix || matrix.length !== 6) throw new Error('Private base must preserve the Figma affine gradient')
    const [a, b, c, d, e, f] = matrix as [number, number, number, number, number, number]
    const det = a * d - b * c
    const original = [d / det, -c / det, (c * f - d * e) / det]
    // Independently recorded from My Advisor 842:44900 /1091:24468 original paint.
    const figma = [-0.30715131759643555, 0.6278628706932068, 0.7538556456565857]
    original.forEach((value, index) => expect(value).toBeCloseTo(figma[index]!, 10))
    expect(layers[0]).toContain("offset='0.004807692486792803'")
    expect(layers[0]).toContain("offset='1'")
    const t = original[0]! + original[2]!
    const upperRightRed = 255 + (34 - 255) * ((t - 0.004807692486792803) / (1 - 0.004807692486792803))
    expect(upperRightRed).toBeGreaterThan(100)
    expect(upperRightRed).toBeLessThan(180)
  }
})

it('keeps the negative stop and layer geometry from the user-supplied Private page CSS', () => {
  expect(PRIVATE_PAGE_GRADIENTS[0]).toBe('linear-gradient(206deg, #FFF -47.26%, #222 59.18%)')
  expect(PRIVATE_PAGE_GRADIENTS[1]).toContain('61.85% 49.94% at 50.13% 50.06%')
  expect(PRIVATE_PAGE_GRADIENTS[2]).toContain('37.18% 73.78% at 70% 28.98%')
})
