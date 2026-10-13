import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { attachDatabasePool } from '@vercel/functions'
import { kyselyAdapter } from '@hot-updater/server/adapters/kysely'

export function createPostgresDatabase(connectionString: string) {
  const url = new URL(connectionString)
  for (const field of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(field)
  const pool = new Pool({
    connectionString: url.href,
    ssl: { rejectUnauthorized: true },
    max: 2,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    maxLifetimeSeconds: 60,
  })
  attachDatabasePool(pool)
  const db = new Kysely<object>({ dialect: new PostgresDialect({ pool }) })
  return { pool, db, database: kyselyAdapter({ db, provider: 'postgresql' }) }
}
