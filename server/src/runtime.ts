import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'
import type { Database } from './database.js'
import { createPlatform } from './app.js'
import type { SpecificationRegistration } from './specifications.js'
import type { FlowRegistration } from './flow-access.js'

export async function openRuntime(specifications: SpecificationRegistration[] = [], migrate = false, flows: FlowRegistration[] = []) {
  const origin = process.env.PLATFORM_ORIGIN ?? 'http://localhost:5173'
  const url = new URL(origin)
  if (url.origin !== origin || (url.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) throw new Error('PLATFORM_ORIGIN must be an HTTPS origin or loopback development origin')
  const secret = process.env.PLATFORM_AUTH_SECRET
  if (!secret || secret.length < 32) throw new Error('Set PLATFORM_AUTH_SECRET to a random secret of at least 32 characters')
  const connectionString = process.env.DATABASE_URL
  let db: Kysely<Database>
  if (connectionString) {
    db = new Kysely<Database>({ dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString, max: 5, connectionTimeoutMillis: 10_000 }) }) })
  } else {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) throw new Error('DATABASE_URL is required outside local development')
    const { openLocalDatabase } = await import('./local-database.js')
    const defaultDirectory = fileURLToPath(new URL('../../.codex-temp/flow-rights-local-db', import.meta.url))
    db = await openLocalDatabase(path.resolve(process.env.PLATFORM_DATA_DIR ?? defaultDirectory))
  }
  try {
    const app = await createPlatform({ db, origin, secret, migrate, specifications, flows })
    return { app, db, origin, close: () => db.destroy() }
  } catch (error) { await db.destroy(); throw error }
}
