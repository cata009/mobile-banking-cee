import { describe, expect, it } from 'vitest'
import { BlobPreconditionFailedError } from '@vercel/blob'
import { createBlobSpecStore } from '../../scripts/flow-spec/blob-store.mjs'
import { createSpecHandler } from '../../scripts/flow-spec/server.mjs'
import { createServer } from 'node:http'
import { createHmac } from 'node:crypto'

const doc = (text) => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })
const png =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII='

function memoryBlobs() {
  const files = new Map()
  let counter = 0
  const calls = []
  const sdk = {
    async get(path, options) {
      calls.push({ method: 'get', path, options })
      const value = files.get(path)
      if (!value) return null
      return {
        statusCode: 200,
        stream: new globalThis.Response(value.bytes).body,
        blob: {
          etag:
            value.bytes.length > 1000 && options.headers?.['accept-encoding'] !== 'identity'
              ? `W/${value.etag}`
              : value.etag,
          size: value.bytes.length,
          contentType: value.contentType,
        },
      }
    },
    async put(path, body, options) {
      calls.push({ method: 'put', path, options })
      const previous = files.get(path)
      if ((options.ifMatch && previous?.etag !== options.ifMatch) || (previous && !options.allowOverwrite))
        throw new BlobPreconditionFailedError()
      const value = { bytes: Buffer.from(body), etag: `etag-${++counter}`, contentType: options.contentType }
      files.set(path, value)
      return { pathname: path, etag: value.etag }
    },
    async issueSignedToken(options) {
      calls.push({ method: 'grant', options })
      return {}
    },
    async presignUrl(_token, options) {
      return { presignedUrl: `https://blob.vercel-storage.com/?path=${encodeURIComponent(options.pathname)}` }
    },
  }
  return { sdk, files, calls }
}

describe('private shared specification storage', () => {
  it('serves viewers only images referenced by the current document while retaining private history bytes', async () => {
    const { sdk } = memoryBlobs()
    const store = createBlobSpecStore({ sdk, namespace: 'production' })
    const image = await store.addAsset({ name: 'private-draft.png', dataUrl: png })
    await store.save({ expectedRevision: 0, document: doc('Current public document') })
    const authorize = async (_request, operation) => {
      if (operation === 'history') throw Object.assign(new Error('Private history'), { status: 403 })
      return { author: 'Reader', actorId: 'reader' }
    }
    const handler = createSpecHandler({ env: { VERCEL: '1', BLOB_READ_WRITE_TOKEN: 'test-only' }, cloudSdk: sdk, authorize })
    const server = createServer((req, res) => void handler(req, res))
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    const endpoint = `http://127.0.0.1:${server.address().port}/api/flow-spec?flow=ba-card-fraud`
    try {
      expect((await globalThis.fetch(`${endpoint}&asset=${image.id}`)).status).toBe(404)
      const published = { type: 'doc', content: [{ type: 'image', attrs: { assetId: image.id } }] }
      await store.save({ expectedRevision: 1, document: published })
      const read = await globalThis.fetch(`${endpoint}&asset=${image.id}`)
      expect(read.status).toBe(200)
      expect(Buffer.from(await read.arrayBuffer()).toString('base64')).toBe(png.split(',')[1])
      await store.save({ expectedRevision: 2, document: doc('Image removed again') })
      expect((await globalThis.fetch(`${endpoint}&asset=${image.id}`)).status).toBe(404)
      expect((await store.archive()).assets[0].dataUrl).toBe(png)
    } finally { await new Promise(resolve => server.close(resolve)) }
  })
  it('keeps a strong version validator for large documents that the CDN would compress', async () => {
    const { sdk } = memoryBlobs()
    const store = createBlobSpecStore({ sdk, namespace: 'compression' })
    await store.save({ expectedRevision: 0, document: doc('Long specification '.repeat(500)) })
    const saved = await store.save({ expectedRevision: 1, document: doc('Updated large specification '.repeat(500)) })
    expect(saved.revision).toBe(2)
  })
  it('backs up original images and complete history, and imports only into an empty namespace', async () => {
    const { sdk } = memoryBlobs()
    const source = createBlobSpecStore({ sdk, namespace: 'backup-source' })
    await source.save({ document: doc('Original'), expectedRevision: 0, author: 'Author one' })
    await source.addAsset({ name: 'original.png', dataUrl: png })
    await source.save({ document: doc('Second'), expectedRevision: 1, author: 'Author two' })
    const archive = await source.archive()
    expect(archive.assets[0].dataUrl).toBe(png)
    expect(JSON.stringify(archive)).not.toContain('pathname')
    const target = createBlobSpecStore({ sdk, namespace: 'backup-target' })
    await target.importArchive(archive)
    expect((await target.read()).history).toEqual((await source.read()).history)
    expect(await target.revision(1)).toEqual(doc('Original'))
    expect((await target.read()).document).toEqual(doc('Second'))
    await expect(target.importArchive(archive)).rejects.toMatchObject({ status: 409 })
    const invalid = {
      ...archive,
      history: [
        {
          ...archive.history[0],
          document: { type: 'doc', content: [{ type: 'image', attrs: { assetId: 'missing' } }] },
        },
      ],
    }
    await expect(
      createBlobSpecStore({ sdk, namespace: 'invalid-backup' }).importArchive(invalid),
    ).rejects.toMatchObject({ status: 400 })
  })
  it('selects private storage on Vercel, authenticates reads/writes and streams registered images', async () => {
    const { sdk } = memoryBlobs()
    const secret = 'cloud-test-secret-'.repeat(3)
    const encoded = Buffer.from(JSON.stringify({ expiresAt: Date.now() + 60_000 })).toString('base64url')
    const cookie = `mb_access=${encoded}.${createHmac('sha256', secret).update(encoded).digest('base64url')}`
    const handler = createSpecHandler({
      env: { VERCEL: '1', BLOB_READ_WRITE_TOKEN: 'server-only', ACCESS_COOKIE_SECRET: secret },
      cloudSdk: sdk,
    })
    const server = createServer((req, res) => void handler(req, res))
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    const origin = `http://127.0.0.1:${server.address().port}`
    const endpoint = `${origin}/api/flow-spec?flow=ba-card-fraud`
    try {
      expect((await globalThis.fetch(endpoint)).status).toBe(401)
      const read = await globalThis.fetch(endpoint, { headers: { cookie } })
      expect(read.status).toBe(200)
      expect((await read.json()).storage.driver).toBe('blob')
      expect(read.headers.get('cache-control')).toBe('no-store')
      const write = (body, source = origin) =>
        globalThis.fetch(endpoint, {
          method: 'POST',
          headers: { cookie, origin: source, 'content-type': 'application/json' },
          body: JSON.stringify(body),
        })
      expect((await write({ operation: 'save', expectedRevision: 0, document: doc('Shared') })).status).toBe(200)
      expect((await write({ operation: 'save' }, 'https://unrelated.example')).status).toBe(403)
      const added = await write({ operation: 'asset', name: 'original.png', dataUrl: png })
      const { asset } = await added.json()
      const image = await globalThis.fetch(`${origin}${asset.url}`, { headers: { cookie } })
      expect(image.status).toBe(200)
      expect(image.headers.get('content-type')).toBe('image/png')
      expect(Buffer.from(await image.arrayBuffer()).toString('base64')).toBe(png.split(',')[1])
      expect((await globalThis.fetch(`${origin}${asset.url}`)).status).toBe(401)
    } finally {
      await new Promise((resolve) => server.close(resolve))
    }
  })
  it('persists revisions across fresh instances and restores by appending', async () => {
    const { sdk, calls } = memoryBlobs()
    const first = createBlobSpecStore({ sdk, namespace: 'test' })
    await first.save({ document: doc('One'), expectedRevision: 0, author: 'BA' })
    const second = createBlobSpecStore({ sdk, namespace: 'test' })
    expect((await second.read()).document).toEqual(doc('One'))
    await second.save({ document: doc('Two'), expectedRevision: 1 })
    const restored = await first.restore({ revision: 1, expectedRevision: 2 })
    expect(restored.revision).toBe(3)
    expect(restored.document).toEqual(doc('One'))
    expect(await second.revision(2)).toEqual(doc('Two'))
    expect(restored.history).toHaveLength(3)
    expect(calls.filter((call) => call.method === 'get').every((call) => call.options.useCache === false)).toBe(true)
    expect(calls.filter((call) => call.method === 'put').every((call) => call.options.access === 'private')).toBe(true)
  })

  it('allows one simultaneous first save and never overwrites its immutable revision', async () => {
    const { sdk, files } = memoryBlobs()
    const stores = [createBlobSpecStore({ sdk, namespace: 'race' }), createBlobSpecStore({ sdk, namespace: 'race' })]
    const results = await Promise.allSettled(
      stores.map((store, i) => store.save({ document: doc(String(i)), expectedRevision: 0 })),
    )
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.find((result) => result.status === 'rejected').reason.status).toBe(409)
    const state = await stores[0].read()
    expect(state.history).toHaveLength(1)
    expect(await stores[1].revision(1)).toEqual(state.document)
    expect([...files.keys()].some((path) => path.includes('/revisions/'))).toBe(true)
  })

  it('preserves assets and document when registration races a save; manifests contain no image bytes', async () => {
    const { sdk, files } = memoryBlobs()
    const one = createBlobSpecStore({ sdk, namespace: 'assets' })
    const two = createBlobSpecStore({ sdk, namespace: 'assets' })
    await one.save({ document: doc('Baseline'), expectedRevision: 0 })
    const [asset] = await Promise.all([
      one.addAsset({ name: 'original.png', dataUrl: png }),
      two.save({ document: doc('Updated'), expectedRevision: 1 }),
    ])
    const state = await two.read()
    expect(state.document).toEqual(doc('Updated'))
    expect(state.assets).toHaveLength(1)
    expect(state.assets[0]).toMatchObject({ id: asset.id, url: expect.stringContaining('&asset=') })
    const download = await two.asset(asset.id)
    expect(Buffer.from(await new globalThis.Response(download.stream).arrayBuffer()).toString('base64')).toBe(
      png.split(',')[1],
    )
    for (const [path, value] of files)
      if (path.endsWith('.json')) expect(value.bytes.toString()).not.toContain('data:image')
  })

  it('rejects stale writes, missing attachments, unsafe paths and invalid image bytes', async () => {
    const { sdk } = memoryBlobs()
    const store = createBlobSpecStore({ sdk, namespace: 'validation' })
    await store.save({ document: doc('Current'), expectedRevision: 0 })
    await expect(store.save({ document: doc('Old'), expectedRevision: 0 })).rejects.toMatchObject({ status: 409 })
    await expect(
      store.save({
        document: { type: 'doc', content: [{ type: 'image', attrs: { assetId: 'missing' } }] },
        expectedRevision: 1,
      }),
    ).rejects.toMatchObject({ status: 400 })
    await expect(store.finishAsset({ pathname: '../../state.json' })).rejects.toMatchObject({ status: 400 })
    await expect(store.addAsset({ name: 'bad.png', dataUrl: 'data:image/png;base64,YmFk' })).rejects.toMatchObject({
      status: 400,
    })
    await expect(store.asset('img-unknown')).rejects.toMatchObject({ status: 404 })
  })

  it('does not expose an uncommitted revision after a failed manifest write', async () => {
    const { sdk } = memoryBlobs()
    const store = createBlobSpecStore({ sdk, namespace: 'failure' })
    await store.save({ document: doc('One'), expectedRevision: 0 })
    const put = sdk.put
    sdk.put = async (path, body, options) => {
      if (path.endsWith('/state.json')) throw new Error('Network interrupted')
      return put(path, body, options)
    }
    await expect(store.save({ document: doc('Lost'), expectedRevision: 1 })).rejects.toThrow()
    expect((await store.read()).revision).toBe(1)
    await expect(store.revision(2)).rejects.toMatchObject({ status: 404 })
  })

  it('issues short-lived grants limited to one private image path and finalizes verified bytes', async () => {
    const { sdk, calls } = memoryBlobs()
    const store = createBlobSpecStore({ sdk, namespace: 'uploads' })
    const grant = await store.grantUpload({ mime: 'image/png', size: 68 })
    expect(grant.pathname).toMatch(/^flow-spec\/uploads\/ba-card-fraud\/images\/[a-f0-9-]+\.png$/)
    const issued = calls.find((call) => call.method === 'grant').options
    expect(issued).toMatchObject({
      pathname: grant.pathname,
      operations: ['put'],
      maximumSizeInBytes: 68,
      allowedContentTypes: ['image/png'],
    })
    expect(issued.validUntil).toBeLessThanOrEqual(Date.now() + 300_000)
    await sdk.put(grant.pathname, Buffer.from(png.split(',')[1], 'base64'), {
      contentType: 'image/png',
      access: 'private',
    })
    const asset = await store.finishAsset({ pathname: grant.pathname, name: 'original.png' })
    expect(asset).toMatchObject({ mime: 'image/png', width: 1, height: 1 })
    expect((await store.read()).assets).toHaveLength(1)
    await expect(store.grantUpload({ mime: 'text/html', size: 1 })).rejects.toMatchObject({ status: 400 })
    await expect(store.grantUpload({ mime: 'image/png', size: 6_000_000 })).rejects.toMatchObject({ status: 413 })
  })
})
