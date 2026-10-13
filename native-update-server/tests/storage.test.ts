import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { assertStorageOperations } from '@hot-updater/plugin-core'
import { createImmutableS3Storage } from '../src/storage.js'

const objects = new Map<string, { bytes: Uint8Array; metadata: Record<string, string> }>()
const sender = {
  async send(command: unknown): Promise<any> {
    if (command instanceof PutObjectCommand) {
      const key = command.input.Key!
      if (objects.has(key) && command.input.IfNoneMatch === '*') throw { $metadata: { httpStatusCode: 412 } }
      objects.set(key, {
        bytes: new Uint8Array(command.input.Body as Uint8Array),
        metadata: command.input.Metadata ?? {},
      })
      return {}
    }
    const key = command instanceof HeadObjectCommand || command instanceof GetObjectCommand ? command.input.Key! : ''
    const object = objects.get(key)
    if (!object) throw { $metadata: { httpStatusCode: 404 } }
    if (command instanceof HeadObjectCommand) return { Metadata: object.metadata, ContentLength: object.bytes.length }
    return { Body: { transformToByteArray: async () => object.bytes }, ContentType: 'application/octet-stream' }
  },
}
const storage = createImmutableS3Storage(
  {
    bucket: 'native-demo',
    endpoint: 'https://account.r2.cloudflarestorage.com',
    region: 'auto',
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
  },
  sender,
)
const put = (value: string) =>
  storage.put!({
    key: 'bundles/signed-test/manifest.json',
    body: new Blob([value]).stream(),
    contentType: 'application/json',
  })

test('immutable storage accepts exact retries and rejects different bytes at the same key', async () => {
  const first = await put('signed-original')
  assert.equal((await put('signed-original')).storageUri, first.storageUri)
  await assert.rejects(() => put('tampered-replacement'), /immutable|collision/i)
  const response = (await storage.get!({ storageUri: first.storageUri })).response!
  assert.equal(await response.text(), 'signed-original')
})
test('storage refuses foreign buckets, path traversal and object deletion', async () => {
  await assert.rejects(() => storage.get!({ storageUri: 'cee-ota-s3://foreign/bundles/test' }), /bucket/)
  await assert.rejects(
    () => storage.put!({ key: '../private-key.pem', body: new Blob(['fake']).stream(), contentType: 'text/plain' }),
    /key/,
  )
  assertStorageOperations(storage, ['put', 'get', 'exists', 'delete'])
  const original = await put('signed-original')
  await assert.rejects(() => storage.delete({ storageUri: original.storageUri }), /cannot be deleted/)
  assert.equal(await (await storage.get({ storageUri: original.storageUri })).response!.text(), 'signed-original')
})

test('S3 descriptors retain storage identity and sign one-hour HTTPS GET URLs locally', async () => {
  const object = await put('signed-original')
  assert.match(object.storageUri, /^cee-ota-s3:\/\//)
  assert.doesNotMatch(object.storageUri, /X-Amz-|https:/)
  const download = new URL((await storage.getDownloadUrl({ storageUri: object.storageUri })).url)
  assert.equal(download.protocol, 'https:')
  assert.equal(download.hostname, 'account.r2.cloudflarestorage.com')
  assert.equal(download.searchParams.get('X-Amz-Expires'), '3600')
  assert.match(download.searchParams.get('X-Amz-Date')!, /^\d{8}T\d{6}Z$/)
  assert.ok(download.searchParams.get('X-Amz-Signature'))
})
