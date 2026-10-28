import { Kysely } from 'kysely'
import { KyselyPGlite } from 'kysely-pglite'
import type { Database } from './database.js'

/** Embedded PostgreSQL for local development/tests only; not serverless storage. */
export async function openLocalDatabase(directory: string) {
  if (process.env.VERCEL) throw new Error('Embedded storage is not allowed on Vercel; configure PostgreSQL')
  const pg = await KyselyPGlite.create(directory)
  const driver = pg.dialect.createDriver()
  // One physical connection means one leased transaction at a time.
  let tail = Promise.resolve()
  const releases = new Map<object, () => void>()
  const acquire = driver.acquireConnection.bind(driver)
  driver.acquireConnection = async () => {
    const previous = tail
    let unlock!: () => void
    tail = new Promise<void>((resolve) => { unlock = resolve })
    await previous
    try {
      const connection = await acquire()
      releases.set(connection, unlock)
      return connection
    } catch (error) { unlock(); throw error }
  }
  driver.releaseConnection = async (connection) => {
    releases.get(connection)?.()
    releases.delete(connection)
  }
  return new Kysely<Database>({ dialect: { ...pg.dialect, createDriver: () => driver } })
}
