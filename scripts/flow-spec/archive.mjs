import { validateSpecDocument } from '../../src/features/flow-spec/schema.mjs'
import { SpecStoreError, parseImageDataUrl, assertAttachments } from './validation.mjs'

/** The same completeness contract protects import and exported backups. */
export async function validateSpecArchive(archive, { allowEmpty = false } = {}) {
  if (
    archive?.format !== 'flow-spec-archive-v1' ||
    archive.flowId !== 'ba-card-fraud' ||
    !Array.isArray(archive.history) ||
    (!allowEmpty && archive.history.length < 1) ||
    archive.history.length > 1000 ||
    !Array.isArray(archive.assets) ||
    archive.assets.length > 50
  )
    throw new SpecStoreError(400, 'Invalid specification backup.')
  const parsedAssets = []
  // Decode sequentially to bound native image-decoder memory for a full backup.
  for (const asset of archive.assets) {
    const parsed = await parseImageDataUrl(asset)
    if (asset.id !== parsed.asset.id) throw new SpecStoreError(400, 'Backup image identity does not match its bytes.')
    parsedAssets.push(parsed)
  }
  if (
    new Set(parsedAssets.map(({ asset }) => asset.id)).size !== parsedAssets.length ||
    parsedAssets.reduce((sum, entry) => sum + entry.bytes.length, 0) > 20 * 1024 * 1024
  )
    throw new SpecStoreError(400, 'Invalid specification backup attachment inventory.')
  for (let index = 0; index < archive.history.length; index++) {
    const entry = archive.history[index]
    if (
      entry.revision !== archive.history.length - index ||
      typeof entry.at !== 'string' ||
      !Number.isFinite(Date.parse(entry.at)) ||
      typeof entry.author !== 'string' ||
      entry.author.length > 80 ||
      typeof entry.message !== 'string' ||
      entry.message.length > 200
    )
      throw new SpecStoreError(400, 'Invalid specification backup history.')
    try {
      validateSpecDocument(entry.document)
    } catch (error) {
      throw new SpecStoreError(400, error.message)
    }
    assertAttachments(
      entry.document,
      parsedAssets.map(({ asset }) => asset),
    )
  }
  return parsedAssets
}
