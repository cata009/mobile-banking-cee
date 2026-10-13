import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readServerEnvironment, requireProductionUrl } from '../src/env.js'

const env = {
  DATABASE_URL: 'postgresql://demo:fake@ep-example-pooler.neon.tech/demo?sslmode=require',
  NATIVE_OTA_ADMIN_TOKEN: 'fake-server-management-token-at-least-32-characters',
  NATIVE_OTA_SERVER_URL: 'https://updates.example/api/native-updates',
  S3_ENDPOINT: 'https://account.r2.cloudflarestorage.com',
  S3_REGION: 'auto',
  S3_BUCKET: 'native-demo',
  S3_ACCESS_KEY_ID: 'fake-access',
  S3_SECRET_ACCESS_KEY: 'fake-secret',
}
test('production server configuration is explicit and contains no private signing key', () => {
  const config = readServerEnvironment(env)
  assert.equal(config.baseURL, env.NATIVE_OTA_SERVER_URL)
  assert.equal(config.databaseURL, env.DATABASE_URL)
  assert.equal('privateKey' in config, false)
})
test('missing production values fail instead of loading local proof credentials', () => {
  assert.throws(() => readServerEnvironment({}), /required/)
  assert.throws(() => readServerEnvironment({ ...env, NATIVE_OTA_ADMIN_TOKEN: 'short' }), /32/)
})
test('production URLs reject insecure protocols, credentials and local/private endpoints', () => {
  for (const value of [
    'http://updates.example',
    'https://user:password@updates.example',
    'https://localhost',
    'https://127.0.0.1',
    'https://10.1.2.3',
    'https://[::1]',
    'https://updates.example/?token=secret',
  ]) {
    assert.throws(() => requireProductionUrl(value, 'test'), /HTTPS|public|credentials|query/)
  }
})
