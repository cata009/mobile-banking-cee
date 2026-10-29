import { createHash } from 'node:crypto'
import sharp from 'sharp'

export class SpecStoreError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function imageInfo(name, mime, bytes) {
  if (bytes.length > MAX_IMAGE_BYTES) throw new SpecStoreError(413, 'Each image must be 5 MB or smaller.')
  const validSignature =
    mime === 'image/png'
      ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : mime === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216
  if (!validSignature) throw new SpecStoreError(400, 'Choose a valid PNG or JPEG image.')
  let width, height
  try {
    const decoder = sharp(bytes, { failOn: 'warning', limitInputPixels: 40_000_000 })
    const metadata = await decoder.metadata()
    width = metadata.width
    height = metadata.height
    // Decode pixels to reject truncated/corrupt payloads; never re-encode the stored original.
    await decoder.stats()
  } catch {
    throw new SpecStoreError(
      400,
      'This image is incomplete, damaged or larger than 40 megapixels. Choose a complete PNG or JPEG.',
    )
  }
  if (width < 1 || height < 1 || width > 16000 || height > 16000)
    throw new SpecStoreError(400, 'Image dimensions must be between 1 and 16000 pixels.')
  return {
    id: `img-${createHash('sha256').update(bytes).digest('hex').slice(0, 32)}`,
    name: Array.from(String(name || 'Image'))
      .filter((char) => char.charCodeAt(0) >= 32 && char !== '/' && char !== '\\')
      .join('')
      .slice(0, 120),
    mime,
    width,
    height,
  }
}

export async function parseImageDataUrl(input) {
  const match =
    typeof input.dataUrl === 'string' &&
    /^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/]+={0,2})$/.exec(input.dataUrl)
  if (!match) throw new SpecStoreError(400, 'Choose a PNG or JPEG image.')
  const bytes = Buffer.from(match[2], 'base64')
  return { bytes, asset: { ...(await imageInfo(input.name, match[1], bytes)), dataUrl: input.dataUrl } }
}

export function assertAttachments(document, assets) {
  if (document.type === 'image' && !assets.some((asset) => asset.id === document.attrs.assetId))
    throw new SpecStoreError(400, 'An image attachment is missing.')
  for (const child of document.content ?? []) assertAttachments(child, assets)
}

export function revisionMetadata(input, revision) {
  return {
    revision,
    at: new Date().toISOString(),
    author: String(input.author || 'Workspace editor')
      .trim()
      .slice(0, 80),
    message: String(input.message || 'Autosave').slice(0, 200),
  }
}
