export interface StorageEnvironment {
  bucket: string
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
}
export function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}
export function requireProductionUrl(value: string, name: string): string {
  const url = new URL(value)
  const host = url.hostname.toLowerCase()
  if (url.protocol !== 'https:') throw new Error(`${name} requires HTTPS`)
  if (url.username || url.password || url.search || url.hash)
    throw new Error(`${name} cannot contain credentials, query or fragment`)
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.includes(':') ||
    /^(?:0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(host)
  )
    throw new Error(`${name} requires a public endpoint`)
  return url.href.replace(/\/$/, '')
}
export function readStorageEnvironment(env: NodeJS.ProcessEnv): StorageEnvironment {
  return {
    endpoint: requireProductionUrl(required(env, 'S3_ENDPOINT'), 'S3_ENDPOINT'),
    bucket: required(env, 'S3_BUCKET'),
    region: required(env, 'S3_REGION'),
    accessKeyId: required(env, 'S3_ACCESS_KEY_ID'),
    secretAccessKey: required(env, 'S3_SECRET_ACCESS_KEY'),
  }
}
export function readServerEnvironment(env: NodeJS.ProcessEnv) {
  const baseURL = requireProductionUrl(required(env, 'NATIVE_OTA_SERVER_URL'), 'NATIVE_OTA_SERVER_URL')
  if (new URL(baseURL).pathname !== '/api/native-updates')
    throw new Error('NATIVE_OTA_SERVER_URL must end in /api/native-updates')
  const databaseURL = required(env, 'DATABASE_URL')
  if (!['postgres:', 'postgresql:'].includes(new URL(databaseURL).protocol))
    throw new Error('DATABASE_URL must be PostgreSQL')
  const adminToken = required(env, 'NATIVE_OTA_ADMIN_TOKEN')
  if (adminToken.length < 32) throw new Error('NATIVE_OTA_ADMIN_TOKEN must contain at least 32 characters')
  return { baseURL, databaseURL, adminToken, storage: readStorageEnvironment(env) }
}
