import { expect, it } from 'vitest'
import { STANDARD_FILL_SVGS, STANDARD_SOURCE_IMAGE_HASH } from '../../native-spike/src/app/primeStandardFills'

it('preserves the original Figma Standard affine fill instead of inaccurate generated percentage stops', () => {
  const matrix = STANDARD_FILL_SVGS[0]
    .match(/gradientTransform='matrix\(([^)]+)\)'/)?.[1]
    ?.split(' ')
    .map(Number)
  expect(matrix).toHaveLength(6)
  if (!matrix || matrix.length !== 6) throw new Error('Standard base requires its original Figma paint transform')
  const [a, b, c, d, e, f] = matrix as [number, number, number, number, number, number]
  const det = a * d - b * c
  const source = [d / det, -c / det, (c * f - d * e) / det]
  const figma = [-0.184892937541008, 0.7900813817977905, 0.5998585820198059]
  source.forEach((value, index) => expect(value).toBeCloseTo(figma[index]!, 10))
  expect(STANDARD_FILL_SVGS[0]).toContain("offset='0.10000000149011612'")
  expect(STANDARD_FILL_SVGS[0]).toContain('rgb(179,215,207)')
  const upperLeftGreen = 215 + (38 - 215) * ((source[2]! - 0.1) / 0.9)
  expect(upperLeftGreen).toBeGreaterThan(110)
  expect(upperLeftGreen).toBeLessThan(125)
  expect(STANDARD_FILL_SVGS).toHaveLength(3)
  expect(STANDARD_SOURCE_IMAGE_HASH).toBe('6f8736f05a24b87b9ef5508cfd9021e9a466bf48')
})
