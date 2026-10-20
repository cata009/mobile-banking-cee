// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import {
  PAYMENT_IMAGE_ARTWORK,
  CARD_ARTWORK_IMAGES,
  resolvePaymentImage,
  resolveCardArt,
} from '@/app/components/contracts/imageArtwork'
import { CARD_SOURCE } from '@/app/components/contracts/cardArtwork'

it('implements all 13 payment and 29 full card-art sources as local original SVGs', () => {
  expect(Object.keys(PAYMENT_IMAGE_ARTWORK)).toHaveLength(13)
  expect(Object.keys(CARD_ARTWORK_IMAGES)).toHaveLength(29)
  const sources = [...Object.values(PAYMENT_IMAGE_ARTWORK), ...Object.values(CARD_ARTWORK_IMAGES)]
  expect(new Set(sources.map((source) => source.nodeId)).size).toBe(42)
  for (const source of sources) {
    const bytes = readFileSync(resolve('src/assets/design-system/images', source.file))
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(source.sha256)
    const xml = bytes.toString('utf8')
    expect(xml).toMatch(/^<svg\b/)
    expect(xml).not.toMatch(/https?:\/\/www\.figma\.com\/api\/mcp\/asset/)
    expect(xml).toContain(`width="${source.svgWidth}"`)
    expect(xml).toContain(`height="${source.svgHeight}"`)
  }
})

it('keeps full card art and the 64×40 thumbnail contract separate', () => {
  expect(CARD_SOURCE.width).toBe(64)
  expect(CARD_SOURCE.height).toBe(40)
  const card = resolveCardArt({ variant: 'Credit red arrow gold' })
  expect([card.nodeId, card.width, card.height]).toEqual(['1272:9526', 219, 138])
  const partner = resolveCardArt({ variant: 'Credit Mobexpert', width: 438 })
  expect(partner.height).toBeCloseTo(309.0264892578125)
  expect(partner.svgWidth).toBe(219)
  expect(partner.svgHeight).toBe(155)
  expect(resolvePaymentImage({ variant: 'MakePayment', width: 274 }).height).toBe(240)
})

it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid artwork width %s', (width) => {
  expect(() => resolveCardArt({ width })).toThrow(RangeError)
  expect(() => resolvePaymentImage({ width })).toThrow(RangeError)
})
