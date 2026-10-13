import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
import { createHotUpdater } from '@hot-updater/server'
import {
  createSqlAdapter,
  createEngineDatabase,
  createStorageAdapter,
  type SqlStatement,
} from '@hot-updater/plugin-core'
import { coreMigrationSql, migrationVersion } from '../src/schema.js'
import { createBoundary } from '../src/boundary.js'

test('versioned SDK SQL matches the pinned schema and runs against local PostgreSQL', async () => {
  const sql = await readFile(new URL(`../migrations/${migrationVersion}.sql`, import.meta.url), 'utf8')
  assert.equal(sql, coreMigrationSql())
  const pg = new PGlite()
  try {
    await pg.exec(sql)
    const execute = async (statement: SqlStatement) => {
      const result = await pg.query<Record<string, unknown>>(statement.sql, [...statement.params])
      return { rows: result.rows, changes: result.affectedRows ?? 0 }
    }
    const database = () =>
      createEngineDatabase({
        name: 'local-postgres-smoke',
        adapter: createSqlAdapter({
          executor: {
            dialect: 'postgresql',
            execute,
            transaction: async (operation) =>
              pg.transaction(async (tx) =>
                operation({
                  execute: async (statement) => {
                    const result = await tx.query<Record<string, unknown>>(statement.sql, [...statement.params])
                    return { rows: result.rows, changes: result.affectedRows ?? 0 }
                  },
                }),
              ),
          },
        }),
      })
    const storage = createStorageAdapter({
      name: 'local-smoke',
      protocol: 'smoke',
      get: async () => ({ response: null }),
      getDownloadUrl: async () => ({ url: 'https://objects.example/missing' }),
    })
    const first = createHotUpdater({ database: database(), storage, clientAccess: 'public' })
    await first.core.ready()
    await first.core.ensureChannel('demo-preview')
    const token = 'test-admin-token-for-local-postgres-only'
    const boundary = createBoundary({ token, handlers: first.handlers })
    const version = await boundary(new Request('https://updates.example/api/native-updates/version'))
    assert.equal(version.status, 200)
    const second = createHotUpdater({ database: database(), storage, clientAccess: 'public' })
    await second.core.ready()
    assert.equal((await second.core.findChannelByName('demo-preview'))?.name, 'demo-preview')
    assert.equal((await second.handlers.admin(new Request('https://updates.example/channels'))).status, 200)
    const unauthorized = await boundary(new Request('https://updates.example/api/native-updates/admin/channels'))
    assert.equal(unauthorized.status, 401)
  } finally {
    await pg.close()
  }
})

test('weeks-old releases resolve fresh signed URLs per uncached artifact request', async () => {
  const pg = new PGlite()
  try {
    await pg.exec(coreMigrationSql())
    const execute = async (statement: SqlStatement) => {
      const result = await pg.query<Record<string, unknown>>(statement.sql, [...statement.params])
      return { rows: result.rows, changes: result.affectedRows ?? 0 }
    }
    const database = createEngineDatabase({
      name: 'artifact-freshness-local-postgres',
      adapter: createSqlAdapter({
        executor: {
          dialect: 'postgresql',
          execute,
          transaction: async (operation) =>
            pg.transaction(async (tx) =>
              operation({
                execute: async (statement) => {
                  const result = await tx.query<Record<string, unknown>>(statement.sql, [...statement.params])
                  return { rows: result.rows, changes: result.affectedRows ?? 0 }
                },
              }),
            ),
        },
      }),
    })
    const bundleId = '01900000-0000-7000-8000-000000000001'
    const manifestStorageUri = `fresh://native-demo/cee-native/bundles/${bundleId}/manifest.json`
    const manifest = JSON.stringify({
      bundleId,
      assets: { 'index.android.bundle': { fileHash: 'a'.repeat(64), signature: 'test-fixture-signature' } },
      archive: { downloadFileHash: 'b'.repeat(64), downloadByteSize: 128, tarByteSize: 256 },
    })
    let signedAt = Date.UTC(2026, 6, 1)
    const resolved: string[] = []
    const storage = createStorageAdapter({
      name: 'controlled-clock-resolver',
      protocol: 'fresh',
      get: async ({ storageUri }) => ({ response: storageUri === manifestStorageUri ? new Response(manifest) : null }),
      getDownloadUrl: async ({ storageUri }) => {
        resolved.push(storageUri)
        return { url: `https://objects.example/${encodeURIComponent(storageUri)}?signedAt=${signedAt}&expires=3600` }
      },
    })
    const updater = createHotUpdater({ database, storage, clientAccess: 'public' })
    await updater.core.deploy([
      {
        bundle: {
          id: bundleId,
          platform: 'android',
          gitCommitHash: 'c'.repeat(40),
          manifestStorageUri,
          manifestFileHash: 'd'.repeat(64),
          assetBaseStorageUri: `fresh://native-demo/cee-native/${bundleId}/assets`,
        },
        release: {
          channel: 'demo-preview',
          enabled: true,
          fingerprintHash: 'e'.repeat(40),
          message: null,
          shouldForceUpdate: false,
          targetAppVersion: null,
        },
      },
    ])
    const boundary = createBoundary({
      token: 'local-test-admin-token-for-artifact-freshness',
      handlers: updater.handlers,
    })
    const url = `https://updates.example/api/native-updates/artifacts/v1/${bundleId}/from/00000000-0000-0000-0000-000000000000`
    const first = await boundary(new Request(url))
    assert.equal(first.status, 200)
    assert.equal(first.headers.get('cache-control'), 'private, no-store')
    const before = await first.json()
    assert.equal(resolved.length, 3, 'manifest, asset and archive resolve independently')
    signedAt += 8 * 7 * 24 * 3600 * 1000
    const second = await boundary(new Request(url))
    assert.equal(second.status, 200)
    assert.equal(second.headers.get('cache-control'), 'private, no-store')
    const after = await second.json()
    assert.equal(resolved.length, 6, 'an old release resolves all URLs again')
    for (const [oldUrl, newUrl] of [
      [before.manifestUrl, after.manifestUrl],
      [before.archiveUrl, after.archiveUrl],
      [before.assets['index.android.bundle'].file.url, after.assets['index.android.bundle'].file.url],
    ]) {
      assert.notEqual(newUrl, oldUrl)
      assert.equal(new URL(newUrl).searchParams.get('signedAt'), String(signedAt))
    }
    assert.equal((await updater.core.getBundle(bundleId))?.bundle.manifest_storage_uri, manifestStorageUri)
    const channelKey = Buffer.from('demo-preview').toString('base64url')
    const catalog = await boundary(
      new Request(
        `https://updates.example/api/native-updates/release-catalogs/fingerprint/android/${channelKey}/${'e'.repeat(40)}`,
      ),
    )
    assert.equal(catalog.status, 200)
    assert.equal(catalog.headers.get('cache-control'), 'public, max-age=0, s-maxage=5')
    assert.doesNotMatch(await catalog.text(), /signedAt|objects\.example|fresh:\/\//)
  } finally {
    await pg.close()
  }
})
