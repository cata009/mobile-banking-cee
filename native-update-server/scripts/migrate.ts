import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createPostgresDatabase } from '../src/database.js'
import { required } from '../src/env.js'
import { migrationVersion } from '../src/schema.js'

if (process.env.NATIVE_OTA_ALLOW_MIGRATIONS !== 'true')
  throw new Error('Reviewed database migration requires NATIVE_OTA_ALLOW_MIGRATIONS=true')
const sql = await readFile(new URL(`../migrations/${migrationVersion}.sql`, import.meta.url), 'utf8')
const checksum = createHash('sha256').update(sql).digest('hex')
const { pool, db } = createPostgresDatabase(required(process.env, 'DATABASE_URL'))
const connection = await pool.connect()
try {
  await connection.query('BEGIN')
  await connection.query('SELECT pg_advisory_xact_lock(48271001)')
  await connection.query(
    'CREATE TABLE IF NOT EXISTS cee_ota_migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())',
  )
  const previous = await connection.query<{ checksum: string }>(
    'SELECT checksum FROM cee_ota_migrations WHERE version=$1',
    [migrationVersion],
  )
  if (previous.rows[0]) {
    if (previous.rows[0].checksum !== checksum)
      throw new Error('Previously applied migration checksum differs; create a new reviewed migration')
  } else {
    await connection.query(sql)
    await connection.query('INSERT INTO cee_ota_migrations(version,checksum) VALUES($1,$2)', [
      migrationVersion,
      checksum,
    ])
  }
  await connection.query('COMMIT')
  console.log(`Migration ${migrationVersion} applied or already matching.`)
} catch (error) {
  await connection.query('ROLLBACK')
  throw error
} finally {
  connection.release()
  await db.destroy()
}
