import { mkdtemp, rm, mkdir, utimes, writeFile, access } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createSpecStore } from '../../scripts/flow-spec/store.mjs'
import { createSpecHandler, flowSpecPlugin } from '../../scripts/flow-spec/server.mjs'
import { createHmac } from 'node:crypto'

const doc = (text) => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })
describe('durable flow spec store', () => {
  it('fails backup with no output if a committed revision snapshot is missing', async () => {
    const root = await mkdtemp(join(tmpdir(), 'card-guard-incomplete-backup-'))
    try {
      await writeFile(
        join(root, 'state.json'),
        JSON.stringify({
          revision: 1,
          document: doc('Current'),
          assets: [],
          history: [{ revision: 1, at: new Date().toISOString(), author: 'BA', message: 'Saved' }],
        }),
      )
      const output = join(root, 'backup.json')
      await expect(
        promisify(execFile)(process.execPath, [
          'scripts/flow-spec/backup.mjs',
          'export',
          '--local-root',
          root,
          '--output',
          output,
        ]),
      ).rejects.toThrow()
      await expect(access(output)).rejects.toMatchObject({ code: 'ENOENT' })
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
  it('recovers an abandoned process lock after a crash', async () => {
    const root = await mkdtemp(join(tmpdir(), 'card-guard-crash-'))
    try {
      await mkdir(join(root, '.write-lock'))
      await expect(createSpecStore(root).save({ expectedRevision: 0, document: doc('Blocked') })).rejects.toMatchObject(
        { status: 503 },
      )
      const old = new Date(Date.now() - 60_000)
      await utimes(join(root, '.write-lock'), old, old)
      await createSpecStore(root).save({ expectedRevision: 0, document: doc('Recovered') })
      expect((await createSpecStore(root).read()).revision).toBe(1)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
  it('saves, survives a fresh store instance and restores by appending history', async () => {
    const root = await mkdtemp(join(tmpdir(), 'card-guard-spec-'))
    try {
      const store = createSpecStore(root)
      expect((await store.read()).revision).toBe(0)
      await store.save({ expectedRevision: 0, document: doc('First'), author: 'BA' })
      const reopened = createSpecStore(root)
      expect((await reopened.read()).document).toEqual(doc('First'))
      await reopened.save({ expectedRevision: 1, document: doc('Second'), author: 'BA' })
      await reopened.restore({ expectedRevision: 2, revision: 1, author: 'BA' })
      const state = await reopened.read()
      expect(state.revision).toBe(3)
      expect(state.document).toEqual(doc('First'))
      expect(state.history).toHaveLength(3)
      expect(state.history[0].message).toContain('Restore')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('rejects stale saves without losing either the saved revision or asset bytes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'card-guard-spec-'))
    try {
      const store = createSpecStore(root)
      await store.save({ expectedRevision: 0, document: doc('Remote'), author: 'BA' })
      await expect(store.save({ expectedRevision: 0, document: doc('Stale'), author: 'Other' })).rejects.toMatchObject({
        status: 409,
      })
      expect((await store.read()).document).toEqual(doc('Remote'))
      await expect(
        store.addAsset({ name: 'evil.svg', dataUrl: 'data:image/svg+xml;base64,PHN2Zz4=' }),
      ).rejects.toThrow()
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII='
      const asset = await store.addAsset({ name: 'alert.png', dataUrl })
      expect(asset.dataUrl).toBe(dataUrl)
      expect((await createSpecStore(root).read()).assets[0].id).toBe(asset.id)
      await expect(
        store.save({
          expectedRevision: 1,
          document: { type: 'doc', content: [{ type: 'image', attrs: { assetId: 'missing' } }] },
          author: 'BA',
        }),
      ).rejects.toThrow(/image/i)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})

async function call(handler, options = {}) {
  const request = {
    method: 'GET',
    url: '/api/flow-spec?flow=ba-card-fraud',
    headers: { host: 'localhost:4004', origin: 'http://localhost:4004', 'content-type': 'application/json' },
    ...options,
  }
  const response = {
    statusCode: 0,
    setHeader() {},
    end(body) {
      this.body = JSON.parse(body)
    },
  }
  await handler(request, response)
  return response
}

describe('specification HTTP boundary', () => {
  it('registers Vite middleware without returning Connect as a post-start hook', () => {
    const plugin = flowSpecPlugin('.')
    const server = { middlewares: { use: () => function connect() {} } }
    expect(plugin.configureServer(server)).toBeUndefined()
    expect(plugin.configurePreviewServer(server)).toBeUndefined()
  })
  it('requires authenticated workspace access and refuses unconfigured serverless persistence', async () => {
    const secret = 's'.repeat(40)
    const env = { ACCESS_COOKIE_SECRET: secret, VERCEL: '1' }
    const handler = createSpecHandler({ env })
    expect((await call(handler)).statusCode).toBe(401)
    const encoded = Buffer.from(JSON.stringify({ expiresAt: Date.now() + 60000 })).toString('base64url')
    const cookie = 'mb_access=' + encoded + '.' + createHmac('sha256', secret).update(encoded).digest('base64url')
    expect((await call(handler, { headers: { cookie } })).statusCode).toBe(503)
    expect((await call(handler, { headers: { cookie: cookie + 'tampered' } })).statusCode).toBe(401)
  })

  it('supports durable JSON writes, rejects cross-origin changes, and reports conflicts', async () => {
    const root = await mkdtemp(join(tmpdir(), 'card-guard-http-'))
    try {
      const handler = createSpecHandler({ localRoot: root })
      expect((await call(handler)).body.revision).toBe(0)
      const body = { operation: 'save', expectedRevision: 0, document: doc('From API'), author: 'BA' }
      expect(
        (
          await call(handler, {
            method: 'POST',
            body,
            headers: { host: 'localhost:4004', origin: 'https://evil.example', 'content-type': 'application/json' },
          })
        ).statusCode,
      ).toBe(403)
      expect((await call(handler, { method: 'POST', body })).body.revision).toBe(1)
      expect((await call(handler, { method: 'POST', body })).statusCode).toBe(409)
      expect((await call(handler, { url: '/api/flow-spec?flow=ba-card-fraud&revision=1' })).body.document).toEqual(
        doc('From API'),
      )
      expect((await call(handler, { method: 'DELETE' })).statusCode).toBe(405)
      expect((await call(handler, { url: '/api/flow-spec?flow=pi-prime' })).statusCode).toBe(404)
      expect(
        (
          await call(handler, {
            method: 'POST',
            body: { operation: 'save', expectedRevision: 1, document: { type: 'doc', content: [{ type: 'script' }] } },
          })
        ).statusCode,
      ).toBe(400)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('allows only one winner when different processes save the same base revision', async () => {
    const root = await mkdtemp(join(tmpdir(), 'card-guard-race-'))
    try {
      const results = await Promise.allSettled([
        createSpecStore(root).save({ expectedRevision: 0, document: doc('One') }),
        createSpecStore(root).save({ expectedRevision: 0, document: doc('Two') }),
      ])
      expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
      expect(results.filter((result) => result.status === 'rejected')[0].reason.status).toBe(409)
      expect((await createSpecStore(root).read()).history).toHaveLength(1)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
