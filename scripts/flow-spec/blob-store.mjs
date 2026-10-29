import * as blobSdk from '@vercel/blob'
import { randomUUID } from 'node:crypto'
import { validateSpecDocument } from '../../src/features/flow-spec/schema.mjs'
import { validateSpecArchive } from './archive.mjs'
import {
  SpecStoreError,
  MAX_IMAGE_BYTES,
  imageInfo,
  parseImageDataUrl,
  assertAttachments,
  revisionMetadata,
} from './validation.mjs'

const empty = () => ({ version: 1, revision: 0, document: null, history: [], assets: [] })
const conflict = () =>
  new SpecStoreError(
    409,
    'This specification has changed in another session. Your draft is preserved; review the latest version.',
  )

/** One conditional manifest commit makes immutable revision/image objects visible atomically. */
export function createBlobSpecStore({ namespace = 'production', credentials = {}, sdk = blobSdk } = {}) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$/.test(namespace)) throw new Error('Invalid specification storage namespace.')
  const prefix = `flow-spec/${namespace}/ba-card-fraud/`
  const manifestPath = `${prefix}state.json`
  const options = { ...credentials, access: 'private' }
  const uploadPath = (path) =>
    typeof path === 'string' &&
    path.startsWith(`${prefix}images/`) &&
    /^[a-f0-9-]{36}\.(png|jpg)$/.test(path.slice(`${prefix}images/`.length))
  async function get(path) {
    // Compressed CDN responses carry W/ validators which cannot be used for If-Match.
    const result = await sdk.get(path, { ...options, useCache: false, headers: { 'accept-encoding': 'identity' } })
    if (result && result.statusCode !== 200) throw new Error('Unexpected specification storage response.')
    return result
  }
  async function load(create = false) {
    let result = await get(manifestPath)
    if (!result && create) {
      try {
        await sdk.put(manifestPath, JSON.stringify(empty()), {
          ...options,
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: false,
        })
      } catch (error) {
        result = await get(manifestPath)
        if (!result) throw error
      }
      result ??= await get(manifestPath)
      if (!result) throw new Error('Specification storage initialization failed.')
    }
    if (!result) return { state: empty(), etag: null }
    const state = await new globalThis.Response(result.stream).json()
    if (
      state.version !== 1 ||
      !Number.isInteger(state.revision) ||
      !Array.isArray(state.history) ||
      !Array.isArray(state.assets)
    )
      throw new Error('Unsupported specification storage manifest.')
    return { state, etag: result.blob.etag }
  }
  function publicState(state) {
    return {
      revision: state.revision,
      document: state.document,
      history: state.history.map(({ revision, at, author, message }) => ({ revision, at, author, message })),
      assets: state.assets.map(({ id, name, mime, width, height }) => ({
        id,
        name,
        mime,
        width,
        height,
        url: `/api/flow-spec?flow=ba-card-fraud&asset=${id}`,
      })),
      storage: { driver: 'blob', directUploads: true },
    }
  }
  async function mutate(action) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const { state, etag } = await load(true)
      const result = await action(state)
      if (!result.next) return result.value
      try {
        await sdk.put(manifestPath, JSON.stringify(result.next), {
          ...options,
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: true,
          ifMatch: etag,
        })
        return result.value ?? publicState(result.next)
      } catch (error) {
        if (!(error instanceof blobSdk.BlobPreconditionFailedError)) throw error
      }
    }
    throw new SpecStoreError(503, 'Other edits are being saved. Retry in a moment; your draft is preserved.')
  }
  async function revision(number) {
    const { state } = await load()
    const metadata = state.history.find((entry) => entry.revision === number)
    if (!Number.isInteger(number) || !metadata) throw new SpecStoreError(404, 'Revision not found.')
    const result = await get(metadata.pathname)
    if (!result) throw new Error('A saved specification revision is unavailable.')
    return new globalThis.Response(result.stream).json()
  }
  async function save(input) {
    try {
      validateSpecDocument(input.document)
    } catch (error) {
      throw new SpecStoreError(400, error.message)
    }
    let snapshotPath
    return mutate(async (state) => {
      if (!Number.isInteger(input.expectedRevision) || input.expectedRevision !== state.revision) throw conflict()
      assertAttachments(input.document, state.assets)
      if (state.revision >= 1000)
        throw new SpecStoreError(
          409,
          'The revision limit has been reached. Export a backup and contact the workspace owner.',
        )
      snapshotPath ??= `${prefix}revisions/${state.revision + 1}-${randomUUID()}.json`
      // A manifest ETag may change solely because another request registered an asset.
      if (!(await get(snapshotPath)))
        await sdk.put(snapshotPath, JSON.stringify(input.document), {
          ...options,
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: false,
        })
      const metadata = { ...revisionMetadata(input, state.revision + 1), pathname: snapshotPath }
      return {
        next: {
          ...state,
          revision: metadata.revision,
          document: input.document,
          history: [metadata, ...state.history],
        },
      }
    })
  }
  async function register(asset, pathname, size) {
    return mutate(async (state) => {
      const existing = state.assets.find((entry) => entry.id === asset.id)
      if (existing) return { value: publicState({ ...state, assets: [existing] }).assets[0] }
      if (
        state.assets.length >= 50 ||
        state.assets.reduce((sum, entry) => sum + entry.size, 0) + size > 20 * 1024 * 1024
      )
        throw new SpecStoreError(413, 'The attachment limit has been reached (50 images / 20 MB).')
      const next = { ...state, assets: [...state.assets, { ...asset, pathname, size }] }
      return { next, value: publicState(next).assets.at(-1) }
    })
  }
  return {
    read: async () => publicState((await load()).state),
    async archive() {
      const { state } = await load()
      const history = []
      for (const { pathname, ...metadata } of state.history) {
        const result = await get(pathname)
        if (!result) throw new Error('A saved revision is unavailable; backup was not completed.')
        history.push({ ...metadata, document: await new globalThis.Response(result.stream).json() })
      }
      const assets = []
      for (const { pathname, size: _size, ...asset } of state.assets) {
        const result = await get(pathname)
        if (!result) throw new Error('A saved image is unavailable; backup was not completed.')
        const bytes = Buffer.from(await new globalThis.Response(result.stream).arrayBuffer())
        assets.push({ ...asset, dataUrl: `data:${asset.mime};base64,${bytes.toString('base64')}` })
      }
      return {
        format: 'flow-spec-archive-v1',
        flowId: 'ba-card-fraud',
        exportedAt: new Date().toISOString(),
        history,
        assets,
      }
    },
    async importArchive(archive) {
      const parsedAssets = await validateSpecArchive(archive)
      const assertEmpty = (state) => {
        if (state.revision !== 0 || state.assets.length)
          throw new SpecStoreError(
            409,
            'Import requires an empty storage namespace. Existing specifications are never replaced.',
          )
      }
      assertEmpty((await load()).state)
      const assets = []
      for (const {
        asset: { dataUrl: _dataUrl, ...asset },
        bytes,
      } of parsedAssets) {
        const pathname = `${prefix}images/${randomUUID()}.${asset.mime === 'image/png' ? 'png' : 'jpg'}`
        await sdk.put(pathname, bytes, {
          ...options,
          contentType: asset.mime,
          addRandomSuffix: false,
          allowOverwrite: false,
        })
        assets.push({ ...asset, pathname, size: bytes.length })
      }
      const history = []
      for (const entry of archive.history) {
        const pathname = `${prefix}revisions/${entry.revision}-${randomUUID()}.json`
        await sdk.put(pathname, JSON.stringify(entry.document), {
          ...options,
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: false,
        })
        history.push({ revision: entry.revision, at: entry.at, author: entry.author, message: entry.message, pathname })
      }
      return mutate(async (state) => {
        assertEmpty(state)
        return { next: { ...state, revision: history.length, document: archive.history[0].document, history, assets } }
      })
    },
    revision,
    save,
    restore: async (input) => {
      if (!Number.isInteger(input.revision) || input.revision < 1)
        throw new SpecStoreError(400, 'Choose a valid revision.')
      return save({ ...input, document: await revision(input.revision), message: `Restore revision ${input.revision}` })
    },
    async addAsset(input) {
      const {
        asset: { dataUrl: _dataUrl, ...asset },
        bytes,
      } = await parseImageDataUrl(input)
      const pathname = `${prefix}images/${randomUUID()}.${asset.mime === 'image/png' ? 'png' : 'jpg'}`
      await sdk.put(pathname, bytes, {
        ...options,
        contentType: asset.mime,
        addRandomSuffix: false,
        allowOverwrite: false,
      })
      return register(asset, pathname, bytes.length)
    },
    async grantUpload(input) {
      if (!['image/png', 'image/jpeg'].includes(input.mime))
        throw new SpecStoreError(400, 'Choose a PNG or JPEG image.')
      if (!Number.isInteger(input.size) || input.size < 1 || input.size > MAX_IMAGE_BYTES)
        throw new SpecStoreError(413, 'Each image must be 5 MB or smaller.')
      const { state } = await load()
      if (
        state.assets.length >= 50 ||
        state.assets.reduce((sum, entry) => sum + entry.size, 0) + input.size > 20 * 1024 * 1024
      )
        throw new SpecStoreError(413, 'The attachment limit has been reached (50 images / 20 MB).')
      const pathname = `${prefix}images/${randomUUID()}.${input.mime === 'image/png' ? 'png' : 'jpg'}`
      const validUntil = Date.now() + 300_000
      const constraints = { pathname, validUntil, allowedContentTypes: [input.mime], maximumSizeInBytes: input.size }
      const signed = await sdk.issueSignedToken({ ...credentials, ...constraints, operations: ['put'] })
      const { presignedUrl } = await sdk.presignUrl(signed, {
        ...constraints,
        access: 'private',
        operation: 'put',
        addRandomSuffix: false,
        allowOverwrite: false,
      })
      return { pathname, presignedUrl }
    },
    async finishAsset(input) {
      if (!uploadPath(input.pathname)) throw new SpecStoreError(400, 'Invalid image upload path.')
      const result = await get(input.pathname)
      if (!result) throw new SpecStoreError(404, 'Image upload not found.')
      if (result.blob.size > MAX_IMAGE_BYTES) {
        await result.stream.cancel()
        throw new SpecStoreError(413, 'Each image must be 5 MB or smaller.')
      }
      const bytes = Buffer.from(await new globalThis.Response(result.stream).arrayBuffer())
      const asset = await imageInfo(input.name, result.blob.contentType, bytes)
      return register(asset, input.pathname, bytes.length)
    },
    async asset(id) {
      const { state } = await load()
      const asset = state.assets.find((entry) => entry.id === id)
      if (!asset) throw new SpecStoreError(404, 'Image attachment not found.')
      const result = await get(asset.pathname)
      if (!result) throw new SpecStoreError(404, 'Image attachment not found.')
      return { stream: result.stream, mime: asset.mime, size: asset.size }
    },
  }
}
