import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

type Result = { bytes: Buffer; extension: string; changed: boolean; proof: Record<string, unknown> }
const optimizerModule = '../../scripts/build-assets/lossless-images.mjs'
const { optimizeLosslessImage } = (await import(optimizerModule)) as {
  optimizeLosslessImage: (bytes: Buffer, extension: string) => Promise<Result>
}

async function pixels(bytes: Buffer) {
  return sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
}

async function transparentPng(hiddenRgb = false) {
  const width = 128
  const height = 128
  const rgba = Buffer.alloc(width * height * 4)
  const swatches = [
    hiddenRgb ? [123, 71, 9, 0] : [0, 0, 0, 0],
    [231, 10, 72, 128],
    [12, 190, 75, 255],
    [32, 64, 128, 64],
  ]
  for (let pixel = 0; pixel < width * height; pixel++) {
    const swatch = swatches[pixel % swatches.length]!
    for (let channel = 0; channel < 4; channel++) rgba[pixel * 4 + channel] = swatch[channel]!
  }
  return sharp(rgba, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 0 })
    .toBuffer()
}

async function noisyJpeg() {
  const rgb = Buffer.alloc(128 * 128 * 3)
  let seed = 1847
  for (let index = 0; index < rgb.length; index++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    rgb[index] = seed >>> 24
  }
  return sharp(rgb, { raw: { width: 128, height: 128, channels: 3 } })
    .jpeg({ quality: 35 })
    .toBuffer()
}

function addPngGamma(png: Buffer, gamma: number) {
  const data = Buffer.alloc(4)
  data.writeUInt32BE(gamma)
  const body = Buffer.concat([Buffer.from('gAMA'), data])
  let crc = 0xffffffff
  for (const byte of body) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0)
  return Buffer.concat([png.subarray(0, 33), length, body, checksum, png.subarray(33)])
}

describe('lossless emitted image optimization', () => {
  it('keeps alpha PNG as PNG even when a smaller WebP passes both Node RGBA comparisons', async () => {
    const source = await transparentPng()
    const original = Buffer.from(source)
    const nodeExactWebp = await sharp(source).webp({ lossless: true, effort: 4 }).toBuffer()
    expect((await pixels(nodeExactWebp)).data).toEqual((await pixels(source)).data)
    expect(await sharp(nodeExactWebp, { ignoreIcc: true }).ensureAlpha().raw().toBuffer()).toEqual(
      await sharp(source, { ignoreIcc: true }).ensureAlpha().raw().toBuffer(),
    )
    const result = await optimizeLosslessImage(source, '.png')
    expect(result.changed).toBe(true)
    expect(result.extension).toBe('.png')
    expect(result.bytes.length).toBeLessThan(source.length)
    const before = await pixels(source)
    const after = await pixels(result.bytes)
    expect(after.info).toMatchObject({ width: 128, height: 128, channels: 4 })
    expect(after.data).toEqual(before.data)
    expect(source).toEqual(original)
    expect(result.proof).toMatchObject({
      rgbaIdentical: true,
      unmanagedRgbaIdentical: true,
      width: 128,
      height: 128,
      sourceHasAlpha: true,
      alphaPolicy: 'png-only-browser-parity',
      candidateFormat: 'png',
    })
  })

  it('compresses alpha PNG without discarding hidden RGB values of transparent pixels', async () => {
    const source = await transparentPng(true)
    expect((await pixels(source)).data.subarray(0, 4)).toEqual(Buffer.from([123, 71, 9, 0]))
    const result = await optimizeLosslessImage(source, 'png')
    expect(result.changed).toBe(true)
    expect(result.extension).toBe('.png')
    expect(result.bytes.length).toBeLessThan(source.length)
    expect((await pixels(result.bytes)).data).toEqual((await pixels(source)).data)
    expect(result.proof).toMatchObject({ rgbaIdentical: true, unmanagedRgbaIdentical: true, outputFormat: 'png' })
  })

  it('retains WebP optimization for opaque PNG after exact pixel validation', async () => {
    const source = await sharp({ create: { width: 128, height: 128, channels: 3, background: '#262626' } })
      .png({ compressionLevel: 0 })
      .toBuffer()
    const result = await optimizeLosslessImage(source, '.png')
    expect(result.changed).toBe(true)
    expect(result.extension).toBe('.webp')
    expect(result.proof).toMatchObject({ sourceHasAlpha: false, alphaPolicy: 'webp-eligible', rgbaIdentical: true })
    expect((await pixels(result.bytes)).data).toEqual((await pixels(source)).data)
  })

  it('detects JPEG content behind a png filename and validates an exact smaller candidate', async () => {
    const source = await sharp({ create: { width: 128, height: 128, channels: 3, background: '#262626' } })
      .jpeg()
      .toBuffer()
    const result = await optimizeLosslessImage(source, '.png')
    expect(result.changed).toBe(true)
    expect(result.extension).toBe('.webp')
    expect(result.proof.sourceFormat).toBe('jpeg')
    expect((await pixels(result.bytes)).data).toEqual((await pixels(source)).data)
  })

  it('keeps JPEG bytes when lossless recompression offers no savings', async () => {
    const source = await noisyJpeg()
    const result = await optimizeLosslessImage(source, '.jpg')
    expect(result.changed).toBe(false)
    expect(result.extension).toBe('.jpg')
    expect(result.bytes).toEqual(source)
    expect(result.proof.reason).toBe('not-smaller')
    expect(result.proof.candidateBytes).toBeGreaterThanOrEqual(source.length)
  })

  it('retains the original ICC profile rather than trusting a pixel comparison after dropping color metadata', async () => {
    const source = await sharp(await transparentPng())
      .withIccProfile('srgb')
      .png({ compressionLevel: 0 })
      .toBuffer()
    const before = await sharp(source).metadata()
    expect(before.icc?.length).toBeGreaterThan(0)
    const result = await optimizeLosslessImage(source, '.png')
    expect((await sharp(result.bytes).metadata()).icc).toEqual(before.icc)
    expect((await pixels(result.bytes)).data).toEqual((await pixels(source)).data)
    if (result.changed) expect(result.proof.iccIdentical).toBe(true)
  })

  it('skips unprofiled PNG gamma and nonidentity EXIF orientation instead of changing display semantics', async () => {
    const gamma = addPngGamma(await transparentPng(), 100000)
    const pngResult = await optimizeLosslessImage(gamma, '.png')
    expect(pngResult.changed).toBe(false)
    expect(pngResult.bytes).toEqual(gamma)
    expect(pngResult.proof.reason).toBe('png-gamma-without-authoritative-profile')
    const oriented = await sharp({ create: { width: 16, height: 8, channels: 3, background: '#262626' } })
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer()
    const jpegResult = await optimizeLosslessImage(oriented, '.jpeg')
    expect(jpegResult.changed).toBe(false)
    expect(jpegResult.bytes).toEqual(oriented)
    expect(jpegResult.proof.reason).toBe('nonidentity-orientation')
  })

  it('changes only verified embedded raster data URIs while preserving every SVG vector and wrapper byte', async () => {
    const png = await transparentPng()
    const jpeg = await noisyJpeg()
    const source = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="paint"><stop stop-color="#e2001a"/></linearGradient></defs><path d="M0 0L128 128" fill="url(#paint)"/><image id="one" href="data:image/png;base64,${png.toString('base64')}"/><image id="two" href="data:image/jpeg;base64,${jpeg.toString('base64')}"/></svg>`,
    )
    const result = await optimizeLosslessImage(source, '.svg')
    expect(result.changed).toBe(true)
    expect(result.extension).toBe('.svg')
    expect(result.bytes.length).toBeLessThan(source.length)
    const vectorWrapper = (bytes: Buffer) =>
      bytes.toString().replace(/data:image\/(?:png|jpeg|webp);base64,[^"]+/g, 'RASTER')
    expect(vectorWrapper(result.bytes)).toBe(vectorWrapper(source))
    const embedded = /data:image\/png;base64,([^"]+)/.exec(result.bytes.toString())
    expect(embedded).not.toBeNull()
    expect((await pixels(Buffer.from(embedded![1]!, 'base64'))).data).toEqual((await pixels(png)).data)
    expect(result.bytes.toString()).toContain(`data:image/jpeg;base64,${jpeg.toString('base64')}`)
    expect(result.proof.embedded).toEqual([
      expect.objectContaining({ changed: true, sourceHasAlpha: true, alphaPolicy: 'png-only-browser-parity' }),
      expect.objectContaining({ changed: false }),
    ])
  })

  it('supports percent-encoded embedded PNG bytes without rasterizing the SVG', async () => {
    const png = await transparentPng()
    const payload = [...png].map((byte) => `%${byte.toString(16).padStart(2, '0')}`).join('')
    const prefix = '<svg viewBox="0 0 128 128"><circle cx="30" cy="30" r="20"/><image href="'
    const source = Buffer.from(`${prefix}data:image/png,${payload}"/></svg>`)
    const result = await optimizeLosslessImage(source, '.svg')
    expect(result.changed).toBe(true)
    expect(result.bytes.toString().startsWith(`${prefix}data:image/png;base64,`)).toBe(true)
    expect(result.bytes.toString().endsWith('"/></svg>')).toBe(true)
  })

  it('uses the real PNG MIME type for an embedded hidden-RGB fallback and preserves vector code', async () => {
    const png = await transparentPng(true)
    const source = Buffer.from(
      `<svg><path d="M0 0L7 7"/><image href="data:image/png;base64,${png.toString('base64')}"/></svg>`,
    )
    const result = await optimizeLosslessImage(source, '.svg')
    expect(result.changed).toBe(true)
    const embedded = /data:image\/png;base64,([^"]+)/.exec(result.bytes.toString())
    expect(embedded).not.toBeNull()
    expect(result.bytes.toString()).toContain('<path d="M0 0L7 7"/>')
    const encoded = Buffer.from(embedded![1]!, 'base64')
    expect((await sharp(encoded).metadata()).format).toBe('png')
    expect((await pixels(encoded)).data).toEqual((await pixels(png)).data)
  })

  it('leaves vector-only SVGs, unsupported formats and malformed embedded payloads untouched', async () => {
    const vector = Buffer.from('<svg><path d="M0 0L1 1"/></svg>')
    expect((await optimizeLosslessImage(vector, '.svg')).bytes).toEqual(vector)
    const malformed = Buffer.from('<svg><image href="data:image/png;base64,AAAA"/></svg>')
    const result = await optimizeLosslessImage(malformed, '.svg')
    expect(result.changed).toBe(false)
    expect(result.bytes).toEqual(malformed)
    const unsupported = await optimizeLosslessImage(Buffer.from('unchanged'), '.gif')
    expect(unsupported.changed).toBe(false)
    expect(unsupported.proof.reason).toBe('unsupported-format')
  })
})
