import { createHash } from 'node:crypto'
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createStorageAdapter, createStorageUri, parseStorageUri } from '@hot-updater/plugin-core'
import type { StorageEnvironment } from './env.js'
const prefix = 'cee-native/'
const protocol = 'cee-ota-s3'
const statusOf = (error: unknown) => (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
function checkedKey(key: string) {
  if (!key || key.includes('\\') || key.split('/').some((part) => !part || part === '.' || part === '..'))
    throw new Error('Invalid OTA object key')
  return key
}
export function createImmutableS3Storage(env: StorageEnvironment, sender?: Pick<S3Client, 'send'>) {
  const s3 = new S3Client({
    endpoint: env.endpoint,
    region: env.region,
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    credentials: { accessKeyId: env.accessKeyId, secretAccessKey: env.secretAccessKey },
  })
  const client = sender ?? s3
  const uriKey = (uri: string) => {
    const parsed = parseStorageUri(uri, protocol)
    if (parsed.bucket !== env.bucket) throw new Error('Unexpected OTA bucket')
    if (!parsed.key.startsWith(prefix)) throw new Error('Unexpected OTA object key prefix')
    return checkedKey(parsed.key)
  }
  return createStorageAdapter({
    name: 'ceeImmutableS3',
    protocol,
    async put({ key, body, contentType, contentLength }) {
      if (contentLength !== undefined && contentLength > 512 * 1024 * 1024)
        throw new Error('OTA object exceeds 512 MiB limit')
      const bytes = new Uint8Array(await new Response(body).arrayBuffer())
      if (bytes.length > 512 * 1024 * 1024) throw new Error('OTA object exceeds 512 MiB limit')
      const hash = createHash('sha256').update(bytes).digest('hex')
      const physicalKey = prefix + checkedKey(key)
      try {
        await client.send(
          new PutObjectCommand({
            Bucket: env.bucket,
            Key: physicalKey,
            Body: bytes,
            ContentLength: bytes.length,
            ContentType: contentType,
            Metadata: { sha256: hash },
            IfNoneMatch: '*',
            CacheControl: 'public, max-age=31536000, immutable',
          }),
        )
      } catch (error) {
        if (statusOf(error) !== 412) throw error
        const current = await client.send(new HeadObjectCommand({ Bucket: env.bucket, Key: physicalKey }))
        if (current.Metadata?.sha256 !== hash || current.ContentLength !== bytes.length)
          throw new Error('Immutable OTA object collision')
      }
      return { storageUri: createStorageUri({ protocol, bucket: env.bucket, key: physicalKey }) }
    },
    async get({ storageUri }) {
      try {
        const object = await client.send(new GetObjectCommand({ Bucket: env.bucket, Key: uriKey(storageUri) }))
        if (!object.Body) return { response: null }
        const bytes = await object.Body.transformToByteArray()
        return {
          response: new Response(new Uint8Array(bytes).buffer, {
            headers: { 'content-type': object.ContentType ?? 'application/octet-stream' },
          }),
        }
      } catch (error) {
        if (statusOf(error) === 404) return { response: null }
        throw error
      }
    },
    async exists({ storageUri }) {
      try {
        await client.send(new HeadObjectCommand({ Bucket: env.bucket, Key: uriKey(storageUri) }))
        return { exists: true }
      } catch (error) {
        if (statusOf(error) === 404) return { exists: false }
        throw error
      }
    },
    async getDownloadUrl({ storageUri }) {
      return {
        url: await getSignedUrl(s3, new GetObjectCommand({ Bucket: env.bucket, Key: uriKey(storageUri) }), {
          expiresIn: 3600,
        }),
      }
    },
    // SDK1.0.1 requires a delete method for deploy; this immutable provider explicitly refuses it.
    async delete({ storageUri }) {
      uriKey(storageUri)
      throw new Error('Immutable OTA objects cannot be deleted through the release adapter')
    },
  })
}
