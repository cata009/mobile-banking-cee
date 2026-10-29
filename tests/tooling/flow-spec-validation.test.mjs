import { describe, expect, it } from 'vitest'
import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { parseImageDataUrl } from '../../scripts/flow-spec/validation.mjs'

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=',
  'base64',
)
const input = (bytes, mime) => ({ name: 'original', dataUrl: `data:${mime};base64,${bytes.toString('base64')}` })
describe('original specification image validation', () => {
  it('rejects truncated PNG/JPEG data instead of permanently registering unreadable images', async () => {
    const jpeg = await sharp({ create: { width: 3, height: 2, channels: 3, background: '#007a91' } })
      .jpeg()
      .toBuffer()
    for (const [bytes, mime] of [
      [png.subarray(0, 33), 'image/png'],
      [jpeg.subarray(0, jpeg.length - 12), 'image/jpeg'],
    ])
      await expect(Promise.resolve().then(() => parseImageDataUrl(input(bytes, mime)))).rejects.toMatchObject({
        status: 400,
      })
  })
  it('preserves every byte and stable identity of a valid image while validating actual pixels', async () => {
    const result = await parseImageDataUrl(input(png, 'image/png'))
    expect(result.bytes.equals(png)).toBe(true)
    expect(result.asset).toMatchObject({
      width: 1,
      height: 1,
      mime: 'image/png',
      id: `img-${createHash('sha256').update(png).digest('hex').slice(0, 32)}`,
    })
  })
})
