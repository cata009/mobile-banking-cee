import { mkdir, readFile, writeFile, rename } from 'node:fs/promises'
import lockfile from 'proper-lockfile'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { validateSpecDocument } from '../../src/features/flow-spec/schema.mjs'
import { SpecStoreError, parseImageDataUrl } from './validation.mjs'

export { SpecStoreError } from './validation.mjs'
const empty = () => ({ revision: 0, document: null, history: [], assets: [] })
const json = async (path, fallback) => {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}

export function createSpecStore(root) {
  const statePath = join(root, 'state.json')
  async function locked(action) {
    await mkdir(root, { recursive: true })
    let release
    try {
      release = await lockfile.lock(root, {
        realpath: false,
        lockfilePath: join(root, '.write-lock'),
        stale: 10_000,
        update: 2000,
        retries: { retries: 40, minTimeout: 50, maxTimeout: 100 },
      })
    } catch {
      throw new SpecStoreError(503, 'Another save is in progress. Retry in a moment.')
    }
    try {
      return await action()
    } finally {
      await release()
    }
  }
  async function atomic(path, value) {
    const temporary = `${path}.${randomUUID()}.tmp`
    await writeFile(temporary, JSON.stringify(value), 'utf8')
    await rename(temporary, path)
  }
  const read = async () => json(statePath, empty())
  async function saveLocked(input) {
    const state = await read()
    if (!Number.isInteger(input.expectedRevision) || input.expectedRevision !== state.revision)
      throw new SpecStoreError(
        409,
        'This specification has changed in another session. Your draft is preserved; review the latest version.',
      )
    try {
      validateSpecDocument(input.document)
    } catch (error) {
      throw new SpecStoreError(400, error.message)
    }
    const checkImages = (node) => {
      if (node.type === 'image' && !state.assets.some((a) => a.id === node.attrs.assetId))
        throw new SpecStoreError(400, 'An image attachment is missing.')
      for (const child of node.content ?? []) checkImages(child)
    }
    checkImages(input.document)
    if (state.revision >= 1000)
      throw new SpecStoreError(
        409,
        'The revision limit has been reached. Export a backup and contact the workspace owner.',
      )
    const revision = state.revision + 1
    const metadata = {
      revision,
      at: new Date().toISOString(),
      author: String(input.author || 'Workspace editor')
        .trim()
        .slice(0, 80),
      message: String(input.message || 'Autosave').slice(0, 200),
    }
    await atomic(join(root, `revision-${revision}.json`), input.document)
    const next = { ...state, revision, document: input.document, history: [metadata, ...state.history] }
    await atomic(statePath, next)
    return next
  }
  return {
    read,
    async revision(number) {
      const state = await read()
      if (!Number.isInteger(number) || number < 1 || number > state.revision)
        throw new SpecStoreError(404, 'Revision not found.')
      const document = await json(join(root, `revision-${number}.json`), null)
      if (!document)
        throw new SpecStoreError(
          500,
          'A saved revision is missing. Restore it from a complete backup before exporting history.',
        )
      try {
        validateSpecDocument(document)
      } catch {
        throw new SpecStoreError(500, 'A saved revision is damaged. Backup was not completed.')
      }
      return document
    },
    save: (input) => locked(() => saveLocked(input)),
    restore: (input) =>
      locked(async () => {
        if (!Number.isInteger(input.revision) || input.revision < 1)
          throw new SpecStoreError(400, 'Choose a valid revision.')
        const document = await json(join(root, `revision-${input.revision}.json`), null)
        if (!document) throw new SpecStoreError(404, 'Revision not found.')
        return saveLocked({ ...input, document, message: `Restore revision ${input.revision}` })
      }),
    addAsset: (input) =>
      locked(async () => {
        const { asset } = await parseImageDataUrl(input)
        const state = await read()
        const existing = state.assets.find((a) => a.id === asset.id)
        if (existing) return existing
        if (
          state.assets.length >= 50 ||
          state.assets.reduce((total, asset) => total + asset.dataUrl.length, 0) + input.dataUrl.length > 28_000_000
        )
          throw new SpecStoreError(413, 'The attachment limit has been reached (50 images / 20 MB).')
        await atomic(statePath, { ...state, assets: [...state.assets, asset] })
        return asset
      }),
  }
}
