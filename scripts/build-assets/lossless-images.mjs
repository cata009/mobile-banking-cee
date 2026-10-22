import { createHash } from 'node:crypto'
import sharp from 'sharp'

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const srgbChromaticity = [31270, 32900, 64000, 33000, 30000, 60000, 15000, 6000]
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex')
const normalizeExtension = (value) =>
  `.${String(value ?? '')
    .replace(/^\./, '')
    .toLowerCase()}`

function originalResult(bytes, extension, proof, reason) {
  return { bytes, extension, changed: false, proof: { ...proof, reason } }
}

function baseProof(bytes, extension) {
  const hash = digest(bytes)
  return {
    sourceExtension: extension,
    sourceBytes: bytes.length,
    outputBytes: bytes.length,
    sourceSha256: hash,
    outputSha256: hash,
    resized: false,
  }
}

/** PNG colour hints can affect browser display even when a raw decoder ignores them. */
function pngDisplayMetadata(bytes) {
  const result = { gamma: null, srgb: false, iccChunk: false, chromaticity: null, hdr: false, nonSquarePixels: false }
  if (!bytes.subarray(0, 8).equals(pngSignature)) return { ...result, invalid: true }
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = bytes.readUInt32BE(offset)
    const end = offset + 12 + length
    if (end > bytes.length) return { ...result, invalid: true }
    const type = bytes.toString('ascii', offset + 4, offset + 8)
    const data = bytes.subarray(offset + 8, offset + 8 + length)
    if (type === 'gAMA') {
      if (length !== 4) return { ...result, invalid: true }
      result.gamma = data.readUInt32BE(0)
    }
    if (type === 'sRGB') {
      if (length !== 1 || data[0] > 3) return { ...result, invalid: true }
      result.srgb = true
    }
    if (type === 'iCCP') result.iccChunk = true
    if (type === 'cHRM') {
      if (length !== 32) return { ...result, invalid: true }
      result.chromaticity = Array.from({ length: 8 }, (_, index) => data.readUInt32BE(index * 4))
    }
    if (['cICP', 'mDCv', 'cLLi'].includes(type)) result.hdr = true
    if (type === 'pHYs' && length === 9) result.nonSquarePixels = data.readUInt32BE(0) !== data.readUInt32BE(4)
    offset = end
    if (type === 'IEND') break
  }
  return result
}

function unsafeDisplayReason(metadata, png) {
  if ((metadata.pages ?? 1) > 1) return 'animated-image'
  if (metadata.orientation !== undefined && metadata.orientation !== 1) return 'nonidentity-orientation'
  if (metadata.depth !== 'uchar' || (metadata.bitsPerSample ?? 8) > 8) return 'high-bit-depth'
  if (!['srgb', 'rgb', 'b-w'].includes(metadata.space)) return 'unsupported-color-space'
  if (metadata.icc && metadata.space === 'b-w') return 'non-rgb-profile'
  if (!png) return null
  if (png.invalid) return 'invalid-png-metadata'
  if (png.hdr) return 'png-hdr-metadata'
  if (png.nonSquarePixels) return 'non-square-pixels'
  if (png.iccChunk && !metadata.icc) return 'unsupported-png-profile'
  if (!metadata.icc && !png.srgb) {
    if (png.gamma !== null) return 'png-gamma-without-authoritative-profile'
    if (png.chromaticity && !png.chromaticity.every((value, index) => value === srgbChromaticity[index]))
      return 'png-nonstandard-chromaticity'
  }
  return null
}

async function rgba(bytes, ignoreIcc = false) {
  return sharp(bytes, { failOn: 'error', ignoreIcc }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
}

function equalPixels(first, second) {
  return (
    first.info.width === second.info.width &&
    first.info.height === second.info.height &&
    first.info.channels === 4 &&
    second.info.channels === 4 &&
    first.data.equals(second.data)
  )
}

async function optimizeRaster(bytes, extension) {
  let proof = baseProof(bytes, extension)
  try {
    // Use the decoder's format: emitted filenames sometimes say PNG for JPEG bytes.
    const metadata = await sharp(bytes, { failOn: 'error' }).metadata()
    const alphaPng = metadata.format === 'png' && metadata.hasAlpha === true
    proof = {
      ...proof,
      sourceFormat: metadata.format,
      width: metadata.width,
      height: metadata.height,
      sourceHasAlpha: metadata.hasAlpha === true,
      alphaPolicy: alphaPng ? 'png-only-browser-parity' : 'webp-eligible',
      orientation: metadata.orientation ?? 1,
      iccSha256: metadata.icc ? digest(metadata.icc) : null,
    }
    if (!['png', 'jpeg'].includes(metadata.format)) return originalResult(bytes, extension, proof, 'unsupported-format')
    const png = metadata.format === 'png' ? pngDisplayMetadata(bytes) : null
    proof = { ...proof, pngDisplayMetadata: png }
    const unsafe = unsafeDisplayReason(metadata, png)
    if (unsafe) return originalResult(bytes, extension, { ...proof, displaySemanticsSafe: false }, unsafe)
    let originalPixels
    const evaluate = async (format) => {
      let attemptProof = { ...proof, candidateFormat: format }
      try {
        const encoder = sharp(bytes, { failOn: 'error' }).keepMetadata()
        const candidate = await (
          format === 'webp'
            ? encoder.webp({ lossless: true, effort: 4 })
            : encoder.png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
        ).toBuffer()
        attemptProof = { ...attemptProof, candidateBytes: candidate.length }
        if (candidate.length >= bytes.length) return originalResult(bytes, extension, attemptProof, 'not-smaller')
        const output = await sharp(candidate, { failOn: 'error' }).metadata()
        const iccIdentical = metadata.icc ? Boolean(output.icc?.equals(metadata.icc)) : !output.icc
        const orientationIdentical = (metadata.orientation ?? 1) === (output.orientation ?? 1)
        attemptProof = { ...attemptProof, iccIdentical, orientationIdentical }
        if (!iccIdentical || !orientationIdentical)
          return originalResult(bytes, extension, attemptProof, 'display-metadata-mismatch')
        originalPixels ??= Promise.all([rgba(bytes), rgba(bytes, true)])
        const [[before, unmanagedBefore], after, unmanagedAfter] = await Promise.all([
          originalPixels,
          rgba(candidate),
          rgba(candidate, true),
        ])
        const rgbaIdentical = equalPixels(before, after)
        const unmanagedRgbaIdentical = equalPixels(unmanagedBefore, unmanagedAfter)
        attemptProof = { ...attemptProof, rgbaIdentical, unmanagedRgbaIdentical }
        if (!rgbaIdentical || !unmanagedRgbaIdentical)
          return originalResult(bytes, extension, attemptProof, 'rgba-mismatch')
        return {
          bytes: candidate,
          extension: `.${format}`,
          changed: true,
          proof: {
            ...attemptProof,
            outputFormat: format,
            outputBytes: candidate.length,
            outputSha256: digest(candidate),
            rgbaSha256: digest(before.data),
            unmanagedRgbaSha256: digest(unmanagedBefore.data),
            displaySemanticsSafe: true,
            lossless: true,
            reason: 'smaller-exact-rgba',
          },
        }
      } catch {
        return originalResult(bytes, extension, attemptProof, 'decode-or-encode-error')
      }
    }
    // Chromium can round premultiplied RGB differently for PNG versus WebP even
    // when both pass Node's RGBA comparison. Retain PNG decoding for all alpha PNGs.
    if (alphaPng) return evaluate('png')
    const webp = await evaluate('webp')
    if (webp.changed || metadata.format !== 'png') return webp
    const pngResult = await evaluate('png')
    const summarize = (result) => ({
      format: result.proof.candidateFormat,
      candidateBytes: result.proof.candidateBytes,
      rgbaIdentical: result.proof.rgbaIdentical,
      unmanagedRgbaIdentical: result.proof.unmanagedRgbaIdentical,
      iccIdentical: result.proof.iccIdentical,
      orientationIdentical: result.proof.orientationIdentical,
      reason: result.proof.reason,
    })
    return { ...pngResult, proof: { ...pngResult.proof, attempts: [summarize(webp), summarize(pngResult)] } }
  } catch {
    return originalResult(bytes, extension, proof, 'decode-or-encode-error')
  }
}

function percentDecodedBytes(value) {
  const bytes = []
  for (let index = 0; index < value.length; index++) {
    if (value[index] === '%') {
      const hex = value.slice(index + 1, index + 3)
      if (!/^[a-f\d]{2}$/i.test(hex)) throw new Error('Invalid percent encoding')
      bytes.push(Number.parseInt(hex, 16))
      index += 2
    } else {
      const code = value.charCodeAt(index)
      if (code > 127) throw new Error('Unescaped non-ASCII data URI')
      bytes.push(code)
    }
  }
  return Buffer.from(bytes)
}

function dataUriBytes(parameters, payload) {
  const decoded = percentDecodedBytes(payload)
  if (!parameters.toLowerCase().split(';').includes('base64')) return decoded
  const compact = decoded.toString('ascii').replace(/\s/g, '')
  if (!/^[a-z\d+/]*={0,2}$/i.test(compact) || compact.length % 4 === 1) throw new Error('Invalid base64')
  const bytes = Buffer.from(compact, 'base64')
  if (bytes.toString('base64').replace(/=+$/, '') !== compact.replace(/=+$/, '')) throw new Error('Invalid base64')
  return bytes
}

async function optimizeSvg(bytes, extension) {
  const source = bytes.toString('utf8')
  const proof = baseProof(bytes, extension)
  if (!Buffer.from(source).equals(bytes)) return originalResult(bytes, extension, proof, 'unsupported-svg-encoding')
  const uri = /data:image\/(png|jpe?g)((?:;[^,\s"'<>)]*)?),([^"'<>)]*)/gi
  const embedded = []
  const fragments = []
  let cursor = 0
  let changed = false
  for (const match of source.matchAll(uri)) {
    let replacement = match[0]
    let outcome
    try {
      const original = dataUriBytes(match[2], match[3])
      const result = await optimizeRaster(original, `.${match[1].toLowerCase()}`)
      outcome = {
        index: embedded.length,
        mimeType: `image/${match[1].toLowerCase()}`,
        ...result.proof,
        changed: result.changed,
      }
      if (result.changed) {
        const mime = result.extension === '.webp' ? 'image/webp' : 'image/png'
        const next = `data:${mime};base64,${result.bytes.toString('base64')}`
        if (next.length < replacement.length) {
          replacement = next
          changed = true
        } else outcome = { ...outcome, changed: false, reason: 'data-uri-not-smaller' }
      }
    } catch {
      outcome = { index: embedded.length, changed: false, reason: 'invalid-data-uri' }
    }
    fragments.push(source.slice(cursor, match.index), replacement)
    cursor = match.index + match[0].length
    embedded.push(outcome)
  }
  if (!changed) return originalResult(bytes, extension, { ...proof, embedded }, 'no-beneficial-embedded-raster')
  fragments.push(source.slice(cursor))
  const output = Buffer.from(fragments.join(''))
  return {
    bytes: output,
    extension,
    changed: true,
    proof: {
      ...proof,
      sourceFormat: 'svg',
      outputFormat: 'svg',
      outputBytes: output.length,
      outputSha256: digest(output),
      vectorWrapperPreserved: true,
      embedded,
      reason: 'smaller-exact-embedded-rasters',
    },
  }
}

/** Optimize emitted buffers only; no source file reads, writes, resizing or vector rasterization. */
export async function optimizeLosslessImage(input, inputExtension) {
  const bytes = Buffer.isBuffer(input) ? input : Buffer.from(input)
  const extension = normalizeExtension(inputExtension)
  if (extension === '.svg') return optimizeSvg(bytes, extension)
  if (['.png', '.jpg', '.jpeg'].includes(extension)) return optimizeRaster(bytes, extension)
  return originalResult(bytes, extension, baseProof(bytes, extension), 'unsupported-format')
}
