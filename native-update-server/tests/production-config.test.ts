import { test } from 'node:test'
import assert from 'node:assert/strict'

test('production CLI module loads against installed SDKs and refuses missing explicit URL without reading proof secrets', async () => {
  const location = new URL('../../native-spike/hot-updater.production.config.ts', import.meta.url).href
  const loaded = await import(location)
  const factory = loaded.default?.default ?? loaded.default
  assert.equal(typeof factory, 'function')
  const previous = process.env.NATIVE_OTA_SERVER_URL
  delete process.env.NATIVE_OTA_SERVER_URL
  try {
    assert.throws(() => factory(null), /NATIVE_OTA_SERVER_URL is required/)
  } finally {
    if (previous !== undefined) process.env.NATIVE_OTA_SERVER_URL = previous
  }
})
