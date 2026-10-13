import { Hono } from 'hono'
import { createHotUpdater } from '@hot-updater/server'
import { readServerEnvironment } from './env.js'
import { createPostgresDatabase } from './database.js'
import { createImmutableS3Storage } from './storage.js'
import { createBoundary } from './boundary.js'

const environment = readServerEnvironment(process.env)
const postgres = createPostgresDatabase(environment.databaseURL)
export const hotUpdater = createHotUpdater({
  database: postgres.database,
  storage: createImmutableS3Storage(environment.storage),
  clientAccess: 'public',
})
const boundary = createBoundary({ token: environment.adminToken, handlers: hotUpdater.handlers })
const app = new Hono()
app.all('/api/native-updates/*', (context) => boundary(context.req.raw))
app.get('/health', (context) => context.json({ service: 'cee-native-updates', sdk: '1.0.1' }))
export default app
